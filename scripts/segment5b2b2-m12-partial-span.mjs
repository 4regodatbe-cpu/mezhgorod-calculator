import { writeFile } from "node:fs/promises";

const VALHALLA = "https://valhalla1.openstreetmap.de/route";
const OUTPUT = "segment5b2b2-m12-partial-span.json";
const M12 = /(?:^|[^0-9A-ZА-Я])(?:M|М)\s*[-‐‑–—]?\s*12(?:[^0-9]|$)/iu;
const MAX_MIRROR_RESIDUAL = 0.03;
const MAX_DISTANCE_SPREAD = 0.03;
const MIN_SPAN_PAIRS = 4;

const places = {
  moscow: { lat: 55.755819, lon: 37.617644 },
  vladimir: { lat: 56.129057, lon: 40.406635 },
  murom: { lat: 55.578348, lon: 42.052126 },
  arzamas: { lat: 55.394902, lon: 43.839919 },
  kazan: { lat: 55.796127, lon: 49.106405 },
};

const pairs = [
  ["vladimir", "kazan"],
  ["murom", "kazan"],
  ["arzamas", "kazan"],
  ["moscow", "arzamas"],
  ["moscow", "kazan"],
];

function round(value, digits = 6) {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function distanceKm(a, b) {
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

function cumulative(shape) {
  const out = [0];
  for (let i = 1; i < shape.length; i += 1) out.push(out[i - 1] + distanceKm(shape[i - 1], shape[i]));
  return out;
}

async function fetchRoute(from, to, name) {
  const body = {
    locations: [from, to],
    costing: "auto",
    costing_options: { auto: { use_tolls: 1 } },
    units: "kilometers",
    shape_format: "polyline6",
    directions_options: { language: "ru-RU", units: "kilometers" },
  };
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 40_000);
    try {
      const response = await fetch(VALHALLA, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json", "user-agent": "MezhgorodSegment5B2B2/1.0" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1200));
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`${name}: ${lastError?.message ?? "route failed"}`);
}

function analyze(name, data) {
  const legs = data.trip?.legs ?? [];
  if (!legs.length) throw new Error(`${name}: no legs`);
  let offset = 0;
  const maneuvers = [];
  for (const [legIndex, leg] of legs.entries()) {
    if (!leg.shape) throw new Error(`${name}: leg ${legIndex} missing shape`);
    const shape = decodePolyline(leg.shape);
    const chain = cumulative(shape);
    for (const [maneuverIndex, maneuver] of (leg.maneuvers ?? []).entries()) {
      const names = [...(maneuver.street_names ?? []), ...(maneuver.begin_street_names ?? [])];
      const strict = names.some((value) => M12.test(value));
      const begin = Number.isInteger(maneuver.begin_shape_index) ? maneuver.begin_shape_index : null;
      const end = Number.isInteger(maneuver.end_shape_index) ? maneuver.end_shape_index : null;
      const valid = begin !== null && end !== null && begin >= 0 && end >= begin && end < shape.length;
      maneuvers.push({
        legIndex,
        maneuverIndex,
        names,
        instruction: maneuver.instruction ?? null,
        strictM12: strict,
        validShapeIndexes: valid,
        beginChainageKm: valid ? offset + chain[begin] : null,
        endChainageKm: valid ? offset + chain[end] : null,
      });
    }
    offset += chain.at(-1) ?? 0;
  }
  const strict = maneuvers.filter((m) => m.strictM12 && m.validShapeIndexes);
  const span = strict.length ? {
    beginKm: Math.min(...strict.map((m) => m.beginChainageKm)),
    endKm: Math.max(...strict.map((m) => m.endChainageKm)),
  } : null;
  const routeKm = Number.isFinite(data.trip?.summary?.length) ? data.trip.summary.length : offset;
  return {
    name,
    routeKm: round(routeKm, 3),
    geometryKm: round(offset, 3),
    maneuverCount: maneuvers.length,
    strictM12ManeuverCount: strict.length,
    span: span ? {
      beginKm: round(span.beginKm, 3),
      endKm: round(span.endKm, 3),
      normalizedBegin: round(span.beginKm / offset),
      normalizedEnd: round(span.endKm / offset),
      spanKm: round(span.endKm - span.beginKm, 3),
    } : null,
    strictManeuvers: strict.map((m) => ({
      maneuverIndex: m.maneuverIndex,
      names: m.names,
      beginChainageKm: round(m.beginChainageKm, 3),
      endChainageKm: round(m.endChainageKm, 3),
      instruction: m.instruction,
    })),
    transitionContext: maneuvers.filter((m, index) => {
      if (!span || m.beginChainageKm === null || m.endChainageKm === null) return false;
      const nearBegin = Math.abs(m.endChainageKm - span.beginKm) < 8 || Math.abs(m.beginChainageKm - span.beginKm) < 8;
      const nearEnd = Math.abs(m.endChainageKm - span.endKm) < 8 || Math.abs(m.beginChainageKm - span.endKm) < 8;
      return nearBegin || nearEnd || (m.strictM12 && index >= 0);
    }).map((m) => ({ names: m.names, instruction: m.instruction, beginChainageKm: round(m.beginChainageKm, 3), endChainageKm: round(m.endChainageKm, 3), strictM12: m.strictM12 })),
  };
}

const routeResults = new Map();
for (const [a, b] of pairs) {
  for (const [fromKey, toKey] of [[a, b], [b, a]]) {
    const key = `${fromKey}->${toKey}`;
    if (routeResults.has(key)) continue;
    const data = await fetchRoute(places[fromKey], places[toKey], key);
    const result = analyze(key, data);
    routeResults.set(key, result);
    console.log(`${key}: ${result.routeKm}km strictM12=${result.strictM12ManeuverCount} span=${result.span ? `${result.span.beginKm}-${result.span.endKm}` : "none"}`);
  }
}

const pairReports = pairs.map(([a, b]) => {
  const forward = routeResults.get(`${a}->${b}`);
  const reverse = routeResults.get(`${b}->${a}`);
  const presenceAgrees = Boolean(forward.span) === Boolean(reverse.span);
  const distanceSpread = Math.abs(forward.routeKm - reverse.routeKm) / ((forward.routeKm + reverse.routeKm) / 2);
  let mirror = null;
  if (forward.span && reverse.span) {
    const beginResidual = Math.abs(forward.span.normalizedBegin - (1 - reverse.span.normalizedEnd));
    const endResidual = Math.abs(forward.span.normalizedEnd - (1 - reverse.span.normalizedBegin));
    mirror = { begin: round(beginResidual), end: round(endResidual), max: round(Math.max(beginResidual, endResidual)) };
  }
  const pass = presenceAgrees
    && distanceSpread <= MAX_DISTANCE_SPREAD
    && (!forward.span || (mirror && mirror.max <= MAX_MIRROR_RESIDUAL));
  return {
    pair: `${a}<->${b}`,
    presenceAgrees,
    hasM12Span: Boolean(forward.span && reverse.span),
    distanceSpread: round(distanceSpread),
    mirror,
    pass,
    forward,
    reverse,
  };
});

const spanPairs = pairReports.filter((pair) => pair.hasM12Span).length;
const failedPairs = pairReports.filter((pair) => !pair.pass);
const success = spanPairs >= MIN_SPAN_PAIRS && failedPairs.length === 0;
const report = {
  generatedAt: new Date().toISOString(),
  diagnosticOnly: true,
  overpassRequests: 0,
  traceAttributeRequests: 0,
  thresholds: { maxMirrorResidual: MAX_MIRROR_RESIDUAL, maxDistanceSpread: MAX_DISTANCE_SPREAD, minSpanPairs: MIN_SPAN_PAIRS },
  spanPairs,
  failedPairCount: failedPairs.length,
  success,
  pairs: pairReports,
};

await writeFile(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
console.log(`partial-span result: spanPairs=${spanPairs}/${pairReports.length}; failedPairs=${failedPairs.length}; success=${success}`);
for (const pair of pairReports) console.log(`  ${pair.pair}: span=${pair.hasM12Span} mirror=${pair.mirror?.max ?? "n/a"} distanceSpread=${pair.distanceSpread} pass=${pair.pass}`);
if (!success) throw new Error(`5B2B-2 failed: spanPairs=${spanPairs}, failedPairs=${failedPairs.length}`);
