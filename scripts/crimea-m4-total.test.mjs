import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';

const require=createRequire(import.meta.url);
const ts=require('typescript');
const source=readFileSync(new URL('../lib/v3-calculation/crimea-m4-total.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let frames=['23','82','103'];
const module={exports:{}};
vm.runInNewContext(compiled,{module,exports:module.exports,require:(name)=>{
  if(name==='@/lib/toll-engine/a289-engine')return {priceA289Route:()=>({crossedFrames:frames})};
  if(name==='@/lib/special-territory-policy')return {inCrimea:({lng})=>lng<35};
  if(name==='@/lib/toll-data/m4')return {M4:[{name:'М-4: Дальний западный обход Краснодара',weekday:410,weekend:410}]};
  if(name==='@/experiments/nationwide-tolls/engine/a289-route-adapter.mjs')return {quoteA289SelectedRoute:()=>({rub:800})};
  throw new Error(`Unexpected import: ${name}`);
}});
const {crimeaM4Total}=module.exports;
const geometry=[[34.16,44.5],[37.62,55.76]];
const production={exact:true,tolls:{amount:5040,weekdayAmount:5040,weekendAmount:6090,period:'понедельник–четверг',segments:['М-4 Дон: полный коридор Москва—Краснодар, tariff'],confidence:'matched'}};

test('Crimea Moscow adds the full A-289 vector and separately crossed bypass once',()=>{
  frames=['23','82','103'];
  const result=crimeaM4Total(geometry,production,['М-4: Дальний западный обход Краснодара']);
  assert.equal(result.tolls.amount,6250);
  assert.equal(result.tolls.weekendAmount,7300);
  assert.equal(result.tolls.segments.length,3);
  assert.equal(crimeaM4Total([...geometry].reverse(),production,[]).tolls.amount,5840);
});

test('incomplete A-289 evidence cannot expose 5040 as a full Crimea toll',()=>{
  frames=['23','82'];
  assert.equal(crimeaM4Total(geometry,production,[]).tolls,null);
  frames=['23','82','103'];
  assert.equal(crimeaM4Total([[38.98,45.04],[37.62,55.76]],production,[]),null);
});
