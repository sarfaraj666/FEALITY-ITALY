const http=require('node:http'), fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
const {randomUUID,createHmac}=require('node:crypto');
const root=path.resolve(__dirname,'..'), port=Number(process.env.PORT||8184), origin='http://127.0.0.1:'+port;
const mock=process.env.LEAD_MODE==='mock', url=process.env.LEAD_SCRIPT_URL, secret=process.env.LEAD_SIGNING_KEY;
if(!mock && (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url||'') || !/^[a-f0-9]{64}$/i.test(secret||''))) throw Error('Configure the server environment or explicitly select mock mode.');
const catalog={};
for(const [key,file,global] of [['Kitchen','kitchen','Kitchen'],['Wardrobes','wardrobe','Wardrobe'],['Vanity','vanity','Vanity']]){
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,file+'-data.js'),'utf8'),ctx);
 catalog[key]=new Map(ctx.window['Feality'+global+'Designs'].map(d=>[d.id,d.name||'Kitchen Design '+d.id]));
}
let windowStart=0, attempts=0;const saved=new Map();
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon'};
http.createServer(async(req,res)=>{
 const reply=(n,obj)=>{res.writeHead(n,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(obj))};
 try{
 if(req.headers.host!==new URL(origin).host)return reply(403,{});
 const route=new URL(req.url,origin).pathname;
 if(route==='/api/enquiries' && req.method==='GET')return reply(200,{enabled:true,mock,designs:Object.fromEntries(Object.entries(catalog).map(([name,items])=>[name,Array.from(items,([id,title])=>({id,title}))]))});
 if(route==='/api/enquiries'){
 if(req.method!=='POST'||req.headers.origin!==origin||req.headers['content-type']!=='application/json')return reply(403,{});
 if(Date.now()-windowStart>60000){windowStart=Date.now();attempts=0}
 if(++attempts>12)return reply(429,{error:'Too many attempts. Try again in a minute.'});
 let body=''; for await(const chunk of req){body+=chunk.toString('latin1');if(body.length>8192)return reply(413,{})}
 let d;try{d=JSON.parse(Buffer.from(body,'latin1').toString())}catch{return reply(400,{})}
 const str=(v,n)=>typeof v==='string'&&v.trim().length>0&&v.length<=n;
 if(!d||!str(d.name,100)||!str(d.city,100)||!str(d.phone,24)||!/^\+?[\d ()-]+$/.test(d.phone)||!/^\d{7,15}$/.test(d.phone.replace(/\D/g,''))||(typeof d.email!=='string'||d.email.length>254||(d.email!==''&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)))||typeof d.message!=='string'||d.message.length>1200||d.consent!==true||d.website!==''||!Object.hasOwn(catalog,d.collection)||!catalog[d.collection].has(d.designId)||!/^([a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12})$/i.test(d.key))return reply(422,{error:'Check the required fields, phone number and privacy consent.'});
 const lead={key:d.key,name:d.name.trim(),phone:d.phone.trim(),email:d.email.trim(),city:d.city.trim(),collection:d.collection,design:catalog[d.collection].get(d.designId),message:d.message.trim(),consent:true};
 if(mock){if(process.env.LEAD_MOCK_FAIL==='1')return reply(503,{error:'Simulated save failure.'});if(!saved.has(d.key))saved.set(d.key,'TEST-'+randomUUID());return reply(200,{id:saved.get(d.key),mock:true})}
 const payload=JSON.stringify({at:Date.now(),lead}),sig=createHmac('sha256',secret).update(payload).digest('hex');
 const upstream=await fetch(url,{method:'POST',redirect:'manual',headers:{'Content-Type':'application/json'},body:JSON.stringify({payload,sig}),signal:AbortSignal.timeout(18000)});
 const destination=new URL(upstream.headers.get('location')||url);
 if(![302,303].includes(upstream.status)||destination.origin!=='https://script.googleusercontent.com')throw Error();
 const ack=await fetch(destination,{redirect:'error',signal:AbortSignal.timeout(10000)});const result=await ack.json();
 if(!ack.ok||result.saved!==true||!/^FE-[0-9a-f]{32}$/.test(result.id))throw Error();
 return reply(200,{id:result.id,mock:false});
 }
 const name=decodeURIComponent(route==='/'?'/index.html':route),file=path.resolve(root,'.'+name),ext=path.extname(file);
 if(req.method!=='GET'||!mime[ext]||!(path.dirname(file)===root||file.startsWith(path.join(root,'assets')+path.sep))||!fs.existsSync(file))return reply(404,{});
 res.writeHead(200,{'Content-Type':mime[ext]});fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
 }catch{return reply(502,{error:'Save could not be confirmed. Retry this enquiry.'})}
}).listen(port,'127.0.0.1',()=>console.log(origin+' — '+(mock?'dummy memory store':'private Sheet submission')));
