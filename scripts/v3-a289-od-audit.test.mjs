import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {load,root} from './helpers/load-ts.mjs';
const {priceA289Route}=load(resolve(root,'lib/toll-engine/a289-engine.ts'));
const {a289ShortRoute}=load(resolve(root,'lib/v3-calculation/a289-short-route.ts'));
const date='2026-10-13T09:00:00+03:00';
const krasnodar=[38.98,45.04],slavyansk=[38.13,45.25],anapa=[37.32,44.90],temryuk=[37.38,45.27],taman=[36.72,45.21];
const gate23=[38.5327744,45.171408],gate82=[37.8330177,45.1961096],gate103=[37.5878131,45.168457];

test('stored intermediate A289 pairs reach V3 in both directions',()=>{
 for(const [route,amount] of [
  [[slavyansk,gate23,krasnodar],555],
  [[slavyansk,gate82,anapa],278],
  [[slavyansk,gate82,gate103,temryuk],548],
  [[anapa,gate103,temryuk],270],
 ]){
  for(const geometry of [route,route.toReversed()]){
   const result=a289ShortRoute(geometry,[],date);
   assert.equal(result?.tolls?.amount,amount,JSON.stringify({geometry,result}));
   assert.match(result.tolls.segments[0],/Стоимость не подтверждена/);
  }
 }
});

test('physical camera order is independent of shape sampling and reverses with direction',()=>{
 const midpoint=[(gate82[0]+gate23[0])/2,(gate82[1]+gate23[1])/2];
 for(const geometry of [[gate82,gate23],[gate82,midpoint,gate23]]){
  const forward=priceA289Route(geometry,date),reverse=priceA289Route(geometry.toReversed(),date);
  assert.deepEqual(Array.from(forward.crossedFrames),['82','23']);
  assert.deepEqual(Array.from(reverse.crossedFrames),['23','82']);
  assert.equal(forward.amount,833);assert.equal(reverse.amount,833);
 }
});

test('missing intermediate price blocks fallback rather than subtracting unrelated OD tariffs',()=>{
 const result=a289ShortRoute([slavyansk,gate82,gate103,taman],[],date);
 assert.equal(result?.tolls,null);assert.match(result.reason,/no applicable/);
});

test('camera return passage cannot be charged as a single ordinary OD trip',()=>{
 const route=[slavyansk,gate82,gate103,gate82,anapa];
 const physical=priceA289Route(route,date);
 assert.ok(physical.repeatedFrames.includes('82'));
 const result=a289ShortRoute(route,[],date);
 assert.equal(result.tolls,null);assert.match(result.reason,/repeated passage/);
});

test('neighboring shape points at a single frame are one passage',()=>{
 const near=[gate82[0]+0.00005,gate82[1]];
 const physical=priceA289Route([slavyansk,near,gate82,anapa],date);
 assert.deepEqual(Array.from(physical.repeatedFrames),[]);
 assert.equal(a289ShortRoute([slavyansk,near,gate82,anapa],[],date).tolls.amount,278);
});
