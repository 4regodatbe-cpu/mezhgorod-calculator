import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { NextRequest } from 'next/server.js';
import { POST } from '../../app/api/collect/route.ts';

const source = await readFile(new URL('./Code.gs', import.meta.url), 'utf8');
const headers = ['Дата и время (UTC)','Город / регион A','Город / регион B','Расстояние, км','Время, мин','Тариф, ₽/км','Стоимость, ₽','Версия','Вариант маршрута','Стандарт, ₽','Комфорт, ₽','Комфорт+, ₽','Минивэн, ₽','Платная дорога Пн–Чт, ₽','Платная дорога Пт–Вс, ₽'];
const body = {type:'route_v2',version:'3.0',fromRegion:'Краснодар, Краснодарский край',toRegion:'Ростов-на-Дону, Ростовская область',distanceKm:273.9,durationMin:244,routeType:'Платный',totals:{standard:10000,comfort:null,comfortPlus:12500,minivan:14000},tollPricingStatus:'unknown',tollWeekday:null,tollWeekend:null};
function setup(h=headers) {
 let row; const sheet={getRange:(r,c,n,w)=>{assert.deepEqual([r,c,n,w],[1,1,1,15]);return{getValues:()=>[h]};},appendRow:x=>{row=x}};
 const globals={console,ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({payload:JSON.parse(s),setMimeType(){return this}})}};
 vm.createContext(globals);vm.runInContext(source,globals);
 return {globals,book:{getSheetByName:n=>n==='Маршруты'?sheet:null},get row(){return row}};
}
test('existing A:O columns retained, absent fares stay blank, no historical data touched',()=>{
 const t=setup(), v=t.globals.saveRoute(t.book,{...body,type:'route',rate:36.51,total:10000});
 assert.equal(v.payload.saved,true);assert.equal(t.row.length,15);assert.equal(t.row[1],body.fromRegion);assert.equal(t.row[2],body.toRegion);assert.equal(t.row[4],244);assert.equal(t.row[7],'3.0');assert.equal(t.row[8],'Платный');assert.equal(t.row[10],'');assert.equal(t.row[13],'');
});
test('existing schema mismatch fails without writing',()=>{const changed=[...headers];changed[8]='Занято';const t=setup(changed);assert.equal(t.globals.saveRoute(t.book,{...body,type:'route'}).payload.error,'route_schema_mismatch');assert.equal(t.row,undefined)});
test('missing duration never becomes fabricated zero',()=>{const t=setup();assert.equal(t.globals.saveRoute(t.book,{...body,durationMin:null}).payload.error,'invalid_route_duration');assert.equal(t.row,undefined)});
test('formula-like route labels remain text',()=>{const t=setup();t.globals.saveRoute(t.book,{...body,fromRegion:'=malicious'});assert.equal(t.row[1],"'=malicious")});
test('API forwards duration and requires real saved acknowledgement without exposing toll data',async()=>{
 const original=globalThis.fetch; const ep=process.env.GOOGLE_SHEETS_WEBHOOK_URL, tok=process.env.GOOGLE_SHEETS_TOKEN;
 process.env.GOOGLE_SHEETS_WEBHOOK_URL='https://example.test';process.env.GOOGLE_SHEETS_TOKEN='test-token';let sent;
 try{globalThis.fetch=async(_url,opts)=>{sent=JSON.parse(opts.body);return Response.json({ok:true,saved:true})};let r=await POST(new NextRequest('http://local/api/collect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));assert.equal(r.status,200);assert.equal(sent.durationMin,244);assert.equal(sent.total,10000);assert.equal('tollWeekday' in sent,false);assert.equal('totals' in sent,false);assert.equal(sent.fromRegion,body.fromRegion);
 globalThis.fetch=async()=>Response.json({ok:true});r=await POST(new NextRequest('http://local/api/collect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));assert.equal(r.status,502);
 }finally{globalThis.fetch=original;if(ep===undefined)delete process.env.GOOGLE_SHEETS_WEBHOOK_URL;else process.env.GOOGLE_SHEETS_WEBHOOK_URL=ep;if(tok===undefined)delete process.env.GOOGLE_SHEETS_TOKEN;else process.env.GOOGLE_SHEETS_TOKEN=tok;}
});

test('V3 records a calculated trip even if one fare needs review',async()=>{
 const ts=await import('typescript');const code=await readFile(new URL('../../app/v3/components/use-v3-calculation.ts',import.meta.url),'utf8');
 const js=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod={exports:{}};const captured=[];const react={useRef:current=>({current}),useState:x=>[x,()=>{}],useEffect:()=>{}};
 const fare={totalPrice:100,requiresSplit:false};const trip={meters:10000,seconds:600,tolls:{pricingStatus:'free'},pricingByVehicle:{standard:fare,comfort:{totalPrice:null,requiresSplit:true},comfort_plus:fare,minivan:fare}};
 const response={legs:[{from:'Краснодар',to:'Ростов-на-Дону',fast:trip,free:null}]};
 const fakeFetch=async(url,options)=>{if(url==='/api/collect'){captured.push(JSON.parse(options.body));return Response.json({ok:true})}return Response.json(response)};
 const stub=(name)=>name==='react'?react:name==='./response-validation'?{validV3Response:()=>true}:name.endsWith('route-utils')?{pickOptimal:x=>x}:{};
 vm.runInNewContext(js,{module:mod,exports:mod.exports,require:stub,fetch:fakeFetch,AbortController,setTimeout,clearTimeout});
 const h=mod.exports.useV3Calculation({from:{label:'Краснодар'},to:{label:'Ростов-на-Дону'},rates:{},specialRates:{},requestMode:()=>({mode:'standard'}),onServerMode:()=>{},multiplier:1});
 await h.calculate();assert.equal(captured.length,1);assert.equal(captured[0].totals.comfort,null);assert.equal(captured[0].totals.standard,100);assert.equal(captured[0].durationMin,10);
});

test('legacy route forwards numeric duration while feedback keeps its prior success contract',async()=>{
 const original=globalThis.fetch; const ep=process.env.GOOGLE_SHEETS_WEBHOOK_URL, tok=process.env.GOOGLE_SHEETS_TOKEN;
 process.env.GOOGLE_SHEETS_WEBHOOK_URL='https://example.test';process.env.GOOGLE_SHEETS_TOKEN='test-token';let sent;
 try{globalThis.fetch=async(_u,o)=>{sent=JSON.parse(o.body);return Response.json({ok:true,saved:true})};
 const req=(obj)=>new NextRequest('http://local/api/collect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(obj)});
 let r=await POST(req({type:'route',fromRegion:'Краснодар',toRegion:'Ростов-на-Дону',distanceKm:10,durationMin:15,rate:30,total:300}));assert.equal(r.status,200);assert.equal(sent.durationMin,15);assert.equal(sent.total,300);
 globalThis.fetch=async()=>Response.json({ok:true});r=await POST(req({type:'feedback',category:'Идея',message:'Это проверочное предложение'}));assert.equal(r.status,200);
 }finally{globalThis.fetch=original;if(ep===undefined)delete process.env.GOOGLE_SHEETS_WEBHOOK_URL;else process.env.GOOGLE_SHEETS_WEBHOOK_URL=ep;if(tok===undefined)delete process.env.GOOGLE_SHEETS_TOKEN;else process.env.GOOGLE_SHEETS_TOKEN=tok;}
});
