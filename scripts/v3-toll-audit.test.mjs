import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import {load, root} from './helpers/load-ts.mjs';
const require=createRequire(import.meta.url);
const { a289ShortRoute } = load(resolve(root, 'lib/v3-calculation/a289-short-route.ts'));
const { quote } = require('../experiments/nationwide-tolls/engine/quote.cjs');
const { calculateRoutePricing } = load(resolve(root, 'lib/route-pricing-integration.ts'));
const date = '2026-10-13T09:00:00+03:00';
const krasnodar=[38.98,45.04],yalta=[34.16,44.5],anapa=[37.32,44.90],temryuk=[37.38,45.27];
const gate23=[38.5327744,45.171408],gate82=[37.8330177,45.1961096],gate103=[37.5878131,45.168457];
test('real physical gates and real matrix price Yalta and Anapa in both directions',()=>{
 for(const [route,amount] of [[[yalta,gate103,gate82,gate23,krasnodar],800],[[anapa,gate82,gate23,krasnodar],620]]){
  assert.equal(a289ShortRoute(route,[],date)?.tolls.amount,amount);
  assert.equal(a289ShortRoute([...route].reverse(),[],date)?.tolls.amount,amount);
 }
 assert.equal(a289ShortRoute([yalta,[36.6,45.3],krasnodar],[],date),null);
});
test('Temryuk estimate requires ordered two-frame evidence, not merely a city endpoint',()=>{
 assert.equal(a289ShortRoute([krasnodar,gate23,temryuk],[],date).tolls,null);
 assert.equal(a289ShortRoute([krasnodar,gate23,gate82,gate103,temryuk],[],date).tolls.amount,800);
 const result=a289ShortRoute([krasnodar,gate23,gate82,temryuk],[],date);
 assert.equal(result?.tolls.amount,620);
 assert.match(result.reason,/unverified/);
});
test('quote rejects impossible calendar dates and malformed components without throwing',()=>{
 const c={road:'a289',from:'Maryanskaya',to:'Slavyansk',profile:'allDays',routeId:'r',traversalId:'a',exactTraversal:true,profileResolved:true,localDate:'2026-02-30'};
 const request=components=>({routeId:'r',evidenceComplete:true,components});
 assert.equal(quote(request([c])).pricingStatus,'unknown');
 for(const bad of [null,{},false,{...c,road:42}])assert.equal(quote(request([bad])).pricingStatus,'unknown');
});
test('invalid zone lengths and empty legs cannot silently produce a zero or underpriced trip',()=>{
 const input={from:'A',to:'B',vehicle:'comfort'};
 assert.equal(calculateRoutePricing({...input,legs:[]}).totalPrice,null);
 for(const [ordinaryKm,specialKm] of [[NaN,100],[-100,200],[100,Infinity]]){
  assert.equal(calculateRoutePricing({...input,legs:[{from:'A',to:'B',distanceKm:100,territorySplit:{ordinaryKm,specialKm}}]}).totalPrice,null);
 }
});

test('A289 product cannot inherit changed legacy bypass money',()=>{
 const {M4}=load(resolve(root,'lib/toll-data/m4.ts'));
 const bypass=M4.find(row=>row.name==='М-4: Дальний западный обход Краснодара');
 const old=bypass.weekend;
 try {
  bypass.weekend=510;
  const result=a289ShortRoute([yalta,gate103,gate82,gate23,krasnodar],[bypass.name],'2026-10-17T09:00:00+03:00');
  assert.equal(result.tolls.weekdayAmount,800);
  assert.equal(result.tolls.weekendAmount,800);
  assert.equal(result.tolls.amount,800);
 } finally {bypass.weekend=old;}
});


test('A289 cannot normalize an impossible date or infer a missing timezone',()=>{
 const route=[yalta,gate103,gate82,gate23,krasnodar];
 for(const bad of ['2026-02-30T12:00:00+03:00','2026-10-14T24:00:00+03:00','2026-10-14T12:00:00','2026-10-14'])assert.equal(a289ShortRoute(route,[],bad).tolls,null);
});
