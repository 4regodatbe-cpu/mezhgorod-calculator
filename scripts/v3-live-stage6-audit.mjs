import {writeFileSync} from 'node:fs';
import {POST} from '../app/api/v3/calculate/route.ts';
import {NextRequest} from 'next/server.js';
const cases=[['moscow-kaluga',{label:'Москва',position:{lng:37.6173,lat:55.7558}},{label:'Калуга',position:{lng:36.2612,lat:54.5138}}],['moscow-odintsovo',{label:'Москва',position:{lng:37.6173,lat:55.7558}},{label:'Одинцово',position:{lng:37.2777,lat:55.6782}}]];
const fetchOriginal=globalThis.fetch;
for(const [name,from,to] of cases){
 const providers=[];
 globalThis.fetch=async(...args)=>{const url=new URL(String(args[0]));const routing=url.pathname==='/route'||url.pathname==='/trace_attributes'||url.hostname==='router.project-osrm.org'||url.hostname==='brouter.de';try{const response=await fetchOriginal(...args);if(routing)providers.push({url:url.origin+url.pathname,status:response.status,data:await response.clone().json()});return response;}catch(e){if(routing)providers.push({url:url.origin+url.pathname,error:String(e)});throw e;}};
 try{
  const departureAt='2026-10-13T12:00:00+03:00';const started=Date.now();
  const response=await POST(new NextRequest('http://localhost/api/v3/calculate',{method:'POST',body:JSON.stringify({from,to,departureAt,diagnostics:true})}));
  const body=await response.json();const record={capturedAt:new Date().toISOString(),externalRoutingSimulated:false,from,to,departureAt,status:response.status,elapsedMs:Date.now()-started,body,providers};
  writeFileSync(`experiments/nationwide-tolls/live-controls/2026-10-13-stage6-${name}.json`,JSON.stringify(record));
  const fast=body.legs?.[0]?.fast;console.log(JSON.stringify({name,status:response.status,elapsedMs:record.elapsedMs,meters:fast?.meters,seconds:fast?.seconds,tolls:fast?.tolls,quality:fast?.quality,providers:providers.map(p=>({url:p.url,status:p.status,error:p.error}))}));
 }finally{globalThis.fetch=fetchOriginal;}
}
