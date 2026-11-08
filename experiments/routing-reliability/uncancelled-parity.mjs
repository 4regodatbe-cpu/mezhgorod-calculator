import fs from 'node:fs';import zlib from 'node:zlib';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';import {registerHooks,stripTypeScriptTypes} from 'node:module';import {NextRequest} from 'next/server';
const api=new URL('../../app/api/v3/calculate/route.ts',import.meta.url),beforeUrl=api.href+'?stageB=before',source=fs.readFileSync(new URL('./2026-10-29/api-before.txt',import.meta.url),'utf8');
const hook=registerHooks({load(url,context,next){return url===beforeUrl?{format:'module',source:stripTypeScriptTypes(source),shortCircuit:true}:next(url,context);}});
const before=(await import(beforeUrl)).POST,after=(await import(api.href)).POST;hook.deregister();
const file='experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/dnr-донецк-moscow-center/2026-10-15T22-34-03-156Z-capture.json.gz',bytes=fs.readFileSync(file),saved=JSON.parse(zlib.gunzipSync(bytes));
const hash=b=>createHash('sha256').update(b).digest('hex');
function sameRoute(a,b){
 if(a.hostname!==b.hostname||a.pathname!==b.pathname)return false;
 if(a.pathname==='/route'){const x=JSON.parse(a.searchParams.get('json')),y=JSON.parse(b.searchParams.get('json'));return JSON.stringify(x.locations)===JSON.stringify(y.locations)&&x.costing===y.costing&&x.costing_options?.auto?.use_tolls===y.costing_options?.auto?.use_tolls;}
 return a.pathname==='/trace_attributes'||a.searchParams.get('profile')===b.searchParams.get('profile');
}
async function run(post){const original=globalThis.fetch,info=console.info,calls=[],misses=[];console.info=()=>{};
 globalThis.fetch=async(input,init)=>{const url=new URL(input),body=String(init?.body??'');calls.push({url:String(url),body});const hit=saved.calls.find(c=>sameRoute(new URL(c.url),url)&&(url.pathname!=='/trace_attributes'||JSON.stringify(JSON.parse(c.body).shape)===JSON.stringify(JSON.parse(body).shape)));if(!hit){misses.push({url:String(url),body});return new Response('{}',{status:503});}return new Response(hit.text,{status:hit.status,headers:{'content-type':hit.contentType??'application/json'}});};
 try{const start=performance.now(),r=await post(new NextRequest('http://localhost/api/v3/calculate',{method:'POST',body:JSON.stringify({from:saved.record.spec.from,to:saved.record.spec.to,departureAt:'2026-10-15T09:00:00+03:00'})}));return {status:r.status,body:await r.json(),elapsedMs:performance.now()-start,calls,misses};}finally{globalThis.fetch=original;console.info=info;}}
const a=await run(before),b=await run(after);assert.equal(a.status,200);assert.equal(b.status,a.status);assert.deepEqual(b.body,a.body);assert.deepEqual(b.calls,a.calls);assert.equal(a.misses.length,0);assert.equal(b.misses.length,0);
const report={source:file,sourceSha256:hash(bytes),mode:'actual before/current API; current adapters with optional cancellation absent vs live nonaborted signal; all I/O from saved capture, no network',status:'PASS',apiBodyParity:'EXACT',requestParity:'EXACT',beforeMs:a.elapsedMs,afterMs:b.elapsedMs,networkRequests:0,callsPerRun:a.calls.length,misses:0,bodySha256:hash(JSON.stringify(b.body)),result:b.body};
fs.writeFileSync('experiments/routing-reliability/2026-10-29/uncancelled-parity.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,result:undefined}));
