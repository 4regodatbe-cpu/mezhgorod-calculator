// One retained previously-unknown route. Offline shadow only, not live routing/pricing.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {resolveM11ProductBoundaries} from '../../lib/v3-calculation/m11-product-boundaries.ts';
import {matrixM11Component,m11MainlineTariffAt} from '../nationwide-tolls/engine/m11-route-adapter.mjs';
import {matrixM11HeadComponent,m11HeadTariffAt} from '../nationwide-tolls/engine/m11-head-route-adapter.mjs';
import core from '../nationwide-tolls/engine/quote.cjs';
import {estimateRouteTolls} from './estimate.ts';

const root=new URL('../../',import.meta.url);
const bytes=p=>readFileSync(new URL(p,root));
const read=p=>JSON.parse(bytes(p));
const sha=b=>createHash('sha256').update(b).digest('hex');
const id='triple-m11-ckad-m12-torzhok-to-kazan';
const base=`experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/${id}/`;
const capturePath=base+'2026-10-16T00-34-01-248Z-capture.json.gz';
const priorPath=base+'replay-2026-10-15T09-00-00-03-00-2026-10-16T00-34-01-774Z.json';
const priorReview='experiments/nationwide-tolls/checks/2026-10-18-m11-p214-three/cases/'+id+'.json';
const sourceEntry='experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-entry5286168661/directed-entry.json';
const sourceExit='experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-ckad47-exit/directed-exit.json';
const ckadPath='experiments/nationwide-tolls/source-snapshots/ckad-2026-03-02-category1-direct-pair-matrix.json';
const registryPath='experiments/nationwide-tolls/TARIFF_SELECTION_REGISTER.json';

