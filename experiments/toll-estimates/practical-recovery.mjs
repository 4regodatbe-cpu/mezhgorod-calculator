// Offline evidence projection only. Never import saved route fixtures into runtime.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {buildSavedSamples} from './saved-samples.ts';
import {estimateRouteTolls} from './estimate.ts';

const root=new URL('../../',import.meta.url);
const bytes=p=>readFileSync(new URL(p,root));
const read=p=>JSON.parse(bytes(p));
const sha=b=>createHash('sha256').update(b).digest('hex');
export const arzamasId='max-chain-m12-ckad-m11-zsd-arzamas-to-prim';
const capturePath=`experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/${arzamasId}/2026-10-15T23-58-33-171Z-capture.json.gz`;
const ckadPath='experiments/nationwide-tolls/source-snapshots/ckad-2026-03-02-category1-direct-pair-matrix.json';
const ckadPdf='experiments/nationwide-tolls/source-documents/ckad-order56-effective-2026-03-02.pdf';
const zsdBase='experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-kad-ekateringofka/owner-base-32-1.txt';

export function inspectArzamas(){
 const raw=bytes(capturePath);assert.equal(sha(raw),'e8b5d42fb9b737227c04d195271c4cb4dde444a66f85aa579d238a0cd2769ed0');
 const data=JSON.parse(gunzipSync(raw));assert.equal(data.record.provider,'Valhalla');
 const coords=data.record.route.coordinates,geometrySha256=sha(JSON.stringify(coords));
 assert.equal(geometrySha256,'94fe668503fc7bf28e4d1c1ec66f98d0b3669affa668dff5588d12820fd5b17e');
 const maneuvers=JSON.parse(data.calls[0].text).trip.legs[0].maneuvers;
 const ckad=maneuvers.filter(m=>m.street_names?.includes('А-113'));
 assert.deepEqual(ckad.map(m=>[m.begin_shape_index,m.end_shape_index]),[[2952,3535],[3535,3547]]);
 assert.deepEqual(coords[2952],[38.554201,55.855543]);assert.deepEqual(coords[3547],[37.209886,56.089259]);
 const prior=maneuvers.find(m=>m.end_shape_index===2952);assert.ok(prior?.street_names?.includes('М-7'),'actual entry must be M7, not inferred from case id M12');
 const next=maneuvers.find(m=>m.begin_shape_index===3547);assert.ok(next?.street_names?.includes('М-11'));
 const t=JSON.parse(data.calls[11].text).edges;
 assert.equal(t[48].way_id,1122966006);assert.equal(t[62].end_node.node_id,933974870);
 assert.equal(t[109].way_id,355755817);assert.equal(t[109].end_node.node_id,1766158781);
 assert.equal(t[110].way_id,151490266);assert.ok(t.slice(110).every(e=>e.toll!==true),'no unexamined paid continuation/reentry after Planernaya exit');
 const matrix=read(ckadPath);assert.equal(sha(bytes(ckadPdf)),matrix.sourceSha256);
 assert.equal(matrix.sourceSha256,'839488fed07f8e611b5304498f22d49626ff0dc7529df67734a2052a49bea3e7');
 const ckadRub=matrix.directFareRub['М-7 Волга']['М-11 Нева'];assert.equal(ckadRub,941);
 const text=bytes(zsdBase).toString('utf8');
 const zoneRates=[1,2,3].map(zone=>{const section=text.split(`Тарифная зона ${zone}`)[1]?.split('Тарифная зона')[0];const rub=Number(section?.match(/(\d+)\s+руб\./u)?.[1]);assert.equal(rub,300);return {zone,rub};});
 return {caseId:arzamasId,capture:{path:capturePath,sha256:sha(raw)},geometrySha256,
  destination:data.record.spec.to,notPrimorskTown:true,networkRequests:0,newRouteOrTraceReplays:0,
  ckad:{entry:'М-7 Волга',exit:'М-11 Нева',direction:'westbound/north arc',shapeRange:[2952,3547],
   entryCoordinate:coords[2952],exitCoordinate:coords[3547],traceExit:{call:6,way:791520973,endNode:3566326245},
   operatorProduct:'direct pair, category I, post-payment',rub:ckadRub,effectiveFrom:matrix.effectiveFrom,
   source:ckadPath,operatorPdf:ckadPdf,sourceSha256:matrix.sourceSha256,
   footnote120Applies:false,reason:'M7→M11 does not traverse the M12–Nosovikhinskoe initial/final segment; not M12→M11=981'},
  zsd:{entry:{call:11,edge:48,way:1122966006,label:'KAD south northbound'},
   booths:[{call:11,edge:62,node:933974870},{call:11,edge:109,node:1766158781}],
   exit:{call:11,edge:109,way:355755817,afterWay:151490266,label:'Bogatyrsky/Planernaya northbound ramp'},
   source:zsdBase,zoneRates,conditionalZoneSumRub:zoneRates.reduce((n,v)=>n+v.rub,0),
   admittedFareRub:null,status:'unknown',
   missing:'Exact directional cash/card collection bundle: which zones each of the two barriers collects, and applicable credit/non-duplication rule. No exact operator row or exhaustive alternative bundle domain retained.',
   restriction:'900 is conditional arithmetic under one-charge-per-geographic-zone hypothesis, NOT an admitted whole-component estimate or upper bound. Do not sum booth count or borrow Ekateringofka600.'}};
}

export function buildArzamasRecovery(){
 const evidence=inspectArzamas();
 const rows=buildSavedSamples().filter(s=>s.caseId===arzamasId).map(s=>{
  const components=s.input.components.map(c=>{
   if(c.id==='ckad'){
    const conditions={...c.conditions,product:'M7-Volga→M11-Neva',direction:evidence.ckad.direction,category:'I',payment:'post-payment',profile:'allDays'};
    return {...c,conditions,entry:'М-7 Волга',exit:'М-11 Нева',scope:{...c.scope,proven:true,reference:evidence.ckad.source},
     quote:{conditions,routeId:s.caseId,geometrySha256:s.geometrySha256,departureAt:s.departureAt,rub:evidence.ckad.rub,profile:'allDays',validity:'resolved',source:evidence.ckad.source,assurance:'working_estimate'},stopReason:undefined};
   }
   return c.id==='zsd'?{...c,stopReason:'zsd_cash_card_collection_bundle_unproven'}:c;
  });
  const input={...s.input,components};
  return {caseId:s.caseId,departureAt:s.departureAt,strict:s.input.strict,oldAssessedSubtotalRub:s.result.assessedSubtotalRub,
   input,result:estimateRouteTolls(input,{enabled:true}),geometryUnchanged:s.geometryUnchanged,
   // Explicitly not a fare: preserve a rejected arithmetic hypothesis outside estimator quotes.
   conditionalNotAdmittedTotalRub:s.result.assessedSubtotalRub+evidence.ckad.rub+evidence.zsd.conditionalZoneSumRub};
 });
 return {evidence,rows,newFullEstimatedRoutes:0};
}
