import { writeFile } from "node:fs/promises";

const baseUrl = (process.env.CALCULATOR_URL || "").replace(/\/$/, "");
const expectedCommit = process.env.EXPECTED_COMMIT || "";
if (!baseUrl) throw new Error("CALCULATOR_URL is required");

const points = {
  moscow: { label: "Москва", position: { lat: 55.755819, lng: 37.617644 } },
  yeisk: { label: "Ейск", position: { lat: 46.711524, lng: 38.276451 } },
  maykop: { label: "Майкоп", position: { lat: 44.609826, lng: 40.100653 } },
  yalta: { label: "Ялта", position: { lat: 44.495205, lng: 34.166301 } },
  krasnodar: { label: "Краснодар", position: { lat: 45.03547, lng: 38.975313 } },
  sochi: { label: "Сочи", position: { lat: 43.585472, lng: 39.723098 } },
  spb: { label: "Санкт-Петербург", position: { lat: 59.938784, lng: 30.314997 } },
  kazan: { label: "Казань", position: { lat: 55.796127, lng: 49.106405 } },
};

const exactM4 = [
  ["yeisk-moscow", points.yeisk, points.moscow, 5240, 7240],
  ["moscow-yeisk", points.moscow, points.yeisk, 5240, 7240],
  ["maykop-moscow", points.maykop, points.moscow, 6090, 8400],
  ["moscow-maykop", points.moscow, points.maykop, 6090, 8400],
  ["krasnodar-moscow", points.krasnodar, points.moscow, 5040, 6090],
  ["moscow-krasnodar", points.moscow, points.krasnodar, 5040, 6090],
  ["sochi-moscow", points.sochi, points.moscow, 6090, 8400],
  ["moscow-sochi", points.moscow, points.sochi, 6090, 8400],
];

// Exact mixed-system controls: Valhalla geometry crosses A-289 RVP 82 and 103
// but not RVP 23. Official category-I charge is 205 + 180 = 385 rubles.
const exactM4A289 = [
  ["yalta-moscow", points.yalta, points.moscow, 5625, 7625],
  ["moscow-yalta", points.moscow, points.yalta, 5625, 7625],
];

