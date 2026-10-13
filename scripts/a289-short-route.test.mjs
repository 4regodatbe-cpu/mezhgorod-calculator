import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript');
const source=readFileSync(new URL('../lib/v3-calculation/a289-short-route.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let frames=[];
const testModule={exports:{}};
vm.runInNewContext(compiled,{module:testModule,exports:testModule.exports,require:name=>{
  if(name==='@/lib/toll-engine/a289-engine')return {priceA289Route:()=>({crossedFrames:frames,period:'понедельник–четверг'})};
  if(name==='@/lib/special-territory-policy')return {inCrimea:({lng,lat})=>lng<35&&lat<46};
  if(name==='@/lib/toll-data/m4')return {M4:[{name:'М-4: Дальний западный обход Краснодара',weekday:410,weekend:410}]};
  if(name==='@/experiments/nationwide-tolls/engine/a289-route-adapter.mjs')return require('../experiments/nationwide-tolls/engine/a289-route-adapter.mjs');
  throw Error(name);
}});
const quote=testModule.exports.a289ShortRoute,date='2026-10-13T07:00:00+03:00';
const krasnodar=[38.98,45.04],yalta=[34.16,44.5],anapa=[37.32,44.90];
test('Yalta and Anapa to Krasnodar return selected A-289 estimates in both directions',()=>{
  frames=['103','82','23'];
  assert.equal(quote([yalta,krasnodar],[],date).tolls.amount,800);
  frames=['23','82','103'];
  assert.equal(quote([krasnodar,yalta],[],date).tolls.amount,800);
  frames=['82','23'];
  assert.equal(quote([anapa,krasnodar],[],date).tolls.amount,833);
  frames=['23','82'];
  assert.equal(quote([krasnodar,anapa],[],date).tolls.amount,833);
});
test('bypass is added once; missing or different exit evidence does not invent fare',()=>{
  frames=['103','82','23'];
  assert.equal(quote([yalta,krasnodar],['М-4: Дальний западный обход Краснодара'],date).tolls.amount,1210);
  frames=['82'];
  assert.equal(quote([anapa,krasnodar],[],date).tolls,null);
  frames=[];
  assert.equal(quote([yalta,krasnodar],[],date),null);
});
