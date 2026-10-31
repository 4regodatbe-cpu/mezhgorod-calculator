import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repo = process.cwd();
const outputDir = path.resolve(process.env.B03_OUTPUT_DIR ?? "b03-browser-results");
mkdirSync(outputDir, { recursive: true });
const snapshot = JSON.parse(readFileSync(path.join(repo, "data/address-city-snapshot.json"), "utf8"));
const startedAt = new Date().toISOString();
const expiry = Date.parse(snapshot.expiresAt);
const sourceSha256 = createHash("sha256").update(JSON.stringify(snapshot.records)).digest("hex");
const environment = {
  startedAt,
  runnerOs: process.env.RUNNER_OS ?? process.platform,
  node: process.version,
  chrome: process.env.CHROME_VERSION ?? "unknown",
  commit: process.env.GITHUB_SHA ?? "local",
  viewportSet: [
    { width: 1280, height: 900 },
    { width: 320, height: 720 },
  ],
  snapshotId: snapshot.snapshotId,
  snapshotExpiresAt: snapshot.expiresAt,
  snapshotRecordsSha256: snapshot.recordsSha256,
  snapshotRecordsHashVerified: sourceSha256 === snapshot.recordsSha256,
};
writeFileSync(path.join(outputDir, "environment.json"), JSON.stringify(environment, null, 2) + "\n");

const caseSpecs = [
  ["01-donetsk-disambiguation", "Two distinct Donetsk results in A; no auto-selection, notice and OSM attribution"],
  ["02-select-a-and-b", "Select exact fallback items in both fields and retain source metadata/positions"],
  ["03-swap-and-reset", "Swap selected A/B values and source metadata; reset existing calculation result"],
  ["04-clear-and-replace-b", "Clear B and replace its city without stale items or source state"],
  ["05-stale-response-race", "Delayed response for old B query cannot restore stale data after a new query"],
  ["06-normal-empty-error-retry", "Normal, empty, 502 and retry responses preserve correct UI state"],
  ["07-fallback-not-in-legacy-cache", "Fallback repeats a fresh request while ordinary positive cache remains effective"],
  ["08-mobile-keyboard", "Narrow viewport, attribution, keyboard selection, clear and swap controls"],
];
const results = [];
const resultsPath = path.join(outputDir, "scenarios.json");
const persist = () => writeFileSync(resultsPath, JSON.stringify({ environment, results }, null, 2) + "\n");

