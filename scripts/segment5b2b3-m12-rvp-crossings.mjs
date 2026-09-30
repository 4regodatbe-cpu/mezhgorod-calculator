import { readFile, writeFile } from "node:fs/promises";

const VALHALLA = "https://valhalla1.openstreetmap.de/route";
const EVIDENCE_PATH = "data/tolls/m12-rvp-evidence-2026-09-30.json";
const TARIFF_PATH = "data/tolls/m12-2026-03-02-category1.json";
const OUTPUT_PATH = "segment5b2b3-m12-rvp-crossings.json";
const MAX_ABSOLUTE_CONTINUITY_ERROR_KM = 3;
const MAX_RELATIVE_CONTINUITY_ERROR = 0.025;

const places = {
  moscow: { lat: 55.755819, lon: 37.617644 },
  vladimir: { lat: 56.129057, lon: 40.406635 },
  murom: { lat: 55.578348, lon: 42.052126 },
  arzamas: { lat: 55.394902, lon: 43.839919 },
  kazan: { lat: 55.796127, lon: 49.106405 },
};

const controls = [
  ["moscow", "kazan"],
  ["vladimir", "kazan"],
  ["murom", "kazan"],
  ["arzamas", "kazan"],
  ["moscow", "arzamas"],
];

function round(value, digits = 6) {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function haversineKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function decodePolyline(encoded, precision = 6) {
  const out = [];
  const factor = 10 ** precision;
  let index = 0, lat = 0, lon = 0;
  while (index < encoded.length) {
    let result = 0, shift = 0, byte;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20 && index < encoded.length);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    result = 0; shift = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20 && index < encoded.length);
    lon += result & 1 ? ~(result >> 1) : result >> 1;
    out.push([lon / factor, lat / factor]);
  }
  return out;
}

function cumulative(route) {
  const out = [0];
  for (let i = 1; i < route.length; i += 1) out.push(out[i - 1] + haversineKm(route[i - 1], route[i]));
  return out;
}

function projectSegment(point, a, b) {
  const mean = ((point[1] + a[1] + b[1]) / 3) * Math.PI / 180;
  const xs = 111.320 * Math.cos(mean);
  const ys = 110.574;
  const bx = (b[0] - a[0]) * xs;
  const by = (b[1] - a[1]) * ys;
  const px = (point[0] - a[0]) * xs;
  const py = (point[1] - a[1]) * ys;
  const denominator = bx * bx + by * by;
  const raw = denominator > 0 ? (px * bx + py * by) / denominator : 0;
  const t = Math.max(0, Math.min(1, raw));
  const projected = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  return { t, distanceKm: haversineKm(point, projected) };
}

function projectRoute(route, chain, point) {
  let best = null;
  for (let i = 1; i < route.length; i += 1) {
    const hit = projectSegment(point, route[i - 1], route[i]);
    if (!best || hit.distanceKm < best.distanceKm) {
      const segmentKm = chain[i] - chain[i - 1];
      best = {
        distanceKm: hit.distanceKm,
        chainageKm: chain[i - 1] + segmentKm * hit.t,
      };
    }
  }
  return best;
}

async function fetchRoute(from, to, name) {
  const body = {
    locations: [from, to],
    costing: "auto",
    costing_options: { auto: { use_tolls: 1 } },
    units: "kilometers",
    directions_type: "none",
    shape_format: "polyline6",
  };
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 40_000);
    try {
      const response = await fetch(VALHALLA, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json", "user-agent": "MezhgorodSegment5B2B3/1.0" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
      const geometry = (data.trip?.legs ?? []).flatMap((leg) => leg.shape ? decodePolyline(leg.shape) : []);
      if (geometry.length < 2) throw new Error("no usable geometry");
      return { geometry, valhallaKm: data.trip?.summary?.length ?? null };
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1200));
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`${name}: ${lastError?.message ?? "route failed"}`);
}

function officialAmount(markers, tariff) {
  const byKm = new Map(tariff.sections.map((section) => [section.rvpKm, section.category1Rub]));
  let amount = 0;
  for (const marker of markers) {
    if (!byKm.has(marker)) throw new Error(`no official tariff for RVP ${marker}`);
    amount += byKm.get(marker);
  }
  return amount;
}

function inferInternalMarkers(direct, allOfficialMarkers) {
  if (direct.length < 2) return { inferred: [], intervals: [], allContinuous: false };
  const inferred = new Set();
  const intervals = [];
  let allContinuous = true;

  for (let i = 1; i < direct.length; i += 1) {
    const a = direct[i - 1];
    const b = direct[i];
    const officialDelta = Math.abs(b.rvpKm - a.rvpKm);
    const routeDelta = b.chainageKm - a.chainageKm;
    const errorKm = Math.abs(routeDelta - officialDelta);
    const toleranceKm = Math.max(MAX_ABSOLUTE_CONTINUITY_ERROR_KM, officialDelta * MAX_RELATIVE_CONTINUITY_ERROR);
    const direction = Math.sign(b.rvpKm - a.rvpKm);
    const continuous = direction !== 0 && errorKm <= toleranceKm;
    if (!continuous) allContinuous = false;

    const internal = continuous
      ? allOfficialMarkers.filter((marker) => direction > 0
        ? marker > a.rvpKm && marker < b.rvpKm
        : marker < a.rvpKm && marker > b.rvpKm)
      : [];
    for (const marker of internal) inferred.add(marker);
    intervals.push({
      fromRvpKm: a.rvpKm,
      toRvpKm: b.rvpKm,
      routeDeltaKm: round(routeDelta),
      officialDeltaKm: officialDelta,
      errorKm: round(errorKm),
      toleranceKm: round(toleranceKm),
      continuous,
      inferredMarkers: internal,
    });
  }

  return { inferred: [...inferred].sort((a, b) => a - b), intervals, allContinuous };
}

