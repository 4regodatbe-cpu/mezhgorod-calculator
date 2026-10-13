import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import {load, root} from './helpers/load-ts.mjs';
const {crimeaM4Total}=load(resolve(root,'lib/v3-calculation/crimea-m4-total.ts'));
const date='2026-10-13T09:00:00+03:00';
const gate23=[38.5327744,45.171408],gate82=[37.8330177,45.1961096],gate103=[37.5878131,45.168457];
const geometry=[[34.16,44.5],gate103,gate82,gate23,[37.62,55.76]];
const production={exact:true,tolls:{amount:5040,weekdayAmount:5040,weekendAmount:6090,period:'понедельник–четверг',segments:['М-4 Дон: полный коридор Москва—Краснодар, tariff'],confidence:'matched'}};
test('Crimea Moscow adds A289 and separately detected bypass once',()=>{
 const result=crimeaM4Total(geometry,production,['М-4: Дальний западный обход Краснодара'],date);
 assert.equal(result.tolls.amount,6250);
 assert.equal(result.tolls.weekendAmount,7300);
 assert.equal(result.tolls.segments.length,3);
 assert.equal(crimeaM4Total([...geometry].reverse(),production,[],date).tolls.amount,5840);
});
test('incomplete A289 cannot expose an incomplete full-trip price',()=>{
 assert.equal(crimeaM4Total([geometry[0],gate82,gate23,geometry.at(-1)],production,[],date).tolls,null);
 assert.equal(crimeaM4Total([[38.98,45.04],[37.62,55.76]],production,[],date),null);
});
test('Anapa and Taman full M4 routes keep their A289 charge in both directions',()=>{
 for(const [route,expected] of [[[[37.32,44.90],gate82,gate23,[37.62,55.76]],5873],[[[36.72,45.21],gate103,gate82,gate23,[37.62,55.76]],5840]]){
  assert.equal(crimeaM4Total(route,production,[],date)?.tolls.amount,expected);
  assert.equal(crimeaM4Total([...route].reverse(),production,[],date)?.tolls.amount,expected);
 }
});
