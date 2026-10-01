import { readFile, writeFile } from "node:fs/promises";

const VALHALLA = "https://valhalla1.openstreetmap.de/route";
const EVIDENCE_PATH = "data/tolls/m12-rvp-evidence-2026-09-30.json";
const TARIFF_PATH = "data/tolls/m12-2026-03-02-category1.json";
const OUTPUT_PATH = "segment5b2b3b-m12-direction-aware.json";
const SAME_CORRIDOR_P95_KM = 2;
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
      best = {
        distanceKm: hit.distanceKm,
        chainageKm: chain[i - 1] + (chain[i] - chain[i - 1]) * hit.t,
      };
    }
  }
  return best;
}

function percentile(values, q) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * q;
  const low = Math.floor(position);
  const high = Math.ceil(position);
  if (low === high) return sorted[low];
  return sorted[low] + (sorted[high] - sorted[low]) * (position - low);
}

function sampledNearestDistances(source, target, maxSamples = 140) {
  const targetChain = cumulative(target);
  const stride = Math.max(1, Math.ceil(source.length / maxSamples));
  const values = [];
  for (let i = 0; i < source.length; i += stride) {
    values.push(projectRoute(target, targetChain, source[i]).distanceKm);
  }
  if ((source.length - 1) % stride !== 0) values.push(projectRoute(target, targetChain, source.at(-1)).distanceKm);
  return values;
}

function corridorParity(forward, reverse) {
  const reverseGeometry = [...reverse.geometry].reverse();
  const fToR = sampledNearestDistances(forward.geometry, reverseGeometry);
  const rToF = sampledNearestDistances(reverseGeometry, forward.geometry);
  const p95Forward = percentile(fToR, 0.95);
  const p95Reverse = percentile(rToF, 0.95);
  const maxP95 = Math.max(p95Forward, p95Reverse);
  return {
    p95ForwardKm: round(p95Forward),
    p95ReverseKm: round(p95Reverse),
    maxP95Km: round(maxP95),
    classification: maxP95 <= SAME_CORRIDOR_P95_KM ? "same_corridor" : "different_corridor",
  };
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
        headers: { "content-type": "application/json", accept: "application/json", "user-agent": "MezhgorodSegment5B2B3B/1.0" },
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
    const internal = continuous ? allOfficialMarkers.filter((marker) => direction > 0
      ? marker > a.rvpKm && marker < b.rvpKm
      : marker < a.rvpKm && marker > b.rvpKm) : [];
    for (const marker of internal) inferred.add(marker);
    intervals.push({ fromRvpKm: a.rvpKm, toRvpKm: b.rvpKm, routeDeltaKm: round(routeDelta), officialDeltaKm: officialDelta, errorKm: round(errorKm), toleranceKm: round(toleranceKm), continuous, inferredMarkers: internal });
  }
  return { inferred: [...inferred].sort((a, b) => a - b), intervals, allContinuous };
}

const evidence = JSON.parse(await readFile(EVIDENCE_PATH, "utf8"));
const tariff = JSON.parse(await readFile(TARIFF_PATH, "utf8"));
const allOfficialMarkers = tariff.sections.map((section) => section.rvpKm).sort((a, b) => a - b);
const amountByMarker = new Map(tariff.sections.map((section) => [section.rvpKm, section.category1Rub]));

async function analyze(fromKey, toKey) {
  const name = `${fromKey}->${toKey}`;
  const live = await fetchRoute(places[fromKey], places[toKey], name);
  const chain = cumulative(live.geometry);
  const projections = evidence.anchors.map((anchor) => {
    const hit = projectRoute(live.geometry, chain, anchor.center);
    return { rvpKm: anchor.rvpKm, nearestDistanceKm: round(hit.distanceKm), chainageKm: round(hit.chainageKm), crossed: hit.distanceKm <= evidence.directCrossingRadiusKm };
  });
  const direct = projections.filter((item) => item.crossed).sort((a, b) => a.chainageKm - b.chainageKm);
  const continuity = inferInternalMarkers(direct, allOfficialMarkers);
  const finalMarkers = [...new Set([...direct.map((item) => item.rvpKm), ...continuity.inferred])].sort((a, b) => a - b);
  let status;
  let amountRub = null;
  if (direct.length === 0) {
    status = "unknown_no_supported_rvp";
  } else if (direct.length >= 2 && continuity.allContinuous) {
    status = "priced_supported";
    amountRub = finalMarkers.reduce((sum, marker) => sum + (amountByMarker.get(marker) ?? 0), 0);
  } else {
    status = "unknown_incomplete";
  }
  const rejectedCandidateChecks = (evidence.rejectedControlCandidates ?? []).map((candidate) => {
    const hit = projectRoute(live.geometry, chain, candidate.center);
    return { rvpKm: candidate.rvpKm, nearestDistanceKm: round(hit.distanceKm), crossed: hit.distanceKm <= evidence.directCrossingRadiusKm };
  });
  return { name, geometry: live.geometry, valhallaKm: live.valhallaKm, status, direct, inferred: continuity.inferred, finalMarkers, amountRub, intervals: continuity.intervals, projections, rejectedCandidateChecks };
}

