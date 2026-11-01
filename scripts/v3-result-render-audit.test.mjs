import test from 'node:test';import assert from 'node:assert/strict';
import {createRequire} from 'node:module';import {readFileSync,existsSync} from 'node:fs';import {resolve,dirname} from 'node:path';import vm from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=resolve(dirname(new URL(import.meta.url).pathname),'..'),cache=new Map();
function load(file){if(!existsSync(file)){file=['.ts','.tsx'].map(s=>file+s).find(existsSync);}if(cache.has(file))return cache.get(file).exports;
 const mod={exports:{}};cache.set(file,mod);const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{module:mod,exports:mod.exports,require:name=>name.startsWith('@/')?load(resolve(root,name.slice(2))):name.startsWith('.')?load(resolve(dirname(file),name)):require(name)});return mod.exports;}
const {ResultPanels}=load(resolve(root,'app/v2/components/result-panels.tsx'));
test('V1 Release page renders the reference notice only after a result',()=>{
 const page=readFileSync(resolve(root,'app/v3/page.tsx'),'utf8');
 assert.match(page,/\{result && <p role="note"[^>]*>Расчёт носит справочный характер\. Фактический маршрут, время в пути и стоимость проезда по платным дорогам могут отличаться от указанных\.<\/p>\}/);
});
test('V1 Release keeps GeoNames attribution without technical corpus copy',()=>{
 const page=readFileSync(resolve(root,'app/v3/page.tsx'),'utf8');
 assert.match(page,/https:\/\/www\.geonames\.org\//);
 assert.match(page,/https:\/\/creativecommons\.org\/licenses\/by\/4\.0\//);
 assert.doesNotMatch(page,/Локальный справочник населённых пунктов|Снимок 24\.10\.2026/);
 assert.doesNotMatch(page,/Расчёт справочный\. Фактический маршрут и тарифы операторов дорог могут измениться\./);
 assert.match(page,/V1\.01/);
 assert.doesNotMatch(page,/>V2 · старый алгоритм|>Платные дороги России/);
});
test('special-zone explanation follows only a completed dual result',()=>{
 const page=readFileSync(resolve(root,'app/v3/page.tsx'),'utf8');
 assert.match(page,/\{result && mode === "dual" && <p[^>]*>Границы участков с обычной и специальной тарификацией определяются автоматически по построенному маршруту\.<\/p>\}/);
});
test('V1 logo container has no opaque fill and increases dark contrast',()=>{
 const page=readFileSync(resolve(root,'app/v3/page.tsx'),'utf8');
 assert.match(page,/src="\/izavb-approved-logo\.svg"[^>]*className="dark:invert"/);
 assert.doesNotMatch(page,/bg-\[#F7F4EE\]/);
});
test('actual fastest result render preserves night price without confirmation notice',()=>{
 const fare={totalPrice:100,requiresSplit:false,reviewRequired:false,dualTariff:false,pricingSegments:[]};
 const toll={amount:880,weekdayAmount:1130,weekendAmount:1650,period:'ночной проезд',segments:[],pricingStatus:'priced',confidence:'matched'};
 const fast={meters:10000,seconds:1000,tolls:toll,quality:{status:'single',message:'Выбран маршрут с минимальным временем'},pricingByVehicle:Object.fromEntries(['standard','comfort','comfort_plus','minivan'].map(k=>[k,fare]))};
 const leg={from:'A',to:'B',fast,free:null};
 const html=renderToStaticMarkup(React.createElement(ResultPanels,{result:{legs:[leg]},fastestOnly:true,tollPeriod:'weekday',onTollPeriodChange:()=>{},copyStandard:async()=>{},copiedKey:'',manualToll:'',onManualToll:()=>{},standardHasTolls:true,standardOptimal:null}));
 assert.match(html,/Выбран маршрут с минимальным временем/);
 assert.equal((html.match(/Выбран маршрут с минимальным временем/g)||[]).length,1);
 assert.doesNotMatch(html,/Выбран маршрут с минимальным временем в пути/);
 assert.match(html,/mt-2\.5 grid min-w-0 gap-1\.5 grid-cols-1/);
 assert.doesNotMatch(html,/>Самый быстрый маршрут</);
 assert.match(html,/880/);assert.match(html,/980/);assert.doesNotMatch(html,/Стоимость не подтверждена|квитанц|оператором/);
 assert.doesNotMatch(html,/1130|1650|Пн–Чт|Пт–Вс/);
});

test('V3 shared fastest-route UI keeps unknown tolls base-only and never presents zero as total',()=>{
 const fare={totalPrice:100,requiresSplit:false,reviewRequired:false,dualTariff:false,pricingSegments:[]};
 const toll={amount:null,weekdayAmount:null,weekendAmount:null,period:'unknown',segments:[],pricingStatus:'unknown',confidence:'none'};
 const fast={meters:10000,seconds:1000,tolls: toll,pricingByVehicle:Object.fromEntries(['standard','comfort','comfort_plus','minivan'].map(k=>[k,fare]))};
 const leg={from:'A',to:'B',fast,free:null};
 const html=renderToStaticMarkup(React.createElement(ResultPanels,{result:{legs:[leg]},fastestOnly:true,tollPeriod:'actual',onTollPeriodChange:()=>{},copyStandard:async()=>{},copiedKey:'',manualToll:'',onManualToll:()=>{},standardHasTolls:true,standardOptimal:null}));
 assert.match(html,/Стоимость платных дорог неизвестна/);assert.match(html,/Итого без дорог/);
 assert.match(html,/mt-2\.5 grid min-w-0 gap-1\.5 grid-cols-2/);
 assert.doesNotMatch(html,/Итого за поездку|=\s*0(?:[,.]00)?\s*₽/);
});


test('fastest V3 keeps dual fare visible and permits an explicitly manual road total',()=>{
 const fare={totalPrice:55299,requiresSplit:false,reviewRequired:false,dualTariff:true,pricingSegments:[
  {tariffType:'normal',amount:26886},{tariffType:'special',amount:28413}]};
 const toll={amount:null,weekdayAmount:null,weekendAmount:null,period:'unknown',segments:[],pricingStatus:'unknown',confidence:'none'};
 const fast={meters:1182425,seconds:61701,tolls:toll,pricingByVehicle:Object.fromEntries(['standard','comfort','comfort_plus','minivan'].map(k=>[k,fare]))};
 const leg={from:'Волноваха',to:'Москва',fast,free:null};
 const props={result:{legs:[leg]},fastestOnly:true,tollPeriod:'actual',onTollPeriodChange:()=>{},copyStandard:async()=>{},copiedKey:'',manualToll:'',onManualToll:()=>{},standardHasTolls:true,standardOptimal:null};
 const html=renderToStaticMarkup(React.createElement(ResultPanels,props));
 assert.match(html,/ring-2 ring-brand-action\/40/);
 assert.match(html,/border-brand-border\/70 bg-brand-surface/);
 assert.match(html,/55[\s\u00a0\u202f]?299/);assert.match(html,/Итого без дорог/);
 assert.match(html,/Стоимость платных дорог вручную/);assert.doesNotMatch(html,/Не рассчитано/);
 let args;const manualProps={...props,manualToll:'3050',copyStandard:(...values)=>{args=values;}};
 const element=ResultPanels(manualProps);element.props.children.props.onCopy();
 assert.equal(args.at(-1),'3050');
 const manual=renderToStaticMarkup(React.createElement(ResultPanels,manualProps));
 assert.match(manual,/58[\s\u00a0\u202f]?349/);assert.match(manual,/Указана вручную/);
});
