import { writeFile } from "node:fs/promises";

const candidateUrl = (process.env.CALCULATOR_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const baselineUrl = (process.env.BASELINE_URL || "https://mezhgorod-calculator.vercel.app").replace(/\/$/, "");

const points = {
  moscow: { label: "Москва", position: { lat: 55.755819, lng: 37.617644 } },
  yalta: { label: "Ялта", position: { lat: 44.495205, lng: 34.166301 } },
  sochi: { label: "Сочи", position: { lat: 43.585472, lng: 39.723098 } },
  spb: { label: "Санкт-Петербург", position: { lat: 59.938784, lng: 30.314997 } },
  kazan: { label: "Казань", position: { lat: 55.796127, lng: 49.106405 } },
};

const cases = [
  {
    name: "yalta-moscow",
    from: points.yalta,
    to: points.moscow,
    expectedWeekday: 5625,
    expectedWeekend: 7625,
    expectedA289Frames: ["РВП 82", "РВП 103"],
    forbiddenA289Frames: ["РВП 23"],
  },
  {
    name: "moscow-yalta",
    from: points.moscow,
    to: points.yalta,
    expectedWeekday: 5625,
    expectedWeekend: 7625,
    expectedA289Frames: ["РВП 82", "РВП 103"],
    forbiddenA289Frames: ["РВП 23"],
  },
  { name: "moscow-spb", from: points.moscow, to: points.spb, protectTollTotal: true },
  { name: "sochi-spb", from: points.sochi, to: points.spb, protectTollTotal: true, mixedRoadGuard: true },
  { name: "spb-sochi", from: points.spb, to: points.sochi, protectTollTotal: true, mixedRoadGuard: true },
  { name: "moscow-kazan", from: points.moscow, to: points.kazan, protectTollTotal: false },
];

async function calculate(baseUrl, test, timeoutMs) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}/api/v2/calculate`, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "MezhgorodSegment1Differential/1.3" },
      body: JSON.stringify({
        mode: "standard",
        from: test.from,
        to: test.to,
        departureAt: "2026-09-30T09:00:00+03:00",
      }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    const fast = data.legs?.[0]?.fast;
    if (!fast) throw new Error("missing fast route");
    return {
      elapsedMs: Date.now() - started,
      fastKm: fast.meters / 1000,
      tollAmount: Number(fast.tolls?.amount || 0),
      weekdayAmount: Number(fast.tolls?.weekdayAmount || 0),
      weekendAmount: Number(fast.tolls?.weekendAmount || 0),
      segments: fast.tolls?.segments ?? [],
      validationStatus: fast.tollValidation?.status ?? null,
    };
  } finally {
    clearTimeout(timer);
  }
}

function candidateChecks(test, candidate) {
  const checks = [
    {
      label: "candidate fast route exists",
      ok: Number.isFinite(candidate.fastKm) && candidate.fastKm > 0,
      actual: `${candidate.fastKm.toFixed(1)} km`,
    },
  ];

  if (test.expectedWeekday !== undefined) {
    checks.push({
      label: "evidence-based weekday toll",
      ok: candidate.weekdayAmount === test.expectedWeekday,
      actual: `${candidate.weekdayAmount} ₽; expected ${test.expectedWeekday}`,
    });
    checks.push({
      label: "evidence-based weekend toll",
      ok: candidate.weekendAmount === test.expectedWeekend,
      actual: `${candidate.weekendAmount} ₽; expected ${test.expectedWeekend}`,
    });
    for (const frame of test.expectedA289Frames ?? []) {
      checks.push({
        label: `A289 ${frame} present`,
        ok: candidate.segments.some((segment) => segment.includes(frame)),
        actual: candidate.segments.filter((segment) => segment.startsWith("А-289:")).join(" | ") || "none",
      });
    }
    for (const frame of test.forbiddenA289Frames ?? []) {
      checks.push({
        label: `A289 ${frame} absent`,
        ok: !candidate.segments.some((segment) => segment.includes(frame)),
        actual: candidate.segments.filter((segment) => segment.startsWith("А-289:")).join(" | ") || "none",
      });
    }
  }

  if (test.protectTollTotal) {
    checks.push({
      label: "candidate keeps a paid-road total",
      ok: candidate.tollAmount > 0,
      actual: `${candidate.tollAmount} ₽`,
    });
  }

  if (test.mixedRoadGuard) {
    checks.push({
      label: "mixed M4+M11 not replaced by M4-only adapter",
      ok: !candidate.segments[0]?.includes("точный расчёт по локально подтверждённым ПВП"),
      actual: candidate.segments[0] || "missing",
    });
  }

  return checks;
}

const results = [];
let failed = false;
let baselineUnavailableCount = 0;

for (const test of cases) {
  let candidate;
  try {
    candidate = await calculate(candidateUrl, test, 65_000);
  } catch (error) {
    failed = true;
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name: test.name, ok: false, candidateError: message, baselineStatus: "not_attempted" });
    console.log(`FAIL ${test.name}: candidate ${message}`);
    continue;
  }

  const checks = candidateChecks(test, candidate);
  let baseline = null;
  let baselineError = null;

  try {
    baseline = await calculate(baselineUrl, test, 35_000);
  } catch (error) {
    baselineError = error instanceof Error ? error.message : String(error);
    baselineUnavailableCount += 1;
  }

  if (baseline) {
    const distanceSpreadPercent = Math.abs(candidate.fastKm - baseline.fastKm) / Math.max(1, baseline.fastKm) * 100;
    checks.push({
      label: "fast distance vs production",
      ok: distanceSpreadPercent <= 2,
      actual: `${baseline.fastKm.toFixed(1)} -> ${candidate.fastKm.toFixed(1)} km (${distanceSpreadPercent.toFixed(2)}%)`,
    });

    if (test.protectTollTotal && baseline.tollAmount > 0) {
      checks.push({
        label: "paid total not silently reduced",
        ok: candidate.tollAmount >= baseline.tollAmount,
        actual: `${baseline.tollAmount} -> ${candidate.tollAmount} ₽`,
      });
    }
  }

  const ok = checks.every((item) => item.ok);
  if (!ok) failed = true;
  results.push({
    name: test.name,
    ok,
    checks,
    candidate,
    baseline,
    baselineStatus: baseline ? "available" : "unavailable",
    baselineError,
  });

  console.log(`${ok ? "PASS" : "FAIL"} ${test.name}`);
  for (const check of checks) console.log(`  ${check.ok ? "✓" : "✗"} ${check.label}: ${check.actual}`);
  if (!baseline) console.log(`  ⚠ baseline unavailable: ${baselineError}`);
}

await writeFile("segment1-differential.json", `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  candidateUrl,
  baselineUrl,
  failed,
  baselineUnavailableCount,
  results,
}, null, 2)}\n`);

if (failed) process.exitCode = 1;