const pairReports = [];
for (const [a, b] of controls) {
  const forward = await analyze(a, b);
  const reverse = await analyze(b, a);
  const parity = corridorParity(forward, reverse);
  const sameFinal = JSON.stringify(forward.finalMarkers) === JSON.stringify(reverse.finalMarkers);
  const sameAmount = forward.amountRub === reverse.amountRub;
  const noFalseZero = [forward, reverse].every((route) => route.amountRub !== 0 || route.status === "priced_supported");
  let pass;
  if (parity.classification === "same_corridor") {
    pass = sameFinal && sameAmount && noFalseZero;
  } else {
    pass = noFalseZero;
  }
  pairReports.push({
    pair: `${a}<->${b}`,
    parity,
    pass,
    sameFinal,
    sameAmount,
    forward: { ...forward, geometry: undefined },
    reverse: { ...reverse, geometry: undefined },
  });
  console.log(`${a}<->${b}: ${parity.classification} p95=${parity.maxP95Km}km; forward=${forward.status}/${forward.amountRub}; reverse=${reverse.status}/${reverse.amountRub}; pass=${pass}`);
}

const full = pairReports.find((item) => item.pair === "moscow<->kazan");
const expectedMarkers = [184, 281, 314, 392, 420, 485, 591, 635, 722, 764];
const fullControl = {
  sameCorridor: full?.parity.classification === "same_corridor",
  forwardMarkers: JSON.stringify(full?.forward.finalMarkers ?? []) === JSON.stringify(expectedMarkers),
  reverseMarkers: JSON.stringify(full?.reverse.finalMarkers ?? []) === JSON.stringify(expectedMarkers),
  forwardAmount3513: full?.forward.amountRub === 3513,
  reverseAmount3513: full?.reverse.amountRub === 3513,
  excludes769: !((full?.forward.finalMarkers ?? []).includes(769) || (full?.reverse.finalMarkers ?? []).includes(769)),
};
fullControl.pass = Object.values(fullControl).every(Boolean);

const vladimir = pairReports.find((item) => item.pair === "vladimir<->kazan");
const differentCorridorControl = {
  classifiedDifferent: vladimir?.parity.classification === "different_corridor",
  reverseNotFalseZero: vladimir?.reverse.status === "unknown_no_supported_rvp" && vladimir?.reverse.amountRub === null,
};
differentCorridorControl.pass = Object.values(differentCorridorControl).every(Boolean);

const failedPairs = pairReports.filter((pair) => !pair.pass);
const success = failedPairs.length === 0 && fullControl.pass && differentCorridorControl.pass;
const output = {
  generatedAt: new Date().toISOString(),
  diagnosticOnly: true,
  thresholds: { sameCorridorP95Km: SAME_CORRIDOR_P95_KM, directCrossingRadiusKm: evidence.directCrossingRadiusKm, maxAbsoluteContinuityErrorKm: MAX_ABSOLUTE_CONTINUITY_ERROR_KM, maxRelativeContinuityError: MAX_RELATIVE_CONTINUITY_ERROR },
  fullControl,
  differentCorridorControl,
  failedPairCount: failedPairs.length,
  success,
  pairs: pairReports,
};
await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(`direction-aware result: success=${success}; failedPairs=${failedPairs.length}; full=${fullControl.pass}; differentCorridor=${differentCorridorControl.pass}`);
if (!success) throw new Error(`5B2B-3B failed: failedPairs=${failedPairs.length}, full=${fullControl.pass}, different=${differentCorridorControl.pass}`);
