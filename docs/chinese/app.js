import { CONFIG } from '../config.js?v=20261027c';
import { SheetsApi } from '../api-client.js';

const APP_ID='vada-chinese';
const $=id=>document.getElementById(id);
const localDay=(d=new Date())=>{const x=new Date(d);return [x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-');};
const prettyDate=d=>new Date(d).toLocaleDateString('vi-VN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const clean=s=>String(s??'').trim();
const asNum=(x,fallback=0)=>{const n=Number(x);return Number.isFinite(n)?n:fallback;};
const row=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
let api=null,cards=[],activity=[],editing=null,reviewQueue=[],reviewIndex=0,turned=false,busy=false;
const storedKey='vada-chinese-token';
function notify(message,error=false){$('globalStatus').textContent=message;$('globalStatus').classList.toggle('error',error);}
function loginNotice(message,error=false){$('loginStatus').textContent=message;$('loginStatus').classList.toggle('error',error);}
function due(c){const stamp=c.data.dueDate;return !stamp||!Number.isFinite(new Date(stamp).getTime())||new Date(stamp).getTime()<=Date.now();}
function tomorrow(c){const dueDate=c.data.dueDate;if(!dueDate)return false;return localDay(dueDate)===localDay(Date.now()+86400000);}
function mastered(c){return asNum(c.data.correct)>=4&&asNum(c.data.interval)>=7;}
function todayCards(){return cards.filter(c=>c.data.createdDay===localDay()||localDay(c.createdAt)===localDay());}
function todayActivity(){return activity.filter(a=>a.data.action==='review'&&localDay(a.data.reviewedAt||a.createdAt)===localDay());}
function sortedCards(){return cards.slice().sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));}
function formatBadge(c){return c.data.kind==='grammar'?'Ngữ pháp':'Từ vựng';}
function showPage(name){
 for(const e of document.querySelectorAll('[data-page]'))e.hidden=e.dataset.page!==name;
 for(const b of document.querySelectorAll('.navBtn'))b.classList.toggle('active',b.dataset.pageTarget===name);
 if(name==='home')renderHome();
 if(name==='words')renderWords();
 if(name==='review')renderReview();
 if(name==='summary')renderSummary();
 window.scrollTo({top:0,behavior:'smooth'});
}
function smallWord(c){
 const b=row('button','wordTile');b.type='button';b.setAttribute('aria-label','Sửa '+clean(c.data.hanzi));
 b.append(row('div','pinyin',clean(c.data.pinyin)||formatBadge(c)),row('div','hanzi',clean(c.data.hanzi)),row('p','',clean(c.data.meaning)||'Chưa có nghĩa'));
 const footer=row('footer');footer.append(row('span','',clean(c.data.lesson)||formatBadge(c)),row('span','pill '+(due(c)?'':'gray'),due(c)?'Cần ôn':'Đã lên lịch'));b.append(footer);
 b.addEventListener('click',()=>openEditor(c));return b;
}
function renderHome(){
 const t=todayCards(),dueList=cards.filter(due),total=cards.length;
 $('statAll').textContent=total;$('statDue').textContent=dueList.length;$('statToday').textContent=t.length;$('statMaster').textContent=cards.filter(mastered).length;
 $('goalText').textContent=t.length+'/10 mục';$('goalBar').style.width=Math.min(100,t.length*10)+'%';
 $('goalHint').textContent=t.length>=10?'Đã đạt mục tiêu lưu kiến thức hôm nay.':'Còn '+(10-t.length)+' mục để đạt mục tiêu hôm nay.';
 $('duePreview').replaceChildren();
 if(!dueList.length)$('duePreview').append(row('p','muted mini','Hiện không có thẻ đến hạn. Có thể học thêm bài mới.'));
 for(const c of dueList.slice(0,3)){
   const b=row('button','noteItem');b.type='button';b.append(row('span','hanzi',clean(c.data.hanzi)));
   const wrap=row('div','grow');wrap.append(row('h3','',clean(c.data.meaning)),row('small','',clean(c.data.lesson)||formatBadge(c)));b.append(wrap);
   b.addEventListener('click',()=>showPage('review'));$('duePreview').append(b);
 }
 $('recentList').replaceChildren(...sortedCards().slice(0,6).map(smallWord));
}
function renderWords(){
 const q=clean($('searchInput').value).toLocaleLowerCase(),kind=$('kindFilter').value;
 const selected=sortedCards().filter(c=>(!kind||c.data.kind===kind)&&[c.data.hanzi,c.data.pinyin,c.data.meaning,c.data.lesson,c.data.example].join(' ').toLocaleLowerCase().includes(q));
 $('wordCount').textContent=selected.length+' / '+cards.length+' mục';$('wordsList').replaceChildren(...selected.map(smallWord));$('wordsEmpty').hidden=selected.length!==0;
}
function reviewStart(){
 reviewQueue=cards.filter(due).sort((a,b)=>String(a.data.dueDate||'').localeCompare(String(b.data.dueDate||''))).map(c=>c.id);
 reviewIndex=0;turned=false;renderReview();
}
function currentCard(){return cards.find(c=>c.id===reviewQueue[reviewIndex]);}
function renderReview(){
 if(reviewQueue.length===0||reviewIndex>=reviewQueue.length)reviewStartFromDueIfNeeded();
 const c=currentCard(),done=reviewIndex>=reviewQueue.length;
 $('reviewArea').hidden=done;$('reviewEmpty').hidden=!done;
 $('reviewSummary').textContent=done?'Bạn có thể tiếp tục khi có kiến thức đến hạn.':'Lật thẻ, tự trả lời trước, sau đó đánh giá mức độ ghi nhớ.';
 if(done)return;
 $('reviewProgress').textContent=(reviewIndex+1)+' / '+reviewQueue.length;
 $('reviewType').textContent=formatBadge(c);$('reviewFront').textContent=clean(c.data.hanzi);
 $('reviewLesson').textContent=clean(c.data.lesson)||'VADA Chinese';
 $('reviewPinyin').textContent=clean(c.data.pinyin);
 $('reviewMeaning').textContent=clean(c.data.meaning);
 $('reviewExample').textContent=clean(c.data.example);
 $('reviewTranslation').textContent=clean(c.data.translation);
 $('reviewAnswer').hidden=!turned;$('revealHint').hidden=turned;$('revealControls').hidden=turned;$('ratingControls').hidden=!turned;
}
function reviewStartFromDueIfNeeded(){
 if(reviewQueue.length===0){reviewQueue=cards.filter(due).sort((a,b)=>String(a.data.dueDate||'').localeCompare(String(b.data.dueDate||''))).map(c=>c.id);reviewIndex=0;}
}
function flip(){if(!currentCard())return;turned=true;renderReview();}
async function rating(grade){
 const c=currentCard();if(!c||busy)return;busy=true;
 document.querySelectorAll('[data-rating]').forEach(x=>x.disabled=true);
 const r=asNum(c.data.reps),previous=asNum(c.data.interval),good=grade>=2;
 const days=grade===0?0:grade===1?1:grade===2?(r===0?1:r===1?3:Math.max(4,Math.round(previous*2))):(r===0?3:Math.max(6,Math.round(previous*2.6)));
 const dueTime=new Date(Date.now()+(grade===0?10*60000:days*86400000)).toISOString();
 const fields={...c.data,dueDate:dueTime,interval:String(days),ease:String(Math.min(3,Math.max(1.3,asNum(c.data.ease,2.5)+(grade===0?-.2:grade===1?-.1:grade===3?.1:0)))),reps:String(grade===0?0:r+1),correct:String(asNum(c.data.correct)+(good?1:0)),incorrect:String(asNum(c.data.incorrect)+(!good?1:0)),lastReviewed:new Date().toISOString()};
 try{
  const result=await api.update('Cards',c.id,c.version,fields);Object.assign(c,result.record);
  try{
   const log={cardId:c.id,kind:clean(c.data.kind),hanzi:clean(c.data.hanzi),reviewedAt:new Date().toISOString(),rating:String(grade),action:'review',lesson:clean(c.data.lesson)};
   const saved=await api.create('Activity',crypto.randomUUID(),log);activity.unshift(saved.record);
   notify('Đã ghi kết quả ôn vào Google Sheets.');
  }catch(e){notify('Đã cập nhật thẻ nhưng chưa ghi nhật ký: '+e.message,true);}
  reviewIndex++;turned=false;renderReview();renderHome();
 }catch(e){notify('Không lưu được kết quả: '+e.message,true);}
 finally{busy=false;document.querySelectorAll('[data-rating]').forEach(x=>x.disabled=false);}
}
function renderSummary(){
 const date=localDay(),t=todayCards(),logs=todayActivity(),good=logs.filter(a=>asNum(a.data.rating)>=2).length,rate=logs.length?Math.round(good/logs.length*100):0;
 $('summaryDate').textContent=prettyDate(new Date()).replace(/^./,m=>m.toUpperCase());
 $('dayNew').textContent=t.length;$('dayReviews').textContent=logs.length;$('dayCorrect').textContent=rate+'%';$('dayDue').textContent=cards.filter(tomorrow).length;
 const days=Array.from({length:7},(_,i)=>new Date(Date.now()-(6-i)*86400000));
 const counts=days.map(x=>activity.filter(a=>a.data.action==='review'&&localDay(a.data.reviewedAt||a.createdAt)===localDay(x)).length);
 const max=Math.max(1,...counts);$('weekChart').replaceChildren();
 for(let i=0;i<days.length;i++){const r=row('div','chartRow');const d=row('span','',String(days[i].getDate()).padStart(2,'0')+'/'+String(days[i].getMonth()+1).padStart(2,'0'));const bar=row('div','bar'),span=row('span');span.style.width=(counts[i]/max*100)+'%';bar.append(span);r.append(d,bar,row('b','',String(counts[i])));$('weekChart').append(r);}
 const learnedMap=new Map([...t,...logs.map(a=>cards.find(c=>c.id===a.data.cardId)).filter(Boolean)].map(c=>[c.id,c]));
 $('todayKnowledge').replaceChildren();
 if(!learnedMap.size)$('todayKnowledge').append(row('p','muted mini','Chưa lưu hoặc ôn kiến thức nào hôm nay.'));
 for(const c of Array.from(learnedMap.values()).slice(0,25)){
   const a=row('div','infoLine'),left=row('div');left.append(row('b','',clean(c.data.hanzi)),row('div','muted mini',clean(c.data.pinyin)));a.append(left,row('div','',clean(c.data.meaning)));$('todayKnowledge').append(a);
 }
 const feedback=logs.length?('Bạn đã ôn '+logs.length+' lượt và nhớ được '+good+'/'+logs.length+' lượt ('+rate+'%). '):'Bạn chưa thực hiện lượt ôn nào hôm nay. ';
 $('dayFeedback').textContent='Hôm nay đã lưu '+t.length+' mục mới. '+feedback+(cards.filter(tomorrow).length?'Ngày mai có '+cards.filter(tomorrow).length+' mục đến lịch ôn.':'Không có thẻ nào được lên lịch ôn vào ngày mai.');
}
function editorStatus(m,e=false){$('editorStatus').textContent=m;$('editorStatus').classList.toggle('error',e);}
function openEditor(c=null){
 editing=c;
 $('dialogTitle').textContent=c?'Chỉnh sửa kiến thức':'Lưu kiến thức mới';
 const data=c?c.data:{};
 for(const key of ['kind','hanzi','pinyin','meaning','lesson','example','translation','notes'])$(key).value=clean(data[key])||(key==='kind'?'word':'');
 $('deleteCard').hidden=!c;editorStatus('');$('cardDialog').showModal();$('hanzi').focus();
}
function editorFields(){
 const fields={};
 for(const key of ['kind','hanzi','pinyin','meaning','lesson','example','translation','notes'])fields[key]=clean($(key).value);
 return fields;
}
async function saveEditor(evt){
 evt.preventDefault();if(busy)return;
 const fields=editorFields();if(!fields.hanzi||!fields.meaning){editorStatus('Cần nhập chữ Hán/cấu trúc và nghĩa tiếng Việt.',true);return;}
 busy=true;$('saveCard').disabled=true;editorStatus('Đang lưu…');
 try{
  if(editing){
   const result=await api.update('Cards',editing.id,editing.version,{...editing.data,...fields});
   const idx=cards.findIndex(c=>c.id===editing.id);if(idx>=0)cards[idx]=result.record;notify('Đã cập nhật kiến thức.');
  }else{
   const data={...fields,createdDay:localDay(),dueDate:new Date().toISOString(),interval:'0',ease:'2.5',reps:'0',correct:'0',incorrect:'0',lastReviewed:''};
   const saved=await api.create('Cards',crypto.randomUUID(),data);
   cards.unshift(saved.record);notify('Đã lưu vào Google Sheets.');
  }
  $('cardDialog').close();reviewQueue=[];reviewIndex=0;turned=false;renderHome();renderWords();renderSummary();
 }catch(e){editorStatus('Lưu thất bại, nội dung vẫn được giữ: '+e.message,true);}
 finally{busy=false;$('saveCard').disabled=false;}
}
async function deleteEditor(){
 if(!editing||busy)return;
 if(!confirm('Xóa "'+clean(editing.data.hanzi)+'"? Có thể khôi phục thủ công từ Google Sheets.'))return;
 busy=true;$('deleteCard').disabled=true;editorStatus('Đang xóa…');
 try{
  await api.remove('Cards',editing.id,editing.version);
  cards=cards.filter(c=>c.id!==editing.id);$('cardDialog').close();reviewQueue=[];turned=false;renderHome();renderWords();renderSummary();notify('Đã xóa kiến thức.');
 }catch(e){editorStatus('Không xóa được: '+e.message,true);}
 finally{busy=false;$('deleteCard').disabled=false;}
}
async function connect(token){
 $('loginButton').disabled=true;loginNotice('Đang đọc Google Sheets…');
 try{
  const conn=new SheetsApi({endpoint:CONFIG.endpoint,appId:APP_ID,token});
  const [c,a]=await Promise.all([conn.list('Cards'),conn.list('Activity')]);
  api=conn;cards=c;activity=a;
  sessionStorage.setItem(storedKey,token);
  $('loginView').hidden=true;$('workspace').hidden=false;$('logoutBtn').hidden=false;$('bottomNav').hidden=false;
  $('accessToken').value='';reviewQueue=[];showPage('home');notify('Đã đồng bộ dữ liệu Google Sheets.');
 }catch(e){sessionStorage.removeItem(storedKey);loginNotice('Không thể kết nối: '+e.message,true);}
 finally{$('loginButton').disabled=false;}
}
function speak(text){
 if(!('speechSynthesis' in window)){notify('Trình duyệt này chưa hỗ trợ phát âm tiếng Trung.',true);return;}
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=.85;u.pitch=1;speechSynthesis.speak(u);
}
async function copyDay(){
 const logs=todayActivity(),good=logs.filter(x=>asNum(x.data.rating)>=2).length;
 const t=todayCards(),date=localDay();
 const lines=['VADA CHINESE • TỔNG KẾT '+date,'Từ/mẫu câu mới: '+t.length,'Lượt ôn: '+logs.length,'Nhớ đúng: '+(logs.length?Math.round(good/logs.length*100):0)+'%','Ôn ngày mai: '+cards.filter(tomorrow).length,'Kiến thức mới: '+t.map(c=>clean(c.data.hanzi)+' ('+clean(c.data.pinyin)+'): '+clean(c.data.meaning)).join('; ')];
 try{await navigator.clipboard.writeText(lines.join('\n'));notify('Đã sao chép tổng kết.');}catch{notify('Trình duyệt không cho phép sao chép tự động.',true);}
}
$('loginForm').addEventListener('submit',e=>{e.preventDefault();connect(clean($('accessToken').value));});
$('logoutBtn').addEventListener('click',()=>{sessionStorage.removeItem(storedKey);location.reload();});
document.querySelectorAll('[data-page-target]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.pageTarget)));
document.querySelectorAll('[data-action="add"]').forEach(b=>b.addEventListener('click',()=>openEditor()));
$('searchInput').addEventListener('input',renderWords);$('kindFilter').addEventListener('change',renderWords);
$('cardForm').addEventListener('submit',saveEditor);$('closeDialog').addEventListener('click',()=>$('cardDialog').close());$('cancelCard').addEventListener('click',()=>$('cardDialog').close());
$('deleteCard').addEventListener('click',deleteEditor);$('revealBtn').addEventListener('click',flip);
$('reviewFlashcard').addEventListener('click',flip);$('reviewFlashcard').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip();}});
document.querySelectorAll('[data-rating]').forEach(b=>b.addEventListener('click',()=>rating(Number(b.dataset.rating))));
$('speakReview').addEventListener('click',()=>{const c=currentCard();if(c)speak(clean(c.data.hanzi));});
$('copySummary').addEventListener('click',copyDay);
const saved=sessionStorage.getItem(storedKey);if(saved)connect(saved);
