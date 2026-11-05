// V3 read-only, live end-to-end acceptance. No route/address response mocking.
// Requires a public deployment and GitHub Actions' pinned Chrome/Playwright environment.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { classifyAnalyticsCheck, classifyApiAndDom, summarizeCalculationResponse } from './v3-live-browser-acceptance-contract.mjs';

const base = new URL(process.env.V3_ACCEPTANCE_URL ?? 'https://mezhgorod-calculator.vercel.app/v3');
assert.equal(base.protocol, 'https:', 'Use an HTTPS deployment');
assert.equal(base.pathname, '/v3', 'Target only the /v3 application');
const root = base.origin;
const output = path.resolve(process.env.V3_ACCEPTANCE_OUTPUT ?? 'v3-live-results');
mkdirSync(output, { recursive: true });
const playwright = process.env.PLAYWRIGHT_MODULE;
if (!playwright) throw new Error('PLAYWRIGHT_MODULE must point to a known Playwright installation');
const { chromium } = await import(pathToFileURL(playwright).href);

const report = {
  kind: 'V3_LIVE_BROWSER_ACCEPTANCE',
  startedAt: new Date().toISOString(),
  target: base.href,
  mode: 'live public /r and /api/v3/calculate; only optional analytics deliberately aborted',
  checkoutSha: process.env.GITHUB_SHA ?? null,
  deployedSha: null,
  deployedVersionHttpStatus: null,
  browser: null,
  results: [],
};
const save = () => writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2) + '\n');
const normalize = e => (e instanceof Error ? `${e.name}: ${e.message}` : String(e));

const cases = [
  ['01', 'Ялта → Санкт-Петербург'],
  ['02', 'Смена A: Волноваха → Санкт-Петербург'],
  ['03', 'Смена A: Донецк (ДНР) → Санкт-Петербург'],
  ['04', 'Смена Б: Донецк (ДНР) → Краснодар'],
  ['05', 'Донецк (ДНР) → Волноваха'],
  ['06', 'Донецк (ДНР) → Мелитополь'],
  ['07', 'Краснодар → Ростов-на-Дону (mobile)'],
  ['08', 'Отказ необязательной аналитики не блокирует результат'],
];
for (const [id, name] of cases) report.results.push({ id, name, status: 'NOT_RUN' });
const item = id => report.results.find(x => x.id === id);
const routeHeading = /^Выбран маршрут (?:с минимальным временем|по новым территориям|через материк|через Крым|с учётом особых территорий)$/u;

// Record the exact deployed release, but never use a previously remembered SHA.
try {
  const response = await fetch(new URL('/api/version', root), {signal: AbortSignal.timeout(15000), cache: 'no-store'});
  report.deployedVersionHttpStatus = response.status;
  if (response.ok) {
    const data = await response.json();
    report.deployedSha = typeof data.commit === 'string' ? data.commit : null;
    report.deploymentEnvironment = data.environment ?? null;
  } else report.versionProbe = `HTTP_${response.status}`;
} catch (e) { report.versionProbe = normalize(e); }
save();

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-background-networking', '--disable-extensions', '--disable-sync'],
});
report.browser = browser.version();

