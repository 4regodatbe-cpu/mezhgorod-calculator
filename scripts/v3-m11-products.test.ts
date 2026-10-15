import test from 'node:test';
import assert from 'node:assert/strict';
import {matrixM11HeadComponent,m11HeadTariffAt} from '../experiments/nationwide-tolls/engine/m11-head-route-adapter.mjs';
import {matrixM11GeometryComponent} from '../experiments/nationwide-tolls/engine/m11-route-adapter.mjs';
import head from '../experiments/nationwide-tolls/source-snapshots/2026-04-24-15-58-category1.json' with {type:'json'};
import {resolveM11ProductBoundaries} from '../lib/v3-calculation/m11-product-boundaries.ts';
import {composeRouteTolls} from '../lib/toll-engine/route-toll-composition.ts';
import {calculateM11MoscowToPetersburg} from '../lib/toll-engine/m11-moscow-production.ts';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import type {Coordinate} from '../lib/tolls.ts';
const date='2026-10-14T12:00:00+03:00';
const bound=(from:string,to:string,at=date,seconds=0)=>({boundaryStatus:'resolved',from,to,paymentAt:at,paymentWindowSeconds:seconds});

test('all 210 head cells remain directed ready fares, including differing Friday reverse price',()=>{
 const dates={night:'2026-10-14T03:00:00+03:00',monThu:date,fri:'2026-10-16T12:00:00+03:00',sat:'2026-10-17T12:00:00+03:00',sun:'2026-10-18T12:00:00+03:00'};
 let count=0;
 for(const [from,row] of Object.entries(head.tariffs))for(const [to,profiles]of Object.entries(row))for(const [profile,rub]of Object.entries(profiles)){
  const result=matrixM11HeadComponent(bound(from,to,dates[profile as keyof typeof dates]));
  assert.equal(result.tolls?.amount,rub,`${from}>${to} ${profile}`);count++;
 }
 assert.equal(count,210);
 assert.equal(matrixM11HeadComponent(bound('moscow','solnechnogorsk',dates.fri)).tolls?.amount,1650);
 assert.equal(matrixM11HeadComponent(bound('solnechnogorsk','moscow',dates.fri)).tolls?.amount,1260);
});

test('head uses its own night, next-day 01:00 and holiday calendar',()=>{
 for(const [at,profile] of [
  ['2026-10-16T00:59:59+03:00','monThu'],['2026-10-16T01:00:00+03:00','night'],
  ['2026-10-16T05:59:59+03:00','night'],['2026-10-16T06:00:00+03:00','fri'],
  ['2026-10-19T00:30:00+03:00','sun'],['2026-11-03T00:30:00+03:00','monThu'],
  ['2026-11-03T06:00:00+03:00','fri'],['2026-11-04T06:00:00+03:00','sat'],
 ])assert.equal(m11HeadTariffAt(at).profile,profile,at);
 assert.equal(matrixM11HeadComponent(bound('moscow','solnechnogorsk','2026-10-16T00:30:00+03:00',1200)).tolls?.amount,1130);
 assert.equal(matrixM11HeadComponent(bound('moscow','solnechnogorsk','2026-10-16T00:30:00+03:00',2400)).tolls,null);
});

test('head cannot guess invalid time, missing boundaries or an in-window night transition',()=>{
 for(const at of ['2026-10-14','2026-02-30T12:00:00+03:00','2026-10-14T24:00:00+03:00','2027-01-01T12:00:00+03:00','2026-04-23T12:00:00+03:00'])assert.equal(matrixM11HeadComponent(bound('moscow','solnechnogorsk',at)).tolls,null);
 for(const b of [null,{},bound('moscow','moscow'),bound('missing','moscow'),{...bound('moscow','solnechnogorsk'),paymentWindowSeconds:-1}])assert.equal(matrixM11HeadComponent(b).tolls,null);
 assert.equal(matrixM11HeadComponent(bound('moscow','solnechnogorsk',date,86400)).tolls,null);
});

const north:Coordinate[]=[[37.472,55.8842],[37.0712818,56.1391684],[30.3598352,59.7750977]];

test('V3 outer boundaries work both directions without intermediate p593 or native fare eligibility',()=>{
 for(const [route,from,to]of [[north,'p58','p679'],[north.toReversed(),'p679','p58']] as const){
  const legacy=calculateM11MoscowToPetersburg(route,8*3600,date);
  assert.equal(legacy.exact,false);
  const resolved=resolveM11ProductBoundaries(route,8*3600,date);
  assert.equal(resolved.resolved,true);assert.equal(resolved.parts?.from,from);assert.equal(resolved.parts?.to,to);
  assert.ok(matrixM11GeometryComponent({exact:resolved.resolved,parts:resolved.parts})?.tolls?.amount);
 }
});

