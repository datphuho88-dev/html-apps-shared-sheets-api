import {CONFIG} from './config.js?v=20261027b';
import {SheetsApi} from './api-client.js';
const $=id=>document.getElementById(id);
const appId=new URLSearchParams(location.search).get('app')||CONFIG.defaultAppId;
const appName=CONFIG.apps[appId];
document.title=appName||'App không hợp lệ';$('appName').textContent=appName||'App không hợp lệ';
$('otherApp').href='?app='+(appId==='test-notes'?'test-notes-2':'test-notes');
const key='notes-access:'+appId;
let api,notes=[],selected=null,dirty=false,busy=null,timer,revision=0,connecting=false;
function status(text,error=false){$('status').textContent=text;$('status').parentElement.classList.toggle('error',error);$('retry').hidden=!error||!dirty;}
function drawList(){
 const query=$('search').value.toLocaleLowerCase('vi');$('notesList').replaceChildren();
 const shown=notes.filter(n=>(n.data.title+' '+n.data.body).toLocaleLowerCase('vi').includes(query));
 $('count').textContent=shown.length+' ghi chú';
 shown.slice().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).forEach(n=>{
  const b=document.createElement('button');b.className='note'+(selected?.id===n.id?' active':'');
  const title=document.createElement('strong');title.textContent=n.data.title||'Chưa có tiêu đề';
  const preview=document.createElement('p');preview.textContent=n.data.body||'Chưa có nội dung';
  const t=document.createElement('time');t.textContent=new Date(n.updatedAt).toLocaleString('vi-VN');
  b.append(title,preview,t);b.addEventListener('click',()=>choose(n));$('notesList').append(b);
 });
}
function renderEditor(){
 $('empty').hidden=!!selected;$('fields').hidden=!selected;
 if(selected){$('title').value=selected.data.title;$('body').value=selected.data.body;$('updatedAt').textContent='Cập nhật '+new Date(selected.updatedAt).toLocaleString('vi-VN');}
 drawList();
}
async function save(){
 clearTimeout(timer);if(busy){await busy;return dirty?save():undefined;}if(!dirty||!selected)return;
 const note=selected,seq=revision,data={title:$('title').value,body:$('body').value};status('Đang lưu…');
 const operation=(async()=>{
  try {
   if(note.pending && !note.pendingData)note.pendingData=data;
   const sent=note.pending?note.pendingData:data;
   const result=note.pending?await api.create('Notes',note.id,sent):await api.update('Notes',note.id,note.version,sent);
   Object.assign(note,result.record,{pending:false});
   if(selected?.id===note.id){dirty=seq!==revision || JSON.stringify(sent)!==JSON.stringify(data);if(!dirty){$('updatedAt').textContent='Cập nhật '+new Date(note.updatedAt).toLocaleString('vi-VN');status('Đã lưu vào Google Sheets');}else status('Đang chờ lưu thay đổi mới…');}
   drawList();
  }catch(error){status((error.code==='CONFLICT'?'Có thay đổi từ phiên khác. Sao chép nội dung đang nhập, rồi tải lại. ': '')+error.message,true);throw error;}
 })();busy=operation;
 try{await operation;}finally{busy=null;}
 if(dirty)timer=setTimeout(()=>save().catch(()=>{}),900);
}
async function choose(note){try{await save();selected=note;dirty=false;renderEditor();}catch{}}
async function newNote(){
 try{await save();selected={id:crypto.randomUUID(),version:0,updatedAt:new Date().toISOString(),data:{title:'',body:''},pending:true};notes.unshift(selected);revision++;dirty=true;renderEditor();$('title').focus();await save();}catch{}
}
async function reload(){
 try{await save();$('reload').disabled=true;status('Đang tải ghi chú…');const next=await api.list('Notes');notes=next;selected=next.find(n=>n.id===selected?.id)||next[0]||null;dirty=false;renderEditor();status('Đã tải từ Google Sheets');}
 catch(error){status(error.message,true);}finally{$('reload').disabled=false;}
}
async function connect(token){
 if(connecting)return;connecting=true;$('connect').disabled=true;$('loginStatus').textContent='Đang kết nối…';
 try{if(!appName)throw new Error('App ID không hợp lệ.');api=new SheetsApi({endpoint:CONFIG.endpoint,appId,token});notes=await api.list('Notes');sessionStorage.setItem(key,token);$('token').value='';$('login').hidden=true;$('workspace').hidden=false;selected=notes[0]||null;renderEditor();status('Đã tải từ Google Sheets');}
 catch(error){sessionStorage.removeItem(key);$('loginStatus').textContent=error.message;}
 finally{connecting=false;$('connect').disabled=false;}
}
$('loginForm').addEventListener('submit',e=>{e.preventDefault();connect($('token').value.trim());});
['title','body'].forEach(id=>$(id).addEventListener('input',()=>{revision++;dirty=true;status('Chưa lưu…');clearTimeout(timer);timer=setTimeout(()=>save().catch(()=>{}),900);}));
$('newNote').addEventListener('click',newNote);$('startNote').addEventListener('click',newNote);
$('reload').addEventListener('click',reload);$('retry').addEventListener('click',()=>save().catch(()=>{}));$('search').addEventListener('input',drawList);
$('deleteNote').addEventListener('click',()=>$('deleteDialog').showModal());$('cancelDelete').addEventListener('click',()=>$('deleteDialog').close());
$('confirmDelete').addEventListener('click',async()=>{
 $('confirmDelete').disabled=true;
 try{await save();const note=selected;await api.remove('Notes',note.id,note.version);notes=notes.filter(n=>n.id!==note.id);selected=notes[0]||null;dirty=false;renderEditor();status('Đã xóa ghi chú');$('deleteDialog').close();}
 catch(error){status(error.message,true);}finally{$('confirmDelete').disabled=false;}
});
$('logout').addEventListener('click',async()=>{try{await save();sessionStorage.removeItem(key);location.reload();}catch{}});
window.addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue='';}});
const saved=sessionStorage.getItem(key);if(saved)connect(saved);

