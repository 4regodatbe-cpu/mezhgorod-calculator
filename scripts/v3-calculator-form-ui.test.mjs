import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import vm from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=resolve(dirname(new URL(import.meta.url).pathname),'..'),cache=new Map();
function load(file){if(!existsSync(file))file=['.ts','.tsx'].map(s=>file+s).find(existsSync);if(cache.has(file))return cache.get(file).exports;const mod={exports:{}};cache.set(file,mod);const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{module:mod,exports:mod.exports,require:name=>name.startsWith('.')?load(resolve(dirname(file),name)):require(name)});return mod.exports;}
const {CalculatorForm}=load(resolve(root,'app/v2/components/calculator-form.tsx'));
const defaults={standard:25,comfort:30,comfortPlus:35,minivan:50};
function render(from,to){return renderToStaticMarkup(React.createElement(CalculatorForm,{mode:'standard',onModeChange:()=>{},onResetResult:()=>{},from,onFromChange:()=>{},to,onToChange:()=>{},onSwap:()=>{},rates:defaults,onRatesChange:()=>{},specialRates:defaults,onSpecialRatesChange:()=>{},urgent:false,onUrgentChange:()=>{},urgentPercent:20,onUrgentPercentChange:()=>{},loading:false,hasResult:false,error:'',onCalculate:()=>{},deepTollDiagnostics:false,onDeepTollDiagnosticsChange:()=>{}}));}
test('both calculate buttons wait until both addresses are entered, and swap control is rendered',()=>{
 const incomplete=render({label:'Москва'}, {label:'   '});
 assert.equal((incomplete.match(/disabled=""/g)||[]).length>=2,true);
 assert.match(incomplete,/Поменять точки A и B местами/);
 const complete=render({label:'Москва'}, {label:'Казань'});
 assert.equal((complete.match(/disabled=""/g)||[]).length,0);
});
test('rubles per kilometre amount and unit are enlarged and centered',()=>{
 const html=render({label:''},{label:''});
 assert.match(html,/justify-center gap-1/);
 assert.match(html,/text-\[22px\]/);
 assert.match(html,/text-\[17px\] font-extrabold text-brand-action/);
});

// SSR contract only: browser event handlers/effects are intentionally not exercised here.
const citySnapshot=JSON.parse(readFileSync(resolve(root,'data/address-city-snapshot.json'),'utf8'));
const fallbackPlace={...citySnapshot.records[0].suggestion,addressSource:'reviewed_city_snapshot'};
const ordinaryPlace=citySnapshot.records[2].suggestion;
const notice='Резервный поиск: только сохранённые города.';
function assertSnapshotCredit(html,count){
 assert.equal(html.split(notice).length-1,count);
 assert.equal((html.match(/href="https:\/\/www\.openstreetmap\.org\/copyright"/g)||[]).length,count);
 if(count) assert.match(html,/© OpenStreetMap contributors · ODbL/);
}
test('selected snapshot city renders limited coverage and licensed credit in either address field',()=>{
 const before=render(fallbackPlace,ordinaryPlace);
 const after=render(ordinaryPlace,fallbackPlace);
 assertSnapshotCredit(before,1);
 assertSnapshotCredit(after,1);
 // Swap is represented by parent props; this does not claim that clicking was tested.
 assert.ok(before.indexOf(notice)<before.indexOf('Точка B'));
 assert.ok(after.indexOf(notice)>after.indexOf('Точка B'));
});
test('two selected snapshot cities retain a separate notice and credit for each field',()=>{
 const second={...citySnapshot.records[1].suggestion,addressSource:'reviewed_city_snapshot'};
 assertSnapshotCredit(render(fallbackPlace,second),2);
});
test('cleared, edited and ordinary places do not display a stale snapshot notice',()=>{
 for(const replacement of [{label:''},{label:'Новое название'},ordinaryPlace]){
  assertSnapshotCredit(render(replacement,ordinaryPlace),0);
 }
});
