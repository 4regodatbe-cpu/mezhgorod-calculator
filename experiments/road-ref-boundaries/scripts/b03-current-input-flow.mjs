// New Oct28 B03 cases; NOT the already passed eight fallback cases.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root=process.cwd(),base=process.env.B03_BASE_URL??'http://127.0.0.1:3012';
const out=path.resolve(process.env.B03_OUTPUT_DIR??'/tmp/b03-current-browser-results');mkdirSync(out,{recursive:true});
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE??'/opt/codex/cua_node/lib/node_modules/playwright/index.mjs').href);
const snapshot=JSON.parse(readFileSync('data/address-city-snapshot.json'));
assert.ok(Date.now()<Date.parse(snapshot.expiresAt),'No expired snapshot fixture');
assert.equal(createHash('sha256').update(JSON.stringify(snapshot.records)).digest('hex'),snapshot.recordsSha256);
const donetsk=snapshot.records.filter(r=>r.searchNames.includes('Донецк')).map(r=>r.suggestion);
const krasnodar=snapshot.records.find(r=>r.searchNames.includes('Краснодар')).suggestion;
const anapa={id:'QA-ANAPA',title:'Анапа',label:'Анапа, QA fixture',region:'QA fixture',position:{lat:44.895,lng:37.315}};
const good=items=>({status:200,body:{items}}),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--disable-extensions','--disable-sync']});
const report={startedAt:new Date().toISOString(),node:process.version,browser:browser.version(),sourceSha:process.env.B03_SOURCE_SHA??'local',componentSha256:createHash('sha256').update(readFileSync('app/v2/components/address-field.tsx')).digest('hex'),snapshotExpiresAt:snapshot.expiresAt,mode:'browser mocked API, no external-service verification',results:[]};
const persist=()=>writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');
const A=p=>p.locator('input[placeholder="Откуда"]'),B=p=>p.locator('input[placeholder="Куда"]');
const field=i=>i.locator('xpath=ancestor::label[1]'),choices=i=>field(i).locator('[role="status"] button strong');
const clear=i=>field(i).getByRole('button',{name:/Очистить поле/});
async function search(i,q){await i.fill(q);await choices(i).first().waitFor({state:'visible'});}
async function select(i,q,label){await search(i,q);await field(i).locator('[role="status"] button').filter({hasText:label}).first().click();}
async function context(viewport={width:1280,height:900},answer=q=>good(q==='Анапа'?[anapa]:q==='Краснодар'?[krasnodar]:donetsk)){
 const c=await browser.newContext({viewport,serviceWorkers:'block'}),requests=[],failures=[],calculations=[],classifications=[];
 await c.addInitScript(()=>{window.__b03Aborts=0;const original=window.fetch;window.fetch=function(input,options){if(input==='/r')options?.signal?.addEventListener('abort',()=>window.__b03Aborts++,{once:true});return original.call(this,input,options);};});
 const page=await c.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>failures.push(e.message));
 // Record before waitForRequest resolves: routing callbacks can run later.
 page.on('request',r=>{if(new URL(r.url()).pathname==='/r'&&r.method()==='POST')requests.push(r.postDataJSON().query);});
 await c.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());
  if(u.host!==new URL(base).host){failures.push('external:'+u.host);return route.abort('blockedbyclient');}
  if(u.pathname==='/r'&&req.method()==='POST'){
   const q=req.postDataJSON().query;
   const r=await answer(q,requests.length);if(r.delayMs)await sleep(r.delayMs);
   try{await route.fulfill({status:r.status,contentType:'application/json',body:JSON.stringify(r.body)});}catch(e){if(!req.failure()?.errorText?.includes('ERR_ABORTED'))failures.push(String(e));}return;
  }
  if(u.pathname==='/api/v2/classify'){classifications.push(req.postDataJSON());return route.fulfill({json:{mode:'standard'}});}
  if(u.pathname==='/api/v2/calculate'){calculations.push(req.postDataJSON());return route.fulfill({status:500,json:{error:'Controlled QA calculation response'}});}
  if(u.pathname==='/api/collect')return route.fulfill({json:{ok:true}});
  return route.continue();
 });
 const hydrated=page.waitForRequest(r=>new URL(r.url()).pathname==='/api/collect');
 await page.goto(base+'/v2',{waitUntil:'domcontentloaded'});await hydrated;
 return {c,page,requests,failures,calculations,classifications};
}
async function run(id,fn,options={}){
 const h=await context(options.viewport,options.answer),r={id,status:'RUNNING',viewport:options.viewport??{width:1280,height:900}};report.results.push(r);persist();
 try{await fn(h);assert.deepEqual(h.failures,[]);r.status='PASS';}
 catch(e){r.status='FAIL';r.error=String(e);await h.page.screenshot({path:path.join(out,id+'-failure.png'),fullPage:true});throw e;}
 finally{r.addressRequests=h.requests;r.classifications=h.classifications;r.calculations=h.calculations;r.addressAbortEvents=await h.page.evaluate(()=>window.__b03Aborts);persist();await h.c.close();}
}
try{
 await run('01-select-A-and-B',async({page,classifications})=>{
  await select(A(page),'Краснодар',krasnodar.label);await select(B(page),'Анапа',anapa.label);
  await page.waitForTimeout(100);assert.deepEqual(classifications.at(-1).positions,[krasnodar.position,anapa.position]);
 });
 await run('02-Anapa-clear-Donetsk',async({page,classifications})=>{
  await select(A(page),'Краснодар',krasnodar.label);await select(B(page),'Анапа',anapa.label);await clear(B(page)).click();
  assert.equal(await B(page).inputValue(),'');assert.equal(await choices(B(page)).count(),0);
  await page.waitForTimeout(100);assert.deepEqual(classifications.at(-1).positions,[krasnodar.position]);
  await select(B(page),'Донецк',donetsk[0].label);await page.waitForTimeout(100);assert.deepEqual(classifications.at(-1).positions,[krasnodar.position,donetsk[0].position]);
 });
 await run('03-fast-typing',async({page,requests})=>{
  for(const q of ['Дон','Доне','Донецк'])await B(page).fill(q);
  await choices(B(page)).first().waitFor();assert.deepEqual(requests,['Донецк']);assert.equal(await choices(A(page)).count(),0);
 });
 await run('04-late-response-after-replace',async({page,requests})=>{
  const sent=page.waitForRequest(r=>new URL(r.url()).pathname==='/r');await B(page).fill('Анапа');await sent;
  // Wait for actual old request, not arbitrary debounce timing.
  assert.ok(requests.includes('Анапа'));await search(B(page),'Донецк');await page.waitForTimeout(1000);
  assert.equal(await choices(B(page)).count(),2);assert.ok(!(await field(B(page)).innerText()).includes(anapa.label));
 },{answer:q=>q==='Анапа'?{...good([anapa]),delayMs:900}:good(donetsk)});
 await run('05-clear-active-request',async({page,requests})=>{
  const sent=page.waitForRequest(r=>new URL(r.url()).pathname==='/r');await B(page).fill('Анапа');await sent;
  await clear(B(page)).click();await page.waitForTimeout(1100);assert.equal(await choices(B(page)).count(),0);assert.equal(await B(page).inputValue(),'');assert.equal(requests.length,1);assert.equal(await page.evaluate(()=>window.__b03Aborts),1);
 },{answer:()=>({...good([anapa]),delayMs:900})});
 await run('06-same-name-choice',async({page,classifications})=>{
  await search(B(page),'Донецк');assert.equal(await choices(B(page)).count(),2);assert.equal(classifications.length,0);
  await field(B(page)).locator('[role="status"] button').filter({hasText:donetsk[1].label}).click();await page.waitForTimeout(100);
  assert.deepEqual(classifications.at(-1).positions,[donetsk[1].position]);
 });
 await run('07-swap-and-refocus',async({page,classifications})=>{
  await select(A(page),'Краснодар',krasnodar.label);await select(B(page),'Анапа',anapa.label);
  await page.getByRole('button',{name:'Поменять точки A и B местами'}).click();await page.waitForTimeout(100);
  assert.equal(await A(page).inputValue(),anapa.label);assert.equal(await B(page).inputValue(),krasnodar.label);
  assert.deepEqual(classifications.at(-1).positions,[anapa.position,krasnodar.position]);
  await B(page).focus();assert.equal(await choices(B(page)).count(),0,'Selected swapped B must not reopen old Anapa suggestions');
  await A(page).focus();assert.equal(await choices(A(page)).count(),0,'Selected swapped A must not reopen old Krasnodar suggestions');
 });
 await run('08-503-429-empty-recovery',async({page,requests})=>{
  await B(page).fill('Отказ');await field(B(page)).getByText('Сервис поиска временно недоступен.').waitFor();
  const rateLimited=page.waitForResponse(r=>new URL(r.url()).pathname==='/r'&&r.status()===429);await field(B(page)).getByRole('button',{name:'Повторить'}).click();await rateLimited;await page.waitForTimeout(50);
  await field(B(page)).getByRole('button',{name:'Повторить'}).click();await field(B(page)).getByText('Ничего не найдено.',{exact:false}).waitFor();
  await select(B(page),'Донецк',donetsk[0].label);assert.equal(requests.length,4);
 },{answer:(_q,n)=>n===1?{status:503,body:{}}:n===2?{status:429,body:{}}:n===3?good([]):good(donetsk)});
 await run('09-mobile-replace',async({page})=>{
  await select(B(page),'Анапа',anapa.label);await clear(B(page)).click();await select(B(page),'Донецк',donetsk[1].label);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:path.join(out,'09-mobile.png'),fullPage:true});
 },{viewport:{width:320,height:720}});
 await run('10-fields-independent-and-cancel',async({page,classifications})=>{
  await select(A(page),'Краснодар',krasnodar.label);const sent=page.waitForRequest(r=>new URL(r.url()).pathname==='/r');
  await B(page).fill('Анапа');await sent;await B(page).fill('До');await page.waitForTimeout(1100);
  assert.equal(await A(page).inputValue(),krasnodar.label);assert.equal(await choices(B(page)).count(),0);assert.deepEqual(classifications.at(-1).positions,[krasnodar.position]);assert.ok(await page.evaluate(()=>window.__b03Aborts>=1));
 },{answer:q=>q==='Краснодар'?good([krasnodar]):({...good([anapa]),delayMs:900})});
}catch(e){report.stoppedAtFirstFailure=String(e);process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();persist();console.log(JSON.stringify({pass:report.results.filter(r=>r.status==='PASS').length,fail:report.results.filter(r=>r.status==='FAIL').length,notRun:10-report.results.length,output:out}));await browser.close();}
