// Exactly two browser /r searches at most; no routing/calculation or automatic retry.
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const base=process.env.B03_BASE_URL??'http://127.0.0.1:3012',out=path.resolve(process.env.B03_OUTPUT_DIR??'/tmp/b03-live-replacement');mkdirSync(out,{recursive:true});
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE??'/opt/codex/cua_node/lib/node_modules/playwright/index.mjs').href);
const b=await chromium.launch({executablePath:process.env.CHROME_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--disable-extensions','--disable-sync']});
const c=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),p=await c.newPage();p.setDefaultTimeout(30000);
const report={startedAt:new Date().toISOString(),node:process.version,browser:b.version(),viewport:{width:390,height:844},componentSha256:createHash('sha256').update(readFileSync('app/v2/components/address-field.tsx')).digest('hex'),sourceApiRemote:'75d55b8a257d6e9685e13c9da179b3385f7ca7d6 (API code unchanged)',addressApi:'LIVE local /r → actual production collector → Photon',classifyAndCollect:'MOCKED, never counted as live',declaredServerProxyOptIn:process.env.B01_SERVER_PROXY_OPT_IN==='1',requests:[],errors:[],steps:[]};
const persist=()=>writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
p.on('pageerror',e=>report.errors.push(e.message));
await c.route('**/*',async r=>{
 const q=r.request(),u=new URL(q.url());
 if(u.host!==new URL(base).host){report.errors.push('external browser request blocked:'+u.host);return r.abort();}
 if(u.pathname==='/r'&&q.method()==='POST'){
  const city=q.postDataJSON().query;report.requests.push(city);persist();
  if(report.requests.length>2||!['Анапа','Донецк'].includes(city)){report.errors.push('query budget violation');return r.abort();}
  return r.continue();
 }
 if(u.pathname==='/api/collect')return r.fulfill({json:{ok:true}});
 if(u.pathname==='/api/v2/classify')return r.fulfill({json:{mode:'standard'}});
 if(u.pathname.includes('/calculate')){report.errors.push('unexpected calculation');return r.abort();}
 return r.continue();
});
try{
 const hydrated=p.waitForRequest(r=>new URL(r.url()).pathname==='/api/collect');await p.goto(base+'/v2',{waitUntil:'domcontentloaded'});await hydrated;
 const input=p.locator('input[placeholder="Куда"]'),field=input.locator('xpath=ancestor::label[1]');
 for(const [index,city] of ['Анапа','Донецк'].entries()){
  const pending=p.waitForResponse(r=>new URL(r.url()).pathname==='/r'&&r.request().postDataJSON()?.query===city,{timeout:30000});
  const started=performance.now();await input.fill(city);const response=await pending,body=await response.text(),file=`response-${index+1}.json`;
  writeFileSync(path.join(out,file),body);const step={city,httpStatus:response.status(),elapsedMs:Math.round(performance.now()-started),file,sha256:createHash('sha256').update(body).digest('hex')};report.steps.push(step);persist();
  const data=JSON.parse(body);
  if(!response.ok()||!Array.isArray(data.items)||!data.items.length){
   step.outcome='LIVE_LOOKUP_UNAVAILABLE_OR_EMPTY';step.uiError=await field.innerText();report.status='BLOCKED_BY_LIVE_SOURCE';break;
  }
  assert.ok(!data.fallback,'Live source check must not silently use a fallback');
  const item=data.items[0],classified=p.waitForRequest(r=>new URL(r.url()).pathname==='/api/v2/classify');
  await field.locator('[role="status"] button').filter({hasText:item.label}).first().click();
  const sent=await classified;step.selectedId=item.id;step.selectedLabel=item.label;step.selectedPosition=item.position;step.sentPositions=sent.postDataJSON().positions;
  assert.deepEqual(step.sentPositions,[item.position]);step.outcome='SELECTED';
  if(city==='Анапа'){await field.getByRole('button',{name:/Очистить поле/}).click();if(await input.inputValue()!=='')throw Error('B did not clear');step.cleared=true;}
  else{report.status='LIVE_REPLACEMENT_PASS';}
 }
}catch(e){report.status='ERROR';report.errors.push(String(e));process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();persist();console.log(JSON.stringify(report));await b.close();}
