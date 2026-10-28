import {readFileSync,writeFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {createLocalGazetteer} from './local-gazetteer.mjs';
const input=process.argv[2],output=process.argv[3];if(!input||!output)throw Error('Pass catalog.json and profile.json');
globalThis.gc?.();const before=process.memoryUsage(),start=performance.now();
const bytes=readFileSync(input),data=JSON.parse(bytes.toString('utf8')),parsed=performance.now();
const index=createLocalGazetteer(data),loaded=performance.now();globalThis.gc?.();const after=process.memoryUsage();
const queries=['Донецк','Донецк Ростовская область','Волноваха','Краснодар','Ялта Крым','Луганск','Запорожье','Херсон','Доне','Тарасовка','несуществующийгород'];
const results=[],durations=[];
const original=globalThis.fetch;globalThis.fetch=()=>{throw Error('Offline profile attempted network');};
try{for(const query of queries){let result;const samples=[];for(let n=0;n<10;n++){const at=performance.now();result=index.search(query);samples.push(performance.now()-at);}durations.push(...samples);
results.push({query,matches:result.matchingRecords,truncated:result.truncated,scanned:result.scanned,ms:samples,
 items:result.items.slice(0,4).map(x=>({id:x.id,title:x.title,label:x.label,position:x.position,territory:x.territory,qualityFlags:x.qualityFlags}))});
}}finally{globalThis.fetch=original;}
durations.sort((a,b)=>a-b);
const flags={};for(const r of data.records)for(const flag of r[13])flags[flag]=(flags[flag]??0)+1;
const report={status:'PROTOTYPE_ONLY',runtimeApproved:false,node:process.version,records:index.recordCount,postings:index.postingCount,
 searchModuleSha256:createHash('sha256').update(readFileSync(new URL('./local-gazetteer.mjs',import.meta.url))).digest('hex'),
 loadMethod:'fresh Node process; OS disk cache not flushed',
 jsonBytes:bytes.length,gzipBytes:gzipSync(bytes).length,sourceSha256:createHash('sha256').update(bytes).digest('hex'),
 parseMs:parsed-start,indexMs:loaded-parsed,coldLoadMs:loaded-start,heapDeltaBytes:after.heapUsed-before.heapUsed,rssBytes:after.rss,
 warmP50Ms:durations[Math.floor(durations.length*.5)],warmP95Ms:durations[Math.floor(durations.length*.95)],warmMaxMs:durations.at(-1),flags,results};
writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,results:results.map(x=>({query:x.query,matches:x.matches,top:x.items[0]?.label}))}));