const evidence = JSON.parse(await readFile(EVIDENCE_PATH, "utf8"));
const tariff = JSON.parse(await readFile(TARIFF_PATH, "utf8"));
const radiusKm = evidence.directCrossingRadiusKm;
const allOfficialMarkers = tariff.sections.map((section) => section.rvpKm).sort((a, b) => a - b);
const routeCache = new Map();

async function analyze(fromKey, toKey) {
  const name = `${fromKey}->${toKey}`;
  if (routeCache.has(name)) return routeCache.get(name);
  const live = await fetchRoute(places[fromKey], places[toKey], name);
  const chain = cumulative(live.geometry);
  const projections = evidence.anchors.map((anchor) => {
    const hit = projectRoute(live.geometry, chain, anchor.center);
    return {
      rvpKm: anchor.rvpKm,
      nearestDistanceKm: round(hit.distanceKm),
      chainageKm: round(hit.chainageKm),
      crossed: hit.distanceKm <= radiusKm,
    };
  });
  const direct = projections.filter((item) => item.crossed).sort((a, b) => a.chainageKm - b.chainageKm);
  const continuity = inferInternalMarkers(direct, allOfficialMarkers);
  const finalMarkers = [...new Set([...direct.map((item) => item.rvpKm), ...continuity.inferred])].sort((a, b) => a - b);
  const amountRub = finalMarkers.length ? officialAmount(finalMarkers, tariff) : null;

  const rejectedCandidateChecks = (evidence.rejectedControlCandidates ?? []).map((candidate) => {
    const hit = projectRoute(live.geometry, chain, candidate.center);
    return { rvpKm: candidate.rvpKm, nearestDistanceKm: round(hit.distanceKm), crossed: hit.distanceKm <= radiusKm };
  });
  const excludedChecks = (evidence.excludedPhysicalEvents ?? []).map((candidate) => {
    const hit = projectRoute(live.geometry, chain, candidate.center);
    return { nearestDistanceKm: round(hit.distanceKm), physicallyCrossed: hit.distanceKm <= radiusKm, excludedByModel: true };
  });

  const report = {
    name,
    valhallaKm: live.valhallaKm,
    geometryKm: round(chain.at(-1)),
    direct,
    inferred: continuity.inferred,
    finalMarkers,
    amountRub,
    allDirectIntervalsContinuous: continuity.allContinuous,
    intervals: continuity.intervals,
    rejectedCandidateChecks,
    excludedChecks,
    projections,
  };
  routeCache.set(name, report);
  console.log(`${name}: direct=[${direct.map((x) => x.rvpKm)}] inferred=[${continuity.inferred}] final=[${finalMarkers}] amount=${amountRub}`);
  return report;
}

const pairReports = [];
for (const [a, b] of controls) {
  const forward = await analyze(a, b);
  const reverse = await analyze(b, a);
  const sameDirect = JSON.stringify([...forward.direct.map((x) => x.rvpKm)].sort((x, y) => x - y)) === JSON.stringify([...reverse.direct.map((x) => x.rvpKm)].sort((x, y) => x - y));
  const sameInferred = JSON.stringify(forward.inferred) === JSON.stringify(reverse.inferred);
  const sameFinal = JSON.stringify(forward.finalMarkers) === JSON.stringify(reverse.finalMarkers);
  const sameAmount = forward.amountRub === reverse.amountRub;
  const noRejectedCrossing = [...forward.rejectedCandidateChecks, ...reverse.rejectedCandidateChecks].every((item) => !item.crossed);
  const pass = sameDirect && sameInferred && sameFinal && sameAmount && noRejectedCrossing;
  pairReports.push({ pair: `${a}<->${b}`, pass, sameDirect, sameInferred, sameFinal, sameAmount, noRejectedCrossing, forward, reverse });
}

const full = pairReports.find((item) => item.pair === "moscow<->kazan");
const expectedDirect = [184, 281, 314, 392, 420, 485, 591, 635, 764];
const fullDirect = full?.forward.direct.map((item) => item.rvpKm).sort((a, b) => a - b) ?? [];
const fullControl = {
  directMatchesExpected: JSON.stringify(fullDirect) === JSON.stringify(expectedDirect),
  inferredContains722: full?.forward.inferred.includes(722) ?? false,
  excludes769: !(full?.forward.finalMarkers.includes(769) ?? true),
};
fullControl.pass = Object.values(fullControl).every(Boolean);

const failedPairs = pairReports.filter((item) => !item.pass);
const success = failedPairs.length === 0 && fullControl.pass;
const output = {
  generatedAt: new Date().toISOString(),
  diagnosticOnly: true,
  evidenceScope: evidence.scope,
  directCrossingRadiusKm: radiusKm,
  tariffEffectiveFrom: tariff.order?.effectiveFrom,
  thresholds: { maxAbsoluteContinuityErrorKm: MAX_ABSOLUTE_CONTINUITY_ERROR_KM, maxRelativeContinuityError: MAX_RELATIVE_CONTINUITY_ERROR },
  fullControl,
  failedPairCount: failedPairs.length,
  success,
  pairs: pairReports,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(`RVP-first result: success=${success}; failedPairs=${failedPairs.length}; Moscow-Kazan direct=${fullControl.directMatchesExpected}; inferred722=${fullControl.inferredContains722}; excludes769=${fullControl.excludes769}; amount=${full?.forward.amountRub ?? "n/a"}`);
if (!success) throw new Error(`5B2B-3 failed: failedPairs=${failedPairs.length}, fullControl=${JSON.stringify(fullControl)}`);
