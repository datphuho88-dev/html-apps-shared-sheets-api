/** No embedded credentials. Supply a per-app user token at runtime. */
export class SheetsApi {
  constructor({endpoint, appId, token}) { this.endpoint=endpoint; this.appId=appId; this.token=token; }
  async call(action, sheet, args={}) {
    if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(this.endpoint)) throw new Error('Web App chưa được cấu hình.');
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),45000);
    let response;
    try {
      response=await fetch(this.endpoint,{method:'POST',redirect:'follow',credentials:'omit',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({appId:this.appId,token:this.token,action,sheet,...args}),signal:controller.signal});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const result=await response.json();
      if(!result.ok){const error=new Error(result.error.message);error.code=result.error.code;error.requestId=result.requestId;throw error;}
      return result.data;
    } catch(error) {
      if(error.name==='AbortError')throw new Error('Chưa xác nhận lưu sau 45 giây. Giữ nội dung và thử lại.');
      throw error;
    } finally { clearTimeout(timer); }
  }
  create(sheet,id,data){return this.call('create',sheet,{id,data});}
  update(sheet,id,version,data){return this.call('update',sheet,{id,version,data});}
  remove(sheet,id,version){return this.call('delete',sheet,{id,version});}
  async list(sheet){
    const records=[];let cursor=0;
    do {const page=await this.call('read',sheet,{cursor,limit:100});records.push(...page.records);cursor=page.nextCursor;} while(cursor!==null);
    return records;
  }
}

