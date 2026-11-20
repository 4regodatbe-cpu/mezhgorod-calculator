// One alternate real API calculation and ONE exact-URL proxy comparison only.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {NextRequest} from 'next/server';
import {POST} from '../../app/api/v3/calculate/route.ts';
import {searchLocalSettlements} from '../../lib/local-settlement-search.ts';
const [directory]=process.argv.slice(2);if(!directory)throw Error('Pass evidence directory');mkdirSync(directory,{recursive:true});
process.env.GEONAMES_LOCAL_PILOT='1';process.env.GEONAMES_LOCAL_TEST='1';
const from=(await searchLocalSettlements('Москва')).items.find(x=>x.id==='geonames-524901'),to=(await searchLocalSettlements('Санкт-Петербург')).items[0];
if(!from||!to)throw Error('Missing admitted control');
const original=globalThis.fetch,calls=[];
globalThis.fetch=async(...args)=>{
 const url=String(args[0]),record={url,startedAt:new Date().toISOString()};calls.push(record);const at=Date.now();
 try{const response=await original(...args);record.httpStatus=response.status;return response;}
 catch(e){record.error={name:e.name,message:e.message,code:e.code,cause:{name:e.cause?.name,code:e.cause?.code,message:e.cause?.message,address:e.cause?.address,port:e.cause?.port}};throw e;}
 finally{record.elapsedMs=Date.now()-at;writeFileSync(directory+'/calls.json',JSON.stringify(calls,null,2)+'\n');}
};
const report={scope:'One Moscow -> StPetersburg actual calculation; no retries/audit',runtimeProxyOptIn:process.execArgv.includes('--use-env-proxy'),from,to};
try{
 const at=Date.now(),response=await POST(new NextRequest('http://localhost/api/v3/calculate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({from,to,departureAt:'2026-10-29',vehicle:'standard'})})),bytes=Buffer.from(await response.text());
 writeFileSync(directory+'/response.json',bytes);report.httpStatus=response.status;report.elapsedMs=Date.now()-at;report.responseSha256=createHash('sha256').update(bytes).digest('hex');
}finally{globalThis.fetch=original;report.calls=calls;writeFileSync(directory+'/review.json',JSON.stringify(report,null,2)+'\n');}
const osrm=calls.find(c=>new URL(c.url).hostname==='router.project-osrm.org'&&c.error);
if(osrm&&!report.runtimeProxyOptIn){
 const path=directory+'/same-osrm-via-proxy.json';
 try{report.proxyComparison={url:osrm.url,httpStatus:Number(execFileSync('curl',['--silent','--show-error','--max-time','15','--retry','0','--output',path,'--write-out','%{http_code}',osrm.url],{encoding:'utf8',timeout:17000})),curlExit:0};
  const bytes=readFileSync(path);report.proxyComparison.sha256=createHash('sha256').update(bytes).digest('hex');const body=JSON.parse(bytes);report.proxyComparison.providerCode=body.code;report.proxyComparison.routes=body.routes?.length??0;
 }catch(error){report.proxyComparison={error:String(error.stderr??error.message).slice(0,1000),curlExit:error.status??null};}
}
writeFileSync(directory+'/review.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
