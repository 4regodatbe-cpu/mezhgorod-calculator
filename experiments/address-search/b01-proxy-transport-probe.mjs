// One explicitly budgeted environment diagnostic; never imported by the app.
import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
if(!process.execArgv.includes('--use-env-proxy')&&process.env.NODE_USE_ENV_PROXY!=='1')throw Error('Changed-condition probe requires explicit Node proxy opt-in');
const out=process.env.B01_PROBE_OUTPUT??'/tmp/b01-proxy-probe';mkdirSync(out,{recursive:true});
const url='https://photon.komoot.io/api/?q=%D0%90%D0%BD%D0%B0%D0%BF%D0%B0&limit=20';
const result={startedAt:new Date().toISOString(),node:process.version,proxyOptIn:true,HTTP_PROXY_present:!!process.env.HTTP_PROXY,HTTPS_PROXY_present:!!process.env.HTTPS_PROXY,url,requestLimit:1,timeoutMs:12000,scope:'transport-only; not /r/browser/outage resilience proof'};
const started=performance.now();
try{
 const response=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)});
 const body=await response.text();writeFileSync(path.join(out,'response.body'),body);
 result.httpStatus=response.status;result.bytes=Buffer.byteLength(body);result.sha256=createHash('sha256').update(body).digest('hex');
 try{const d=JSON.parse(body);result.featureCount=Array.isArray(d.features)?d.features.length:null;}catch{result.featureCount=null;}
 result.status=response.ok&&Number.isInteger(result.featureCount)?'TRANSPORT_RESPONSE_RECEIVED':'SOURCE_RESPONSE_UNUSABLE';
}catch(e){result.status='TRANSPORT_FAILED';result.errorName=e?.name??'unknown';result.causeCode=typeof e?.cause?.code==='string'?e.cause.code:null;}
result.elapsedMs=Math.round(performance.now()-started);result.finishedAt=new Date().toISOString();
writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
