import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import gates from '../experiments/nationwide-tolls/source-snapshots/dzok/2026-10-14-pvp46-physical-gates.json' with {type:'json'};
import {inspectKrasnodarBypass} from '../lib/toll-engine/krasnodar-bypass-evidence.ts';
import {matrixDzokComponent} from '../experiments/nationwide-tolls/engine/dzok-route-adapter.mjs';
import {matrixM4Component} from '../experiments/nationwide-tolls/engine/m4-route-adapter.mjs';
import {composeSelectedM4A289} from '../lib/v3-calculation/m4-a289-composition.ts';
import {composeRouteTolls} from '../lib/toll-engine/route-toll-composition.ts';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import type {ProductionM4Result} from '../lib/toll-engine/m4-production.ts';
import type {Coordinate} from '../lib/tolls.ts';
const point=(node:{lon:number;lat:number}):Coordinate=>[node.lon,node.lat];
const routeFor=(g:typeof gates.gates[number])=>[point(g.before),point(g.gate),point(g.after)];
const date='2026-10-14T12:00:00+03:00';
const empty={candidate:false,exact:false,tolls:null} as ProductionM4Result;
const BYPASS='М-4: Дальний западный обход Краснодара';

test('archived primary map matches the normalized booths and named one-way toll roads',()=>{
 const packed=readFileSync(new URL('../experiments/nationwide-tolls/source-snapshots/dzok/2026-10-14-osm-pvp46.osm.gz',import.meta.url));
 const bytes=gunzipSync(packed);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),gates.sourceSha256);
 assert.equal(createHash('sha256').update(packed).digest('hex'),gates.archiveSha256);
 for(const g of gates.gates){
  assert.ok(bytes.toString().includes(`id="${g.gate.id}"`));
  assert.equal(g.wayTags.oneway,'yes');assert.equal(g.wayTags.toll,'yes');
  assert.ok(g.wayTags.name.includes('западный обход'));
 }
});

test('both actual directional carriageways resolve their own 410 matrix fare',()=>{
 for(const g of gates.gates){
  const evidence=inspectKrasnodarBypass(routeFor(g));
  assert.equal(evidence.boundaryStatus,'resolved');assert.equal(evidence.from,g.from);assert.equal(evidence.to,g.to);
  assert.equal(matrixDzokComponent(evidence,date,60).tolls?.amount,410);
  assert.equal(composeSelectedM4A289(routeFor(g),empty,null,[],date,60)?.tolls?.amount,410);
 }
});

test('wrong-way geometry, proximity and a long interpolated chord cannot bind a directional fare',()=>{
 const g=gates.gates[0];
 const reverse=inspectKrasnodarBypass(routeFor(g).toReversed());
 assert.equal(reverse.candidate,true);assert.equal(reverse.boundaryStatus,'unknown');
 assert.equal(matrixDzokComponent(reverse,date,60).tolls,null);
 const [lon,lat]=point(g.gate);
 const chord:Coordinate[]=[[lon-0.1,lat-0.1],[lon+0.1,lat+0.1]];
 assert.equal(inspectKrasnodarBypass(chord).boundaryStatus,'unknown');
 const nearby=routeFor(g).map(([x,y]):Coordinate=>[x,y+0.002]);
 assert.equal(inspectKrasnodarBypass(nearby).candidate,false);
});

test('bypass needs proven boundaries and valid departure; later Friday does not reprice',()=>{
 const simple:Coordinate[]=[[38.98,45.24],[38.68,45.0]];
 const result=composeSelectedM4A289(simple,empty,null,[BYPASS,BYPASS],date,3600);
 assert.equal(result?.tolls,null);
 assert.deepEqual(result?.components.filter(c=>c.detected).map(c=>c.id),['krasnodar-west-bypass']);
 const evidence=inspectKrasnodarBypass(routeFor(gates.gates[0]));
 for(const at of ['2026-03-01T12:00:00+03:00','2026-10-14','2026-02-30T12:00:00+03:00','2027-01-01T12:00:00+03:00'])assert.equal(matrixDzokComponent(evidence,at,60).tolls,null);
 assert.equal(matrixDzokComponent(evidence,'2026-10-15T23:59:00+03:00',120).tolls?.amount,matrixDzokComponent(evidence,'2026-10-15T23:59:00+03:00',0).tolls?.amount);
});

test('M4, A289 and bypass compose three independent ready fares exactly once',()=>{
 const production={candidate:true,exact:true,tolls:{amount:1,weekdayAmount:1,weekendAmount:1,
  confidence:'matched',period:'monThu',segments:[]},m4PvpPreview:{confirmedPvps:['m4-1046','m4-1093','m4-1184','m4-1223']}} as unknown as ProductionM4Result;
 const matrix=matrixM4Component(production,date,3600);
 const g=gates.gates.find(g=>g.from==='0')!;
 const route:Coordinate[]=[[37.62,55.76],...routeFor(g),[38.5327744,45.171408],[37.8330177,45.1961096],[37.5878131,45.168457],[34.16,44.5]];
 const result=composeSelectedM4A289(route,production,matrix,[],date,3600)!;
 assert.deepEqual(result.components.filter(c=>c.detected).map(c=>c.id),['m4','a289','krasnodar-west-bypass']);
 assert.equal(result.tolls?.amount,2440);
 assert.equal(composeRouteTolls(result.components).tolls?.amount,2440);
 assert.equal(composeRouteTolls([...result.components,result.components[2]]).status,'unknown');
 assert.equal(composeRouteTolls([...result.components,{id:'m4_a289',detected:true,tolls:result.tolls}]).status,'unknown');
});

test('upper V3 consumes the bypass product rather than the old aggregate',async()=>{
 const route=routeFor(gates.gates[0]);
 const result=await calculateLegTolls({routeGeometry:route,routeSeconds:60,departureAt:date,
  selectedFastProvider:'OSRM',selectedFastRoute:{coordinates:route,meters:300,seconds:60},
  valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:null});
 assert.equal(result.tolls.amount,410);
 assert.deepEqual(result.fastValidation.roadNames,['krasnodar-west-bypass']);
});

test('an unresolved physical bypass blocks a provider-free route at the API boundary',async()=>{
 const route=routeFor(gates.gates[0]).toReversed();
 const result=await calculateLegTolls({routeGeometry:route,routeSeconds:60,departureAt:date,
  selectedFastProvider:'OSRM',selectedFastRoute:{coordinates:route,meters:300,seconds:60},
  valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:{status:'free',complete:true,
   source:'Valhalla map matching',tollEdgeCount:0,checkedEdgeCount:1,wayIds:[],roadNames:[],message:'fixture'}});
 assert.equal(tollsForApi(result.tolls,result.fastValidation).amount,null);
 assert.equal(tollsForApi(result.tolls,result.fastValidation).pricingStatus,'unknown');
});
