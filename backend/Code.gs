/** One deployment, multiple private registry-controlled databases. */
const API_VERSION = '1.0.0';
const META = ['_id','_owner','_version','_createdAt','_updatedAt','_deleted'];
const ACTIONS = ['create','read','update','delete'];

function doGet() {
  return json_({ok:true,data:{service:'HTML Apps - Shared Google Sheets API',version:API_VERSION},status:200});
}

function doPost(e) {
  const requestId=Utilities.getUuid();
  let lock;
  try {
    const raw=e && e.postData && e.postData.contents;
    demand_(typeof raw==='string' && raw.length<=30000,'BAD_REQUEST',400,'Yêu cầu quá lớn hoặc thiếu nội dung.');
    const req=JSON.parse(raw);
    demand_(req && !Array.isArray(req) && typeof req==='object','BAD_REQUEST',400,'Nội dung phải là JSON object.');
    const allowed=['appId','token','action','sheet','id','version','data','cursor','limit'];
    demand_(Object.keys(req).every(k=>allowed.indexOf(k)>=0),'BAD_REQUEST',400,'Tham số không được hỗ trợ.');
    demand_(typeof req.appId==='string' && /^[a-z0-9][a-z0-9-]{2,63}$/.test(req.appId),'UNAUTHORIZED',401,'Thông tin truy cập không hợp lệ.');
    demand_(typeof req.token==='string' && /^[A-Za-z0-9_-]{43}$/.test(req.token),'UNAUTHORIZED',401,'Thông tin truy cập không hợp lệ.');
    demand_(ACTIONS.indexOf(req.action)>=0,'BAD_REQUEST',400,'Thao tác không được hỗ trợ.');
    lock=LockService.getScriptLock();
    demand_(lock.tryLock(10000),'BUSY',503,'Hệ thống đang bận. Vui lòng thử lại.');
    const registryId=PropertiesService.getScriptProperties().getProperty('REGISTRY_ID');
    demand_(registryId,'CONFIG_ERROR',503,'Chưa thiết lập bảng quản lý.');
    const registry=SpreadsheetApp.openById(registryId);
    const apps=rows_(registry,'Apps',1000);
    const app=apps.find(a=>a.appId===req.appId && a.status==='active');
    const hash=sha256_(req.token);
    const grant=rows_(registry,'Grants',3000).find(g=>g.appId===req.appId && constantEqual_(String(g.tokenHash),hash) && g.status==='active');
    demand_(app && grant && (!grant.expiresAt || Date.parse(grant.expiresAt)>Date.now()),'UNAUTHORIZED',401,'Thông tin truy cập không hợp lệ hoặc đã hết hạn.');
    demand_(grant.scope==='own' || grant.scope==='app','CONFIG_ERROR',503,'Cấu hình quyền chưa hợp lệ.');
    demand_(split_(grant.operations).indexOf(req.action)>=0,'FORBIDDEN',403,'Bạn không có quyền thực hiện thao tác này.');
    const schema=JSON.parse(String(app.schemaJson));
    demand_(typeof req.sheet==='string' && Object.prototype.hasOwnProperty.call(schema,req.sheet) && split_(grant.sheets).indexOf(req.sheet)>=0,'FORBIDDEN',403,'Không được truy cập sheet này.');
    const fields=schema[req.sheet];
    demand_(Array.isArray(fields) && fields.length>0 && fields.length<=40 && fields.every(f=>typeof f==='string' && /^[a-z][A-Za-z0-9_]{0,39}$/.test(f)) && new Set(fields).size===fields.length,'CONFIG_ERROR',503,'Schema chưa hợp lệ.');
    throttle_(grant.grantId,Math.min(120,Math.max(1,Number(app.requestsPerMinute)||60)));
    // Spreadsheet IDs supplied by the caller are never accepted.
    demand_(app.spreadsheetId!==registryId,'CONFIG_ERROR',503,'Cơ sở dữ liệu không hợp lệ.');
    const db=SpreadsheetApp.openById(String(app.spreadsheetId));
    const sh=db.getSheetByName(req.sheet);
    demand_(sh,'CONFIG_ERROR',503,'Sheet dữ liệu chưa được tạo.');
    const headers=META.concat(fields);
    demand_(JSON.stringify(sh.getRange(1,1,1,headers.length).getValues()[0])===JSON.stringify(headers) && sh.getLastColumn()===headers.length,'CONFIG_ERROR',503,'Cột dữ liệu không khớp schema.');
    const maxRows=Math.min(10000,Math.max(1,Number(app.maxRows)||5000));
    demand_(sh.getLastRow()<=maxRows+1,'CAPACITY',503,'Sheet vượt giới hạn số bản ghi.');
    const values=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,headers.length).getValues():[];
    const visible=r=>grant.scope==='app' || String(r[1])===String(grant.grantId);
    const record=r=>{const out={id:String(r[0]),version:Number(r[2]),createdAt:String(r[3]),updatedAt:String(r[4]),data:{}};fields.forEach((f,i)=>out.data[f]=r[i+6]);return out;};
    let result;
    if(req.action==='read') {
      if(req.id!==undefined) {
        const r=values.find(r=>String(r[0])===req.id && !deleted_(r[5]) && visible(r));
        demand_(r,'NOT_FOUND',404,'Không tìm thấy bản ghi.'); result={record:record(r)};
      } else {
        const cursor=req.cursor===undefined?0:req.cursor, limit=req.limit===undefined?100:req.limit;
        demand_(Number.isInteger(cursor) && cursor>=0 && cursor<=values.length && Number.isInteger(limit) && limit>=1 && limit<=100,'BAD_REQUEST',400,'Phân trang không hợp lệ.');
        const records=[];let pos=cursor;
        while(pos<values.length && records.length<limit){const r=values[pos++];if(!deleted_(r[5])&&visible(r))records.push(record(r));}
        result={records,nextCursor:pos<values.length?pos:null};
      }
    } else {
      demand_(typeof req.id==='string' && /^[a-zA-Z0-9_-]{16,80}$/.test(req.id),'BAD_REQUEST',400,'ID bản ghi không hợp lệ.');
      const at=values.findIndex(r=>String(r[0])===req.id);const old=at>=0?values[at]:null;
      const now=new Date().toISOString();
      if(req.action==='create') {
        const data=validateData_(req.data,fields,true);
        if(old){
          demand_(visible(old) && !deleted_(old[5]) && fields.every((f,i)=>String(old[i+6])===String(data[f])),'CONFLICT',409,'ID đã tồn tại.');
          result={record:record(old),replayed:true};
        } else {
          demand_(values.length<maxRows,'CAPACITY',409,'Sheet đã đầy. Liên hệ quản trị.');
          const row=[req.id,String(grant.grantId),1,now,now,false].concat(fields.map(f=>cell_(data[f])));
          sh.getRange(sh.getLastRow()+1,1,1,row.length).setValues([row]);SpreadsheetApp.flush();
          // Read back values so formula-escape apostrophes do not leak into the API.
          result={record:record(sh.getRange(sh.getLastRow(),1,1,row.length).getValues()[0])};
        }
      } else {
        demand_(old && visible(old),'NOT_FOUND',404,'Không tìm thấy bản ghi.');
        demand_(Number.isInteger(req.version) && req.version>0,'BAD_REQUEST',400,'Thiếu phiên bản bản ghi.');
        if(req.action==='delete' && deleted_(old[5]) && Number(old[2])===req.version+1){result={id:req.id,deleted:true,version:Number(old[2]),replayed:true};}
        else {
          demand_(!deleted_(old[5]),'NOT_FOUND',404,'Không tìm thấy bản ghi.');
          let data={};if(req.action==='update')data=validateData_(req.data,fields,false);
          if(req.action==='update' && Number(old[2])===req.version+1 && Object.keys(data).every(f=>String(old[fields.indexOf(f)+6])===String(data[f]))) {
            return json_({ok:true,data:{record:record(old),replayed:true},status:200,requestId});
          }
          demand_(Number(old[2])===req.version,'CONFLICT',409,'Bản ghi đã thay đổi. Tải lại trước khi sửa.');
          const next=old.slice();next[2]=Number(old[2])+1;next[4]=now;
          if(req.action==='delete')next[5]=true;
          else fields.forEach((f,i)=>{if(Object.prototype.hasOwnProperty.call(data,f))next[i+6]=data[f];});
          const stored=next.map((v,i)=>i>=6?cell_(v):v);
          sh.getRange(at+2,1,1,stored.length).setValues([stored]);SpreadsheetApp.flush();
          result=req.action==='delete'?{id:req.id,deleted:true,version:next[2]}:{record:record(sh.getRange(at+2,1,1,stored.length).getValues()[0])};
        }
      }
    }
    return json_({ok:true,data:result,status:200,requestId});
  } catch(err) {
    const known=!!err.apiCode;
    const code=known?err.apiCode:(err instanceof SyntaxError?'BAD_REQUEST':'INTERNAL');
    // Never log request bodies, tokens, note contents or raw Google exceptions.
    console.warn(JSON.stringify({requestId,code}));
    return json_({ok:false,error:{code,message:known?err.message:(code==='BAD_REQUEST'?'JSON không hợp lệ.':'Không xử lý được yêu cầu. Liên hệ quản trị với requestId.')},status:known?err.apiStatus:(code==='BAD_REQUEST'?400:500),requestId});
  } finally {if(lock && lock.hasLock())lock.releaseLock();}
}
function rows_(book,name,max) {
 const sh=book.getSheetByName(name);demand_(sh && sh.getLastRow()<=max+1,'CONFIG_ERROR',503,'Bảng quản lý chưa hợp lệ.');
 const rows=sh.getDataRange().getValues(),heads=rows.shift();
 demand_(new Set(heads).size===heads.length,'CONFIG_ERROR',503,'Cột quản lý bị trùng.');
 return rows.filter(r=>r[0]!=='').map(r=>Object.fromEntries(heads.map((h,i)=>[String(h),r[i]])));
}
function validateData_(data,fields,full) {
 demand_(data && typeof data==='object' && !Array.isArray(data) && Object.keys(data).length>0 && Object.keys(data).every(k=>fields.indexOf(k)>=0),'BAD_REQUEST',400,'Trường dữ liệu không hợp lệ.');
 demand_(!full || fields.every(f=>Object.prototype.hasOwnProperty.call(data,f)),'BAD_REQUEST',400,'Thiếu trường dữ liệu.');
 Object.keys(data).forEach(k=>demand_(typeof data[k]==='string' && data[k].length<=20000,'BAD_REQUEST',400,'Dữ liệu phải là chuỗi tối đa 20.000 ký tự.'));
 return data;
}
function throttle_(id,limit) {
 const c=CacheService.getScriptCache(),key='rate:'+sha256_(String(id))+':'+Math.floor(Date.now()/60000);
 const n=Number(c.get(key)||0);demand_(n<limit,'RATE_LIMIT',429,'Quá nhiều yêu cầu. Vui lòng thử lại sau một phút.');c.put(key,String(n+1),120);
}
function cell_(v){return typeof v==='string' && /^[=+\-@\t\r]/.test(v)?"'"+v:v;}
function deleted_(v){return v===true || String(v).toLowerCase()==='true';}
function split_(v){return String(v||'').split(',').map(s=>s.trim()).filter(Boolean);}
function sha256_(v){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,v,Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');}
function constantEqual_(a,b){let n=a.length^b.length;for(let i=0;i<b.length;i++)n|=(a.charCodeAt(i)||0)^b.charCodeAt(i);return n===0;}
function demand_(condition,code,status,message){if(!condition){const e=new Error(message);e.apiCode=code;e.apiStatus=status;throw e;}}
function json_(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}