const nonM4Guards = [
  ["moscow-spb", points.moscow, points.spb, 620, 760],
  ["moscow-kazan", points.moscow, points.kazan, 750, 950],
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDeployment() {
  if (!expectedCommit) return;
  const deadline = Date.now() + 8 * 60_000;
  let last = "";
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/version?ts=${Date.now()}`, {
        headers: { "cache-control": "no-cache", "user-agent": "MezhgorodSegment1Regression/1.1" },
      });
      const data = await response.json().catch(() => ({}));
      last = data.commit || `HTTP ${response.status}`;
      if (response.ok && data.commit === expectedCommit) return;
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
    await sleep(10_000);
  }
  throw new Error(`Preview did not reach ${expectedCommit}; last=${last}`);
}

async function calculate(from, to) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 95_000);
  try {
    const response = await fetch(`${baseUrl}/api/v2/calculate`, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "MezhgorodSegment1Regression/1.1" },
      body: JSON.stringify({
        mode: "standard",
        from,
        to,
        departureAt: "2026-09-30T09:00:00+03:00",
      }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
let failed = false;

function record(name, checks, data) {
  const ok = checks.every((item) => item.ok);
  if (!ok) failed = true;
  results.push({ name, ok, checks, diagnostics: data });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  for (const item of checks) console.log(`  ${item.ok ? "✓" : "✗"} ${item.label}: ${item.actual}`);
}

await waitForDeployment();

for (const [name, from, to, weekday, weekend] of exactM4) {
  try {
    const data = await calculate(from, to);
    const fast = data.legs?.[0]?.fast;
    const tolls = fast?.tolls;
    const checks = [
      { label: "weekday M4 amount", ok: tolls?.weekdayAmount === weekday, actual: String(tolls?.weekdayAmount) },
      { label: "weekend M4 amount", ok: tolls?.weekendAmount === weekend, actual: String(tolls?.weekendAmount) },
      { label: "exact M4 tariff path used", ok: tolls?.segments?.[0]?.includes("М-4 Дон") === true, actual: tolls?.segments?.[0] || "missing" },
      ...(name === "krasnodar-moscow" || name === "moscow-krasnodar" ? [{ label: "published full-route tariff used", ok: tolls?.segments?.[0]?.includes("5 040 ₽ Пн–Чт / 6 090 ₽ Пт–Вс") === true, actual: tolls?.segments?.[0] || "missing" }] : []),
      { label: "no A289 frame charged", ok: !(tolls?.segments ?? []).some((segment) => segment.startsWith("А-289:")), actual: (tolls?.segments ?? []).filter((segment) => segment.startsWith("А-289:")).join(" | ") || "none" },
      { label: "toll crossing confirmed", ok: fast?.tollValidation?.status === "toll", actual: fast?.tollValidation?.status || "missing" },
    ];
    record(name, checks, { fastKm: fast?.meters ? fast.meters / 1000 : null, tolls, validation: fast?.tollValidation });
  } catch (error) {
    failed = true;
    record(name, [{ label: "request", ok: false, actual: error instanceof Error ? error.message : String(error) }], null);
  }
}

for (const [name, from, to, weekday, weekend] of exactM4A289) {
  try {
    const data = await calculate(from, to);
    const fast = data.legs?.[0]?.fast;
    const tolls = fast?.tolls;
    const a289Segments = (tolls?.segments ?? []).filter((segment) => segment.startsWith("А-289:"));
    const checks = [
      { label: "weekday M4+A289 amount", ok: tolls?.weekdayAmount === weekday, actual: String(tolls?.weekdayAmount) },
      { label: "weekend M4+A289 amount", ok: tolls?.weekendAmount === weekend, actual: String(tolls?.weekendAmount) },
      { label: "RVP 82 charged", ok: a289Segments.some((segment) => segment.includes("РВП 82")), actual: a289Segments.join(" | ") || "missing" },
      { label: "RVP 103 charged", ok: a289Segments.some((segment) => segment.includes("РВП 103")), actual: a289Segments.join(" | ") || "missing" },
      { label: "RVP 23 not charged", ok: !a289Segments.some((segment) => segment.includes("РВП 23")), actual: a289Segments.join(" | ") || "missing" },
      { label: "toll crossing confirmed", ok: fast?.tollValidation?.status === "toll", actual: fast?.tollValidation?.status || "missing" },
    ];
    record(name, checks, { fastKm: fast?.meters ? fast.meters / 1000 : null, tolls, validation: fast?.tollValidation });
  } catch (error) {
    failed = true;
    record(name, [{ label: "request", ok: false, actual: error instanceof Error ? error.message : String(error) }], null);
  }
}

// Non-M4 controls only protect routing availability/range in this segment;
// their exact road-specific toll engines are handled in later segments.
for (const [name, from, to, minKm, maxKm] of nonM4Guards) {
  try {
    const data = await calculate(from, to);
    const fast = data.legs?.[0]?.fast;
    const km = fast?.meters ? fast.meters / 1000 : NaN;
    const checks = [
      { label: "request succeeds", ok: Boolean(fast), actual: fast ? "ok" : "missing fast route" },
      { label: "fast distance guard", ok: Number.isFinite(km) && km >= minKm && km <= maxKm, actual: Number.isFinite(km) ? `${km.toFixed(1)} km` : "missing" },
    ];
    record(name, checks, { fastKm: Number.isFinite(km) ? km : null, tolls: fast?.tolls, validation: fast?.tollValidation });
  } catch (error) {
    failed = true;
    record(name, [{ label: "request", ok: false, actual: error instanceof Error ? error.message : String(error) }], null);
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  expectedCommit,
  failed,
  results,
};
await writeFile("segment1-user-regression.json", `${JSON.stringify(report, null, 2)}\n`);

if (failed) process.exitCode = 1;