if (!Number.isFinite(expiry) || Date.now() >= expiry) {
  for (const [id, name] of caseSpecs) results.push({ id, name, status: "NOT_RUN", reason: "BLOCKED_BY_EXPIRED_SNAPSHOT" });
  persist();
  console.error(`BLOCKED_BY_EXPIRED_SNAPSHOT: expiresAt=${snapshot.expiresAt}; no snapshot items used`);
  process.exitCode = 2;
} else if (!environment.snapshotRecordsHashVerified) {
  for (const [id, name] of caseSpecs) results.push({ id, name, status: "NOT_RUN", reason: "BLOCKED_BY_SNAPSHOT_HASH_MISMATCH" });
  persist();
  console.error("BLOCKED_BY_SNAPSHOT_HASH_MISMATCH: no snapshot items used");
  process.exitCode = 2;
} else {
  const playwrightPath = process.env.PLAYWRIGHT_MODULE;
  const baseUrl = process.env.B03_BASE_URL ?? "http://127.0.0.1:3000";
  if (!playwrightPath) throw new Error("PLAYWRIGHT_MODULE must point to the pinned Playwright ESM entrypoint");
  const { chromium } = await import(pathToFileURL(playwrightPath).href);
  const records = snapshot.records;
  const donetsk = records.filter(record => record.searchNames.includes("Донецк")).map(record => record.suggestion);
  const krasnodar = records.find(record => record.searchNames.includes("Краснодар"))?.suggestion;
  const rostov = records.find(record => record.searchNames.includes("Ростов-на-Дону"))?.suggestion;
  assert.equal(donetsk.length, 2, "reviewed snapshot must contain both distinct Donetsk records");
  assert.ok(krasnodar && rostov, "reviewed snapshot must contain the expected replacement cities");

  const fallbackResponse = items => ({
    status: 200,
    body: { items, fallback: { source: "reviewed_city_snapshot", scope: snapshot.scope, snapshotId: snapshot.snapshotId } },
  });
  const standardSuggestion = {
    id: "QA-NORMAL-001",
    title: "Москва",
    label: "Москва, Россия",
    region: "Москва, Россия",
    position: { lat: 55.7558, lng: 37.6173 },
  };
  const normalResponse = { status: 200, body: { items: [standardSuggestion] } };
  const calcFare = {
    totalPrice: 100,
    requiresSplit: false,
    reviewRequired: false,
    dualTariff: false,
    pricingSegments: [],
  };
  const calcResponse = {
    status: 200,
    body: {
      automaticMode: "standard",
      legs: [{
        from: "QA A",
        to: "QA B",
        fast: {
          meters: 10000,
          seconds: 900,
          tolls: { amount: null, weekdayAmount: null, weekendAmount: null, period: "QA unknown", segments: [], confidence: "none", pricingStatus: "unknown" },
          pricingByVehicle: Object.fromEntries(["standard", "comfort", "comfort_plus", "minivan"].map(key => [key, calcFare])),
        },
        free: null,
      }],
    },
  };
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const defaultAddressAnswer = async query => {
    if (query === "Краснодар") return fallbackResponse([krasnodar]);
    if (query === "Ростов-на-Дону") return fallbackResponse([rostov]);
    return fallbackResponse(donetsk);
  };

  async function openHarness({ viewport = { width: 1280, height: 900 }, answerAddress = () => fallbackResponse(donetsk) } = {}) {
    const context = await browser.newContext({ viewport, serviceWorkers: "block" });
    const state = { requests: [], calculationBodies: [], blockedExternalHosts: [], pageErrors: [], routeErrors: [] };
    await context.route("**/*", async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.host !== new URL(baseUrl).host) {
        state.blockedExternalHosts.push(url.host);
        await route.abort("blockedbyclient");
        return;
      }
      if (url.pathname === "/r" && request.method() === "POST") {
        let query = "";
        try { query = JSON.parse(request.postData() ?? "{}").query ?? ""; } catch { /* the evidence records no raw query */ }
        state.requests.push({ path: "/r", method: "POST", querySha256: createHash("sha256").update(String(query)).digest("hex") });
        try {
          const response = await answerAddress(String(query), state.requests.filter(item => item.path === "/r").length);
          if (response.delayMs) await delay(response.delayMs);
          await route.fulfill({ status: response.status, contentType: "application/json", body: JSON.stringify(response.body) });
        } catch (error) {
          const failure = request.failure()?.errorText ?? "";
          if (!failure.includes("ERR_ABORTED")) state.routeErrors.push(String(error));
        }
        return;
      }
      if (url.pathname === "/api/collect" && request.method() === "POST") {
        state.requests.push({ path: "/api/collect", method: "POST" });
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
        return;
      }
      if (url.pathname === "/api/v2/classify" && request.method() === "POST") {
        state.requests.push({ path: "/api/v2/classify", method: "POST" });
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ mode: "standard" }) });
        return;
      }
      if (url.pathname === "/api/v2/calculate" && request.method() === "POST") {
        try { state.calculationBodies.push(request.postDataJSON()); } catch { state.calculationBodies.push(null); }
        state.requests.push({ path: "/api/v2/calculate", method: "POST" });
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(calcResponse.body) });
        return;
      }
      await route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on("pageerror", error => state.pageErrors.push(error.message));
    const appHydrated = page.waitForRequest(request => {
      const url = new URL(request.url());
      return url.pathname === "/api/collect" && request.method() === "POST";
    });
    await page.goto(`${baseUrl}/v2`, { waitUntil: "domcontentloaded" });
    await page.locator('input[placeholder="Откуда"]').waitFor({ state: "visible" });
    await appHydrated;
    return { context, page, state };
  }

  const inputA = page => page.locator('input[placeholder="Откуда"]');
  const inputB = page => page.locator('input[placeholder="Куда"]');
  const fieldFor = input => input.locator("xpath=ancestor::label[1]");
  const buttonsFor = input => fieldFor(input).locator('[role="status"] button');
  const noticeFor = input => fieldFor(input).getByText("Резервный поиск: только сохранённые города.");
  const requestForQuery = (page, query) => page.waitForRequest(request => {
    const url = new URL(request.url());
    if (url.pathname !== "/r" || request.method() !== "POST") return false;
    try { return JSON.parse(request.postData() ?? "{}").query === query; } catch { return false; }
  });
  async function search(page, input, query) {
    const request = requestForQuery(page, query);
    await input.fill(query);
    await request;
    await buttonsFor(input).first().waitFor({ state: "visible" });
  }
  async function selectItem(input, item) {
    await buttonsFor(input).filter({ hasText: item.label }).first().click();
  }
  async function prepareSelectedRoute(page) {
    await search(page, inputA(page), "Донецк");
    await selectItem(inputA(page), donetsk[0]);
    await search(page, inputB(page), "Донецк");
    await selectItem(inputB(page), donetsk[1]);
    const calculation = page.waitForRequest(request => new URL(request.url()).pathname === "/api/v2/calculate");
    await page.getByRole("button", { name: "Рассчитать поездку" }).first().click();
    await calculation;
    await page.getByRole("heading", { name: "Основной маршрут" }).waitFor({ state: "visible" });
  }
  async function screenshot(page, id, suffix) {
    const name = `${id}${suffix}.png`;
    const full = path.join(outputDir, name);
    await page.screenshot({ path: full, fullPage: true });
    const sha256 = createHash("sha256").update(readFileSync(full)).digest("hex");
    return { file: name, sha256 };
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-background-networking", "--disable-extensions", "--disable-sync"],
  });
  environment.browserVersion = browser.version();
  writeFileSync(path.join(outputDir, "environment.json"), JSON.stringify(environment, null, 2) + "\n");

  async function runCase(id, name, viewport, fn, answerAddress = defaultAddressAnswer) {
    const record = { id, name, status: "RUNNING", startedAt: new Date().toISOString(), viewport, requestCount: 0, addressRequestCount: 0, blockedExternalRequestCount: 0, evidence: [] };
    let harness;
    try {
      harness = await openHarness({ viewport, answerAddress });
      await fn({ ...harness, record, helpers: { inputA, inputB, fieldFor, buttonsFor, noticeFor, search, selectItem, prepareSelectedRoute, screenshot, fallbackResponse, normalResponse, donetsk, krasnodar, rostov, standardSuggestion } });
      assert.equal(harness.state.blockedExternalHosts.length, 0, `unexpected browser request to external host(s): ${harness.state.blockedExternalHosts.join(", ")}`);
      assert.deepEqual(harness.state.routeErrors, [], "mock route handler error");
      assert.deepEqual(harness.state.pageErrors, [], "uncaught browser page error");
      record.status = "PASS";
    } catch (error) {
      record.status = "FAIL";
      record.error = error instanceof Error ? error.message : String(error);
      if (harness?.page && !record.evidence.some(item => item.file.endsWith(".png"))) {
        try { record.evidence.push(await screenshot(harness.page, id, "-failure")); } catch { /* browser may already be closed */ }
      }
    } finally {
      if (harness) {
        record.requestCount = harness.state.requests.length;
        record.addressRequestCount = harness.state.requests.filter(item => item.path === "/r").length;
        record.requestPaths = harness.state.requests.map(item => item.path);
        record.blockedExternalRequestCount = harness.state.blockedExternalHosts.length;
        record.pageErrors = harness.state.pageErrors;
        record.routeErrors = harness.state.routeErrors;
        record.finishedAt = new Date().toISOString();
        record.viewport = harness.page.viewportSize();
        await harness.context.close();
      }
      results.push(record);
      persist();
      console.log(`${record.status} ${record.id}: requests=${record.requestCount}, externalBlocked=${record.blockedExternalRequestCount}${record.error ? `; ${record.error}` : ""}`);
    }
  }

  await runCase(caseSpecs[0][0], caseSpecs[0][1], { width: 1280, height: 900 }, async ({ page, record, helpers: h }) => {
    const a = h.inputA(page), menu = h.buttonsFor(a);
    await h.search(page, a, "Донецк");
    const texts = await menu.allTextContents();
    const value = await a.inputValue();
    const notice = await h.noticeFor(a).count();
    const credit = page.locator('input[placeholder="Откуда"]').locator("xpath=ancestor::label[1]").locator('a[href="https://www.openstreetmap.org/copyright"]');
    const creditCount = await credit.count();
    record.actual = { suggestionCount: await menu.count(), suggestionTexts: texts, inputValue: value, noticeCount: notice, creditHref: await credit.getAttribute("href"), creditCount };
    assert.equal(await menu.count(), 2, "A must show exactly the two distinct Donetsk records");
    assert.equal(value, "Донецк", "query must remain unselected until the user chooses an item");
    assert.equal(notice, 1, "limited-snapshot notice must be visible");
    assert.equal(creditCount, 1, "OSM/ODbL credit link must be visible");
    assert.equal(await credit.getAttribute("href"), "https://www.openstreetmap.org/copyright");
    assert.ok(texts.some(text => text.includes(donetsk[0].label)) && texts.some(text => text.includes(donetsk[1].label)), "both reviewed labels must be present");
  });

  await runCase(caseSpecs[1][0], caseSpecs[1][1], { width: 1280, height: 900 }, async ({ page, state, record, helpers: h }) => {
    const a = h.inputA(page), b = h.inputB(page);
    await h.search(page, a, "Донецк"); await h.selectItem(a, donetsk[0]);
    await h.search(page, b, "Донецк"); await h.selectItem(b, donetsk[1]);
    assert.equal(await a.inputValue(), donetsk[0].label);
    assert.equal(await b.inputValue(), donetsk[1].label);
    assert.equal(await h.noticeFor(a).count(), 1);
    assert.equal(await h.noticeFor(b).count(), 1);
    const calcRequest = page.waitForRequest(request => new URL(request.url()).pathname === "/api/v2/calculate");
    await page.getByRole("button", { name: "Рассчитать поездку" }).first().click();
    await calcRequest;
    await page.getByRole("heading", { name: "Основной маршрут" }).waitFor({ state: "visible" });
    const body = state.calculationBodies[0];
    record.actual = { selectedA: await a.inputValue(), selectedB: await b.inputValue(), addressSources: [body?.from?.addressSource, body?.to?.addressSource], positions: [body?.from?.position, body?.to?.position], noticeCounts: [await h.noticeFor(a).count(), await h.noticeFor(b).count()] };
    assert.deepEqual(body?.from?.position, donetsk[0].position, "A calculation request must retain the exact selected coordinate");
    assert.deepEqual(body?.to?.position, donetsk[1].position, "B calculation request must retain the exact selected coordinate");
    assert.equal(body?.from?.addressSource, "reviewed_city_snapshot");
    assert.equal(body?.to?.addressSource, "reviewed_city_snapshot");
    assert.deepEqual(record.actual.noticeCounts, [1, 1]);
  });

  await runCase(caseSpecs[2][0], caseSpecs[2][1], { width: 1280, height: 900 }, async ({ page, record, helpers: h }) => {
    await h.prepareSelectedRoute(page);
    const swap = page.getByRole("button", { name: "Поменять точки A и B местами" });
    const swapCount = await swap.count();
    record.actual = { resultVisibleBeforeSwap: await page.getByRole("heading", { name: "Основной маршрут" }).count(), swapButtonCount: swapCount };
    if (swapCount === 0) throw new Error("expected A↔B swap control is absent from the V2 page");
    await swap.click();
    record.actual.valuesAfterSwap = [await h.inputA(page).inputValue(), await h.inputB(page).inputValue()];
    record.actual.noticesAfterSwap = [await h.noticeFor(h.inputA(page)).count(), await h.noticeFor(h.inputB(page)).count()];
    record.actual.resultCountAfterSwap = await page.getByRole("heading", { name: "Основной маршрут" }).count();
    assert.deepEqual(record.actual.valuesAfterSwap, [donetsk[1].label, donetsk[0].label]);
    assert.deepEqual(record.actual.noticesAfterSwap, [1, 1]);
    assert.equal(record.actual.resultCountAfterSwap, 0, "swap should reset the previous calculation result");
  });

  await runCase(caseSpecs[3][0], caseSpecs[3][1], { width: 1280, height: 900 }, async ({ page, state, record, helpers: h }) => {
    const b = h.inputB(page);
    await h.search(page, b, "Краснодар");
    await h.selectItem(b, krasnodar);
    assert.equal(await b.inputValue(), krasnodar.label);
    assert.equal(await h.noticeFor(b).count(), 1);
    await page.getByRole("button", { name: "Очистить поле «Точка B»" }).click();
    assert.equal(await b.inputValue(), "");
    assert.equal(await h.noticeFor(b).count(), 0);
    assert.equal(await h.buttonsFor(b).count(), 0);
    const before = state.requests.filter(item => item.path === "/r").length;
    await h.search(page, b, "Ростов-на-Дону");
    const button = h.buttonsFor(b).filter({ hasText: rostov.label }).first();
    record.actual = { beforeReplacement: before, afterNewQuery: state.requests.filter(item => item.path === "/r").length, staleSuggestions: await h.buttonsFor(b).allTextContents() };
    assert.equal(record.actual.afterNewQuery, before + 1, "replacement should issue a new /r request");
    await button.click();
    record.actual.selectedB = await b.inputValue();
    record.actual.noticeAfterSelection = await h.noticeFor(b).count();
    assert.equal(record.actual.selectedB, rostov.label);
    assert.equal(record.actual.noticeAfterSelection, 1);
  });

  await runCase(caseSpecs[4][0], caseSpecs[4][1], { width: 1280, height: 900 }, async ({ page, state, record, helpers: h }) => {
    const b = h.inputB(page);
    const oldQuery = "Донецк";
    const newQuery = "Краснодар";
    const firstRequest = requestForQuery(page, oldQuery);
    await b.fill(oldQuery);
    await firstRequest;
    const nextRequest = requestForQuery(page, newQuery);
    await b.fill(newQuery);
    await nextRequest;
    await h.buttonsFor(b).first().waitFor({ state: "visible" });
    await delay(1700);
    const labels = await h.buttonsFor(b).allTextContents();
    record.actual = { currentValue: await b.inputValue(), visibleSuggestions: labels, oldResponseArrivedAfterEdit: state.requests.filter(item => item.path === "/r").length === 2, pageErrors: state.pageErrors };
    assert.equal(record.actual.currentValue, newQuery);
    assert.equal(labels.length, 1);
    assert.ok(labels[0].includes(krasnodar.label), "new response must remain displayed");
    assert.ok(!labels.some(label => label.includes(donetsk[0].label) || label.includes(donetsk[1].label)), "stale Donetsk response must not restore old items");
    assert.deepEqual(state.pageErrors, [], "aborted old response must not cause an uncaught error");
  }, async query => query === "Донецк" ? { ...fallbackResponse(donetsk), delayMs: 1800 } : fallbackResponse([krasnodar]));

  await runCase(caseSpecs[5][0], caseSpecs[5][1], { width: 1280, height: 900 }, async ({ page, state, record, helpers: h }) => {
    const a = h.inputA(page);
    await h.search(page, a, "Москва");
    assert.equal(await h.noticeFor(a).count(), 0, "ordinary results must not show snapshot notice");
    assert.equal(await h.buttonsFor(a).count(), 1);
    await page.getByRole("button", { name: "Очистить поле «Точка A»" }).click();
    const emptyRequest = requestForQuery(page, "Неттакого");
    await a.fill("Неттакого"); await emptyRequest;
    await page.getByText("Ничего не найдено. Уточните название или добавьте область.").waitFor({ state: "visible" });
    assert.equal(await h.buttonsFor(a).count(), 0, "empty response must not leave old items selectable");
    await page.getByRole("button", { name: "Очистить поле «Точка A»" }).click();
    const failRequest = requestForQuery(page, "Сбой");
    await a.fill("Сбой"); await failRequest;
    await page.getByText("Сервис поиска временно недоступен.").waitFor({ state: "visible" });
    const selectableTitlesAfterFailure = await h.fieldFor(a).locator('[role="status"] button strong').allTextContents();
    record.actual = { selectableTitlesAfterFailure, retryVisible: await page.getByRole("button", { name: "Повторить" }).count() === 1 };
    assert.deepEqual(selectableTitlesAfterFailure, [], "502 must not leave old suggestion items selectable");
    const beforeRetry = state.requests.filter(item => item.path === "/r").length;
    const retryRequest = page.waitForRequest(request => new URL(request.url()).pathname === "/r");
    await page.getByRole("button", { name: "Повторить" }).click();
    await retryRequest;
    await h.buttonsFor(a).first().waitFor({ state: "visible" });
    record.actual = { ...record.actual, requestCount: state.requests.filter(item => item.path === "/r").length, requestsBeforeRetry: beforeRetry, emptyMessageVisible: true, retryResult: await h.buttonsFor(a).allTextContents(), noticeCount: await h.noticeFor(a).count() };
    assert.equal(record.actual.requestCount, beforeRetry + 1, "retry must issue a new /r request");
    assert.equal(record.actual.noticeCount, 0);
  }, async (query, count) => {
    if (query === "Москва") return normalResponse;
    if (query === "Неттакого") return { status: 200, body: { items: [] } };
    if (query === "Сбой" && count === 3) return { status: 502, body: { error: "controlled outage" } };
    return normalResponse;
  });

  await runCase(caseSpecs[6][0], caseSpecs[6][1], { width: 1280, height: 900 }, async ({ page, state, record, helpers: h }) => {
    const a = h.inputA(page);
    await h.search(page, a, "Донецк");
    assert.equal(await h.buttonsFor(a).count(), 2);
    await page.getByRole("button", { name: "Очистить поле «Точка A»" }).click();
    await h.search(page, a, "Донецк");
    const fallbackRequestCount = state.requests.filter(item => item.path === "/r").length;
    assert.equal(fallbackRequestCount, 2, "fallback results must not be restored from the legacy positive cache");
    await page.getByRole("button", { name: "Очистить поле «Точка A»" }).click();
    await h.search(page, a, "Москва");
    const beforeCache = state.requests.filter(item => item.path === "/r").length;
    await page.getByRole("button", { name: "Очистить поле «Точка A»" }).click();
    await a.fill("Москва");
    await delay(700);
    record.actual = { fallbackRequests: fallbackRequestCount, ordinaryRequestsBeforePositiveCache: beforeCache, requestsAfterCacheHit: state.requests.filter(item => item.path === "/r").length, cachedSuggestions: await h.buttonsFor(a).allTextContents() };
    assert.equal(record.actual.requestsAfterCacheHit, beforeCache, "ordinary positive cache should avoid an extra /r request");
    assert.equal(await h.buttonsFor(a).count(), 1, "ordinary cached item should remain available");
  }, async query => query === "Москва" ? normalResponse : defaultAddressAnswer(query));

  await runCase(caseSpecs[7][0], caseSpecs[7][1], { width: 320, height: 720 }, async ({ page, record, helpers: h }) => {
    const a = h.inputA(page);
    await h.search(page, a, "Донецк");
    const field = h.fieldFor(a);
    const credit = field.locator('a[href="https://www.openstreetmap.org/copyright"]');
    const swap = page.getByRole("button", { name: "Поменять точки A и B местами" });
    const clear = page.getByRole("button", { name: "Очистить поле «Точка A»" });
    const menu = field.locator('[role="status"]');
    const menuBox = await menu.boundingBox();
    record.evidence.push(await h.screenshot(page, record.id, "-mobile"));
    record.actual = {
      viewport: page.viewportSize(),
      documentScrollWidth: await page.evaluate(() => document.documentElement.scrollWidth),
      menuBounds: menuBox,
      creditVisible: await credit.isVisible(),
      clearVisible: await clear.isVisible(),
      swapVisible: await swap.count() > 0 && await swap.isVisible(),
    };
    assert.equal(record.actual.documentScrollWidth, 320, "narrow page should not horizontally overflow");
    assert.ok(menuBox && menuBox.x >= 0 && menuBox.x + menuBox.width <= 320, "dropdown should fit the viewport");
    assert.equal(record.actual.creditVisible, true);
    assert.equal(record.actual.clearVisible, true);
    await a.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const focusedText = await page.evaluate(() => document.activeElement?.textContent ?? "");
    record.actual.keyboardFocusedSuggestion = focusedText;
    await page.keyboard.press("Enter");
    record.actual.selectedByKeyboard = await a.inputValue();
    record.actual.noticeAfterKeyboardSelection = await h.noticeFor(a).count();
    assert.ok(record.actual.keyboardFocusedSuggestion.includes(donetsk[0].title), "keyboard focus should reach the first suggestion");
    assert.equal(record.actual.selectedByKeyboard, donetsk[0].label);
    assert.equal(record.actual.noticeAfterKeyboardSelection, 1);
    assert.equal(record.actual.swapVisible, true, "A↔B control must remain available on narrow screens");
  });

  await browser.close();
  const failures = results.filter(result => result.status !== "PASS");
  const summary = { finishedAt: new Date().toISOString(), status: failures.length ? "FAIL" : "PASS", passed: results.filter(result => result.status === "PASS").length, failed: failures.length, notRun: results.filter(result => result.status === "NOT_RUN").length, resultsPath };
  writeFileSync(path.join(outputDir, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify(summary));
  if (failures.length) process.exitCode = 1;
}
