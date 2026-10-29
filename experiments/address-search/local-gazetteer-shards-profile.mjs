import {readFileSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {openShardLoader} from './local-gazetteer-shards.mjs';
const [directory,output]=process.argv.slice(2);if(!directory||!output)throw Error('Pass shard directory and output');
const manifest=readFileSync(directory+'/manifest.json'),meta=JSON.parse(manifest),before=process.memoryUsage();
const original=globalThis.fetch;let calls=0;globalThis.fetch=()=>{calls++;throw Error('External geocoder disabled');};
const start=performance.now(),loader=await openShardLoader(directory),manifestMs=performance.now()-start;
const results=[];let peakRss=0,peakHeap=0;
try{
 for(const query of ['Доне','Донецк','Донецк Ростовская область','Волноваха','Луганск','Мариуполь','Мелитополь','Бердянск','Геническ','Симферополь','Севастополь','Ялта','Керчь','Краснодар','Москва','Санкт-Петербург','Тарасовка','Нов']){
  const t=performance.now(),result=await loader.search(query),coldMs=performance.now()-t,samples=[];
  for(let n=0;n<10;n++){const s=performance.now();await loader.search(query);samples.push(performance.now()-s);}
  globalThis.gc?.();const memory=process.memoryUsage();peakRss=Math.max(peakRss,memory.rss);peakHeap=Math.max(peakHeap,memory.heapUsed);
  results.push({query,coldMs,warmMs:samples,items:result.items.slice(0,4),truncated:result.truncated,hasMore:result.hasMore,matchingRecords:result.matchingRecords,heapUsed:memory.heapUsed,rss:memory.rss});
 }
}finally{globalThis.fetch=original;}
const values=Object.values(meta.shards),warm=results.flatMap(r=>r.warmMs).sort((a,b)=>a-b);
const report={status:'ISOLATED_PROTOTYPE_ONLY',runtimeApproved:false,node:process.version,manifestSha256:createHash('sha256').update(manifest).digest('hex'),
 sourceDate:meta.sourceDate,records:meta.recordCount,shards:values.length,compressedBytes:values.reduce((n,s)=>n+s.bytes,0),
 maxShardRawBytes:Math.max(...values.map(s=>s.rawBytes)),manifestMs,peakObservedRss:peakRss,peakPostGcHeapDelta:peakHeap-before.heapUsed,
 warmP50Ms:warm[Math.floor(warm.length*.5)],warmP95Ms:warm[Math.floor(warm.length*.95)],networkCalls:calls,
 notes:'Fresh Node process; OS cache not flushed; cold means process-local shard load; post-GC observations are not instantaneous allocation peak or integrated Next memory.',stats:loader.stats(),results};
writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,results:results.map(r=>({query:r.query,coldMs:r.coldMs,top:r.items[0]?.label,truncated:r.truncated}))}));
