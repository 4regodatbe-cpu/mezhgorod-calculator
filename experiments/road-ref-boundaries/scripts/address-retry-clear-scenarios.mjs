// Prepared offline browser acceptance. Fixture coordinates are deliberately
// synthetic: this checks UI state, not real geocoding or route correctness.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const base=process.env.ADDRESS_UI_BASE_URL;
const modulePath=process.env.PLAYWRIGHT_MODULE;
if(!base||!modulePath)throw new Error('Set ADDRESS_UI_BASE_URL and PLAYWRIGHT_MODULE');
const out=process.env.ADDRESS_UI_OUTPUT_DIR??'/tmp/address-retry-clear-results';mkdirSync(out,{recursive:true});
const {chromium}=await import(pathToFileURL(modulePath).href);
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const fixture=(name,id)=>({id,title:name,label:name,region:'Synthetic UI fixture',position:{lat:1,lng:1}});
const cities={Ялта:[fixture('Ялта','QA-YALTA')],'Санкт-Петербург':[fixture('Санкт-Петербург','QA-SPB')],
 Волноваха:[fixture('Волноваха — ДНР','QA-VOLNOVAKHA')],Донецк:[fixture('Донецк — ДНР','QA-DNR'),fixture('Донецк, Ростовская область','QA-ROSTOV')]};
const report={mode:'mocked address UI only; no real calculation/Preview acceptance',results:[]};
const persist=()=>writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');
try{
 for(const viewport of [{width:1280,height:900},{width:375,height:812}]){
  const context=await browser.newContext({viewport,serviceWorkers:'block'});
  const page=await context.newPage();page.setDefaultTimeout(10_000);
  let failNext=false;
  await context.route('**/*',async route=>{
   const request=route.request(),url=new URL(request.url());
   if(url.origin!==new URL(base).origin)return route.abort('blockedbyclient');
   if(url.pathname==='/r'){
    const query=request.postDataJSON().query;
    if(failNext){failNext=false;return route.fulfill({status:502,json:{error:'Controlled provider failure'}});}
    return route.fulfill({json:{items:cities[query]??[]}});
   }
   if(url.pathname.startsWith('/api/'))return route.fulfill({json:url.pathname.endsWith('/classify')?{mode:'standard'}:{ok:true}});
   return route.continue();
  });
  const row={viewport,status:'RUNNING'};report.results.push(row);persist();
  try{
   await page.goto(new URL('/v3',base).href,{waitUntil:'networkidle'});
   const a=page.getByPlaceholder('Откуда',{exact:true}),b=page.getByPlaceholder('Куда',{exact:true});
   const field=input=>input.locator('xpath=ancestor::label[1]');
   const choose=async(input,query,label)=>{await input.fill(query);await field(input).locator('[role="status"] button').filter({hasText:label}).first().click();};
   const clear=async input=>{await field(input).getByRole('button',{name:/Очистить поле/}).click();assert.equal(await input.inputValue(),'');await input.focus();};
   await choose(a,'Ялта','Ялта');await choose(b,'Санкт-Петербург','Санкт-Петербург');
   for(const [input,other] of [[a,b],[b,a]]){
    const preserved=await other.inputValue();
    for(let i=0;i<10;i++){
     await clear(input);const query=i%2?'Донецк':'Волноваха';
     if(i===0&&input===a){
      failNext=true;await input.fill(query);
      await field(input).getByText('Сервис поиска временно недоступен.',{exact:true}).waitFor();
      await field(input).getByRole('button',{name:'Повторить',exact:true}).click();
     }else await input.fill(query);
     await field(input).locator('[role="status"] button strong').first().waitFor();
     assert.equal(await input.inputValue(),query,'suggestions must not auto-select a homonym');
     await field(input).locator('[role="status"] button').filter({hasText:cities[query][0].label}).first().click();
     assert.equal(await input.inputValue(),cities[query][0].label);
     assert.equal(await other.inputValue(),preserved);
    }
   }
   row.status='PASS';row.replacements=20;
  }catch(error){row.status='FAIL';row.error=String(error);await page.screenshot({path:path.join(out,`failure-${viewport.width}.png`)});throw error;}
  finally{persist();await context.close();}
 }
}finally{persist();await browser.close();}
