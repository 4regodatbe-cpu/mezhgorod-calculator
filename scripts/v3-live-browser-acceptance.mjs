// V3 read-only, live end-to-end acceptance. No route/address response mocking.
// Requires a public deployment and GitHub Actions' pinned Chrome/Playwright environment.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

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
  await context.route('**/api/collect', route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.setDefaultTimeout(25000);
  await page.goto(base.href, {waitUntil: 'domcontentloaded', timeout: 60000});
  await page.locator('input[placeholder="Откуда"]').waitFor({state:'visible'});
  return {context, page, pageErrors};
}
const origin = page => page.locator('input[placeholder="Откуда"]');
const dest = page => page.locator('input[placeholder="Куда"]');
const parent = field => field.locator('xpath=ancestor::label[1]');

async function selectCity(page, field, query, labelFilter = '') {
  await field.fill(query);
  const options = parent(field).locator('[role="status"] button');
  await options.first().waitFor({state:'visible', timeout: 30000});
  const total = await options.count();
  let chosen = null;
  for (let i=0; i<total; i++) {
    const button = options.nth(i);
    const content = await button.innerText();
    if (content.includes(query) && (!labelFilter || content.includes(labelFilter))) {chosen = button; break;}
  }
  if (!chosen) throw new Error(`Live suggestions did not contain ${query} / ${labelFilter}; ${total} option(s)`);
  const selectedLabel = await chosen.innerText();
  await chosen.click();
  assert.ok((await field.inputValue()).trim().length > 0, 'Selection did not set field');
  return {query, selectedLabel, selectedValue:await field.inputValue()};
}
async function calculate(page, caseId) {
  const started = Date.now();
  const apiResponse = page.waitForResponse(r => {
    try {return new URL(r.url()).pathname === '/api/v3/calculate' && r.request().method() === 'POST';}
    catch {return false;}
  }, {timeout: 180000});
  await page.getByRole('button', {name: 'Рассчитать поездку'}).click();
  const response = await apiResponse;
  let payload = null;
  try { payload = await response.json(); } catch { /* preserve explicit non-JSON error */ }
  const observation = {
    status: response.status(),
    elapsedMs: Date.now() - started,
    error: typeof payload?.error === 'string' ? payload.error : null,
  };
  if (!response.ok()) {
    const e = new Error(`V3 returned HTTP ${response.status()}: ${observation.error ?? 'non-JSON response'}`);
    e.observation = observation;
    throw e;
  }
  const trip = payload?.options?.[0]?.fast ?? payload?.legs?.[0]?.fast;
  assert.ok(trip && Number.isFinite(trip.meters) && trip.meters > 0, 'No positive real distance in V3 response');
  assert.ok(Number.isFinite(trip.seconds) && trip.seconds > 0, 'No positive real travel duration');
  const card = page.locator('article').filter({hasText:routeHeading}).first();
  await card.waitFor({state:'visible', timeout: 18000});
  const distanceText = `${(trip.meters / 1000).toLocaleString('ru-RU', {maximumFractionDigits:1})} км`;
  const roundedMinutes = Math.round(trip.seconds / 60);
  const durationText = `${Math.floor(roundedMinutes / 60)} ч ${roundedMinutes % 60} мин`;
  await card.getByText(distanceText, {exact:true}).waitFor({state:'visible', timeout:5000});
  await card.getByText(durationText, {exact:true}).waitFor({state:'visible', timeout:5000});
  observation.distanceKm = Math.round(trip.meters / 100) / 10;
  observation.durationMin = Math.round(trip.seconds / 60);
  observation.displayedDistance = distanceText;
  observation.displayedDuration = durationText;
  observation.displayedTollSummary = (await card.innerText()).split('\n').filter(line => /₽|неизвестна|Бесплатно/u.test(line)).join(' | ');
  observation.specialOnly = payload.specialOnly === true;
  observation.tollPricingStatus = trip.tolls?.pricingStatus ?? null;
  observation.vehiclePricingAvailable = Boolean(trip.pricingByVehicle);
  await page.screenshot({path:path.join(output, `${caseId}-result.png`), fullPage:true});
  return observation;
}
async function run(id, session, execute) {
  const target = item(id);
  target.status = 'RUNNING'; save();
  try {
    const data = await execute();
    target.status = 'PASS'; target.observation = data;
  } catch (e) {
    target.status = 'FAIL'; target.error = normalize(e);
    if (e?.observation) target.observation = e.observation;
    if (session?.page && !session.page.isClosed()) {
      try { await session.page.screenshot({path:path.join(output,`${id}-failure.png`),fullPage:true}); }
      catch { /* do not obscure original failure */ }
    }
  } finally {
    target.pageErrors = session?.pageErrors?.slice(0,10) ?? [];
    if (target.status === 'PASS' && target.pageErrors.length) {
      target.status = 'FAIL'; target.error = `Uncaught page errors: ${target.pageErrors.join('; ')}`;
    }
    save();
  }
  return target.status === 'PASS';
}

let main = null;
let anySuccessfulCalc = false;
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
    anySuccessfulCalc ||= first;
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
        await page.getByText(routeHeading).first().waitFor({state:'hidden',timeout:5000});
        const selection=await selectCity(page,field,city,filter);
        return {prior,selection,calculation:await calculate(page,id)};
      });
      anySuccessfulCalc ||= ok;
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
    anySuccessfulCalc ||= ok;
    await session.context.close();
  }
  const eighth=item('08');
  if (anySuccessfulCalc) {
    eighth.status='PASS';
    eighth.observation='Every browser context deliberately aborted /api/collect; a real V3 response still rendered successfully.';
  } else {
    eighth.status='NOT_VERIFIED';
    eighth.error='No successful calculation to establish analytics independence';
  }
} finally {
  if (main) await main.context.close().catch(()=>{});
  await browser.close();
  report.finishedAt=new Date().toISOString();
  report.summary={
    deployedVersionIdentified: Boolean(report.deployedSha),
    pass:report.results.filter(x=>x.status==='PASS').length,
    fail:report.results.filter(x=>x.status==='FAIL').length,
    blocked:report.results.filter(x=>x.status==='BLOCKED').length,
    notVerified:report.results.filter(x=>x.status==='NOT_VERIFIED'||x.status==='NOT_RUN').length,
  };
  save();
  console.log(JSON.stringify({target:report.target,deployedSha:report.deployedSha,summary:report.summary,output},null,2));
  // A provider outage and a code failure both require honest inspection, not a green test run.
  if (!report.summary.deployedVersionIdentified || report.summary.fail || report.summary.blocked || report.summary.notVerified) process.exitCode=1;
}
