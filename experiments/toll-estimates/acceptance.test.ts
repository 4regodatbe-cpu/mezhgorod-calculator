import test from 'node:test';
import assert from 'node:assert/strict';
import core from '../nationwide-tolls/engine/quote.cjs';
import {m11MainlineTariffAt} from '../nationwide-tolls/engine/m11-route-adapter.mjs';
import {m11HeadTariffAt} from '../nationwide-tolls/engine/m11-head-route-adapter.mjs';
import {departureTariffContext} from '../nationwide-tolls/engine/tariff-window.mjs';
import {estimateRouteTolls,type Conditions,type EstimateComponent,type EstimateInput} from './estimate.ts';
import {buildSavedSamples} from './saved-samples.ts';
import {tollEstimateView} from './presentation.ts';
const routeId='CONTROLLED_E5_SCOPE_NOT_A_REAL_ROUTE',geometry='f'.repeat(64),thu='2026-10-15T09:00:00+03:00';
function priced(road:'m11-15-58'|'m11-58-679',from:string,to:string,at=thu,direction='northbound'):EstimateComponent {
 const calendar=road==='m11-15-58'?m11HeadTariffAt(at):m11MainlineTariffAt(at);assert.equal(calendar.status,'resolved');const profile=calendar.profile!;
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at));
 const q=core.quote({routeId,evidenceComplete:true,components:[{routeId,traversalId:road,road,from,to,profile,localDate:date,exactTraversal:true,profileResolved:true}]});assert.equal(q.pricingStatus,'priced');assert.ok(Number.isSafeInteger(q.rub));
 const conditions:Conditions={road:'M11',operator:road==='m11-15-58'?'m11-neva':'Avtodor',product:road,direction,category:'I',payment:'cash/card',profile};
 return {id:road,conditions,entry:from,exit:to,family:'M11',aggregate:false,coverageKeys:[road],
  scope:{proven:true,reference:'CONTROLLED scope only; actual matrix prices, not real selected-route evidence',routeId,geometrySha256:geometry},
  quote:{conditions,routeId,geometrySha256:geometry,departureAt:at,rub:q.rub,profile,validity:'resolved',assurance:'confirmed',
   source:`${q.components[0].source}#${road}/${from}->${to}/${profile}`}};
}
function request(parts:readonly EstimateComponent[],at=thu):EstimateInput {
 return {routeId,geometrySha256:geometry,departureAt:at,coverageComplete:true,requiredCoverage:parts.flatMap(c=>[...c.coverageKeys]),components:parts,strict:{pricingStatus:'unknown',amount:null,priceConfirmation:'unknown'}};
}
test('E5 comparable bound uses actual same-product matrix cells, never a whole-route benchmark',()=>{
 const a=priced('m11-58-679','p58','p124'),b=priced('m11-58-679','p58','p147');
 const c:EstimateComponent={...b,exit:null,quote:undefined,alternatives:{exhaustive:true,reference:'CONTROLLED exhaustive p124/p147 ambiguity, not a real-route claim',quotes:[a.quote!,b.quote!]}};
 const result=estimateRouteTolls(request([c]),{enabled:true});assert.equal(result.status,'estimated');assert.deepEqual(result.components[0].range,{min:460,max:610});assert.equal(result.totalRub,610);assert.match(tollEstimateView(result).secondary!,/верхняя граница/u);
});
test('E5 reverse matrix quote must be resolved independently, a northbound quote cannot be inherited',()=>{
 const south=priced('m11-58-679','p147','p58',thu,'southbound');const valid=estimateRouteTolls(request([south]),{enabled:true});assert.equal(valid.totalRub,south.quote!.rub);
 const north=priced('m11-58-679','p58','p147');assert.equal(estimateRouteTolls(request([{...south,quote:north.quote}]),{enabled:true}).totalRub,null);
});
test('E5 road-specific midnight and night calendars remain departure-based, not a global weekend or arrival profile',()=>{
 const before='2026-10-16T00:30:00+03:00',night='2026-10-16T01:30:00+03:00';
 const prior=priced('m11-58-679','p58','p147',before);assert.equal(prior.quote!.profile,'monThu');assert.equal(estimateRouteTolls(request([prior],before),{enabled:true}).totalRub,610);
 const head=priced('m11-15-58','moscow','solnechnogorsk',night),main=priced('m11-58-679','p58','p147',night);assert.equal(head.quote!.profile,'night');assert.equal(main.quote!.profile,'friSun');
 const out=estimateRouteTolls(request([head,main],night),{enabled:true});assert.equal(out.totalRub,1630);
 const frozen=departureTariffContext(thu,72*3600,m11MainlineTariffAt);assert.equal(frozen.begin.profile,'monThu');assert.equal(estimateRouteTolls(request([prior],'2026-10-17T00:30:00+03:00'),{enabled:true}).totalRub,null);
});
test('E5 actual sample atomic M4 and ZSD coverage blocks aggregate plus partial duplicate charges',()=>{
 const samples=buildSavedSamples(),long=samples.find(s=>s.caseId==='pair-m4-m11-krasnodar-to-spb')!,full=samples.find(s=>s.caseId.startsWith('dnr-'))!;
 const m4=long.input.components.find(c=>c.id==='m4')!;assert.ok(m4.coverageKeys.includes('m4:m4-545-a')&&m4.coverageKeys.includes('m4:m4-545-b'));
 const duplicate={...m4,id:'m4-545-copy',aggregate:false,coverageKeys:['m4:m4-545-a','m4:m4-545-b']};assert.equal(estimateRouteTolls({...long.input,components:[...long.input.components,duplicate]},{enabled:true}).reasons[0],'overlapping_product_or_aggregate_coverage');
 const zsd=full.input.components[0],part={...zsd,id:'zone1-copy',aggregate:false,coverageKeys:['zsd:zone-1']};assert.equal(estimateRouteTolls({...full.input,components:[zsd,part]},{enabled:true}).totalRub,null);
});
test('E5 a blocked map/product scope cannot acquire a price merely because comparable tariffs exist',()=>{
 const c=priced('m11-58-679','p58','p147');const blocked={...c,scope:{...c.scope,proven:false},stopReason:'E1_map_alignment_or_operator_product_unresolved'};
 const input=request([blocked]),before=JSON.stringify(input);assert.equal(estimateRouteTolls(input,{enabled:true}).totalRub,null);assert.equal(JSON.stringify(input),before);assert.equal(estimateRouteTolls(input).status,'disabled');
});
