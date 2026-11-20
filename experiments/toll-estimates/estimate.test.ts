import test from 'node:test';
import assert from 'node:assert/strict';
import {estimateRouteTolls,type Conditions,type EstimateInput,type EstimateComponent,type TariffQuote} from './estimate.ts';
const geometry='a'.repeat(64),at='2026-10-15T09:00:00+03:00';
const cond:Conditions={road:'M11',operator:'Avtodor',product:'M11-58-679',direction:'north',category:'I',payment:'cash/card',profile:'monThu'};
export function component(id='m11',rub=610,assurance:TariffQuote['assurance']='confirmed'):EstimateComponent {
 return {id,conditions:{...cond},entry:'p58',exit:'p147',family:id,aggregate:false,coverageKeys:[id],
  scope:{proven:true,reference:'CONTROLLED fixture scope, not real route proof',routeId:'fixture',geometrySha256:geometry},
  quote:{conditions:{...cond},routeId:'fixture',geometrySha256:geometry,departureAt:at,rub,profile:'monThu',validity:'resolved',
   source:'controlled matrix fixture/real p58-p147610 but synthetic scope',assurance}};
}
export function input(parts:readonly EstimateComponent[]=[component()]):EstimateInput {
 return {routeId:'fixture',geometrySha256:geometry,departureAt:at,coverageComplete:true,requiredCoverage:parts.flatMap(p=>[...p.coverageKeys]),
  components:parts,strict:{pricingStatus:'unknown',amount:null,priceConfirmation:'unknown'}};
}
const on={enabled:true};
test('E2 disabled module passes strict object through without activating estimates',()=>{
 const i=input();Object.freeze(i.strict);Object.freeze(i);const out=estimateRouteTolls(i);assert.equal(out.status,'disabled');assert.equal(out.strict,i.strict);assert.equal(out.totalRub,null);
});
test('E2 fully confirmed complete route retains exact total',()=>{
 const i={...input(),strict:{pricingStatus:'priced',amount:610,priceConfirmation:'confirmed'}};const out=estimateRouteTolls(i,on);assert.equal(out.status,'confirmed');assert.equal(out.totalRub,610);assert.deepEqual(out.strict,i.strict);
});
test('E2 one and multiple working estimates mark only the complete toll total as estimated',()=>{
 for(const parts of [[component('a',610,'working_estimate')],[component('a',610,'working_estimate'),component('b',460,'working_estimate')]]){
  const out=estimateRouteTolls(input(parts),on);assert.equal(out.status,'estimated');assert.equal(out.totalRub,parts.length===1?610:1070);assert.equal(out.confirmedSubtotalRub,null);
 }
});
test('E2 mixed roads sum confirmed and estimated components without relabelling strict input',()=>{
 const a=component('a',610),b=component('b',300,'working_estimate');const i=input([a,{...b,conditions:{...b.conditions,road:'ZSD',product:'ZSD-zone1'},quote:{...b.quote!,conditions:{...b.conditions,road:'ZSD',product:'ZSD-zone1'}}}]);
 const out=estimateRouteTolls(i,on);assert.equal(out.status,'estimated');assert.equal(out.totalRub,910);assert.equal(out.confirmedSubtotalRub,610);assert.equal(i.strict.amount,null);
});
test('E2 insufficient product data never turns known subtotal into a full total',()=>{
 const absent={...component('missing'),quote:undefined,stopReason:'operator_product_unknown'};
 const out=estimateRouteTolls(input([component(),absent]),on);assert.equal(out.status,'insufficient');assert.equal(out.totalRub,null);assert.equal(out.confirmedSubtotalRub,610);assert.deepEqual(out.missingCoverage,['missing']);
});
test('E2 comparable upper bound requires a documented exhaustive same-product candidate set',()=>{
 const c=component(),q=c.quote!;const bounded={...c,quote:undefined,alternatives:{exhaustive:true,reference:'CONTROLLED complete candidate-set proof, not real route evidence',quotes:[{...q,rub:460,source:'fixture p58-p124'},{...q,rub:610,source:'fixture p58-p147'}]}};
 const out=estimateRouteTolls(input([bounded]),on);assert.equal(out.status,'estimated');assert.equal(out.totalRub,610);assert.deepEqual(out.components[0].range,{min:460,max:610});
 assert.equal(estimateRouteTolls(input([{...bounded,alternatives:{...bounded.alternatives,exhaustive:false}}]),on).status,'insufficient');
});
test('E2 incompatible road direction category payment product profile or date cannot be a convenient estimate',()=>{
 const c=component(),q=c.quote!;
 for(const conditions of [{...cond,road:'M12'},{...cond,direction:'south'},{...cond,category:'II'},{...cond,payment:'transponder'},{...cond,product:'head15-58'}]){
  assert.equal(estimateRouteTolls(input([{...c,quote:{...q,conditions}}]),on).totalRub,null);
 }
 for(const bad of [{...q,validity:'unknown' as const},{...q,departureAt:'2026-10-17T09:00:00+03:00'},{...q,geometrySha256:'b'.repeat(64)}])assert.equal(estimateRouteTolls(input([{...c,quote:bad}]),on).totalRub,null);
 const mixed={...c,quote:undefined,alternatives:{exhaustive:true,reference:'fixture',quotes:[q,{...q,profile:'friSun',rub:750}]}};
 assert.equal(estimateRouteTolls(input([mixed]),on).totalRub,null);
});
test('E2 duplicate and aggregate-overlap protection rejects double charging',()=>{
 const c=component();assert.equal(estimateRouteTolls(input([c,c]),on).status,'insufficient');
 const b={...component('other'),coverageKeys:['m11']};assert.equal(estimateRouteTolls({...input([c,b]),requiredCoverage:['m11']},on).totalRub,null);
 const aggregate={...c,aggregate:true,family:'M4'},part={...component('545'),family:'M4'};
 assert.equal(estimateRouteTolls(input([aggregate,part]),on).assessedSubtotalRub,null);
});
test('E2 unsafe route scope malformed date and unknown zero remain insufficient',()=>{
 const c=component();assert.equal(estimateRouteTolls(input([{...c,scope:{...c.scope,proven:false}}]),on).totalRub,null);
 assert.equal(estimateRouteTolls({...input(),departureAt:'2026-02-30T09:00:00+03:00'},on).totalRub,null);
 assert.equal(estimateRouteTolls(input([component('zero',0)]),on).totalRub,null);
 assert.equal(estimateRouteTolls({...input([]),confirmedNoPaidCrossing:false},on).totalRub,null);
});
test('E2 confirmed strict conflict and unsafe arithmetic never overwrite an existing confirmed calculation',()=>{
 const strict={pricingStatus:'priced',amount:999,priceConfirmation:'confirmed'};const out=estimateRouteTolls({...input(),strict},on);assert.equal(out.totalRub,null);assert.equal(out.strict,strict);
 assert.equal(estimateRouteTolls(input([component('a',Number.MAX_SAFE_INTEGER),component('b',1)]),on).totalRub,null);
});
test('E2 resolved component profile at departure cannot be replaced by another quote profile',()=>{
 const c=component();const out=estimateRouteTolls(input([{...c,quote:{...c.quote!,profile:'friSun'}}]),on);assert.equal(out.totalRub,null);
});
test('E2 local work limits return structured insufficient instead of unbounded candidate evaluation',()=>{
 const c=component(),q=c.quote!;assert.equal(estimateRouteTolls(input([{...c,quote:undefined,alternatives:{exhaustive:true,reference:'fixture',quotes:Array.from({length:33},()=>q)}}]),on).totalRub,null);
 assert.equal(estimateRouteTolls(input(Array.from({length:65},(_,i)=>component('c'+i))),on).reasons[0],'local_estimate_work_limit');
});
