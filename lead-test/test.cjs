const assert=require('node:assert/strict'),{spawn}=require('node:child_process'),{once}=require('node:events'),crypto=require('node:crypto'),vm=require('node:vm'),fs=require('node:fs');
(async()=>{
 const origin='http://127.0.0.1:18184', key=crypto.randomUUID(),lead={key,name:'=1+1',phone:'+00012345678',email:'dummy@example.invalid',city:'Test City',collection:'Kitchen',designId:'04',message:'Dummy test',consent:true,website:''};
 for(const fail of ['0','1']){
 const child=spawn(process.execPath,[__dirname+'/server.cjs'],{env:{...process.env,PORT:'18184',LEAD_MODE:'mock',LEAD_MOCK_FAIL:fail},stdio:['ignore','pipe','inherit']});try{
 await once(child.stdout,'data');const post=(d,from=origin)=>fetch(origin+'/api/enquiries',{method:'POST',headers:{Origin:from,'Content-Type':'application/json'},body:JSON.stringify(d)});
 if(fail==='1'){assert.equal((await post(lead)).status,503);continue}
 const a=await (await post(lead)).json();assert.match(a.id,/^TEST-/);assert.equal((await (await post(lead)).json()).id,a.id);
 for(const bad of [{consent:false},{website:'bot'},{designId:'99'},{name:''},{phone:'123'}])assert.equal((await post({...lead,...bad})).status,422);
 assert.equal((await post(lead,'http://other.invalid')).status,403);
 for(let i=0;i<5;i++)await post(lead);assert.equal((await post(lead)).status,429);
 assert.equal((await fetch(origin+'/lead-test/Code.gs')).status,404);
 }finally{const exit=once(child,'exit');child.kill();await exit}}
 const rows=[],secret='a'.repeat(64),headers=['Enquiry ID','Date','Time','Customer Name','Phone Number','Email','City','Collection','Design Name','Message','Lead Status'];
 const sign=s=>crypto.createHmac('sha256',secret).update(s).digest('hex');
 const ctx={PropertiesService:{getScriptProperties:()=>({getProperty:k=>k==='SIGNING_KEY'?secret:'dummy-book'})},Utilities:{Charset:{UTF_8:'utf8'},computeHmacSha256Signature:s=>Array.from(Buffer.from(sign(s),'hex')),formatDate:(_,z,f)=>{assert.equal(z,'Asia/Kolkata');return f}},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},SpreadsheetApp:{openById:()=>({getSheetByName:()=>({getRange:()=>({getValues:()=>[headers],createTextFinder:id=>({matchEntireCell:()=>({findNext:()=>rows.some(r=>r[0]===id)})})})})})},Sheets:{Spreadsheets:{Values:{append:({values},id,range,opts)=>{assert.equal(opts.valueInputOption,'RAW');rows.push(...values);return {updates:{updatedRows:1}}}}}},ContentService:{MimeType:{JSON:'json'},createTextOutput:v=>({setMimeType:()=>JSON.parse(v)})}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/Code.gs','utf8'),ctx);
 const req=(at,signed=true)=>{const payload=JSON.stringify({at,lead:{...lead,design:'ONYX'}}),contents=JSON.stringify({sig:signed?sign(payload):'0'.repeat(64),payload});return ctx.doPost({postData:{contents,length:contents.length}})};
 assert.equal(req(Date.now(),false).saved,false);assert.equal(req(Date.now()-100000).saved,false);
 assert.equal(req(Date.now()).saved,true);assert.equal(req(Date.now()).id,rows[0][0]);assert.equal(rows.length,1);
 assert.deepEqual(Array.from(rows[0]).slice(3),['=1+1','+00012345678','dummy@example.invalid','Test City','Kitchen','ONYX','Dummy test','New']);
 console.log('Passed: local mock HTTP, validation, retries, failure, origin, limits, private files, signed Apps Script simulation and RAW row mapping.');
})().catch(e=>{console.error(e);process.exitCode=1});
