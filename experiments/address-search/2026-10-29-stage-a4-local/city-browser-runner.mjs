import fs from'node:fs';import assert from'node:assert/strict';import{pathToFileURL}from'node:url';
const base='http://127.0.0.1:3193',out='/tmp/stage-a4-browser';fs.mkdirSync(out,{recursive:true});
const{chromium}=await import(pathToFileURL('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs').href);
const report={mode:'real local production build/API; actual GeoNames/Photon/routing, no mocks',sourceRuntimeCommit:'c962fb730c42fd42f192ee55bbba9de20341bbbc',viewports:[]};let browser;
try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,chromiumSandbox:true});report.browser=browser.version();
 for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
  const c=await browser.newContext({viewport,isMobile:viewport.width===390,hasTouch:viewport.width===390}),page=await c.newPage();page.setDefaultTimeout(18000);
  const r={viewport,status:'RUNNING',searches:[]},tasks=[];report.viewports.push(r);
  page.on('response',response=>{if(new URL(response.url()).pathname==='/r')tasks.push((async()=>r.searches.push({query:response.request().postDataJSON().query,status:response.status(),body:await response.json().catch(()=>null)}))());});
  try{
   await page.goto(base+'/v3',{waitUntil:'networkidle'});const a=page.locator('input[placeholder="Откуда"]'),b=page.locator('input[placeholder="Куда"]'),field=i=>i.locator('xpath=ancestor::label[1]');
   const clear=i=>field(i).getByRole('button',{name:/Очистить поле/}).click();
   async function select(i,q,label){await i.click();await i.fill(q);await field(i).locator('[role="status"] button').filter({hasText:label}).first().click();}
   await select(a,'Москва','Москва');await select(b,'Санкт-Петербург','Санкт-Петербург');const av=await a.inputValue(),bv=await b.inputValue();
   const swap=page.getByRole('button',{name:'Поменять точки A и B местами',exact:true});await swap.click();assert.equal(await a.inputValue(),bv);assert.equal(await b.inputValue(),av);await a.focus();await swap.click();assert.equal(await a.inputValue(),av);assert.equal(await b.inputValue(),bv);r.swap='PASS';
   if(viewport.width===1280){
    const t=Date.now(),pending=page.waitForResponse(x=>new URL(x.url()).pathname==='/api/v3/calculate',{timeout:120000});await page.getByRole('button',{name:'Рассчитать поездку',exact:true}).click();
    try{const response=await pending;report.controlRoute={httpStatus:response.status(),elapsedMs:Date.now()-t,body:await response.json()};}catch(e){report.controlRoute={error:String(e),elapsedMs:Date.now()-t};}
   }
   await clear(a);assert.equal(await b.inputValue(),bv);await select(a,'Волноваха','Волноваха');assert.equal(await b.inputValue(),bv);const currentA=await a.inputValue();
   await clear(b);assert.equal(await a.inputValue(),currentA);await select(b,'Севастополь','Крым');assert.equal(await a.inputValue(),currentA);
   r.clearing='PASS';await Promise.all(tasks);assert.ok(r.searches.every(x=>x.status===200&&x.body?.localSource?.provider==='geonames'));r.status='PASS';await page.screenshot({path:out+'/'+viewport.width+'.png',fullPage:true});
  }catch(e){r.status='FAIL';r.error=String(e);process.exitCode=1;}finally{await c.close();}
 }
}catch(e){report.error=String(e);process.exitCode=1;}finally{await browser?.close();fs.writeFileSync(out+'/review.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({viewports:report.viewports.map(({viewport,status,swap,clearing,error})=>({viewport,status,swap,clearing,error})),route:report.controlRoute?{httpStatus:report.controlRoute.httpStatus,elapsedMs:report.controlRoute.elapsedMs,error:report.controlRoute.error}:null,error:report.error}));}
