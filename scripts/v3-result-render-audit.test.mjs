import test from 'node:test';import assert from 'node:assert/strict';
import {createRequire} from 'node:module';import {readFileSync,existsSync} from 'node:fs';import {resolve,dirname} from 'node:path';import vm from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=resolve(dirname(new URL(import.meta.url).pathname),'..'),cache=new Map();
function load(file){if(!existsSync(file)){file=['.ts','.tsx'].map(s=>file+s).find(existsSync);}if(cache.has(file))return cache.get(file).exports;
 const mod={exports:{}};cache.set(file,mod);const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{module:mod,exports:mod.exports,require:name=>name.startsWith('.')?load(resolve(dirname(file),name)):require(name)});return mod.exports;}
const {ResultPanels}=load(resolve(root,'app/v2/components/result-panels.tsx'));
test('actual fastest result render preserves night price and warning, without weekday selector',()=>{
 const fare={totalPrice:100,requiresSplit:false,reviewRequired:false,dualTariff:false,pricingSegments:[]};
 const toll={amount:880,weekdayAmount:1130,weekendAmount:1650,period:'ночной проезд',segments:[],pricingStatus:'priced',confidence:'matched',priceConfirmation:'unconfirmed'};
 const fast={meters:10000,seconds:1000,tolls:toll,pricingByVehicle:Object.fromEntries(['standard','comfort','comfort_plus','minivan'].map(k=>[k,fare]))};
 const leg={from:'A',to:'B',fast,free:null};
 const html=renderToStaticMarkup(React.createElement(ResultPanels,{result:{legs:[leg]},fastestOnly:true,tollPeriod:'weekday',onTollPeriodChange:()=>{},copyStandard:async()=>{},copiedKey:'',manualToll:'',onManualToll:()=>{},standardHasTolls:true,standardOptimal:null}));
 assert.match(html,/880/);assert.match(html,/980/);assert.match(html,/Стоимость не подтверждена/);assert.match(html,/role="note"/);
 assert.doesNotMatch(html,/1130|1650|Пн–Чт|Пт–Вс/);
});