async function newSession(mobile = false) {
  const context = await browser.newContext({
    viewport: mobile ? {width: 390, height: 844} : {width: 1280, height: 900},
    isMobile: mobile,
    hasTouch: mobile,
    locale: 'ru-RU',
    serviceWorkers: 'block',
  });
  // Important: never write test traffic into Google Sheets, never mock /r or /api/v3/calculate.
  const analytics = {intercepted:0, blocked:0, abortErrors:0};
  await context.route('**/api/collect', async route => {
    analytics.intercepted++;
    try { await route.abort('blockedbyclient'); analytics.blocked++; }
    catch { analytics.abortErrors++; }
  });
  const page = await context.newPage();
  const pageErrors = [];
  const searches = [];
  const requests = new Map();
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('request', request => {
    try {
      const url = new URL(request.url());
      if (url.pathname !== '/r' || request.method() !== 'POST') return;
      let query = null;
      try { query = request.postDataJSON()?.query; } catch { /* retain only a safe query string */ }
      const entry = {searchText:typeof query === 'string' ? query.slice(0,120) : null, requestSent:true, startedAt:Date.now(), httpStatus:null, elapsedMs:null, itemCount:null, partial:null, fallback:null, requestError:null};
      searches.push(entry);
      requests.set(request, entry);
    } catch { /* no raw URL/body is persisted */ }
  });
  page.on('response', response => {
    const entry = requests.get(response.request());
    if (!entry) return;
    entry.httpStatus = response.status();
    entry.elapsedMs = Math.max(0, Date.now() - entry.startedAt);
    entry.responseRead = response.json().then(data => {
      entry.responseJsonValid = true;
      entry.itemCount = Array.isArray(data?.items) ? data.items.length : 0;
      entry.partial = typeof data?.partial === 'boolean' ? data.partial : null;
      entry.fallback = typeof data?.fallback?.source === 'string' ? data.fallback.source.slice(0,80) : null;
    }).catch(() => { entry.responseJsonValid = false; });
  });
  page.on('requestfailed', request => {
    const entry = requests.get(request);
    if (!entry) return;
    const failure = request.failure()?.errorText ?? '';
    entry.requestError = /^net::ERR_[A-Z_]+$/u.test(failure) ? failure : 'REQUEST_FAILED';
  });
  page.__v3AcceptanceSearches = searches;
  page.__v3AcceptanceAnalytics = analytics;
  page.__v3AcceptancePageErrors = pageErrors;
  page.setDefaultTimeout(25000);
  await page.goto(base.href, {waitUntil: 'domcontentloaded', timeout: 60000});
  await page.locator('input[placeholder="Откуда"]').waitFor({state:'visible'});
  return {context, page, pageErrors};
}
const origin = page => page.locator('input[placeholder="Откуда"]');
const dest = page => page.locator('input[placeholder="Куда"]');
const parent = field => field.locator('xpath=ancestor::label[1]');

