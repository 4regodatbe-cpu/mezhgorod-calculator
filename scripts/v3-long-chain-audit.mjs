import fs from 'node:fs';
import path from 'node:path';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {valhalla,osrmRoute,brouterFast} from '../lib/route-providers.ts';
import {isUsableRoute} from '../lib/v3-calculation/route-candidate.ts';
import {followsPlan,findPlanLegStretchAnomaly,analyzeRoute} from '../lib/special-territory-policy.ts';
import {SPECIAL_TERRITORY_BOUNDARIES} from '../lib/special-territory-boundaries.ts';
import {selectFastestRoute} from '../experiments/nationwide-tolls/fastest-route-policy.mjs';
import {validateTollEdges} from '../lib/toll-validator.ts';
import {nearestSegment} from '../lib/toll-engine/m11-moscow-geometry.ts';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
const point=(label,lng,lat)=>({label,position:{lng,lat}});
const kazan=point('Казань',49.1221,55.7887),krasnodar=point('Краснодар',38.9753,45.0355),
 moscow=point('Москва',37.6173,55.7558),spb=point('Санкт-Петербург',30.3159,59.9391);
const ckad=[[37.75,55.32],[37.80,55.35],[38.05,55.39],[38.34,55.53],[38.35,55.65],
 [38.46,55.72],[38.50,55.90],[37.92,56.13],[37.55,56.18],[37.42,56.20],[37.30,56.24]].map(([lng,lat])=>({lng,lat}));
