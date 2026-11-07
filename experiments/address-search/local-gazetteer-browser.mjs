// New GeoNames integration scenario, not replay of the closed B03 mock suite.
import {writeFileSync,mkdirSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const [base,output]=process.argv.slice(2);if(!base||!output)throw Error('Pass local base and evidence directory');mkdirSync(output,{recursive:true});
const {chromium}=await import(pathToFileURL('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs').href);
const report={mode:'real local production V3 /r + actual GeoNames; no address mocks; calculation blocked to avoid unapproved extra live work',results:[]};
let browser;
try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,chromiumSandbox:true,args:['--disable-background-networking']});
 report.browser=browser.version();
 for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
  const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage(),errors=[],searchResponses=[],responseTasks=[];
  page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(new URL(r.url()).pathname==='/r')responseTasks.push((async()=>searchResponses.push({query:r.request().postDataJSON().query,status:r.status(),body:await r.json().catch(()=>null)}))());});
  await context.route('**/*',route=>{
   const u=new URL(route.request().url());if(u.origin!==new URL(base).origin)return route.abort();
   if(u.pathname==='/api/v3/calculate')return route.fulfill({status:503,json:{error:'Calculation intentionally not live in this browser fixture'}});
   return route.continue();
  });
  const result={viewport,status:'RUNNING'};report.results.push(result);
  try{
   await page.goto(base+'/v3',{waitUntil:'networkidle'});
   const a=page.locator('input[placeholder="Откуда"]'),b=page.locator('input[placeholder="Куда"]');
   const field=i=>i.locator('xpath=ancestor::label[1]');
   async function select(input,query,qualifier){await input.fill(query);const button=field(input).locator('[role="status"] button').filter({hasText:qualifier}).first();await button.waitFor();await button.click();}
   const clear=i=>field(i).getByRole('button',{name:/Очистить поле/});
   await select(a,'Ялта Крым','Крым');await select(b,'Санкт-Петербург','Санкт-Петербург');const second=await b.inputValue();
   await clear(a).click();assert.equal(await b.inputValue(),second);
   await select(a,'Волноваха','Волноваха');assert.equal(await b.inputValue(),second);
   await clear(a).click();await select(a,'Доне','ДНР');assert.equal(await b.inputValue(),second);
   await clear(a).click();await select(a,'Донецк Ростовская область','Ростовская');const first=await a.inputValue();
   await clear(b).click();assert.equal(await a.inputValue(),first);
   await select(b,'Волноваха','Волноваха');assert.equal(await a.inputValue(),first);
   await Promise.all(responseTasks);
   // Re-selecting Volnovakha can legitimately reuse the client cache. Verify
   // every distinct server query, not an invented per-click request count.
   for(const q of ['Ялта Крым','Санкт-Петербург','Волноваха','Доне','Донецк Ростовская область'])assert.ok(searchResponses.some(r=>r.query===q),q);
   assert.ok(searchResponses.every(r=>r.status===200&&r.body.localSource?.provider==='geonames'));
   assert.deepEqual(errors,[]);result.status='PASS';result.searches=searchResponses;
   await page.screenshot({path:output+'/'+viewport.width+'.png',fullPage:true});
  }catch(error){result.status='FAIL';result.error=String(error);throw error;}finally{await context.close();}
 }
}catch(error){report.error=String(error);report.status='BLOCKED_OR_FAILED';process.exitCode=1;}
finally{await browser?.close();writeFileSync(output+'/review.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