async function searchDiagnostic(page, field, query) {
  const search = [...(page.__v3AcceptanceSearches ?? [])].reverse().find(entry => entry.searchText === query);
  if (search?.responseRead) await Promise.race([search.responseRead, new Promise(resolve => setTimeout(resolve, 100))]);
  const statusRegion = parent(field).locator('[role="status"]');
  const state = await statusRegion.innerText().catch(() => '');
  const visibleButtons = await statusRegion.locator('button').count().catch(() => 0);
  const searchUiState = /Ищем/u.test(state) ? 'loading'
    : /Сервис поиска временно недоступен/u.test(state) ? 'error'
      : /Ничего не найдено/u.test(state) ? 'empty'
        : visibleButtons > 0 ? 'results'
          : state ? 'other' : 'none';
  return {
    search:{searchText:query,requestSent:Boolean(search),httpStatus:search?.httpStatus ?? null,elapsedMs:search?.elapsedMs ?? null,itemCount:search?.itemCount ?? null,partial:search?.partial ?? null,fallback:search?.fallback ?? null,requestError:search?.requestError ?? null,responseJsonValid:search?.responseJsonValid ?? null},
    searchUiState,
    searchStateVisible:Boolean(state),
    javaScriptErrors:(page.__v3AcceptancePageErrors ?? []).slice(0,10),
  };
}
async function selectCity(page, field, query, labelFilter = '') {
  await field.fill(query);
  const options = parent(field).locator('[role="status"] button');
  try { await options.first().waitFor({state:'visible', timeout: 30000}); }
  catch (error) {
    error.observation = await searchDiagnostic(page,field,query);
    throw error;
  }
  const total = await options.count();
  let chosen = null;
  for (let i=0; i<total; i++) {
    const button = options.nth(i);
    const content = await button.innerText();
    if (content.includes(query) && (!labelFilter || content.includes(labelFilter))) {chosen = button; break;}
  }
  if (!chosen) {
    const error = new Error(`Live suggestions did not contain ${query} / ${labelFilter}; ${total} option(s)`);
    error.observation = {...await searchDiagnostic(page,field,query),optionCount:total};
    throw error;
  }
  const selectedLabel = await chosen.innerText();
  await chosen.click();
  assert.ok((await field.inputValue()).trim().length > 0, 'Selection did not set field');
  return {query, selectedLabel, selectedValue:await field.inputValue()};
}
async function calculate(page, caseId) {
  const started = Date.now();
  const target = item(caseId);
  target.api = {apiStatus:'WAITING',httpStatus:null,elapsedMs:null,jsonValid:false,distanceMeters:null,durationSeconds:null,tollPricingStatus:null,deployedSha:report.deployedSha};
  target.dom = {status:'NOT_RUN'};
  save();
  const apiResponse = page.waitForResponse(r => {
    try {return new URL(r.url()).pathname === '/api/v3/calculate' && r.request().method() === 'POST';}
    catch {return false;}
  }, {timeout: 180000});
  let response;
  try {
    await page.getByRole('button', {name: 'Рассчитать поездку'}).click();
    response = await apiResponse;
  }
  catch (error) {
    target.api = {...target.api,apiStatus:'NOT_VERIFIED',elapsedMs:Date.now()-started,error:'No /api/v3/calculate response was observed before timeout'};
    target.classification = classifyApiAndDom(target.api,target.dom);
    save();
    throw error;
  }
  let payload = null;
  try { payload = await response.json(); } catch { /* preserve explicit non-JSON error */ }
  target.api = summarizeCalculationResponse({status:response.status(),elapsedMs:Date.now()-started,payload,jsonValid:payload !== null && typeof payload === 'object'});
  target.api.deployedSha = report.deployedSha;
  target.api.httpErrorCode = response.ok() ? null : `HTTP_${response.status()}`;
  target.classification = classifyApiAndDom(target.api,target.dom);
  save();
  if (target.api.apiStatus !== 'API_PASS') {
    target.status = 'FAIL';
    target.dom = {status:'NOT_RUN'};
    target.classification = classifyApiAndDom(target.api,target.dom);
    save();
    const e = new Error(`V3 response did not contain a valid successful route: HTTP ${response.status()}`);
    e.observation = {api:target.api,dom:target.dom};
    throw e;
  }
  const trip = payload?.options?.[0]?.fast ?? payload?.legs?.[0]?.fast;
  const dom = {status:'RUNNING',headingFound:false,distanceFound:false,durationFound:false,pricingFound:false};
  target.dom = dom;
  save();
  try {
    const heading = page.getByRole('heading', {level:3, name:routeHeading}).first();
    await heading.waitFor({state:'visible', timeout:18000});
    dom.headingFound = true;
    const card = heading.locator('xpath=ancestor::article[1]');
    await card.waitFor({state:'visible', timeout:3000});
    const distanceText = `${(trip.meters / 1000).toLocaleString('ru-RU', {maximumFractionDigits:1})} км`;
    const roundedMinutes = Math.round(trip.seconds / 60);
    const durationText = `${Math.floor(roundedMinutes / 60)} ч ${roundedMinutes % 60} мин`;
    await card.getByText(distanceText, {exact:true}).waitFor({state:'visible', timeout:5000});
    dom.distanceFound = true;
    await card.getByText(durationText, {exact:true}).waitFor({state:'visible', timeout:5000});
    dom.durationFound = true;
    const cardText = await card.innerText();
    const tollStatus = trip.tolls?.pricingStatus;
    const pricePatterns = {
      unknown:/Стоимость платных дорог неизвестна|сумма неизвестна|стоимость уточняется/iu,
      priced:/Платные дороги:|платные дороги/iu,
      free:/Итого за поездку|Итого/iu,
    };
    const pricingEvidence = cardText.match(pricePatterns[tollStatus])?.[0] ?? '';
    assert.ok(pricingEvidence, `No visible pricing result for API toll status ${String(tollStatus)}`);
    dom.pricingFound = true;
    dom.pricingStatus = tollStatus;
    dom.pricingEvidence = pricingEvidence;
    dom.displayedDistance = distanceText;
    dom.displayedDuration = durationText;
    dom.displayedTollSummary = cardText.split('\n').filter(line => /₽|неизвестна|Бесплатно/u.test(line)).join(' | ');
    dom.status = 'PASS';
    target.api.distanceKm = Math.round(trip.meters / 100) / 10;
    target.api.durationMin = Math.round(trip.seconds / 60);
    target.api.tollPricingStatus = tollStatus;
    target.api.vehiclePricingAvailable = Boolean(trip.pricingByVehicle);
    await page.screenshot({path:path.join(output, `${caseId}-result.png`), fullPage:true});
  } catch (error) {
    dom.status = 'FAIL';
    dom.error = normalize(error).slice(0,500);
    target.status = 'FAIL';
    target.classification = classifyApiAndDom(target.api,dom);
    save();
    try { await page.screenshot({path:path.join(output,`${caseId}-failure.png`),fullPage:true}); } catch { /* preserve diagnostic */ }
    error.observation = {api:target.api,dom};
    throw error;
  }
  target.classification = classifyApiAndDom(target.api,dom);
  target.analytics = {...(page.__v3AcceptanceAnalytics ?? {})};
  save();
  return {api:target.api,dom,analytics:target.analytics};
}
async function run(id, session, execute) {
  const target = item(id);
  target.status = 'RUNNING'; save();
  try {
    const data = await execute();
    target.status = 'PASS'; target.observation = data;
  } catch (e) {
    target.status = 'FAIL'; target.error = normalize(e).slice(0,800);
    if (e?.observation) target.observation = e.observation;
    if (session?.page && !session.page.isClosed()) {
      try { await session.page.screenshot({path:path.join(output,`${id}-failure.png`),fullPage:true}); }
      catch { /* do not obscure original failure */ }
    }
  } finally {
    target.pageErrors = session?.pageErrors?.slice(0,10) ?? [];
    target.searchDiagnostics = (session?.page?.__v3AcceptanceSearches ?? []).map(({responseRead,startedAt,...entry})=>entry);
    target.analytics = {...(session?.page?.__v3AcceptanceAnalytics ?? {})};
    if (target.status === 'PASS' && target.pageErrors.length) {
      target.status = 'FAIL'; target.error = `Uncaught page errors: ${target.pageErrors.join('; ')}`;
      if (target.api?.apiStatus === 'API_PASS') {
        target.dom = {...target.dom,status:'FAIL',error:'Uncaught page JavaScript errors'};
        target.classification = classifyApiAndDom(target.api,target.dom);
      }
    }
    save();
  }
  return target.status === 'PASS';
}

