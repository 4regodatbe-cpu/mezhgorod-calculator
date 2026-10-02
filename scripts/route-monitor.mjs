import { writeFile } from "node:fs/promises";

const baseUrl = (process.env.CALCULATOR_URL || "https://mezhgorod-calculator.vercel.app").replace(/\/$/, "");
const expectedCommit = process.env.EXPECTED_COMMIT || "";

const routes = [
  { name: "Анапа — Воронеж", from: [44.894818, 37.316367], to: [51.660781, 39.200296], fast: [970, 1010], free: [1010, 1050], toll: [3000, 6500], expectToll: true, allowUnknownToll: true },
  { name: "Москва — Сочи", from: [55.755819, 37.617644], to: [43.585472, 39.723098], fast: [1500, 1700], free: [1680, 1820], toll: [3500, 11000], expectToll: true },
  { name: "Москва — Краснодар", from: [55.755819, 37.617644], to: [45.03547, 38.975313], fast: [1250, 1420], free: [1380, 1550], toll: [3500, 8500], expectToll: true },
  { name: "Москва — Санкт-Петербург", from: [55.755819, 37.617644], to: [59.938784, 30.314997], fast: [620, 760], free: [680, 850], toll: [2500, 7500], expectToll: true },
  { name: "Москва — Казань", from: [55.755819, 37.617644], to: [55.796127, 49.106405], fast: [750, 950], free: [780, 1050], toll: [3000, 7500], expectToll: true },
  { name: "Ялта — Краснодар", from: [44.495205, 34.166301], to: [45.03547, 38.975313], fast: [430, 620], free: [450, 680], toll: [0, 2500], expectToll: true },
  { name: "Ялта — Москва", from: [44.495205, 34.166301], to: [55.755819, 37.617644], fast: [1750, 1950], free: [1850, 2150], toll: [4500, 10000], expectToll: true },
  { name: "Ейск — Москва", from: [46.711524, 38.276451], to: [55.755819, 37.617644], fast: [1180, 1320], free: [1300, 1600], toll: [1, 8000], expectToll: true },
  { name: "Майкоп — Москва", from: [44.609826, 40.100653], to: [55.755819, 37.617644], fast: [1320, 1460], free: [1450, 1750], toll: [1, 9000], expectToll: true },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDeployment() {
  if (!expectedCommit) return null;
  const deadline = Date.now() + 6 * 60_000;
  let lastCommit = null;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/version?ts=${Date.now()}`, {
        headers: { "cache-control": "no-cache", "user-agent": "MezhgorodRouteMonitor/2.4" },
      });
      const data = await response.json().catch(() => ({}));
      lastCommit = data.commit || null;
      if (response.ok && lastCommit === expectedCommit) {
        console.log(`Проверяется нужный Vercel-деплой: ${lastCommit}`);
        return lastCommit;
      }
      lastError = response.ok ? `production=${lastCommit || "нет SHA"}` : `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    console.log(`Ожидание Vercel: нужен ${expectedCommit.slice(0, 8)}, сейчас ${lastCommit?.slice?.(0, 8) || "неизвестно"}`);
    await sleep(10_000);
  }

  throw new Error(`Vercel не опубликовал commit ${expectedCommit} за 6 минут. Последнее состояние: ${lastError || lastCommit || "неизвестно"}`);
}

function point(name, [lat, lng]) {
  return { label: name, position: { lat, lng } };
}

