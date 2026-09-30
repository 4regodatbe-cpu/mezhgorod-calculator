import { readFile, writeFile } from "node:fs/promises";

const VALHALLA = "https://valhalla1.openstreetmap.de/route";
const FIXTURE_PATH = "data/fixtures/m12-osm-5a2-limited.json";
const OUTPUT_PATH = "segment5a2c-m12-parity-fixture.json";
const ROUTE_RADIUS_KM = 1.0;
const EVENT_CLUSTER_KM = 0.25;

const routeSpecs = [
  { name: "moscow-kazan", from: { lat: 55.755819, lon: 37.617644 }, to: { lat: 55.796127, lon: 49.106405 } },
  { name: "kazan-moscow", from: { lat: 55.796127, lon: 49.106405 }, to: { lat: 55.755819, lon: 37.617644 } },
];

function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const value = Math.sin(dLat / 2) ** 2
    + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function decodePolyline(encoded, precision = 6) {
  const out = [];
  const factor = 10 ** precision;
  let index = 0;
  let lat = 0;
  let lon = 0;
  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);
    lon += result & 1 ? ~(result >> 1) : result >> 1;
    out.push([lon / factor, lat / factor]);
  }
  return out;
}

async function fetchJson(url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function routeGeometry(spec) {
  const body = {
    locations: [spec.from, spec.to],
    costing: "auto",
    costing_options: { auto: { use_tolls: 1 } },
    units: "kilometers",
    directions_type: "none",
    shape_format: "polyline6",
  };
  const started = Date.now();
  const data = await fetchJson(VALHALLA, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "user-agent": "MezhgorodSegment5A2c/1.0",
    },
    body: JSON.stringify(body),
  }, 70_000);
  const geometry = (data.trip?.legs ?? []).flatMap((leg) => leg.shape ? decodePolyline(leg.shape) : []);
  if (geometry.length < 2 || !Number.isFinite(data.trip?.summary?.length)) {
    throw new Error(`${spec.name}: no usable production-parity Valhalla geometry`);
  }
  return {
    geometry,
    km: data.trip.summary.length,
    seconds: data.trip.summary.time,
    elapsedMs: Date.now() - started,
  };
}

function cumulative(route) {
  const values = [0];
  for (let i = 1; i < route.length; i += 1) values.push(values[i - 1] + distanceKm(route[i - 1], route[i]));
  return values;
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
  return { t, projected, distanceKm: distanceKm(point, projected) };
}

function projectRoute(route, cumulativeKm, point) {
  let best = null;
  for (let i = 1; i < route.length; i += 1) {
    const hit = projectSegment(point, route[i - 1], route[i]);
    if (!best || hit.distanceKm < best.distanceKm) {
      const segmentKm = cumulativeKm[i] - cumulativeKm[i - 1];
      best = {
        distanceKm: hit.distanceKm,
        chainageKm: cumulativeKm[i - 1] + segmentKm * hit.t,
        segmentIndex: i - 1,
        projected: hit.projected,
      };
    }
  }
  return best;
}

function clusterEvents(items) {
  const sorted = [...items].sort((a, b) => a.chainageKm - b.chainageKm || a.id - b.id);
  const clusters = [];
  for (const item of sorted) {
    const last = clusters.at(-1);
    if (last && item.chainageKm - last.maxChainageKm <= EVENT_CLUSTER_KM) {
      last.items.push(item);
      last.maxChainageKm = item.chainageKm;
      last.chainageKm = round(last.items.reduce((sum, value) => sum + value.chainageKm, 0) / last.items.length);
    } else {
      clusters.push({ chainageKm: item.chainageKm, maxChainageKm: item.chainageKm, items: [item] });
    }
  }
  return clusters.map((cluster, eventIndex) => ({
    eventIndex,
    chainageKm: cluster.chainageKm,
    osmIds: cluster.items.map((item) => item.id),
    coordinates: cluster.items.map((item) => [item.lon, item.lat]),
    maxLateralKm: round(Math.max(...cluster.items.map((item) => item.nearestDistanceKm))),
  }));
}

function corridorParity(a, b) {
  function oneWay(source, target) {
    const sourceStep = Math.max(1, Math.floor(source.length / 180));
    const targetStep = Math.max(1, Math.floor(target.length / 1200));
    const values = [];
    for (let i = 0; i < source.length; i += sourceStep) {
      let best = Infinity;
      for (let j = 0; j < target.length; j += targetStep) best = Math.min(best, distanceKm(source[i], target[j]));
      values.push(best);
    }
    values.sort((x, y) => x - y);
    const quantile = (p) => values[Math.min(values.length - 1, Math.floor((values.length - 1) * p))];
    return {
      samples: values.length,
      medianKm: round(quantile(0.5)),
      p95Km: round(quantile(0.95)),
      maxKm: round(values.at(-1)),
    };
  }
  return { forwardToReverse: oneWay(a, b), reverseToForward: oneWay(b, a) };
}

