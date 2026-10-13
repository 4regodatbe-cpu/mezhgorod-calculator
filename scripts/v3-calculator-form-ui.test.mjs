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
