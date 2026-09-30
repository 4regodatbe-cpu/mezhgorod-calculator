import { writeFile } from "node:fs/promises";

const VALHALLA = "https://valhalla1.openstreetmap.de/route";
const OUTPUT = "segment5b2c1-m12-route-fixture.json";
const M12 = /(?:^|[^0-9A-ZА-Я])(?:M|М)\s*[-‐‑–—]?\s*12(?:[^0-9]|$)/iu;

const places = {
  moscow: { lat: 55.755819, lon: 37.617644 },
  vladimir: { lat: 56.129057, lon: 40.406635 },
  murom: { lat: 55.578348, lon: 42.052126 },
  arzamas: { lat: 55.394902, lon: 43.839919 },
  kazan: { lat: 55.796127, lon: 49.106405 },
};
const pairs = [
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

function cumulative(shape) {
  const out = [0];
  for (let i = 1; i < shape.length; i += 1) out.push(out[i - 1] + haversineKm(shape[i - 1], shape[i]));
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
        headers: { "content-type": "application/json", accept: "application/json", "user-agent": "MezhgorodSegment5B2C1/1.0" },
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

function normalizeRoute(name, fromKey, toKey, data) {
  const legs = data.trip?.legs ?? [];
  if (!legs.length) throw new Error(`${name}: no legs`);
  let routeOffsetKm = 0;
  const strictSegments = [];
  const normalizedLegs = legs.map((leg, legIndex) => {
    if (!leg.shape) throw new Error(`${name}: leg ${legIndex} missing shape`);
    const shape = decodePolyline(leg.shape);
    const chain = cumulative(shape);
    const strictManeuvers = [];
    for (const [maneuverIndex, maneuver] of (leg.maneuvers ?? []).entries()) {
      const names = [...(maneuver.street_names ?? []), ...(maneuver.begin_street_names ?? [])];
      if (!names.some((value) => M12.test(value))) continue;
      const begin = maneuver.begin_shape_index;
      const end = maneuver.end_shape_index;
      if (!Number.isInteger(begin) || !Number.isInteger(end) || begin < 0 || end < begin || end >= shape.length) continue;
      const item = {
        maneuverIndex,
        names,
        beginShapeIndex: begin,
        endShapeIndex: end,
        beginRouteKm: round(routeOffsetKm + chain[begin], 3),
        endRouteKm: round(routeOffsetKm + chain[end], 3),
      };
      strictManeuvers.push(item);
      strictSegments.push(item);
    }
    routeOffsetKm += chain.at(-1) ?? 0;
    return { shape: leg.shape, shapePointCount: shape.length, strictManeuvers };
  });
  const strictSpan = strictSegments.length ? {
    beginKm: round(Math.min(...strictSegments.map((item) => item.beginRouteKm)), 3),
    endKm: round(Math.max(...strictSegments.map((item) => item.endRouteKm)), 3),
  } : null;
  return {
    id: name,
    from: fromKey,
    to: toKey,
    endpoints: { from: places[fromKey], to: places[toKey] },
    valhallaKm: round(data.trip?.summary?.length ?? routeOffsetKm, 3),
    geometryKm: round(routeOffsetKm, 3),
    strictM12Span: strictSpan,
    legs: normalizedLegs,
  };
}

const routes = [];
for (const [a, b] of pairs) {
  for (const [fromKey, toKey] of [[a, b], [b, a]]) {
    const id = `${fromKey}->${toKey}`;
    const data = await fetchRoute(places[fromKey], places[toKey], id);
    const normalized = normalizeRoute(id, fromKey, toKey, data);
    routes.push(normalized);
    console.log(`${id}: ${normalized.valhallaKm}km span=${normalized.strictM12Span ? `${normalized.strictM12Span.beginKm}-${normalized.strictM12Span.endKm}` : "none"} legs=${normalized.legs.length}`);
  }
}

const fixture = {
  fixtureVersion: 1,
  capturedAt: new Date().toISOString(),
  purpose: "Deterministic M-12 toll-core regression fixture; not a production route database",
  source: {
    provider: "Valhalla public server",
    endpoint: VALHALLA,
    requestSemantics: { costing: "auto", useTolls: 1, shapeFormat: "polyline6", directions: true },
  },
  routeCount: routes.length,
  routes,
};
await writeFile(OUTPUT, `${JSON.stringify(fixture)}\n`);
console.log(`captured ${routes.length} deterministic route controls`);
