import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {estimateRouteTolls,type Conditions,type EstimateComponent,type EstimateInput,type EstimateResult} from './estimate.ts';
import {composeRouteTolls,type RouteTollComponent} from '../../lib/toll-engine/route-toll-composition.ts';
import {matrixM4Component} from '../nationwide-tolls/engine/m4-route-adapter.mjs';
import {matrixM11HeadComponent,m11HeadTariffAt} from '../nationwide-tolls/engine/m11-head-route-adapter.mjs';
import {matrixM11Component,m11MainlineTariffAt} from '../nationwide-tolls/engine/m11-route-adapter.mjs';
import {matrixM12Component} from '../nationwide-tolls/engine/m12-route-adapter.mjs';
import {matrixM11TailComponent} from '../../lib/toll-engine/m11-tail-component.ts';
import {m4TariffPeriodAt} from '../toll-od-matrix/m4-fare-calendar-2026.mjs';
import core from '../nationwide-tolls/engine/quote.cjs';

type Value={amount:number;weekdayAmount:number;weekendAmount:number;period:string;segments:string[];confidence:'matched'};
type SavedComponent={id:RouteTollComponent['id'];detected:boolean;tolls:Value|null;reason?:string};
type SavedCase={caseId:string;date:string;capture:{path:string;sha256:string};selectedGeometrySha256?:string;geometryUnchanged?:boolean;
 componentAudit?:{components:SavedComponent[]};api?:{pricingStatus:string;amount:number|null;priceConfirmation:string};
 currentM12Boundary?:{boundary:unknown}};
export type Sample={caseId:string;departureAt:string;source:string;captureSha256:string;geometrySha256:string;
 input:EstimateInput;result:EstimateResult;strictTotalRub:number|null;geometryUnchanged:boolean;note:string};
