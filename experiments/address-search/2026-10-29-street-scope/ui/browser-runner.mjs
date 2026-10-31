import fs from 'node:fs';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
const root='/workspace/geonames-preview-publish-fc83523',out=root+'/experiments/address-search/2026-10-29-street-scope/ui';fs.mkdirSync(out,{recursive:true});
const handler=JSON.parse(fs.readFileSync(root+'/experiments/address-search/2026-10-29-street-scope/handler-replay.json','utf8'));
const bodies=new Map(handler.results.filter(x=>x.query.includes('улица')||x.query.includes('улицы')).map(x=>[x.query,x.body]));
const {chromium}=await import(pathToFileURL('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs').href);
const report={runtimeCommit:'e6142b18f1d41dae25e43a0a859a36cd247cdb81',mode:'local built V3; cities use actual POST/r and admitted database; street responses explicitly replay current handler outputs derived from saved actual Photon captures; no new live Photon/route calls',viewports:[]};let browser;
try{browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,chromiumSandbox:true});report.browser=browser.version();
 for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width===390,hasTouch:viewport.width===390}),page=await context.newPage();page.setDefaultTimeout(20000);
  const r={viewport,status:'RUNNING',responses:[],pageErrors:[],newRouteRequests:0};report.viewports.push(r);
  page.on('pageerror',e=>r.pageErrors.push(e.message));
  await page.route('**/*',async route=>{
   const request=route.request(),url=new URL(request.url());
   if(url.pathname.includes('calculate')){r.newRouteRequests++;await route.abort();return;}
   if(url.origin!=='http://127.0.0.1:3194'){await route.abort();return;}
   if(url.pathname==='/r'&&request.method()==='POST'){
    const query=request.postDataJSON().query;
    if(bodies.has(query)){const body=bodies.get(query);r.responses.push({query,mode:'controlled saved-response replay',httpStatus:200,first:body.items[0],streetSearch:body.streetSearch});await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});return;}
   }
   await route.continue();
  });
  const cityTasks=[];page.on('response',response=>{const u=new URL(response.url());if(u.pathname==='/r'){const q=response.request().postDataJSON().query;if(!bodies.has(q))cityTasks.push((async()=>{const body=await response.json();r.responses.push({query:q,mode:'actual local HTTP city API',httpStatus:response.status(),provider:body.localSource?.provider,first:body.items[0]});assert.equal(body.localSource?.provider,'geonames');})());}});
  try{
   await page.goto('http://127.0.0.1:3194/v3',{waitUntil:'networkidle'});
   const a=page.locator('input[placeholder="Откуда"]'),b=page.locator('input[placeholder="Куда"]'),field=i=>i.locator('xpath=ancestor::label[1]');
   async function select(i,query,text){await i.click();await i.fill(query);await field(i).locator('[role="status"] button').filter({hasText:text}).first().click();return i.inputValue();}
   const av=await select(a,'Краснодар, Красная улица','Краснодар'),bv=await select(b,'Донецк, улица Артёма','Донецк');
   assert.match(av,/Красная улица.*Краснодар/);assert.match(av,/ориентировочная точка улицы/);assert.equal(bv,'Донецк — ДНР');assert.doesNotMatch(bv,/Артёма|Ростов/);r.streetAndCityFallback='PASS';
   await page.screenshot({path:out+`/${viewport.width}-street-city.png`,fullPage:true});
   await field(a).getByRole('button',{name:/Очистить поле/}).click();assert.equal(await b.inputValue(),bv);const moscow=await select(a,'Москва','Москва');assert.equal(await b.inputValue(),bv);
   const swap=page.getByRole('button',{name:'Поменять точки A и B местами',exact:true});await swap.click();assert.equal(await a.inputValue(),bv);assert.equal(await b.inputValue(),moscow);await a.focus();await swap.click();assert.equal(await a.inputValue(),moscow);assert.equal(await b.inputValue(),bv);r.swapAndRefocus='PASS';
   await field(b).getByRole('button',{name:/Очистить поле/}).click();assert.equal(await a.inputValue(),moscow);await select(b,'Ялта','Крым');assert.equal(await a.inputValue(),moscow);r.clearBothAndPreserveOther='PASS';
   await Promise.all(cityTasks);assert.equal(r.newRouteRequests,0);assert.deepEqual(r.pageErrors,[]);r.status='PASS';
  }catch(e){r.status='FAIL';r.error=String(e);process.exitCode=1;}finally{await context.close();}
 }
}catch(e){report.error=String(e);process.exitCode=1;}finally{await browser?.close();fs.writeFileSync(out+'/review.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.viewports.map(({viewport,status,streetAndCityFallback,swapAndRefocus,clearBothAndPreserveOther,error})=>({viewport,status,streetAndCityFallback,swapAndRefocus,clearBothAndPreserveOther,error}))));}
