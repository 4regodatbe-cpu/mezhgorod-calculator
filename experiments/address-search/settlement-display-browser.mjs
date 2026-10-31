// Local built-source public-label regression. No provider/address mocks or route calculation.
import {mkdirSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const [base,out]=process.argv.slice(2);if(!base||!out||new URL(base).hostname!=='127.0.0.1')throw Error('Pass local server URL and output directory');
mkdirSync(out,{recursive:true});
const {chromium}=await import(pathToFileURL('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs').href);
const report={mode:'real local V3 API + admitted GeoNames, no mocks, no calculation',results:[]};let browser;
try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,chromiumSandbox:true});report.browser=browser.version();
 for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width===390,hasTouch:viewport.width===390}),page=await context.newPage();page.setDefaultTimeout(15000);
  const result={viewport,status:'RUNNING'};report.results.push(result);
  try{
   await page.goto(base+'/v3',{waitUntil:'networkidle'});
   const a=page.locator('input[placeholder="Откуда"]'),field=a.locator('xpath=ancestor::label[1]'),buttons=field.locator('[role="status"] button');
   const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/r');await a.fill('Доне');const r=await response,body=await r.json();assert.equal(r.status(),200);assert.equal(body.localSource.provider,'geonames');
   await buttons.first().waitFor();const labels=await buttons.allTextContents();
   assert.ok(labels.length>0);for(const label of labels)assert.doesNotMatch(label,/[сц]ьк|geonames-|\d+\.\d+,\s*\d+\.\d+/iu);
   assert.ok(!body.items.some(x=>x.id==='geonames-709711'));
   const homonyms=['geonames-709713','geonames-811884'].map(id=>body.items.findIndex(x=>x.id===id));assert.ok(homonyms.every(i=>i>=0));
   assert.notEqual(body.items[homonyms[0]].label,body.items[homonyms[1]].label);
   await page.screenshot({path:out+'/'+viewport.width+'-choices.png',fullPage:true});
   for(const i of homonyms){
    await buttons.nth(i).click();assert.equal(await a.inputValue(),body.items[i].label);
    await field.getByRole('button',{name:/Очистить поле/}).click();await a.fill('Доне');await buttons.first().waitFor();
   }
   result.status='PASS';result.labels=labels;result.homonyms=homonyms.map(i=>body.items[i]);
  }catch(e){result.status='FAIL';result.error=String(e);throw e;}finally{await context.close();}
 }
}catch(e){report.error=String(e);process.exitCode=1;}finally{await browser?.close();writeFileSync(out+'/review.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({browser:report.browser,results:report.results.map(({viewport,status,error})=>({viewport,status,error})),error:report.error}));}