async function calculate(test, attempt = 1) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const response = await fetch(`${baseUrl}/api/v2/calculate`, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "MezhgorodRouteMonitor/2.4" },
      body: JSON.stringify({
        mode: "standard",
        from: point(test.name.split(" — ")[0], test.from),
        to: point(test.name.split(" — ")[1], test.to),
        departureAt: new Date().toISOString(),
      }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  } catch (error) {
    if (attempt < 2) return calculate(test, attempt + 1);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function inRange(value, [min, max]) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

let deployedCommit = null;
let deploymentError = null;
try {
  deployedCommit = await waitForDeployment();
} catch (error) {
  deploymentError = error instanceof Error ? error.message : String(error);
}

const results = [];
if (!deploymentError) {
  for (const test of routes) {
    try {
      const data = await calculate(test);
      const leg = data.legs?.[0];
      if (!leg?.fast) throw new Error("Не получен быстрый маршрут");

      const fastKm = leg.fast.meters / 1000;
      const freeTrip = leg.free ?? leg.freeCandidate ?? null;
      const freeKm = freeTrip ? freeTrip.meters / 1000 : null;
      const freeKind = leg.free ? "confirmed" : leg.freeCandidate ? "candidate" : "missing";
      const pricingStatus = leg.fast.tolls?.pricingStatus ?? "unknown";
      const toll = pricingStatus === "priced" ? Number(leg.fast.tolls?.amount) : pricingStatus === "free" ? 0 : null;
      const weekdayToll = pricingStatus === "priced" ? Number(leg.fast.tolls?.weekdayAmount) : pricingStatus === "free" ? 0 : null;
      const weekendToll = pricingStatus === "priced" ? Number(leg.fast.tolls?.weekendAmount) : pricingStatus === "free" ? 0 : null;
      const fastTollStatus = leg.fast.tollValidation?.status || "нет";
      const freeTollStatus = freeTrip?.tollValidation?.status || (freeTrip ? "нет" : "маршрут отсутствует");
      const fastTollMessage = leg.fast.tollValidation?.message || "нет сообщения";
      const freeTollMessage = freeTrip?.tollValidation?.message || (freeTrip ? "нет сообщения" : leg.freeError || "маршрут отсутствует");
      const tollDetected = pricingStatus === "priced" || Boolean(leg.fast.tolls?.segments?.length) || fastTollStatus === "toll";
      const pricedValuesValid = pricingStatus === "priced" && [toll, weekdayToll, weekendToll].every((value) => inRange(value, test.toll));
      const safeUnknownValid = Boolean(test.allowUnknownToll && pricingStatus === "unknown" && toll === null && weekdayToll === null && weekendToll === null && tollDetected);
      const tollPriceOk = pricedValuesValid || safeUnknownValid;
      const tollExpectedText = test.allowUnknownToll
        ? `${test.toll[0]}–${test.toll[1]} ₽ для current/weekday/weekend либо безопасный status=unknown без 0 ₽`
        : `${test.toll[0]}–${test.toll[1]} ₽ для current/weekday/weekend и status=priced`;
      const tollActualText = pricingStatus === "unknown"
        ? "unknown (current/weekday/weekend = null, не 0 ₽)"
        : `current=${toll} ₽; weekday=${weekdayToll} ₽; weekend=${weekendToll} ₽`;

      const checks = [
        { label: "быстрый маршрут", ok: inRange(fastKm, test.fast), actual: `${fastKm.toFixed(1)} км`, expected: `${test.fast[0]}–${test.fast[1]} км` },
        { label: "альтернативный маршрут", ok: freeKm !== null && inRange(freeKm, test.free), actual: freeKm === null ? leg.freeError || "нет" : `${freeKm.toFixed(1)} км (${freeKind})`, expected: `${test.free[0]}–${test.free[1]} км` },
        { label: "проверка бесплатности", ok: freeTollStatus !== "toll", actual: `${freeTollStatus}: ${freeTollMessage}`, expected: "free или временно unknown" },
        { label: "обнаружение платности", ok: !test.expectToll || tollDetected, actual: `${pricingStatus}/${fastTollStatus}: ${fastTollMessage}; segments=${leg.fast.tolls?.segments?.length || 0}`, expected: test.expectToll ? "платность обнаружена" : "не обязательно" },
        { label: "стоимость платных дорог", ok: !test.expectToll || tollPriceOk, actual: tollActualText, expected: tollExpectedText },
        { label: "контроль источников", ok: leg.fast.quality?.status !== "warning", actual: `${leg.fast.quality?.status || "нет"}/${freeTrip?.quality?.status || "нет"}`, expected: "быстрый без warning" },
      ];
      results.push({
        name: test.name,
        ok: checks.every((item) => item.ok),
        checks,
        diagnostics: {
          tollPricingStatus: pricingStatus,
          fastTollValidation: leg.fast.tollValidation,
          freeKind,
          freeTollValidation: freeTrip?.tollValidation ?? null,
          freeError: leg.freeError ?? null,
        },
      });
    } catch (error) {
      results.push({ name: test.name, ok: false, error: error instanceof Error ? error.message : String(error), checks: [] });
    }
  }
}

const failed = results.filter((item) => !item.ok);
const generatedAt = new Date().toISOString();
const lines = [
  "# Ежедневная проверка маршрутов",
  "",
  `Дата: ${generatedAt}`,
  `Ожидаемый commit: ${expectedCommit || "не задан"}`,
  `Проверенный production commit: ${deployedCommit || "локальная сборка / не определён"}`,
  `Проверено: ${results.length}. Ошибок: ${failed.length + (deploymentError ? 1 : 0)}.`,
  "",
];

if (deploymentError) {
  lines.push(`❌ Проверка не запущена: ${deploymentError}`, "");
} else {
  lines.push(
    "| Маршрут | Проверка | Фактически | Допустимо | Статус |",
    "|---|---|---:|---:|---|",
  );
  for (const result of results) {
    if (result.error) lines.push(`| ${result.name} | доступность | ${result.error} | успешный ответ | ❌ |`);
    for (const check of result.checks) lines.push(`| ${result.name} | ${check.label} | ${check.actual} | ${check.expected} | ${check.ok ? "✅" : "❌"} |`);
  }
}

lines.push(
  "",
  "Контроль бесплатности использует независимый map matching. Неподтверждённый freeCandidate учитывается как кандидат, но не превращается в подтверждённый бесплатный маршрут. `pricingStatus=unknown` никогда не считается стоимостью 0 ₽. Стоимость контролируется одновременно по текущему, будничному и выходному значениям, поэтому результат мониторинга не зависит от дня запуска. Для маршрутов с известной неполнотой локальной тарификации `unknown` допустим только как fail-closed состояние: платность должна быть обнаружена, а все суммы обязаны оставаться `null`.",
  "",
  "Отчёт сформирован автоматически. Изменения в рабочую версию автоматически не публикуются.",
);

await Promise.all([
  writeFile("route-report.md", `${lines.join("\n")}\n`),
  writeFile("route-report.json", `${JSON.stringify({ generatedAt, baseUrl, expectedCommit, deployedCommit, deploymentError, results }, null, 2)}\n`),
]);

console.log(lines.join("\n"));
if (deploymentError || failed.length) process.exitCode = 1;
