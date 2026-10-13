import test from 'node:test';
import assert from 'node:assert/strict';
import {unpricedRoadCoverage as coverage} from '../lib/v3-calculation/unpriced-road-coverage.ts';
import {detectedFamiliesFromLegacySegments as families} from '../lib/toll-engine/route-toll-composition.ts';
import type {TollValidation} from '../lib/toll-validator.ts';
const input={segments:[],validation:null,candidateNetworks:[],m1m3Candidates:[]};
const trace=(names:string[],edgeToll=true):TollValidation=>({status:'toll',source:'Valhalla map matching',tollEdgeCount:1,checkedEdgeCount:1,wayIds:[],roadNames:[],message:'selected-route fixture',tollBooths:[{osmNodeId:'123',wayId:'1',edgeIndex:0,edgeToll,roadNames:names}]});
test('road references require exact numeric and word boundaries',()=>{
  for(const name of ['М-111','М-120','М-13','М-30','М-40','AM-4','М-3а']) assert.equal(families([name]).size,0,name);
  for(const [name,family] of [['M-1: paid','m1'],['М‑3 «Украина»','m3'],['М11 Нева','m11'],['М-12 Восток','m12'],['А289: paid','m4_a289']]) assert.ok(families([name]).has(family as never),name);
});
test('M1/M3 matched candidates and named paid booths cannot be omitted',()=>{
  assert.equal(coverage({...input,m1m3Candidates:['m3']}).m3,true);
  assert.equal(coverage({...input,validation:trace(['М-1 Беларусь'])}).m1,true);
  assert.equal(coverage({...input,validation:trace(['М-3 Украина'])}).m3,true);
});
test('all catalog regional candidates block a complete total until priced',()=>{
  for(const id of ['zsd','shmsd','msd','odintsovo','bagration','ufa-east','tolyatti','voznesensky','khabarovsk','mytishchi','pskov','ryazan','udmurt-bridges','amur-bridge']) assert.equal(coverage({...input,candidateNetworks:[{id}]}).regional,true,id);
  for(const id of ['m4','m11','m11-15-58','m12','ckad','a289']) assert.equal(coverage({...input,candidateNetworks:[{id}]}).regional,false,id);
});
test('regional names and unmapped paid events block a numeric subset',()=>{
  for(const name of ['ЗСД: paid','Западный скоростной диаметр','Мытищинская хорда','Проспект Багратиона','Северный обход Одинцова']) assert.equal(coverage({...input,segments:[name]}).regional,true,name);
  assert.equal(coverage({...input,validation:trace([])}).regional,true);
  assert.equal(coverage({...input,validation:trace(['М-4 Дон'])}).regional,false);
  assert.equal(coverage({...input,validation:trace(['местная дорога'],false)}).regional,false);
});
test('V3 known A289 price cannot hide another unpriced regional road',async()=>{
 const {calculateLegTolls}=await import('../lib/v3-calculation/route-leg-pricing.ts');
 const coordinates:[number,number][]=[[37.32,44.90],[37.8330177,45.1961096],[38.5327744,45.171408],[38.98,45.04]];
 const selectedFastRoute={coordinates,meters:170000,seconds:9000};
 const args={routeGeometry:coordinates,routeSeconds:9000,departureAt:'2026-10-13T12:00:00+03:00',selectedFastProvider:'OSRM',selectedFastRoute,valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:null};
 const base=await calculateLegTolls(args);
 assert.equal(base.tolls.amount,620);
 for(const name of ['ЗСД','М-3 Украина','М-1 Беларусь']) {
 const result=await calculateLegTolls({...args,diagnosticFastValidation:trace([name])});
 assert.equal(result.tolls.amount,0);
 assert.ok(result.tolls.segments.some(s=>s.includes(name==='ЗСД'?'regional':name.includes('3')?'m3':'m1')));
 }
});

test('CKAD endpoint labels do not assert passage on the intersecting highways',()=>{
 assert.deepEqual([...families(['ЦКАД: М-4 — М-11'])],['ckad']);
});

test('late map matching cannot revive an incomplete toll price',async()=>{
 const {calculateLegTolls}=await import('../lib/v3-calculation/route-leg-pricing.ts');
 const coordinates:[number,number][]=[[60,60],[60.01,60.01],[60.02,60.02]];
 const original=globalThis.fetch;
 globalThis.fetch=async()=>Response.json({edges:[{toll:true,names:['М-3 Украина'],end_osm_node_id:4780909558,end_node:{type:'toll_booth'},way_id:1}]});
 try{
 const result=await calculateLegTolls({routeGeometry:coordinates,routeSeconds:1000,departureAt:'2026-10-13T12:00:00+03:00',selectedFastProvider:'OSRM',selectedFastRoute:{coordinates,seconds:1000,meters:5000},valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:null});
 assert.equal(result.tolls.amount,0);
 assert.equal(result.fastValidation.status,'unknown');
 assert.ok(result.tolls.segments.some(s=>s.includes('m3')));
 }finally{globalThis.fetch=original;}
});
