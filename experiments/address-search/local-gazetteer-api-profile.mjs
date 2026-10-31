import {performance} from 'node:perf_hooks';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const [directory,output]=process.argv.slice(2);if(!directory||!output)throw Error('Pass pilot shards and output');
process.env.GEONAMES_LOCAL_PILOT='1';process.env.GEONAMES_LOCAL_PILOT_DIR=directory;
globalThis.gc?.();const baseline=process.memoryUsage(),start=performance.now();
const {NextRequest}=await import('next/server');const {POST}=await import('../../app/r/route.ts');
const imported=performance.now();globalThis.gc?.();const nextImports=process.memoryUsage();
const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error('Provider disabled for real local API test');};
const rows=[];let peakRss=0,peakHeap=0;
try{
 for(const query of ['Доне','Донецк Ростовская область','Волноваха','Ялта Крым','Санкт-Петербург','Москва','Краснодар']){
  const times=[];let body;
  for(let i=0;i<6;i++){
   const t=performance.now(),response=await POST(new NextRequest('http://localhost/r',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query})}));
   body=await response.json();times.push(performance.now()-t);if(response.status!==200||!body.items.length)throw Error('Local API failure: '+query);
  }
  globalThis.gc?.();const memory=process.memoryUsage();peakRss=Math.max(peakRss,memory.rss);peakHeap=Math.max(peakHeap,memory.heapUsed);
  rows.push({query,firstMs:times[0],repeatMs:times.slice(1),firstItem:body.items[0],rss:memory.rss,heapUsed:memory.heapUsed});
 }
}finally{globalThis.fetch=original;}
const warm=rows.flatMap(r=>r.repeatMs).sort((a,b)=>a-b);
const report={status:'ACTUAL_NEXT_ROUTE_HANDLER_PASS',scope:'NextRequest/NextResponse and real POST /r -> GET /api/suggest in fresh Node process; NOT a listening Next.js server or Vercel process',
 node:process.version,sourceApiSha256:createHash('sha256').update(readFileSync(new URL('../../app/api/suggest/route.ts',import.meta.url))).digest('hex'),
 admissionSha256:createHash('sha256').update(readFileSync(directory+'/admission.json')).digest('hex'),baselineMemory:baseline,nextHandlerImportMemory:nextImports,
 importMs:imported-start,peakObservedRss:peakRss,postGcDatabaseHeapDelta:peakHeap-nextImports.heapUsed,warmP95Ms:warm[Math.floor(warm.length*.95)],networkCalls:calls,rows};
writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,rows:rows.map(r=>({query:r.query,firstMs:r.firstMs}))}));
