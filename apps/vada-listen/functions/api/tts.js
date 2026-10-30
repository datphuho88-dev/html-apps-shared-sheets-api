const MODEL = 'gemini-3.8-flash-lite-tts';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const MAX_TEXT_LENGTH = 800;

function jsonError(message, status) {
  return Response.json({ error: message }, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

function speechStyle(lang, rate) {
  const pace = rate < 0.9 ? 'slow and careful' : rate > 1.1 ? 'brisk but clear' : 'natural and clear';
  return lang === 'vi-VN'
    ? `Speak in natural Vietnamese with a ${pace} learning-friendly pace.`
    : `Speak in standard Mandarin Chinese with a ${pace} learning-friendly pace.`;
}

function addPauseTags(text, phrasePause) {
  if (!phrasePause) return text;
  return text.replace(/([,，])/g, '$1 <short pause>');
}

function findAudio(payload) {
  const audio = (payload.steps || [])
    .filter(step => step && step.type === 'model_output')
    .flatMap(step => Array.isArray(step.content) ? step.content : [])
    .filter(item => item && item.type === 'audio' && item.data)
    .at(-1);
  return audio || null;
}

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY) return jsonError('Gemini TTS is not configured.', 503);

  let input;
  try {
    input = await request.json();
  } catch {
    return jsonError('Invalid JSON body.', 400);
  }

  const text = String(input.text || '').trim();
  const lang = input.lang === 'vi-VN' ? 'vi-VN' : 'zh-CN';
  const rate = Math.min(1.5, Math.max(0.5, Number(input.rate) || 1));
  const phrasePause = Math.min(1000, Math.max(0, Number(input.phrasePause) || 0));
  if (!text) return jsonError('Text is required.', 400);
  if (text.length > MAX_TEXT_LENGTH) return jsonError('Text is too long.', 413);

  const providerResponse = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': env.GEMINI_API_KEY,
      'api-revision': '2026-05-20',
    },
    body: JSON.stringify({
      model: MODEL,
      input: [{
        type: 'user_input',
        content: [{
          type: 'text',
          text: addPauseTags(text, phrasePause),
          annotations: [{ type: 'speech_metadata', style: speechStyle(lang, rate) }],
        }],
      }],
      response_format: { type: 'audio' },
      generation_config: { speech_config: [{ voice: 'Kore' }] },
    }),
  });

  if (!providerResponse.ok) {
    const providerText = await providerResponse.text();
    let providerError = {};
    try { providerError = JSON.parse(providerText); } catch {}
    const providerCode = providerError?.error?.status || 'UNKNOWN';
    console.error('Gemini TTS request failed', providerResponse.status, providerCode);
    return Response.json({
      error: 'Gemini TTS request failed.',
      providerStatus: providerResponse.status,
      providerCode,
    }, {
      status: 502,
      headers: { 'cache-control': 'no-store' },
    });
  }

  const payload = await providerResponse.json();
  const audio = findAudio(payload);
  if (!audio) return jsonError('Gemini returned no audio.', 502);

  return new Response(decodeBase64(audio.data), {
    headers: {
      'content-type': audio.mime_type || audio.mimeType || 'audio/wav',
      'cache-control': 'no-store',
      'content-disposition': 'inline',
    },
  });
}

export function onRequestOptions() {
  return new Response(null, { status: 204 });
}
