import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../backend/Code.gs',import.meta.url),'utf8');
const meta=['_id','_owner','_version','_createdAt','_updatedAt','_deleted'];
class Sheet {
 constructor(rows){this.rows=structuredClone(rows);}
 getLastRow(){return this.rows.length;}getLastColumn(){return this.rows[0].length;}
 getDataRange(){return this.getRange(1,1,this.rows.length,this.getLastColumn());}
 getRange(r,c,n,m){return {getValues:()=>Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>this.rows[r-1+i]?.[c-1+j]??'')),setValues:a=>a.forEach((row,i)=>{this.rows[r-1+i]??=[];row.forEach((v,j)=>this.rows[r-1+i][c-1+j]=typeof v==='string'&&v.startsWith("'")?v.slice(1):v);})};}
}
const tokenA='a'.repeat(43),tokenB='b'.repeat(43),tokenOther='c'.repeat(43),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const apps=new Sheet([['appId','status','spreadsheetId','schemaJson','maxRows','requestsPerMinute'],['app-a','active','dbA','{"Notes":["title","body"],"Tags":["name"]}',5000,120],['app-b','active','dbB','{"Notes":["title","body"]}',5000,120]]);
const grants=new Sheet([['tokenHash','grantId','appId','operations','sheets','status','expiresAt','scope'],[hash(tokenA),'user-a','app-a','create,read,update,delete','Notes,Tags','active','2099-01-01','own'],[hash(tokenB),'user-b','app-b','create,read,update,delete','Notes','active','2099-01-01','own'],[hash(tokenOther),'other-a','app-a','read','Notes','active','2099-01-01','own']]);
const registry={getSheetByName:n=>({Apps:apps,Grants:grants})[n]};
const dataA={Notes:new Sheet([meta.concat(['title','body'])]),Tags:new Sheet([meta.concat(['name'])])},dataB={Notes:new Sheet([meta.concat(['title','body'])])};
const cache=new Map();let held=false;
const ctx=vm.createContext({PropertiesService:{getScriptProperties:()=>({getProperty:()=>'registry'})},console:{warn:()=>{}},Utilities:{getUuid:()=>crypto.randomUUID(),DigestAlgorithm:{SHA_256:1},Charset:{UTF_8:1},computeDigest:(_,s)=>[...crypto.createHash('sha256').update(s).digest()]},LockService:{getScriptLock:()=>({tryLock:()=>held=true,hasLock:()=>held,releaseLock:()=>held=false})},CacheService:{getScriptCache:()=>({get:k=>cache.get(k),put:(k,v)=>cache.set(k,v)})},SpreadsheetApp:{openById:id=>id==='dbA'?{getSheetByName:n=>dataA[n]}:id==='dbB'?{getSheetByName:n=>dataB[n]}:registry,flush:()=>{}},ContentService:{MimeType:{JSON:'application/json'},createTextOutput:text=>({setMimeType:()=>text})}});
vm.runInContext(source,ctx);
const call=(action,args={},token=tokenA,appId='app-a',sheet='Notes')=>JSON.parse(ctx.doPost({postData:{contents:JSON.stringify({appId,token,action,sheet,...args})}}));
let checks=0;function check(name,fn){fn();checks++;console.log('PASS '+name);}
const id=crypto.randomUUID();let result;
check('create stores data',()=>{result=call('create',{id,data:{title:'Tiếng Việt',body:'=1+1'}});assert.equal(result.data.record.version,1);assert.equal(dataA.Notes.rows.length,2);assert.equal(result.data.record.data.body,'=1+1');});
check('create retry is idempotent',()=>{assert.equal(call('create',{id,data:{title:'Tiếng Việt',body:'=1+1'}}).data.replayed,true);assert.equal(dataA.Notes.rows.length,2);});
check('read persisted value',()=>assert.equal(call('read').data.records[0].data.title,'Tiếng Việt'));
check('update increments version',()=>assert.equal(call('update',{id,version:1,data:{title:'Đã sửa'}}).data.record.version,2));
check('update retry is idempotent',()=>assert.equal(call('update',{id,version:1,data:{title:'Đã sửa'}}).data.replayed,true));
check('stale update rejected',()=>assert.equal(call('update',{id,version:1,data:{title:'stale'}}).error.code,'CONFLICT'));
check('other app initially empty',()=>assert.equal(call('read',{},tokenB,'app-b').data.records.length,0));
check('cross app token rejected',()=>assert.equal(call('read',{},tokenA,'app-b').error.code,'UNAUTHORIZED'));
check('another user cannot read owner records',()=>assert.equal(call('read',{},tokenOther).data.records.length,0));
check('read only user cannot write',()=>assert.equal(call('create',{id:crypto.randomUUID(),data:{title:'x',body:''}},tokenOther).error.code,'FORBIDDEN'));
check('arbitrary spreadsheet ID rejected',()=>assert.equal(call('read',{spreadsheetId:'any-id'}).error.code,'BAD_REQUEST'));
check('unlisted sheet rejected',()=>assert.equal(call('read',{},tokenA,'app-a','Apps').error.code,'FORBIDDEN'));
check('metadata injection rejected',()=>assert.equal(call('update',{id,version:2,data:{_owner:'user-b'}}).error.code,'BAD_REQUEST'));
check('multi sheet CRUD allowed',()=>assert.equal(call('create',{id:crypto.randomUUID(),data:{name:'work'}},tokenA,'app-a','Tags').ok,true));
check('second app stores independent note',()=>{assert.equal(call('create',{id,data:{title:'B',body:'separate'}},tokenB,'app-b').ok,true);assert.equal(call('read',{id}).data.record.data.title,'Đã sửa');});
check('soft delete hides note',()=>{assert.equal(call('delete',{id,version:2}).data.deleted,true);assert.equal(call('read').data.records.length,0);assert.equal(dataA.Notes.rows[1][5],true);});
check('delete retry is idempotent',()=>assert.equal(call('delete',{id,version:2}).data.replayed,true));
check('other app survives deletion',()=>assert.equal(call('read',{},tokenB,'app-b').data.records.length,1));
check('invalid JSON handled',()=>assert.equal(JSON.parse(ctx.doPost({postData:{contents:'{'}})).error.code,'BAD_REQUEST'));
check('expired grant denied',()=>{grants.rows[1][6]='2000-01-01';assert.equal(call('read').error.code,'UNAUTHORIZED');grants.rows[1][6]='2099-01-01';});
check('revoked grant denied immediately',()=>{grants.rows[1][5]='revoked';assert.equal(call('read').error.code,'UNAUTHORIZED');grants.rows[1][5]='active';});
check('inactive app denied',()=>{apps.rows[1][1]='inactive';assert.equal(call('read').error.code,'UNAUTHORIZED');apps.rows[1][1]='active';});
check('rate limit enforced for cached window',()=>{for(let i=0;i<130;i++)result=call('read');assert.equal(result.error.code,'RATE_LIMIT');});
assert.equal(held,false);console.log(`${checks} checks passed (mock Google services; not a deployment test).`);

