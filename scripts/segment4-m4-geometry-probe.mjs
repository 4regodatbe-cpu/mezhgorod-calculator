import { writeFile } from "node:fs/promises";

const baseUrl = (process.env.CALCULATOR_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const routes = [
  ["yeisk-moscow", "Ейск", "Москва"],
  ["moscow-yeisk", "Москва", "Ейск"],
  ["maykop-moscow", "Майкоп", "Москва"],
  ["moscow-maykop", "Москва", "Майкоп"],
  ["krasnodar-moscow", "Краснодар", "Москва"],
  ["moscow-krasnodar", "Москва", "Краснодар"],
  ["sochi-moscow", "Сочи", "Москва"],
  ["moscow-sochi", "Москва", "Сочи"],
  ["yalta-moscow", "Ялта", "Москва"],
  ["moscow-yalta", "Москва", "Ялта"],
];

const thresholdsKm = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5];

async function probeRoute(name, from, to) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 70_000);
  const startedAt = Date.now();
  try {
    const url = new URL(`${baseUrl}/api/v2/debug-m4`);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    url.searchParams.set("departureAt", "2026-09-30T09:00:00+03:00");
    const response = await fetch(url, {
      headers: { "user-agent": "MezhgorodSegment4GeometryProbe/1.0", "cache-control": "no-cache" },
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    const validation = data.validation ?? {};
    const pricing = data.pricing ?? {};
    const checks = (validation.checks ?? []).map((check, order) => ({
      order,
      km: check.km,
      model: check.model,
      status: check.status,
      nearestDistanceKm: Number(check.nearestDistanceKm),
      matchedNodeIds: check.matchedNodeIds ?? [],
      expectedNodeIds: check.expectedNodeIds ?? [],
      windowPointCount: check.windowPointCount ?? null,
      message: check.message ?? "",
    }));
    return {
      name,
      from,
      to,
      ok: true,
      wallElapsedMs: Date.now() - startedAt,
      fastKm: data.fastKm,
      geometryPoints: data.geometryPoints,
      totalElapsedMs: data.totalElapsedMs,
      validationElapsedMs: validation.elapsedMs,
      complete: validation.complete,
      candidateCount: validation.candidateCount,
      checkedCandidateCount: validation.checkedCandidateCount,
      confirmedCount: validation.confirmedCount,
      rejectedCount: validation.rejectedCount,
      unknownCount: validation.unknownCount,
      checks,
      pricing: {
        status: pricing.status,
        amount: pricing.amount,
        weekdayAmount: pricing.weekdayAmount,
        weekendAmount: pricing.weekendAmount,
        confidence: pricing.confidence,
        unresolved: pricing.unresolved ?? [],
      },
    };
  } catch (error) {
    return {
      name,
      from,
      to,
      ok: false,
      wallElapsedMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
for (const [name, from, to] of routes) {
  const result = await probeRoute(name, from, to);
  results.push(result);
  if (!result.ok) {
    console.log(`ERROR ${name}: ${result.error}`);
    continue;
  }
  console.log(`${result.complete ? "COMPLETE" : "INCOMPLETE"} ${name}: fast=${result.fastKm}km candidates=${result.candidateCount} confirmed=${result.confirmedCount} rejected=${result.rejectedCount} unknown=${result.unknownCount} validator=${result.validationElapsedMs}ms wall=${result.wallElapsedMs}ms`);
  for (const check of result.checks) {
    console.log(`  ${check.order + 1}. km=${check.km} model=${check.model} status=${check.status} nearest=${(check.nearestDistanceKm * 1000).toFixed(1)}m nodes=${check.matchedNodeIds.join(",") || "-"}`);
  }
}

const labelledChecks = results
  .filter((route) => route.ok && route.complete)
  .flatMap((route) => route.checks.map((check) => ({ route: route.name, ...check })))
  .filter((check) => check.status === "confirmed" || check.status === "rejected");

const thresholdAnalysis = thresholdsKm.map((thresholdKm) => {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;
  const falsePositives = [];
  const falseNegatives = [];
  for (const check of labelledChecks) {
    const predicted = check.nearestDistanceKm <= thresholdKm;
    const actual = check.status === "confirmed";
    if (predicted && actual) tp += 1;
    else if (predicted && !actual) {
      fp += 1;
      falsePositives.push({ route: check.route, km: check.km, nearestDistanceKm: check.nearestDistanceKm });
    } else if (!predicted && actual) {
      fn += 1;
      falseNegatives.push({ route: check.route, km: check.km, nearestDistanceKm: check.nearestDistanceKm });
    } else tn += 1;
  }
  return { thresholdKm, thresholdMeters: thresholdKm * 1000, tp, fp, fn, tn, falsePositives, falseNegatives };
});

const successful = results.filter((result) => result.ok);
const complete = successful.filter((result) => result.complete);
const validatorTimes = complete.map((result) => Number(result.validationElapsedMs)).filter(Number.isFinite);
const wallTimes = successful.map((result) => Number(result.wallElapsedMs)).filter(Number.isFinite);
const confirmedDistances = labelledChecks.filter((check) => check.status === "confirmed").map((check) => check.nearestDistanceKm);
const rejectedDistances = labelledChecks.filter((check) => check.status === "rejected").map((check) => check.nearestDistanceKm);

const stats = {
  routeCount: routes.length,
  successfulRoutes: successful.length,
  completeRoutes: complete.length,
  failedRoutes: results.filter((result) => !result.ok).length,
  incompleteRoutes: successful.filter((result) => !result.complete).length,
  labelledCandidateCount: labelledChecks.length,
  confirmedCandidateCount: confirmedDistances.length,
  rejectedCandidateCount: rejectedDistances.length,
  validatorElapsedMs: {
    total: validatorTimes.reduce((sum, value) => sum + value, 0),
    min: validatorTimes.length ? Math.min(...validatorTimes) : null,
    max: validatorTimes.length ? Math.max(...validatorTimes) : null,
    average: validatorTimes.length ? Math.round(validatorTimes.reduce((sum, value) => sum + value, 0) / validatorTimes.length) : null,
  },
  wallElapsedMs: {
    total: wallTimes.reduce((sum, value) => sum + value, 0),
    min: wallTimes.length ? Math.min(...wallTimes) : null,
    max: wallTimes.length ? Math.max(...wallTimes) : null,
    average: wallTimes.length ? Math.round(wallTimes.reduce((sum, value) => sum + value, 0) / wallTimes.length) : null,
  },
  nearestDistanceMeters: {
    confirmedMin: confirmedDistances.length ? Math.min(...confirmedDistances) * 1000 : null,
    confirmedMax: confirmedDistances.length ? Math.max(...confirmedDistances) * 1000 : null,
    rejectedMin: rejectedDistances.length ? Math.min(...rejectedDistances) * 1000 : null,
    rejectedMax: rejectedDistances.length ? Math.max(...rejectedDistances) * 1000 : null,
  },
};

const zeroFalsePositiveThresholds = thresholdAnalysis.filter((item) => item.fp === 0 && item.tp > 0);
const perfectThresholds = thresholdAnalysis.filter((item) => item.fp === 0 && item.fn === 0 && item.tp > 0);

console.log(`SUMMARY successful=${stats.successfulRoutes}/${stats.routeCount} complete=${stats.completeRoutes}/${stats.routeCount} labelled=${stats.labelledCandidateCount}`);
console.log(`TIMING validator avg=${stats.validatorElapsedMs.average}ms max=${stats.validatorElapsedMs.max}ms total=${stats.validatorElapsedMs.total}ms`);
console.log(`DISTANCE confirmed=${stats.nearestDistanceMeters.confirmedMin}..${stats.nearestDistanceMeters.confirmedMax}m rejected=${stats.nearestDistanceMeters.rejectedMin}..${stats.nearestDistanceMeters.rejectedMax}m`);
for (const item of thresholdAnalysis) {
  console.log(`THRESHOLD ${item.thresholdMeters}m: TP=${item.tp} FP=${item.fp} FN=${item.fn} TN=${item.tn}`);
}
console.log(`ZERO_FP_THRESHOLDS ${zeroFalsePositiveThresholds.map((item) => `${item.thresholdMeters}m`).join(",") || "none"}`);
console.log(`PERFECT_THRESHOLDS ${perfectThresholds.map((item) => `${item.thresholdMeters}m`).join(",") || "none"}`);

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  stats,
  thresholdAnalysis,
  zeroFalsePositiveThresholds: zeroFalsePositiveThresholds.map((item) => item.thresholdMeters),
  perfectThresholds: perfectThresholds.map((item) => item.thresholdMeters),
  results,
};

await writeFile("segment4-m4-geometry-probe.json", `${JSON.stringify(report, null, 2)}\n`);

// This is an evidence probe. Provider failures are recorded rather than turned
// into a false algorithm failure; the next step is chosen from the report.
