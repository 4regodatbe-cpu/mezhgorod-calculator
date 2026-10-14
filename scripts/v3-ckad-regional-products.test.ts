import test from 'node:test';
import assert from 'node:assert/strict';
import {paidProductsFromName,unpricedRoadCoverage} from '../lib/v3-calculation/unpriced-road-coverage.ts';
import {resolveCkadProductBoundaries} from '../lib/v3-calculation/ckad-product-boundaries.ts';
import {matrixCkadComponent} from '../experiments/nationwide-tolls/engine/ckad-route-adapter.mjs';
import {composeRouteTolls} from '../lib/toll-engine/route-toll-composition.ts';
import {calculateLegTolls} from '../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import type {Coordinate} from '../lib/tolls.ts';
import type {TollValidation} from '../lib/toll-validator.ts';
const blank={segments:[],validation:null,candidateNetworks:[],m1m3Candidates:[]};
const trace=(names:string[],edge=true):TollValidation=>({status:'toll',source:'Valhalla map matching',
 tollEdgeCount:edge?1:0,checkedEdgeCount:1,wayIds:[],roadNames:[],complete:true,message:'fixture',
 tollBooths:[{osmNodeId:'1',wayId:'1',edgeIndex:0,edgeToll:edge,roadNames:names}]});
const date='2026-10-14T12:00:00+03:00';
const supported:Coordinate[]=[[37.32,44.90],[37.8330177,45.1961096],[38.5327744,45.171408],[38.98,45.04]];
async function upper(validation:TollValidation|null,route=supported) {
 return calculateLegTolls({routeGeometry:route,routeSeconds:9000,departureAt:date,
  selectedFastProvider:'OSRM',selectedFastRoute:{coordinates:route,meters:170000,seconds:9000},
  valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:validation});
}

test('regional identities remain independent and duplicate same-product clues collapse',()=>{
 const ids=['ufa-east','tolyatti','odintsovo','bagration','msd','zsd','shmsd','voznesensky','udmurt-bridges','khabarovsk','mytishchi','ryazan','amur-bridge'];
 const result=unpricedRoadCoverage({...blank,candidateNetworks:ids.map(id=>({id})),segments:['ЗСД: paid'],validation:trace(['ЗСД'])});
 assert.equal(result.regionalProducts.length,13);
 assert.deepEqual(new Set(result.regionalProducts.map(p=>p.id)),new Set(ids));
 assert.deepEqual(paidProductsFromName('ШМСД'),['shmsd']);
 assert.deepEqual(paidProductsFromName('МСД'),['msd']);
 assert.deepEqual(paidProductsFromName('ЗСД'),['zsd']);
});

test('CKAD junction labels and Small Vyazemy do not create M1/M4/M11 traversals',()=>{
 assert.deepEqual(paidProductsFromName('ЦКАД: М-4 — М-11'),['ckad']);
 assert.deepEqual(paidProductsFromName('М-1 — Звенигород, обход Малых Вязем'),['ckad-small-vyazemy']);
 const small=unpricedRoadCoverage({...blank,validation:trace(['ЦКАД: Малые Вяземы'])});
 assert.equal(small.smallVyazemy,true);assert.equal(small.m1,false);
 assert.equal(small.matchedCoreProducts.includes('ckad'),false);
 assert.equal(small.regional,false);
});

test('ambiguous Pskov and unidentified paid objects remain explicit unknown products',()=>{
 assert.deepEqual(unpricedRoadCoverage({...blank,candidateNetworks:[{id:'pskov'}]}).regionalProducts.map(p=>p.id),['pskov-unresolved']);
 assert.deepEqual(unpricedRoadCoverage({...blank,validation:trace([],false)}).regionalProducts.map(p=>p.id),['unknown-paid-road']);
 const paidEdges={...trace([]),roadNames:['местная дорога'],tollBooths:[]};
 assert.deepEqual(unpricedRoadCoverage({...blank,validation:paidEdges}).regionalProducts.map(p=>p.id),['unknown-paid-road']);
 const fare={amount:0,weekdayAmount:0,weekendAmount:0,period:'allDays',segments:[],confidence:'matched' as const};
 for(const id of ['pskov-unresolved','unknown-paid-road'] as const)assert.equal(composeRouteTolls([{id,detected:true,tolls:fare}]).status,'unknown');
 assert.equal(composeRouteTolls([{id:'regional',detected:true,tolls:fare},{id:'zsd',detected:true,tolls:fare}]).status,'unknown');
});

