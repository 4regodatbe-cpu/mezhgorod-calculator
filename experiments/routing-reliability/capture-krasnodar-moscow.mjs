import fs from 'node:fs';import zlib from 'node:zlib';import {createHash} from 'node:crypto';import {NextRequest} from 'next/server';import {POST} from '../../app/api/v3/calculate/route.ts';
const dir='experiments/routing-reliability/2026-10-29',source=JSON.parse(fs.readFileSync('experiments/address-search/2026-10-29-street-scope/handler-replay.json','utf8'));
const get=q=>source.results.find(x=>x.query===q).body.items[0],spec={from:get('Краснодар'),to:get('Москва')},departureAt='2026-10-15T09:00:00+03:00';
const original=globalThis.fetch,info=console.info,controller=new AbortController(),timer=setTimeout(()=>controller.abort(new Error('bounded_capture_deadline')),35000),calls=[],tasks=[],timings=[];
console.info=(name,value)=>{if(name==='calculation_timing')timings.push(value);};
globalThis.fetch=async(input,init)=>{
 if(calls.length>=20){controller.abort(new Error('bounded_capture_request_limit'));throw controller.signal.reason;}
 const entry={url:String(input),body:init?.body?String(init.body):'',startedAt:new Date().toISOString()},start=performance.now();calls.push(entry);
 try{const r=await original(input,init);entry.status=r.status;entry.elapsedMs=performance.now()-start;entry.contentType=r.headers.get('content-type');tasks.push(r.clone().text().then(text=>{entry.text=text;entry.sha256=createHash('sha256').update(text).digest('hex');}).catch(e=>{entry.captureError=e.name;}));return r;}
 catch(e){entry.error={name:e.name,code:e.cause?.code??null};entry.elapsedMs=performance.now()-start;throw e;}
};
const report={scope:'ONE real current V3 handler Krasnodar–Moscow with GeoNames points; no audit or tariff certification',sourceRuntimeCommit:'180e7caad4381a92057035827ba1be88113e2bc1',node:process.version,departureAt,spec};
const start=performance.now();let body;
try{const r=await POST(new NextRequest('http://localhost/api/v3/calculate',{method:'POST',signal:controller.signal,body:JSON.stringify({...spec,departureAt})}));report.httpStatus=r.status;body=await r.json();report.elapsedMs=performance.now()-start;report.serverTiming=r.headers.get('server-timing');}
finally{clearTimeout(timer);await Promise.all(tasks);globalThis.fetch=original;console.info=info;}
report.callerAborted=controller.signal.aborted;report.requestCount=calls.length;report.timings=timings;report.body=body;
const bytes=zlib.gzipSync(JSON.stringify({schemaVersion:1,departureAt,record:{spec,provider:body?.legs?.[0]?.fast?.quality?.providers?.[0]??null,route:body?.legs?.[0]?.fast??null},calls}));fs.writeFileSync(dir+'/krasnodar-moscow-current.json.gz',bytes);report.captureSha256=createHash('sha256').update(bytes).digest('hex');fs.writeFileSync(dir+'/krasnodar-moscow-current.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({httpStatus:report.httpStatus,elapsedMs:report.elapsedMs,callerAborted:report.callerAborted,requestCount:report.requestCount,provider:body?.legs?.[0]?.fast?.quality?.providers,meters:body?.legs?.[0]?.fast?.meters,seconds:body?.legs?.[0]?.fast?.seconds,tolls:body?.legs?.[0]?.fast?.tolls?.pricingStatus,captureSha256:report.captureSha256}));