test('north head fare uses common final exit time and ignores any old numeric fields',()=>{
 const resolved=resolveM11ProductBoundaries(north,8*3600,'2026-10-15T22:00:00+03:00');
 assert.equal(resolved.parts?.head.paymentAt,'2026-10-16T03:00:00.000Z');
 const production={exact:true,parts:{...resolved.parts,headAmount:NaN,headWeekday:Number.MAX_SAFE_INTEGER,headWeekend:-1}};
 const result=matrixM11GeometryComponent(production)!;
 const component=result.components.find(c=>c.id==='m11-15-58')!;
 assert.equal(component.tolls?.amount,1650);
 assert.equal(result.components.length,2);
 assert.equal(composeRouteTolls(result.components).tolls?.amount,result.tolls?.amount);
 assert.equal(composeRouteTolls([...result.components,component]).status,'unknown');
 assert.equal(composeRouteTolls([...result.components,{id:'m11',detected:true,tolls:result.tolls}]).status,'unknown');
});

test('south payment window stays unknown when unbound Moscow PVP21 could change the profile',()=>{
 const resolved=resolveM11ProductBoundaries(north.toReversed(),8*3600,'2026-10-15T22:00:00+03:00');
 assert.ok(resolved.parts!.head.paymentWindowSeconds>0);
 const parts={...resolved.parts,head:{...resolved.parts!.head,paymentAt:'2026-10-16T00:30:00+03:00',paymentWindowSeconds:3600}};
 const result=matrixM11GeometryComponent({exact:true,parts})!;
 assert.equal(result.tolls,null);
 assert.equal(composeRouteTolls(result.components).status,'unknown');
});

async function upper(route:Coordinate[],tail=false) {
 const selectedFastRoute={meters:700000,seconds:8*3600,coordinates:route,
  m11RoadEvidence:{provider:'osrm' as const,malformedStrictCount:0,candidateClues:[],strictBlocks:[{
   provider:'osrm' as const,legIndex:0,sourceStartIndex:0,sourceEndIndex:0,beginKm:0,endKm:700,lengthKm:700,
   beginCoordinate:route[0],endCoordinate:route.at(-1)!,labels:['М-11'],
  }]}};
 return calculateLegTolls({routeGeometry:route,routeSeconds:8*3600,departureAt:date,
  selectedFastProvider:'OSRM',selectedFastRoute,valhallaEvidence:null,confirmedFreeRoute:null,
  diagnosticFastValidation:tail?{status:'free',complete:true,source:'Valhalla map matching',tollEdgeCount:0,checkedEdgeCount:1,wayIds:[],roadNames:[],message:'fixture'}:null});
}

test('upper V3 adds head and mainline once in both directions, never the old M11 aggregate',async()=>{
 for(const route of [north,north.toReversed()]){
  const result=await upper(route);
  assert.ok(result.tolls.amount>0);
  assert.deepEqual(result.fastValidation.roadNames,['m11-15-58','m11-58-679']);
  assert.equal(tollsForApi(result.tolls,result.fastValidation).pricingStatus,'priced');
 }
});

test('user-approved 94 RUB tail fare prices the continuation in both directions',async()=>{
 const full:Coordinate[]=[...north,[30.3351,59.9343]];
 for(const route of [full,full.toReversed()]){
  const result=await upper(route,true);
  const api=tollsForApi(result.tolls,result.fastValidation);
  assert.equal(api.pricingStatus,'priced');assert.ok(api.amount!==null&&api.amount>0);
  assert.equal(result.componentAudit.components.find(c=>c.id==='m11-679-684')?.tolls?.amount,94);
  assert.equal(result.componentAudit.missing.length,0);
 }
});


test('a route without the Moscow head does not infer the missing mainline from the 94 RUB tail fare',async()=>{
 const route:Coordinate[]=[[31.2534812,59.1976987],[30.3598352,59.7750977],[30.3351,59.9343]];
 for(const directed of [route,route.toReversed()]) {
  const result=await upper(directed,true);
  assert.equal(tollsForApi(result.tolls,result.fastValidation).amount,null);
  assert.equal(tollsForApi(result.tolls,result.fastValidation).pricingStatus,'unknown');
 }
});
