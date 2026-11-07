// Real local built React UI, controlled address/calculation responses. No live-provider claims.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {confirmV3ClientReady} from './v3-live-browser-readiness.mjs';
const base=new URL(process.env.LOCAL_V3_URL??'http://127.0.0.1:3208/v3');
assert.ok(['127.0.0.1','localhost'].includes(base.hostname),'Local acceptance must never target Production');
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const output=process.env.LOCAL_V3_OUTPUT??'/tmp/stage-ad-browser';mkdirSync(output,{recursive:true});
const report={kind:'LOCAL_BUILT_UI_CONTROLLED_API',sourceSha:process.env.EXPECTED_COMMIT,results:[],liveProviders:'NOT_RUN'};
const versionResponse=await fetch(new URL('/api/version',base));
assert.equal(versionResponse.status,200);
report.version=await versionResponse.json();
assert.ok(report.sourceSha,'Expected source commit is required');
assert.equal(report.version.commit,report.sourceSha);
const save=()=>writeFileSync(`${output}/results.json`,JSON.stringify(report,null,2));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
function result(body){
 const fare={totalPrice:1700,requiresSplit:false,reviewRequired:false,dualTariff:false,pricingSegments:[{distanceKm:170,ratePerKm:10,amount:1700,tariffType:'normal',from:body.from.label,to:body.to.label}]};
 return {legs:[{from:body.from.label,to:body.to.label,fast:{meters:170000,seconds:90000,quality:{status:'single',providers:['CONTROLLED'],message:'Выбран маршрут с минимальным временем'},tolls:{pricingStatus:'unknown',amount:null,weekdayAmount:null,weekendAmount:null,period:'дата расчёта',confidence:'none',segments:[]},pricingByVehicle:Object.fromEntries(['standard','comfort','comfort_plus','minivan'].map(k=>[k,fare]))},free:null}]};
}
try{for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile,locale:'ru-RU'});
 const page=await context.newPage();let next='success',release,delayedStarted;const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.origin!==base.origin||url.pathname==='/api/collect')return route.abort();
  if(url.pathname==='/r'){
   const query=req.postDataJSON().query;
   return route.fulfill({json:{items:[{id:`controlled-${query}`,title:query,label:query,position:{lat:45.03547,lng:38.975313}}]}});
  }
  if(url.pathname==='/api/v3/calculate'){
   const mode=next;next='success';
   if(mode==='error')return route.fulfill({status:502,json:{error:'Сервис маршрутов временно недоступен. Попробуйте позже.'}});
   if(mode==='delay'){delayedStarted?.();await new Promise(resolve=>{release=resolve;});}
   try{return await route.fulfill({json:result(req.postDataJSON())});}catch(e){if(mode!=='delay')throw e;return;}
  }
  return route.continue();
 });
 const a=page.getByRole('textbox',{name:'Откуда',exact:true}),b=page.getByRole('textbox',{name:'Куда',exact:true});
 const clearA=()=>page.getByRole('button',{name:'Очистить поле «Точка A»'}).click();
 const clearB=()=>page.getByRole('button',{name:'Очистить поле «Точка B»'}).click();
 const calculate=()=>page.getByRole('button',{name:'Рассчитать поездку',exact:true}).filter({visible:true}).click();
 const choose=async(field,query)=>{await field.fill(query);await page.getByRole('button',{name:new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).filter({has:page.locator('strong')}).click();assert.equal(await field.inputValue(),query);};
 const card=page.locator('article').filter({has:page.getByRole('heading',{level:3,name:'Выбран маршрут с минимальным временем'})});
 const step=async(name,run)=>{try{await run();report.results.push({viewport:mobile?'mobile':'desktop',name,status:'PASS'});}catch(error){report.results.push({viewport:mobile?'mobile':'desktop',name,status:'FAIL',error:error.message});await page.screenshot({path:`${output}/${mobile?'mobile':'desktop'}-failure.png`,fullPage:true});throw error;}finally{save();}};
 try{
  await page.goto(base.href);await confirmV3ClientReady(page);
  await step('01 empty calculate disabled',async()=>assert.ok(await page.getByRole('button',{name:'Рассчитать поездку',exact:true}).filter({visible:true}).isDisabled()));
  await step('02 select A',()=>choose(a,'Краснодар'));
  await step('03 select B',()=>choose(b,'Москва'));
  await step('04 street refinement controlled',()=>choose(a,'Краснодар, Красная улица'));
  await step('05 clear A preserves B',async()=>{await clearA();assert.equal(await a.inputValue(),'');assert.equal(await b.inputValue(),'Москва');});
  await step('06 reselect A preserves B',async()=>{await choose(a,'Ялта');assert.equal(await b.inputValue(),'Москва');});
  await step('07 clear B preserves A',async()=>{await clearB();assert.equal(await a.inputValue(),'Ялта');assert.equal(await b.inputValue(),'');});
  await step('08 reverse',async()=>{await choose(b,'Казань');await page.getByRole('button',{name:'Поменять точки A и B местами'}).click();assert.equal(await a.inputValue(),'Казань');assert.equal(await b.inputValue(),'Ялта');});
  await step('09 calculation and day duration',async()=>{await calculate();await card.waitFor();assert.match(await card.innerText(),/170 км/);assert.match(await card.innerText(),/1 д 1 ч/);assert.match(await card.innerText(),/неизвестна/);});
  await step('10 upstream error',async()=>{next='error';await calculate();await page.getByText('Сервис маршрутов временно недоступен. Попробуйте позже.',{exact:true}).waitFor();assert.equal(await card.count(),0);});
  await step('11 retry succeeds',async()=>{await calculate();await card.waitFor();});
  await step('12 clear cancels pending',async()=>{next='delay';const started=new Promise(resolve=>{delayedStarted=resolve;});await calculate();await started;await clearA();assert.equal(await card.count(),0);});
  await step('13 late response cannot restore result',async()=>{release();await page.waitForTimeout(100);assert.equal(await card.count(),0);assert.equal(await a.inputValue(),'');});
  await step('14 repeat and layout',async()=>{await choose(a,'Москва');await calculate();await card.waitFor();assert.equal(await b.inputValue(),'Ялта');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);});
  await page.screenshot({path:`${output}/${mobile?'mobile':'desktop'}.png`,fullPage:true});
 }catch{ /* failure preserved; independently try next viewport */ }finally{await context.close();}
}}finally{await browser.close();save();}
if(report.results.filter(row=>row.status==='PASS').length!==28)process.exitCode=1;
