import { writeFile } from "node:fs/promises";

const baseUrl = (process.env.CALCULATOR_URL || "https://mezhgorod-calculator.vercel.app").replace(/\/$/, "");

const routes = [
  { name: "Москва — Сочи", from: [55.755819, 37.617644], to: [43.585472, 39.723098], fast: [1500, 1700], free: [1680, 1820], toll: [3500, 7000] },
  { name: "Москва — Краснодар", from: [55.755819, 37.617644], to: [45.03547, 38.975313], fast: [1250, 1420], free: [1380, 1550], toll: [3500, 7000] },
  { name: "Москва — Санкт-Петербург", from: [55.755819, 37.617644], to: [59.938784, 30.314997], fast: [620, 760], free: [680, 850], toll: [2500, 6500] },
  { name: "Москва — Казань", from: [55.755819, 37.617644], to: [55.796127, 49.106405], fast: [750, 950], free: [780, 1050], toll: [3500, 7500] },
  { name: "Ялта — Краснодар", from: [44.495205, 34.166301], to: [45.03547, 38.975313], fast: [430, 620], free: [450, 680], toll: [0, 2000] },
];

function point(name, [lat, lng]) {
  return { label: name, position: { lat, lng } };
}

async function calculate(test, attempt = 1) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 75_000);
  try {
    const response = await fetch(`${baseUrl}/api/v2/calculate`, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "MezhgorodRouteMonitor/1.0" },
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
  return value >= min && value <= max;
}

const results = [];
for (const test of routes) {
  try {
    const data = await calculate(test);
    const leg = data.legs?.[0];
    if (!leg?.fast || !leg?.free) throw new Error("Получен неполный расчёт");
    const fastKm = leg.fast.meters / 1000;
    const freeKm = leg.free.meters / 1000;
    const toll = Number(leg.fast.tolls?.amount || 0);
    const checks = [
      { label: "быстрый маршрут", ok: inRange(fastKm, test.fast), actual: `${fastKm.toFixed(1)} км`, expected: `${test.fast[0]}–${test.fast[1]} км` },
      { label: "без платных дорог", ok: inRange(freeKm, test.free), actual: `${freeKm.toFixed(1)} км`, expected: `${test.free[0]}–${test.free[1]} км` },
      { label: "платные участки", ok: inRange(toll, test.toll), actual: `${toll} ₽`, expected: `${test.toll[0]}–${test.toll[1]} ₽` },
      { label: "контроль источников", ok: leg.fast.quality?.status !== "warning" && leg.free.quality?.status !== "warning", actual: `${leg.fast.quality?.status || "нет"}/${leg.free.quality?.status || "нет"}`, expected: "без warning" },
    ];
    results.push({ name: test.name, ok: checks.every((item) => item.ok), checks });
  } catch (error) {
    results.push({ name: test.name, ok: false, error: error instanceof Error ? error.message : String(error), checks: [] });
  }
}

const failed = results.filter((item) => !item.ok);
const generatedAt = new Date().toISOString();
const lines = [
  "# Ежедневная проверка маршрутов",
  "",
  `Дата: ${generatedAt}`,
  `Проверено: ${results.length}. Ошибок: ${failed.length}.`,
  "",
  "| Маршрут | Проверка | Фактически | Допустимо | Статус |",
  "|---|---|---:|---:|---|",
];
for (const result of results) {
  if (result.error) lines.push(`| ${result.name} | доступность | ${result.error} | успешный ответ | ❌ |`);
  for (const check of result.checks) lines.push(`| ${result.name} | ${check.label} | ${check.actual} | ${check.expected} | ${check.ok ? "✅" : "❌"} |`);
}
lines.push("", "Отчёт сформирован автоматически. Изменения в рабочую версию автоматически не публикуются.");

await Promise.all([
  writeFile("route-report.md", `${lines.join("\n")}\n`),
  writeFile("route-report.json", `${JSON.stringify({ generatedAt, baseUrl, results }, null, 2)}\n`),
]);

console.log(lines.join("\n"));
if (failed.length) process.exitCode = 1;