const root=new URL('../../',import.meta.url);
const bytes=(p:string)=>readFileSync(new URL(p,root));
const hash=(b:Uint8Array|string)=>createHash('sha256').update(b).digest('hex');
const read=<T,>(p:string):T=>JSON.parse(bytes(p).toString('utf8')) as T;
const c5='experiments/road-ref-boundaries/checks/2026-10-29-stage-c/c5-composition.json';
const c4='experiments/road-ref-boundaries/checks/2026-10-29-stage-c/c4-zsd.json';
const zonePath='experiments/nationwide-tolls/source-snapshots/zsd/2026-10-15-zone1/zone1-readiness.json';
const finishedPath='experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-kad-ekateringofka/readiness.json';
type Ready={rows:unknown[]};
const zoneEngine=core.createQuoteEngine({selected:read<Ready>(zonePath).rows,provisional:[],history:[]});
const finishedEngine=core.createQuoteEngine({selected:read<Ready>(finishedPath).rows,provisional:[],history:[]});
const localDate=(at:string)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at));
const pair=(s:string,pattern:RegExp)=>{const m=s.match(pattern);assert.ok(m,'missing retained pair '+s);return {from:m[1],to:m[2]};};
function calendar(id:string,at:string):string|null {
 const v=id==='m4'?m4TariffPeriodAt(at):id==='m11-15-58'?m11HeadTariffAt(at):id==='m11-58-679'?m11MainlineTariffAt(at):{status:'resolved',profile:'allDays'};
 return v.status==='resolved'&&v.profile?v.profile:null;
}
function matrixValue(c:SavedComponent,row:SavedCase,at:string):{value:Value|null;profile:string;source:string;working:boolean;coverage:readonly string[];entry:string|null;exit:string|null} {
 const profile=calendar(c.id,at)??'unresolved',source=`${c5}#${row.caseId}/componentAudit/${c.id}`;
 const base={value:null,profile,source,working:false,coverage:[c.id],entry:null,exit:null};
 if(!c.tolls)return base;
 let value:Value|null=null,working=false,coverage:readonly string[]=[c.id],entry:string|null=null,exit:string|null=null;
 const segment=c.tolls.segments[0];
 if(c.id==='m4'){
  const p=pair(segment,/М-4:\s+(\S+)\s+→\s+(\S+)/u);entry=p.from;exit=p.to;
  const q=matrixM4Component({exact:true,endpointOnly:true,m4PvpPreview:{confirmedPvps:[p.from,p.to]}},at,0);
  const current=q?.tolls??null;
  if(current){assert.equal(current.confidence,'matched');value={...current,confidence:'matched'};}working=true;
  coverage=q?.productCoverage?.sectionVector?.map((s:string)=>`m4:${s}`)??['m4'];
 }else if(c.id==='m11-15-58'){
  const p=pair(segment,/М-11 15–58:\s+(\S+)\s+→\s+(\S+):/u);entry=p.from;exit=p.to;
  value=matrixM11HeadComponent({boundaryStatus:'resolved',...p,paymentWindowSeconds:0},at).tolls;
 }else if(c.id==='m11-58-679'){
  const p=pair(segment,/М-11:\s+(p\d+)\s+→\s+(p\d+)/u);entry=p.from;exit=p.to;
  value=matrixM11Component({boundaryStatus:'resolved',traversal:{entryPointId:p.from,exitPointId:p.to}},at,0)?.tolls??null;
 }else if(c.id==='m11-679-684'){
  entry='p679';exit='p684';value=matrixM11TailComponent(true,at)?.tolls??null;
 }else if(c.id==='m12'){
  const p=pair(segment,/М-12:\s+(\S+)\s+→\s+(\S+)/u);entry=`model:${p.from}`;exit=`model:${p.to}`;
  const current=matrixM12Component(row.currentM12Boundary,at,0)?.tolls??null;
  if(current){assert.equal(current.confidence,'matched');value={...current,confidence:'matched'};}working=true;
 }else if(c.id==='zsd'){
  entry='zone-1';exit='zone-1';coverage=['zsd:zone-1'];const q=zoneEngine.quote({routeId:row.caseId,evidenceComplete:true,components:[{routeId:row.caseId,traversalId:'zsd',road:'zsd',from:entry,to:exit,
   profile:'allDays',localDate:localDate(at),exactTraversal:true,profileResolved:true}]});
  value=q.rub===null?null:{...c.tolls,amount:q.rub,weekdayAmount:q.rub,weekendAmount:q.rub};
 }else throw new Error('Unreviewed numeric sample component '+c.id);
 if(at===row.date)assert.equal(value?.amount,c.tolls.amount,'current matrix differs from retained quote '+c.id);
 return {value,profile,source,working,coverage,entry,exit};
}
function geometry(row:SavedCase){
 const raw=bytes(row.capture.path);assert.equal(hash(raw),row.capture.sha256);
 const capture=JSON.parse(gunzipSync(raw).toString('utf8')) as {record:{route:{coordinates:number[][]}}};
 const before=JSON.stringify(capture.record.route.coordinates),sha=hash(before);
 if(row.selectedGeometrySha256)assert.equal(sha,row.selectedGeometrySha256);
 return {sha,rawSha:hash(raw),unchanged:()=>JSON.stringify(capture.record.route.coordinates)===before};
}
export function buildSavedSamples():Sample[] {
 const source=read<{results:SavedCase[]}>(c5),out:Sample[]=[];
 assert.equal(source.results.length,2,'bounded two multi-road samples only');
 for(const row of source.results){
  assert.equal(row.geometryUnchanged,true);const g=geometry(row);
  for(const at of [row.date,'2026-10-17T09:00:00+03:00']){
   const native:RouteTollComponent[]=[],parts:EstimateComponent[]=[];
   for(const c of row.componentAudit!.components.filter(c=>c.detected)){
    const q=matrixValue(c,row,at);native.push({id:c.id,detected:true,tolls:q.value,reason:c.reason});
    const conditions:Conditions={road:c.id.startsWith('m11')?'M11':c.id.toUpperCase(),operator:c.id==='zsd'?'NCH':c.id==='m11-15-58'?'m11-neva':'Avtodor',
     product:c.id,direction:c.id==='m12'?'westbound':'northbound',category:'I',payment:'cash/card',profile:q.profile};
    parts.push({id:c.id,conditions,entry:q.entry,exit:q.exit,family:c.id.startsWith('m11')?'M11':c.id,aggregate:c.id==='m4',coverageKeys:q.coverage,
     scope:{proven:q.value!==null,reference:q.source+'; retained model scope, not a new operator crosswalk',routeId:row.caseId,geometrySha256:g.sha},
     ...(q.value?{quote:{conditions,routeId:row.caseId,geometrySha256:g.sha,departureAt:at,rub:q.value.amount,profile:q.profile,validity:'resolved' as const,
      source:q.source,assurance:q.working?'working_estimate' as const:'confirmed' as const}}:{stopReason:c.reason??'operator_product_unknown'})});
   }
   const strict=composeRouteTolls(native),strictAmount=strict.status==='priced'?strict.tolls.amount:null;
   if(at===row.date)assert.equal(strictAmount,row.api!.amount,'strict source total changed');
   const input:EstimateInput={routeId:row.caseId,geometrySha256:g.sha,departureAt:at,coverageComplete:true,requiredCoverage:parts.flatMap(p=>[...p.coverageKeys]),components:parts,
    strict:{pricingStatus:strict.status,amount:strictAmount,priceConfirmation:row.api!.priceConfirmation}};
   const result=estimateRouteTolls(input,{enabled:true});assert.ok(g.unchanged());
   out.push({caseId:row.caseId,departureAt:at,source:c5,captureSha256:g.rawSha,geometrySha256:g.sha,input,result,strictTotalRub:strictAmount,geometryUnchanged:true,
    note:'Only existing pure tariff adapters re-evaluated at departure; no trace/provider/API replay. M4 working grade retained; M12 model-only boundary stays estimated, CKAD/ZSD missing stays unknown.'});
  }
 }
 const finished=read<{results:(SavedCase&{caseId:string})[]}>(c4).results[0],g=geometry(finished);
 for(const at of ['2026-10-15T09:00:00+03:00','2026-10-17T09:00:00+03:00']){
  const q=finishedEngine.quote({routeId:finished.caseId,evidenceComplete:true,components:[{routeId:finished.caseId,traversalId:'zsd',road:'zsd',from:'kad-south',to:'ekateringofka',profile:'allDays',localDate:localDate(at),exactTraversal:true,profileResolved:true}]});assert.equal(q.rub,600);
  const conditions:Conditions={road:'ZSD',operator:'NCH',product:'kad-south-ekateringofka',direction:'northbound',category:'I',payment:'cash/card',profile:'allDays'};
  const input:EstimateInput={routeId:finished.caseId,geometrySha256:g.sha,departureAt:at,coverageComplete:true,requiredCoverage:['zsd:zone-1','zsd:zone-2'],strict:{pricingStatus:'priced',amount:q.rub,priceConfirmation:'confirmed'},
   components:[{id:'zsd-finished',conditions,entry:'kad-south',exit:'ekateringofka',family:'zsd',aggregate:true,coverageKeys:['zsd:zone-1','zsd:zone-2'],
    scope:{proven:true,reference:finishedPath,routeId:finished.caseId,geometrySha256:g.sha},quote:{conditions,routeId:finished.caseId,geometrySha256:g.sha,departureAt:at,rub:q.rub,profile:'allDays',validity:'resolved',source:finishedPath,assurance:'working_estimate'}}]};
  out.push({caseId:finished.caseId,departureAt:at,source:c4,captureSha256:g.rawSha,geometrySha256:g.sha,input,result:estimateRouteTolls(input,{enabled:true}),strictTotalRub:q.rub,geometryUnchanged:g.unchanged(),note:'Original strict600/confirmed and readiness source retained unchanged. Shadow600 is a working zone-sum interpretation (300+300), not a direct operator fare for this exact passage; see PRACTICAL_RECOVERY.md.'});
 }
 return out;
}
export function sampleReport(){
 const samples=buildSavedSamples(),thu=samples.filter(s=>s.departureAt.startsWith('2026-10-15'));
 const files=[c5,c4,zonePath,finishedPath,'experiments/nationwide-tolls/TARIFF_SELECTION_REGISTER.json','experiments/nationwide-tolls/M4_ACTIVE_ENDPOINT_REGISTER.json'];
 return {date:'2026-10-30',sourceHead:'338dacad',scope:'two retained multi-road routes plus one existing finished control; two departure profiles each, not six different routes',
  networkRequests:0,newRouteOrTraceReplays:0,defaultEnabled:false,
  sources:files.map(path=>({path,sha256:hash(bytes(path))})),
  distinctRoutes:3,multiRoadRoutes:2,countsAtSavedDeparture:{confirmed:thu.filter(s=>s.result.status==='confirmed').length,estimated:thu.filter(s=>s.result.status==='estimated').length,unknown:thu.filter(s=>s.result.status==='insufficient').length},
  newNumericTotalsForPreviouslyUnknownRoutes:0,samples};
}