const startedAt = Date.now();
const fixture = JSON.parse(await readFile(FIXTURE_PATH, "utf8"));
if (fixture.scope !== "LIMITED_PARITY_FIXTURE") throw new Error(`unexpected fixture scope: ${fixture.scope}`);
if (fixture.candidateCount !== 68 || fixture.candidates?.length !== 68) throw new Error(`fixture count mismatch: ${fixture.candidates?.length}`);
if (fixture.provenance?.runId !== 36728141365 || fixture.provenance?.artifactId !== 11102648908) throw new Error("fixture provenance mismatch");

const routeData = await Promise.all(routeSpecs.map(routeGeometry));
const routes = [];
for (let i = 0; i < routeSpecs.length; i += 1) {
  const spec = routeSpecs[i];
  const live = routeData[i];
  const cumulativeKm = cumulative(live.geometry);
  const projected = fixture.candidates.map((candidate) => {
    const hit = projectRoute(live.geometry, cumulativeKm, [candidate.lon, candidate.lat]);
    const nearRoute = hit.distanceKm <= ROUTE_RADIUS_KM;
    const eligibleM12Evidence = nearRoute && candidate.kind === "gantry" && candidate.platon === false;
    return {
      ...candidate,
      nearestDistanceKm: round(hit.distanceKm),
      chainageKm: round(hit.chainageKm),
      nearRoute,
      eligibleM12Evidence,
      exclusionReason: eligibleM12Evidence
        ? null
        : candidate.platon
          ? "Platon/HGV gantry"
          : candidate.kind === "booth"
            ? "physical toll booth is not M-12 free-flow gantry evidence"
            : !nearRoute
              ? `outside ${ROUTE_RADIUS_KM} km route radius`
              : "not eligible passenger M-12 free-flow evidence",
    };
  });
  const eligible = projected.filter((item) => item.eligibleM12Evidence);
  const excludedNear = projected.filter((item) => item.nearRoute && !item.eligibleM12Evidence);
  const events = clusterEvents(eligible);
  routes.push({
    name: spec.name,
    valhallaKm: round(live.km, 1),
    geometryKm: round(cumulativeKm.at(-1), 1),
    routeSeconds: live.seconds,
    routeElapsedMs: live.elapsedMs,
    routePointCount: live.geometry.length,
    eligibleCount: eligible.length,
    eventCount: events.length,
    events,
    eligible,
    excludedNear,
    projections: projected,
  });
  console.log(`${spec.name}: km=${live.km.toFixed(1)} points=${live.geometry.length} eligibleGantries=${eligible.length} events=${events.length} excludedNear=${excludedNear.length}`);
}

const parity = corridorParity(routeData[0].geometry, routeData[1].geometry);
const informative = routes.every((route) => route.eventCount >= 2)
  && Math.max(parity.forwardToReverse.p95Km, parity.reverseToForward.p95Km) <= 3;
const coverageAssessment = {
  status: informative ? "informative_limited_fixture" : "insufficient_limited_fixture",
  informative,
  reason: informative
    ? "Both production-parity directions intersect multiple non-Platon gantry events; fixture remains non-authoritative and must not be used for tariff coverage."
    : "The limited fixture does not provide enough bidirectional event evidence for physical-event clustering; build a versioned full inventory before promotion.",
};

const report = {
  generatedAt: new Date().toISOString(),
  wallElapsedMs: Date.now() - startedAt,
  diagnosticOnly: true,
  overpassRequests: 0,
  fixture: {
    scope: fixture.scope,
    warning: fixture.warning,
    provenance: fixture.provenance,
    candidateCount: fixture.candidateCount,
  },
  thresholds: { routeRadiusKm: ROUTE_RADIUS_KM, eventClusterKm: EVENT_CLUSTER_KM },
  parity,
  coverageAssessment,
  routes,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`);
console.log(`parity p95: F→R=${parity.forwardToReverse.p95Km}km R→F=${parity.reverseToForward.p95Km}km`);
console.log(`coverage=${coverageAssessment.status}; overpassRequests=0; wall=${report.wallElapsedMs}ms`);
