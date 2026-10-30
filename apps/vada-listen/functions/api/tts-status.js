const MODEL = 'gemini-3.8-flash-lite-tts';

export function onRequestGet({ env }) {
  return Response.json({
    enabled: Boolean(env.GEMINI_API_KEY),
    provider: 'gemini',
    model: MODEL,
  }, {
    headers: { 'cache-control': 'no-store' },
  });
}