const cases={
 'kazan-spb-moscow':{endpoints:[kazan,spb],controls:[kazan.position,moscow.position,spb.position],expected:['m12','m11']},
 'spb-kazan-moscow':{endpoints:[spb,kazan],controls:[spb.position,moscow.position,kazan.position],expected:['m11','m12']},
 'krasnodar-spb-moscow':{endpoints:[krasnodar,spb],controls:[krasnodar.position,moscow.position,spb.position],expected:['m4','m11']},
 'spb-krasnodar-moscow':{endpoints:[spb,krasnodar],controls:[spb.position,moscow.position,krasnodar.position],expected:['m11','m4']},
 'spb-kazan-ckad':{endpoints:[spb,kazan],controls:[spb.position,...ckad.slice(5).toReversed(),kazan.position],expected:['m11','ckad','m12']},
 'kazan-spb-ckad':{endpoints:[kazan,spb],controls:[kazan.position,...ckad.slice(5),spb.position],expected:['m12','ckad','m11']},
 'krasnodar-spb-ckad-outer':{endpoints:[krasnodar,spb],controls:[krasnodar.position,ckad[0],ckad[6],ckad[10],spb.position],expected:['m4','ckad','m11']},
 'krasnodar-spb-ckad':{endpoints:[krasnodar,spb],controls:[krasnodar.position,...ckad,spb.position],expected:['m4','ckad','m11']},
};
const originalFetch=globalThis.fetch;
const requestKey=(url,init)=>createHash('sha256').update(JSON.stringify([String(url),init?.method??'GET',init?.body??null])).digest('hex');
const calls=[];
let replay=null,out=null;
if(process.argv[2]==='--replay'){
 replay=JSON.parse(gunzipSync(fs.readFileSync(process.argv[3])));
 out=path.dirname(process.argv[3]);
 const consumed=new Map();
 globalThis.fetch=async(url,init)=>{
  const key=requestKey(url,init),index=consumed.get(key)??0;consumed.set(key,index+1);
  const call=replay.calls.filter(c=>c.key===key)[index];
  if(!call||call.error)throw Error('REPLAY_NO_SUCCESSFUL_RESPONSE');
  return new Response(call.text,{status:call.status,headers:{'content-type':call.contentType??'application/json'}});
 };
}else{
 const name=process.argv[2];if(!cases[name])throw Error('Choose '+Object.keys(cases).join(', '));
 const stamp=new Date().toISOString().replace(/[:.]/g,'-');
 out=`experiments/nationwide-tolls/source-snapshots/long-chain-2026-10-15/${name}-${stamp}`;
 fs.mkdirSync(out,{recursive:true});
 globalThis.fetch=async(url,init)=>{
  const record={key:requestKey(url,init),url:String(url),method:init?.method??'GET',body:init?.body??null};
  const started=Date.now();
  try{
   const response=await originalFetch(url,init);
   const text=await response.clone().text();
   calls.push({...record,status:response.status,text,contentType:response.headers.get('content-type'),elapsedMs:Date.now()-started});
   return response;
  }catch(error){calls.push({...record,error:String(error),elapsedMs:Date.now()-started});throw error;}
 };
}
try{
 let record;
 if(replay){
  record=replay;
  // Derive the newly exposed way ledger only from captured full-route traces.
  // Local plaza traces have trace_options and cannot enter this ledger.
  if(!record.validation.paidRoadEdges){
   const traces=new Map();
   for(const call of record.calls){
    if(!call.url.includes('/trace_attributes')||call.status!==200)continue;
    const request=JSON.parse(call.body);if(request.trace_options||!request.shape?.length)continue;
    traces.set(call.key,{request,data:JSON.parse(call.text)});
   }
   const ordered=[...traces.values()].sort((a,b)=>nearestSegment(record.route.coordinates,[[a.request.shape[0].lon,a.request.shape[0].lat]]).index-nearestSegment(record.route.coordinates,[[b.request.shape[0].lon,b.request.shape[0].lat]]).index);
   record.validation={...record.validation,paidRoadEdges:ordered.flatMap(t=>(t.data.edges??[]).filter(e=>e.toll===true).map(e=>({wayId:e.way_id==null?null:String(e.way_id),roadNames:e.names??[]})))};
  }
 }
 else{
  const name=process.argv[2],spec=cases[name],[from,to]=spec.endpoints,started=Date.now();
  const responses=await Promise.allSettled([valhalla(from,to,1,spec.controls),osrmRoute(from,to,spec.controls),brouterFast(from,to,spec.controls)]);
  const providers=['Valhalla','OSRM','BRouter'];
  const accepted=[],rejected=[];
  for(const [index,response] of responses.entries()){
   try{
    if(response.status!=='fulfilled')throw response.reason;
    const route=response.value;
    if(!isUsableRoute(route,from,to)||!followsPlan(route.coordinates,spec.controls,'mainland',false)||findPlanLegStretchAnomaly(route.coordinates,spec.controls))throw Error('route_control_or_quality_check_failed');
    analyzeRoute(route.coordinates,route.meters,route.seconds,from.position,to.position,SPECIAL_TERRITORY_BOUNDARIES);
    accepted.push({id:providers[index],seconds:route.seconds,tollStatus:'unknown',route});
   }catch(error){rejected.push({provider:providers[index],error:String(error)});}
  }
  const chosen=selectFastestRoute(accepted).route;
  const validation=await validateTollEdges(chosen.route.coordinates);
  record={name,spec,capturedAt:new Date().toISOString(),scope:'Live audit via explicit controls; production routers/filter/fastest selector/pricing; not public API via support or exact user addresses',routeElapsedMs:Date.now()-started,
   accepted:accepted.map(r=>({provider:r.id,meters:r.route.meters,seconds:r.seconds})),rejected,provider:chosen.id,route:chosen.route,validation};
 }
 const departureAt=replay?(process.argv[4]??'2026-10-15T22:30:00+03:00'):'2026-10-13T09:00:00+03:00';
 const started=Date.now(),r=record.route;
 const result=await calculateLegTolls({routeGeometry:r.coordinates,routeSeconds:r.seconds,departureAt,
  selectedFastProvider:record.provider,selectedFastRoute:r,valhallaEvidence:record.provider==='Valhalla'?r:null,
  confirmedFreeRoute:null,diagnosticFastValidation:record.validation});
 const audit=result.componentAudit;
 const families=new Set(audit.components.map(c=>c.id.startsWith('m11-')?'m11':c.id));
 const summary={name:record.name,mode:replay?'offline-recorded-response-replay':'live',provider:record.provider,
  departureAt,meters:r.meters,seconds:r.seconds,traceComplete:record.validation.complete,
  expected:record.spec.expected,missingExpected:record.spec.expected.filter(id=>!families.has(id)),
  pricingElapsedMs:Date.now()-started,tolls:tollsForApi(result.tolls,result.fastValidation),
  audit,booths:record.validation.tollBooths};
 const suffix=replay?`replay-${departureAt.replace(/[:+]/g,'-')}`:'live';
 const filename=replay?`${suffix}-${new Date().toISOString().replace(/[:.]/g,'-')}.json`:'live.json';
 fs.writeFileSync(path.join(out,filename),JSON.stringify(summary,null,2));
 if(!replay)fs.writeFileSync(path.join(out,'capture.json.gz'),gzipSync(JSON.stringify({...record,calls})));
 console.log(JSON.stringify({output:out,...summary,booths:undefined}));
 if(summary.missingExpected.length)process.exitCode=2;
}catch(error){
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:String(error),calls},null,2));
 console.error(String(error));process.exitCode=1;
}finally{globalThis.fetch=originalFetch;}
