import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {existsSync,readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import vm from 'node:vm';

const require=createRequire(import.meta.url),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=resolve(dirname(new URL(import.meta.url).pathname),'..'),cache=new Map();
function load(file){if(!existsSync(file))file=['.ts','.tsx'].map(s=>file+s).find(existsSync);if(cache.has(file))return cache.get(file).exports;const mod={exports:{}};cache.set(file,mod);const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{module:mod,exports:mod.exports,require:name=>name.startsWith('@/')?load(resolve(root,name.slice(2))):name.startsWith('.')?load(resolve(dirname(file),name)):require(name)});return mod.exports;}
const {RouteCard}=load(resolve(root,'app/v2/components/route-card.tsx'));

function render(manualToll=''){
 const fare={totalPrice:100,requiresSplit:false,reviewRequired:false,dualTariff:false,pricingSegments:[]};
 const toll={amount:null,weekdayAmount:null,weekendAmount:null,period:'unknown',segments:[],pricingStatus:'unknown',confidence:'none'};
 const trip={meters:10000,seconds:1000,tolls:toll,pricingByVehicle:Object.fromEntries(['standard','comfort','comfort_plus','minivan'].map(k=>[k,fare]))};
 return renderToStaticMarkup(React.createElement(RouteCard,{title:'Маршрут',accent:'blue',trip,toll,tollPeriod:'actual',onTollPeriodChange:()=>{},manualToll,onManualToll:()=>{},onCopy:()=>{},copied:false}));
}

test('unknown V2 amount renders base-only total without zero or complete-total claim',()=>{
 const html=render();
 assert.match(html,/Стоимость платных дорог неизвестна/);
 assert.match(html,/Итого без дорог<\/span><strong[^>]*>100/);
 assert.doesNotMatch(html,/Итого за поездку|=\s*0(?:[,.]00)?\s*₽/);
});

test('manual V2 amount computes a labeled total without claiming the total is uncalculated',()=>{
 const html=render('3050');
 assert.match(html,/Указана вручную/);
 assert.match(html,/Итого за поездку/);
 assert.match(html,/3[\s\u00a0\u202f]?150/);
 assert.doesNotMatch(html,/полная сумма поездки не рассчитана/);
});
