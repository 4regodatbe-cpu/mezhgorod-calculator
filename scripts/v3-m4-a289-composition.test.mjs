import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import {load,root} from './helpers/load-ts.mjs';
import {matrixM4Component} from '../experiments/nationwide-tolls/engine/m4-route-adapter.mjs';
const require=createRequire(import.meta.url);
const {composeSelectedM4A289:compose}=load(resolve(root,'lib/v3-calculation/m4-a289-composition.ts'));
const {priceA289Route}=load(resolve(root,'lib/toll-engine/a289-engine.ts'));
const date='2026-10-13T09:00:00+03:00';
const slavyansk=[38.13,45.25],anapa=[37.32,44.90],krasnodar=[38.98,45.04],rostov=[39.7015,47.2357],yalta=[34.16,44.5],moscow=[37.62,55.76];
const gate23=[38.5327744,45.171408],gate82=[37.8330177,45.1961096],gate103=[37.5878131,45.168457];
const BYPASS='М-4: Дальний западный обход Краснодара';
function production(ids,exact=true){
 const placeholder={candidate:ids.length>0,exact,tolls:{amount:0,weekdayAmount:0,weekendAmount:0,period:'понедельник–четверг',segments:[],confidence:exact?'matched':'partial'},m4PvpPreview:{confirmedPvps:ids}};
 const matrix=matrixM4Component(placeholder,date,6000);
 if(matrix)placeholder.tolls=matrix.tolls;
 return {p:placeholder,m:exact?matrix:null};
}

test('Anapa620 and Slavyansk415 use category I, never category-II833/555',()=>{
 const {p,m}=production([]);
 for(const [route,amount] of [[[anapa,gate82,gate23,krasnodar],620],[[slavyansk,gate23,krasnodar],415]]){
  assert.equal(compose(route,p,m,[],date).tolls.amount,amount);
  assert.equal(compose(route.toReversed(),p,m,[],date).tolls.amount,amount);
 }
 const registry=require('../experiments/nationwide-tolls/TARIFF_SELECTION_REGISTER.json');
 for(const row of [...registry.selected,...registry.provisional].filter(x=>x.road==='a289')){
  assert.equal(row.vehicleCategory,1);assert.ok(row.rub<=800,JSON.stringify(row));
 }
 assert.equal(priceA289Route([gate103,gate82,gate23],date).amount,800);
});

test('Slavyansk Rostov and Anapa Rostov compose the south M4 vector with actual A289 entry',()=>{
 const {p,m}=production(['m4-1223','m4-1184','m4-1093']);
 assert.equal(m.tolls.amount,850);
 for(const [route,amount] of [[[slavyansk,gate23,rostov],1265],[[anapa,gate82,gate23,rostov],1470]]){
  const result=compose(route,p,m,[],date);
  assert.equal(result.tolls.amount,amount);assert.equal(result.tolls.segments.filter(x=>x.startsWith('А-289:')).length,1);
  assert.equal(compose(route.toReversed(),p,m,[],date).tolls.amount,amount);
  assert.equal(compose(route,p,m,[BYPASS,BYPASS],date).tolls.amount,amount+410);
 }
});

test('full Crimea Moscow adds800 rather than replacing the full M4 price',()=>{
 const p={candidate:true,exact:true,tolls:{amount:5040,weekdayAmount:5040,weekendAmount:6090,period:'понедельник–четверг',segments:['М-4 Дон: полный коридор Москва—Краснодар'],confidence:'matched'},m4PvpPreview:{confirmedPvps:['m4-1223','m4-1184','m4-1093']}};
 const route=[yalta,gate103,gate82,gate23,moscow];
 assert.equal(compose(route,p,null,[],date).tolls.amount,5840);
 assert.equal(compose(route,p,null,[BYPASS],date).tolls.amount,6250);
});

test('missing/partial M4 cannot disappear behind a known A289 price',()=>{
 const {p,m}=production(['m4-1223'],false);
 const result=compose([slavyansk,gate23,rostov],p,m,[],date);
 assert.equal(result.tolls,null);assert.match(result.reason,/M-4 selected traversal/);
});

test('a mixed legacy M4 payload is rejected instead of charging A289 twice',()=>{
 const {p}=production(['m4-1223','m4-1184','m4-1093']);
 p.tolls.segments.push('А-289: old mixed charge');
 const result=compose([slavyansk,gate23,rostov],p,null,[],date);
 assert.equal(result.tolls,null);assert.match(result.reason,/already contains/);
});

test('confirmed M4 on a locally named trip is still included, diagnostic neighbors are not',()=>{
 const local=[slavyansk,gate23,krasnodar];
 const adjacent={...production([]).p,candidate:true,exact:false,tolls:null};
 assert.equal(compose(local,adjacent,null,[],date).tolls.amount,415);
 const {p,m}=production(['m4-1223']);
 assert.equal(compose(local,p,m,[],date).tolls.amount,415+m.tolls.amount);
});
