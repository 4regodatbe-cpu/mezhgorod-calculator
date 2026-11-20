import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
const [base,pid,output]=process.argv.slice(2);if(!base||!pid||!output||!/^\d+$/.test(pid))throw Error('Pass local base, known Next PID and output');
if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(base))throw Error('Local HTTP only');
const initialStatus=readFileSync('/proc/'+pid+'/status','utf8');if(!initialStatus.includes('next-server'))throw Error('PID is not expected Next server');
const memory=()=>{const s=readFileSync('/proc/'+pid+'/status','utf8');return {rssKiB:Number(s.match(/^VmRSS:\s+(\d+)/m)?.[1]),highWaterKiB:Number(s.match(/^VmHWM:\s+(\d+)/m)?.[1])};};
const rows=[],before=memory();
for(const query of ['Доне','Волноваха','Ялта Крым','Санкт-Петербург','Краснодар']){
 const samples=[];
 for(let i=0;i<7;i++){
  const start=performance.now(),body=JSON.parse(execFileSync('curl',['--silent','--show-error','--fail','--max-time','5','-H','content-type: application/json','--data',JSON.stringify({query}),base+'/r'],{encoding:'utf8'}));
  samples.push(performance.now()-start);if(body.localSource?.provider!=='geonames'||!body.items.length)throw Error('Not a local GeoNames response');
 }
 rows.push({query,roundTripWithCurlProcessMs:samples});
}
const all=rows.flatMap(r=>r.roundTripWithCurlProcessMs).sort((a,b)=>a-b),files=new Set(),traces=[];
for(const name of ['.next/server/app/r/route.js.nft.json','.next/server/app/api/suggest/route.js.nft.json']){
 const trace=JSON.parse(readFileSync(name,'utf8'));for(const f of trace.files)files.add(resolve(dirname(name),f));traces.push(name);
}
let traceBytes=0;const missing=[];for(const f of files){try{traceBytes+=statSync(f).size;}catch{missing.push(f);}}
const report={scope:'Actual already-running production Next server; WARM process, curl startup included. Cold HTTP startup not measured here.',node:process.version,
 samples:all.length,p95RoundTripMs:all[Math.floor(all.length*.95)],beforeMemory:before,afterMemory:memory(),rows,traces,
 traceUniqueFiles:files.size,traceBytes,missingTraceFiles:missing,
 packagingLimit:'Pilot data is external to current NFT trace, not yet deployable as a self-contained Vercel artifact. Include approved data + public visible attribution before Preview publication.',
 planLimit:'Vercel plan/account not inspected; prior documented function size/memory estimates are not a deployed plan verification.'};
writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,rows:undefined}));