let main = null;
let analyticsProof = null;
try {
  try { main = await newSession(); }
  catch (e) {
    for (const id of ['01','02','03','04']) {item(id).status='BLOCKED';item(id).error=`Browser navigation: ${normalize(e)}`;}
    save();
  }
  if (main) {
    const {page} = main;
    const first = await run('01', main, async () => {
      const a=await selectCity(page,origin(page),'Ялта','Крым');
      const b=await selectCity(page,dest(page),'Санкт-Петербург');
      return {a,b,calculation:await calculate(page,'01')};
    });
    if (first) analyticsProof = {api:item('01').api,dom:item('01').dom,analytics:item('01').analytics,sourceScenario:'01'};
    const next = [
      ['02','Волноваха','ДНР',origin],
      ['03','Донецк','ДНР',origin],
      ['04','Краснодар','',dest],
    ];
    for (const [id,city,filter,fieldFn] of next) {
      if (!((await origin(page).inputValue()).trim() && (await dest(page).inputValue()).trim())) {
        item(id).status='BLOCKED';item(id).error='Required state from earlier selection missing';save();continue;
      }
      const ok = await run(id, main, async () => {
        const field = fieldFn(page);
        const prior=await field.inputValue();
        const cleared=parent(field).getByRole('button',{name:/Очистить поле/});
        await cleared.click();
        assert.equal(await field.inputValue(),'','Clear button did not clear address');
        // The old route must disappear as soon as an address changes.
        await page.getByRole('heading',{level:3,name:routeHeading}).first().waitFor({state:'hidden',timeout:5000});
        const selection=await selectCity(page,field,city,filter);
        return {prior,selection,calculation:await calculate(page,id)};
      });
      if (ok) analyticsProof = {api:item(id).api,dom:item(id).dom,analytics:item(id).analytics,sourceScenario:id};
    }
    await main.context.close();main=null;
  }
  const independent = [
    ['05',['Донецк','ДНР'],['Волноваха','ДНР'],false],
    ['06',['Донецк','ДНР'],['Мелитополь',''],false],
    ['07',['Краснодар',''],['Ростов-на-Дону',''],true],
  ];
  for (const [id,a,b,mobile] of independent) {
    let session;
    try { session=await newSession(mobile); }
    catch (e) {item(id).status='BLOCKED';item(id).error=`Browser navigation: ${normalize(e)}`;save();continue;}
    const ok=await run(id,session,async()=>({
      a:await selectCity(session.page,origin(session.page),...a),
      b:await selectCity(session.page,dest(session.page),...b),
      calculation:await calculate(session.page,id),
    }));
    if (ok) analyticsProof = {api:item(id).api,dom:item(id).dom,analytics:item(id).analytics,sourceScenario:id};
    await session.context.close();
  }
  const eighth=item('08');
  const analyticsStatus = classifyAnalyticsCheck({
    interceptedRequests:analyticsProof?.analytics?.intercepted ?? 0,
    blockedRequests:analyticsProof?.analytics?.blocked ?? 0,
    abortErrors:analyticsProof?.analytics?.abortErrors ?? 0,
    apiStatus:analyticsProof?.api?.apiStatus ?? null,
    domStatus:analyticsProof?.dom?.status ?? null,
  });
  eighth.status=analyticsStatus;
  eighth.observation={
    interceptedRequests:analyticsProof?.analytics?.intercepted ?? 0,
    verifiedBlockedRequests:analyticsProof?.analytics?.blocked ?? 0,
    abortErrors:analyticsProof?.analytics?.abortErrors ?? 0,
    apiStatus:analyticsProof?.api?.apiStatus ?? 'NOT_VERIFIED',
    domStatus:analyticsProof?.dom?.status ?? 'NOT_VERIFIED',
    sourceScenario:analyticsProof?.sourceScenario ?? null,
  };
  if (analyticsStatus !== 'PASS') eighth.error='Analytics blocking and a rendered successful calculation were not both observed';
  else eighth.error=null;
} finally {
  if (main) await main.context.close().catch(()=>{});
  await browser.close();
  report.finishedAt=new Date().toISOString();
  report.summary={
    deployedVersionIdentified: Boolean(report.deployedSha),
    pass:report.results.filter(x=>x.status==='PASS').length,
    fail:report.results.filter(x=>x.status==='FAIL').length,
    blocked:report.results.filter(x=>x.status==='BLOCKED').length,
    apiPassUiFail:report.results.filter(x=>x.classification==='API_PASS / UI_FAIL').length,
    notVerified:report.results.filter(x=>x.status==='NOT_VERIFIED'||x.status==='NOT_RUN').length,
  };
  save();
  console.log(JSON.stringify({target:report.target,deployedSha:report.deployedSha,summary:report.summary,output},null,2));
  // A provider outage and a code failure both require honest inspection, not a green test run.
  if (!report.summary.deployedVersionIdentified || report.summary.fail || report.summary.blocked || report.summary.notVerified) process.exitCode=1;
}
