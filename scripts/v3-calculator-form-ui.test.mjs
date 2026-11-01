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
const {DonationCard}=load(resolve(root,'app/v2/components/donation-card.tsx'));
const defaults={standard:25,comfort:30,comfortPlus:35,minivan:50};
function render(from,to,loading=false,releaseCopy=true,mode='standard',hasResult=false){return renderToStaticMarkup(React.createElement(CalculatorForm,{mode,onModeChange:()=>{},onResetResult:()=>{},from,onFromChange:()=>{},to,onToChange:()=>{},onSwap:()=>{},rates:defaults,onRatesChange:()=>{},specialRates:defaults,onSpecialRatesChange:()=>{},urgent:false,onUrgentChange:()=>{},urgentPercent:20,onUrgentPercentChange:()=>{},loading,hasResult,error:'',onCalculate:()=>{},deepTollDiagnostics:false,onDeepTollDiagnosticsChange:()=>{},releaseCopy}));}
test('both loading indicators use the approved one-minute message',()=>{
 const html=render({label:'Москва'},{label:'Казань'},true);
 assert.equal(html.split('Подождите минуту, пока загружается маршрут.').length-1,2);
 assert.doesNotMatch(html,/Подождите пару минут/);
});
test('V2 keeps its previous loading text',()=>{
 const html=render({label:'Москва'},{label:'Казань'},true,false);
 assert.equal(html.split('Подождите пару минут, пока загружается маршрут.').length-1,2);
});
test('V1 Release hides the optional PVP switch while V2 retains it',()=>{
 assert.doesNotMatch(render({label:''},{label:''}),/Углублённая проверка ПВП/);
 assert.match(render({label:''},{label:''},false,false),/Углублённая проверка ПВП/);
});
test('V1 Release keeps A/B inside fields and accessible names, V2 keeps outer labels',()=>{
 const current=render({label:''},{label:''});
 const legacy=render({label:''},{label:''},false,false);
 assert.equal((current.match(/class="sr-only">Точка [AB]/g)||[]).length,2);
 assert.match(current,/aria-label="Откуда"/);
 assert.match(current,/aria-label="Куда"/);
 assert.equal((current.match(/pointer-events-none absolute left-10 top-2\.5/g)||[]).length,2);
 assert.match(current,/aria-hidden="true"[^>]*>А<\/span>/);
 assert.match(current,/aria-hidden="true"[^>]*>Б<\/span>/);
 assert.equal((legacy.match(/mb-1\.5 block text-xs font-bold uppercase/g)||[]).length,2);
});
test('V1 dual form keeps the zone heading but moves explanation out of the form',()=>{
 const current=render({label:''},{label:''},false,true,'dual');
 const legacy=render({label:''},{label:''},false,false,'dual');
 assert.match(current,/>Особые тарифные зоны<\/p>/);
 assert.doesNotMatch(current,/Пробег внутри и вне зон определяется/);
 assert.match(legacy,/Пробег внутри и вне зон определяется/);
});
test('V1 rate cards are compact and contrasted while touch targets stay 44px',()=>{
 const current=render({label:''},{label:''},false,true,'dual');
 const legacy=render({label:''},{label:''},false,false,'dual');
 assert.equal((current.match(/border-brand-border\/70 p-1\.5/g)||[]).length,8);
 assert.match(current,/grid h-11 w-11 min-h-11 min-w-11/);
 assert.equal((legacy.match(/border-brand-border\/25 p-1\.5/g)||[]).length,8);
});
test('V1 first-screen vertical spacing is compact without shrinking text or V2 spacing',()=>{
 const current=render({label:''},{label:''});
 const legacy=render({label:''},{label:''},false,false);
 const page=readFileSync(resolve(root,'app/v3/page.tsx'),'utf8');
 assert.match(page,/header className="mb-2 grid grid-cols-\[1fr_auto_1fr\]/);
 assert.match(current,/class="mb-2\.5 grid grid-cols-2 rounded-2xl/);
 assert.match(current,/class="mt-3 pt-3 border-t/);
 assert.match(current,/class="mt-2 p-2\.5 flex min-w-0/);
 assert.match(legacy,/class="mb-4 grid grid-cols-2 rounded-2xl/);
 assert.match(legacy,/class="mt-4 pt-4 border-t/);
 assert.match(legacy,/class="mt-3 p-3 flex min-w-0/);
 assert.match(current,/grid h-11 w-11 min-h-11 min-w-11/);
});
test('V1 dual form keeps eight tariffs, urgent switch and one mobile calculate action after a result',()=>{
 const current=render({label:'Москва'},{label:'Казань'},false,true,'dual',true);
 const legacy=render({label:'Москва'},{label:'Казань'},false,false,'dual',true);
 assert.equal((current.match(/aria-label="Цена за км:/g)||[]).length,8);
 assert.match(current,/aria-label="Срочная поездка"/);
 assert.equal((current.match(/>Рассчитать поездку</g)||[]).length,2);
 assert.equal((legacy.match(/>Рассчитать поездку</g)||[]).length,1);
});
test('V1 page scrolls only on a transition into dual mode',()=>{
 const page=readFileSync(resolve(root,'app/v3/page.tsx'),'utf8');
 assert.match(page,/previousModeRef\.current = mode/);
 assert.match(page,/if \(wasDual \|\| mode !== "dual"\) return/);
 assert.match(page,/requestAnimationFrame\(\(\) => \{/);
 assert.match(page,/formRef\.current\?\.scrollIntoView/);
});
test('project support card keeps the existing destination and approved copy',()=>{
 const html=renderToStaticMarkup(React.createElement(DonationCard,{releaseCopy:true}));
 assert.match(html,/Поддержать проект «Из А в Б»/);
 assert.match(html,/Калькулятор развивается и остаётся бесплатным/);
 assert.match(html,/href="https:\/\/t\.tb\.ru\/pm_short\/4YCKLToUeM6"/);
 assert.doesNotMatch(html,/Сбор на API Яндекс Карт/);
});
test('V2 keeps its previous support card copy',()=>{
 const html=renderToStaticMarkup(React.createElement(DonationCard));
 assert.match(html,/Сбор на API Яндекс Карт/);
 assert.match(html,/Поддержать подключение/);
});
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
