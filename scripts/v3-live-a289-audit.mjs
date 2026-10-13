import {writeFileSync} from 'node:fs';
import {POST} from '../app/api/v3/calculate/route.ts';
import {NextRequest} from 'next/server.js';
import {priceA289Route} from '../lib/toll-engine/a289-engine.ts';
const original=globalThis.fetch;
const departureAt=process.argv[2]??'2026-10-13T13:36:00+03:00';
const froms={anapa:{label:'Анапа',position:{lng:37.32,lat:44.90}},slavyansk:{label:'Славянск-на-Кубани',position:{lng:38.13,lat:45.25}}};
const tos={krasnodar:{label:'Краснодар',position:{lng:38.98,lat:45.04}},rostov:{label:'Ростов-на-Дону',position:{lng:39.7015,lat:47.2357}}};
for(const [a,b] of [['anapa','krasnodar'],['slavyansk','krasnodar'],['slavyansk','rostov']]){
 const providers=[];
 globalThis.fetch=async(...args)=>{
  const url=new URL(String(args[0]));
  const routing=url.pathname==='/route'||url.hostname==='router.project-osrm.org'||url.hostname==='brouter.de';
  try{
   const response=await original(...args);
   if(routing){const raw=await response.clone().json();providers.push({url:url.origin+url.pathname,status:response.status,data:raw});}
   return response;
  }catch(e){if(routing)providers.push({url:url.origin+url.pathname,error:String(e)});throw e;}
 };
 const started=Date.now();const response=await POST(new NextRequest('http://localhost/api/v3/calculate',{method:'POST',body:JSON.stringify({from:froms[a],to:tos[b],departureAt})}));
 const body=await response.json();globalThis.fetch=original;
 const record={capturedAt:new Date().toISOString(),externalRoutingSimulated:false,from:froms[a],to:tos[b],departureAt,status:response.status,elapsedMs:Date.now()-started,body,providers};
 writeFileSync(`experiments/nationwide-tolls/live-controls/2026-10-13-${a}-${b}.json`,JSON.stringify(record));
 const fast=body.legs?.[0]?.fast;const selected=providers.find(p=>fast?.quality?.providers.includes(p.url.includes('osrm')?'OSRM':p.url.includes('valhalla')?'Valhalla':'BRouter'));
 const geometry=selected?.data?.routes?.[0]?.geometry?.coordinates;
 console.log(JSON.stringify({route:`${a}-${b}`,status:record.status,elapsedMs:record.elapsedMs,meters:fast?.meters,seconds:fast?.seconds,tolls:fast?.tolls,providers:providers.map(p=>({url:p.url,status:p.status,error:p.error,distance:p.data?.routes?.[0]?.distance??p.data?.trip?.summary?.length,seconds:p.data?.routes?.[0]?.duration??p.data?.trip?.summary?.time})),osrmA289:geometry?priceA289Route(geometry,departureAt).crossedFrames:null}));
}