test('every recognized core paid booth blocks a known A289 subset until its own price exists',async()=>{
 assert.equal((await upper(null)).tolls.amount,620);
 for(const [name,id]of [['М-4 Дон','m4'],['М-11 Нева','m11-58-679'],['М-12 Восток','m12'],['ЦКАД: М-4 — М-11','ckad']] as const){
  for(const flag of [true,false]){
   const result=await upper(trace([name],flag));
   const api=tollsForApi(result.tolls,result.fastValidation);
   assert.equal(api.pricingStatus,'unknown',name);assert.equal(api.amount,null,name);
   assert.ok(result.tolls.segments.some(s=>s.includes(id)),id);
  }
 }
 const same=await upper(trace(['А-289']));
 assert.equal(same.tolls.amount,620);
});

test('regional and Small Vyazemy clues block total separately without inventing published fees',async()=>{
 for(const [name,id]of [['ЗСД','zsd'],['ШМСД','shmsd'],['Восточный выезд Уфы','ufa-east'],['ЦКАД: Малые Вяземы','ckad-small-vyazemy']] as const){
  const result=await upper(trace([name]));
  assert.equal(tollsForApi(result.tolls,result.fastValidation).amount,null);
  assert.ok(result.tolls.segments.some(s=>s.includes(id)),id);
 }
});

test('unidentified paid edges or a contradictory free trace cannot hide behind known money',async()=>{
 const unknown={...trace([]),tollBooths:[],roadNames:['местная дорога']};
 const result=await upper(unknown);
 assert.equal(tollsForApi(result.tolls,result.fastValidation).amount,null);
 const free={...trace(['ЦКАД']),status:'free' as const};
 const freeResult=await upper(free);
 assert.equal(tollsForApi(freeResult.tolls,freeResult.fastValidation).amount,null);
});

test('late core and regional evidence cannot turn an unknown route into free',async()=>{
 const original=globalThis.fetch;
 const route:Coordinate[]=[[60,60],[60.01,60.01],[60.02,60.02]];
 try {
  for(const name of ['ЦКАД','М-12','ЗСД']){
   globalThis.fetch=async()=>Response.json({edges:[{toll:true,names:[name]}]});
   const result=await upper(null,route);
   assert.equal(tollsForApi(result.tolls,result.fastValidation).pricingStatus,'unknown');
   assert.equal(tollsForApi(result.tolls,result.fastValidation).amount,null);
  }
 }finally{globalThis.fetch=original;}
});

const arc:Coordinate[]=[[37.75,55.32],[37.80,55.35],[38.05,55.39],[38.34,55.53],[38.35,55.65],[38.46,55.72],[38.50,55.90],[37.92,56.13],[37.55,56.18],[37.42,56.20],[37.30,56.24]];
const evidence={provider:'osrm' as const,malformedStrictCount:0,candidateClues:[],strictBlocks:[{provider:'osrm' as const,
 legIndex:0,sourceStartIndex:0,sourceEndIndex:0,beginKm:0,endKm:1,lengthKm:1,
 beginCoordinate:arc[9],endCoordinate:arc[10],labels:['М-11']}]};

test('CKAD boundary model has no native monetary prerequisite and uses one ready directed pair',()=>{
 for(const route of [arc,arc.toReversed()]){
  const proof=resolveCkadProductBoundaries(route,evidence);
  assert.equal(proof.exact,true);assert.equal('tolls' in proof,false);
  assert.equal(matrixCkadComponent(proof,date,3600)?.tolls?.amount,1800);
 }
 assert.equal(resolveCkadProductBoundaries(arc,null).exact,false);
});

test('CKAD conditions and version window never resolve from a caller flag or source amount alone',()=>{
 const proof={exact:true,traversal:{from:'М-12 Восток',to:'Носовихинское шоссе'},tariffContextResolved:true};
 const result=matrixCkadComponent(proof,date,3600)!;
 assert.equal(result.tolls,null);assert.match(result.reason,/unresolved-operator-tariff-context/);
 const plain={exact:true,traversal:{from:'М-4 Дон',to:'М-11 Нева'}};
 assert.equal(matrixCkadComponent(plain,'2026-03-01T23:30:00+03:00',3600)?.tolls,null);
 assert.equal(matrixCkadComponent(plain,'2026-10-14T23:30:00+03:00',3600)?.tolls?.amount,1800);
 assert.equal(matrixCkadComponent(plain,date,-1)?.tolls,null);
});


test('references and product names on one booth are aliases, never a second charged road',()=>{
 const validation={...trace(['М-1','Северный обход Одинцова']),roadNames:['М-1','Северный обход Одинцова']};
 const result=unpricedRoadCoverage({...blank,validation});
 assert.equal(result.m1,false);
 assert.deepEqual(result.regionalProducts.map(p=>p.id),['odintsovo']);
 assert.deepEqual(result.matchedCoreProducts,[]);
 const bypass=unpricedRoadCoverage({...blank,validation:{...trace(['М-4','Дальний западный обход Краснодара']),roadNames:['М-4','Дальний западный обход Краснодара']}});
 assert.deepEqual(bypass.matchedCoreProducts,['krasnodar-west-bypass']);
});