export function buildTorzhokRecovery(){
 const raw=bytes(capturePath);assert.equal(sha(raw),'da0f293ff4743939866e74b60ea49cae07891b08306b386a58c57da0e058fa6a');
 const data=JSON.parse(gunzipSync(raw)),prior=read(priorPath),review=read(priorReview);
 const coords=data.record.route.coordinates,geometrySha256=sha(JSON.stringify(coords));
 assert.equal(geometrySha256,'afef70ba994a294ff96c356bec2750b5a65bcfb9bf3c5ff44eb9a62ab4f197f7');
 assert.equal(data.record.provider,'Valhalla');assert.equal(prior.captureSha256,sha(raw));
 assert.equal(prior.tolls.amount,null);assert.equal(prior.traceComplete,true);assert.equal(review.traceComplete,true);assert.equal(review.captureSha256,sha(raw));
 assert.equal(prior.audit.components.find(c=>c.id==='unknown-paid-road')?.reason,'unmapped_selected_route_paid_booth','only a source-mapped booth residual may be discharged, never an unrelated missing road');
 const traces=data.calls.filter(c=>c.url.includes('/trace_attributes')).map(c=>{assert.equal(c.status,200);const t=JSON.parse(c.text);assert.ok(Array.isArray(t.edges));return t;});
 assert.equal(traces.length,review.chunkCount);assert.equal(review.checkedChunkCount,traces.length);
 const edges=traces.flatMap(t=>t.edges),booths=[...new Map(edges.filter(e=>e.end_node?.type==='toll_booth').map(e=>[String(e.end_node.node_id),{osmNodeId:String(e.end_node.node_id),wayId:String(e.way_id)}])).values()];
 const entry=read(sourceEntry),exit=read(sourceExit);
 const expected=[{osmNodeId:entry.gate.osmNodeId,wayId:entry.gate.wayId},{osmNodeId:exit.gateNodeId,wayId:exit.gateWayId}];
 assert.deepEqual(booths,expected,'every retained booth must map to its source-bound M11 product, no residual may be dropped');
 assert.deepEqual([...new Set(prior.paidRoadEdgeNames)].sort(),['М-11','«Нева»','А-113','Центральная кольцевая автомобильная дорога','М-12','«Восток»'].sort());
 const validation={status:'toll',complete:true,boothEventCoverage:'complete',chunkCount:traces.length,checkedChunkCount:traces.length,failedChunkCount:0,
  tollBooths:booths,paidRoadEdges:edges.filter(e=>e.toll===true).map(e=>({wayId:String(e.way_id)}))};
 const ms=JSON.parse(data.calls[0].text).trip.legs[0].maneuvers,ckad=ms.find(m=>m.street_names?.includes('А-113'));
 assert.equal(ckad.begin_shape_index,1036);assert.equal(ckad.end_shape_index,1648);
 assert.deepEqual(coords[1036],[37.199624,56.09007]);assert.deepEqual(coords[1648],[38.548576,55.853909]);
 assert.ok(ms.find(m=>m.end_shape_index===1036)?.street_names?.includes('М-11'));
 assert.ok(ms.find(m=>m.begin_shape_index===1648)?.street_names?.includes('М-7'));
 const ckadSource=read(ckadPath);assert.equal(sha(bytes('experiments/nationwide-tolls/'+ckadSource.sourceFile)),ckadSource.sourceSha256);
 assert.equal(ckadSource.sourceSha256,'839488fed07f8e611b5304498f22d49626ff0dc7529df67734a2052a49bea3e7');assert.equal(ckadSource.effectiveFrom,'2026-03-02T00:00:00+03:00');
 const ckadRub=ckadSource.directFareRub['М-11 Нева']['М-7 Волга'];assert.equal(ckadRub,941);
 const savedM12=prior.audit.components.find(c=>c.id==='m12');assert.ok(savedM12.tolls);
 const pair=savedM12.tolls.segments[0].match(/М-12:\s+(\S+)\s+→\s+(\S+)/u);assert.ok(pair);
 const rows=['2026-10-15T09:00:00+03:00','2026-10-17T09:00:00+03:00'].map(at=>{
  // Reuse actual current product inspector; do not assert a head/entry from a city name.
  const b=resolveM11ProductBoundaries(coords,data.record.route.seconds,at,data.record.route.m11RoadEvidence,validation);
  assert.equal(b.resolved,true);assert.equal(b.reason,'m11_p214_p58_and_southbound_ckad_head_proved');assert.ok(b.parts.head);
  const main=matrixM11Component({boundaryStatus:'resolved',traversal:{entryPointId:b.parts.from,exitPointId:b.parts.to}},at,0);
  const head=matrixM11HeadComponent({boundaryStatus:'resolved',...b.parts.head},at);
  assert.ok(main.tolls);assert.ok(head.tolls);
  const m12=core.quote({routeId:id,evidenceComplete:true,components:[{routeId:id,traversalId:'m12',road:'m12',from:pair[1],to:pair[2],profile:'allDays',localDate:at.slice(0,10),exactTraversal:true,profileResolved:true}]});
  assert.notEqual(m12.rub,null);assert.equal(m12.rub,savedM12.tolls.amount,'no repricing of existing saved M12 working pair');
  const component=(name,road,operator,from,to,rub,profile,source,assurance='working_estimate')=>{
   const conditions={road,operator,product:name,direction:`${from}→${to}`,category:'I',payment:road==='CKAD'?'post-payment':'cash/card',profile};
   return {id:name,conditions,entry:from,exit:to,family:road,aggregate:false,coverageKeys:[name],
    scope:{proven:true,reference:source,routeId:id,geometrySha256},
    quote:{conditions,routeId:id,geometrySha256,departureAt:at,rub,profile,validity:'resolved',source,assurance}};
  };
  const components=[component('m11-58-679','M11','Avtodor',b.parts.from,b.parts.to,main.tolls.amount,m11MainlineTariffAt(at).profile,sourceEntry,'confirmed'),
   component('m11-15-58','M11','m11-neva',b.parts.head.from,b.parts.head.to,head.tolls.amount,m11HeadTariffAt(at).profile,sourceExit,'confirmed'),
   component('ckad','CKAD','Avtodor','М-11 Нева','М-7 Волга',ckadRub,'allDays',ckadPath),
   component('m12','M12','Avtodor',pair[1],pair[2],m12.rub,'allDays',priorPath)];
  const strict={pricingStatus:prior.tolls.pricingStatus,amount:prior.tolls.amount,priceConfirmation:prior.tolls.priceConfirmation};
  const input={routeId:id,geometrySha256,departureAt:at,coverageComplete:true,requiredCoverage:components.map(c=>c.id),components,strict};
  return {departureAt:at,m11Boundary:b,input,result:estimateRouteTolls(input,{enabled:true})};
 });
 return {caseId:id,from:data.record.spec.from,to:data.record.spec.to,capture:{path:capturePath,sha256:sha(raw)},geometrySha256,
  sourceEvidence:[priorPath,priorReview,sourceEntry,sourceExit,ckadPath,registryPath].map(path=>({path,sha256:sha(bytes(path))})),
  proof:{traceChunks:traces.length,retainedTraceComplete:true,booths,unmappedBooths:[],
   ckad:{from:'М-11 Нева',to:'М-7 Волга',rub:ckadRub,shapeRange:[1036,1648],footnote120Applies:false},
   productCoverage:'p214→p58 mainline + separate p58→CKAD47 concession head + CKAD M11→M7 + retained M12 Vladimir→Ivanovskoe working pair; no ZSD/M4',
   caution:'M12 source pair/model retained, not new independent registration-endpoint certification. CKAD directed named-road binding is a working source match, not operator receipt. Total estimated only.'},
  networkRequests:0,newProviderCapture:0,newFullRouteReplays:0,newBoundaryInspections:2,defaultEnabled:false,
  geometryUnchanged:sha(JSON.stringify(coords))===geometrySha256,rows,
  newFullEstimatedRoutes:rows.every(r=>r.result.status==='estimated'&&r.result.totalRub!==null)?1:0};
}
