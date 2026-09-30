import { writeFile } from "node:fs/promises";

const VALHALLA = "https://valhalla1.openstreetmap.de/route";
const OUTPUT_PATH = "segment5b2b1-m12-maneuver-span-probe.json";
const M12_STRICT = /(?:^|[^0-9A-ZА-Я])(?:M|М)\s*[-‐‑–—]?\s*12(?:[^0-9]|$)/iu;
const M12_LOOSE = /(?:M|М)\s*[-‐‑–—]?\s*12|М-12|Восток/iu;

const routes = [
  { name: "moscow-kazan", from: { lat: 55.755819, lon: 37.617644 }, to: { lat: 55.796127, lon: 49.106405 } },
  { name: "kazan-moscow", from: { lat: 55.796127, lon: 49.106405 }, to: { lat: 55.755819, lon: 37.617644 } },
];

function round(value, digits = 6) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
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

function cumulativeKm(shape) {
  const values = [0];
  for (let i = 1; i < shape.length; i += 1) values.push(values[i - 1] + distanceKm(shape[i - 1], shape[i]));
  return values;
}

function textFields(maneuver) {
  return [
    ...(maneuver.street_names ?? []),
    ...(maneuver.begin_street_names ?? []),
    maneuver.instruction,
    maneuver.verbal_transition_alert_instruction,
    maneuver.verbal_pre_transition_instruction,
    maneuver.verbal_post_transition_instruction,
  ].filter((value) => typeof value === "string" && value.trim());
}

async function route(spec) {
  const payload = {
    locations: [spec.from, spec.to],
    costing: "auto",
    costing_options: { auto: { use_tolls: 1 } },
    units: "kilometers",
    shape_format: "polyline6",
    directions_options: { language: "ru-RU", units: "kilometers" },
  };

  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45_000);
    try {
      const response = await fetch(VALHALLA, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          "user-agent": "MezhgorodSegment5B2B1/1.0",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1_500));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError ?? new Error(`${spec.name}: route request failed`);
}

function analyze(spec, data) {
  const legs = data.trip?.legs ?? [];
  if (!legs.length) throw new Error(`${spec.name}: no route legs`);
  const legReports = [];
  let routeKmOffset = 0;
  let strictCount = 0;
  let looseCount = 0;
  const strictSegments = [];

  for (let legIndex = 0; legIndex < legs.length; legIndex += 1) {
    const leg = legs[legIndex];
    if (!leg.shape) throw new Error(`${spec.name}: leg ${legIndex} has no shape`);
    const shape = decodePolyline(leg.shape);
    const cumulative = cumulativeKm(shape);
    const maneuvers = (leg.maneuvers ?? []).map((maneuver, maneuverIndex) => {
      const fields = textFields(maneuver);
      const joined = fields.join(" | ");
      const strictM12 = M12_STRICT.test(joined);
      const looseM12 = M12_LOOSE.test(joined);
      const beginIndex = Number.isInteger(maneuver.begin_shape_index) ? maneuver.begin_shape_index : null;
      const endIndex = Number.isInteger(maneuver.end_shape_index) ? maneuver.end_shape_index : null;
      const validIndexes = beginIndex !== null && endIndex !== null && beginIndex >= 0 && endIndex >= beginIndex && endIndex < shape.length;
      const beginChainageKm = validIndexes ? routeKmOffset + cumulative[beginIndex] : null;
      const endChainageKm = validIndexes ? routeKmOffset + cumulative[endIndex] : null;
      if (strictM12) {
        strictCount += 1;
        if (validIndexes) strictSegments.push({ beginChainageKm, endChainageKm, legIndex, maneuverIndex });
      }
      if (looseM12) looseCount += 1;
      return {
        maneuverIndex,
        type: maneuver.type,
        beginShapeIndex: beginIndex,
        endShapeIndex: endIndex,
        validShapeIndexes: validIndexes,
        beginChainageKm: beginChainageKm === null ? null : round(beginChainageKm, 3),
        endChainageKm: endChainageKm === null ? null : round(endChainageKm, 3),
        streetNames: maneuver.street_names ?? [],
        beginStreetNames: maneuver.begin_street_names ?? [],
        instruction: maneuver.instruction ?? null,
        strictM12,
        looseM12,
      };
    });
    const geometryKm = cumulative.at(-1) ?? 0;
    legReports.push({ legIndex, shapePointCount: shape.length, geometryKm: round(geometryKm, 3), maneuverCount: maneuvers.length, maneuvers });
    routeKmOffset += geometryKm;
  }

  strictSegments.sort((a, b) => a.beginChainageKm - b.beginChainageKm);
  const span = strictSegments.length ? {
    beginKm: round(Math.min(...strictSegments.map((segment) => segment.beginChainageKm)), 3),
    endKm: round(Math.max(...strictSegments.map((segment) => segment.endChainageKm)), 3),
  } : null;
  const routeKm = Number.isFinite(data.trip?.summary?.length) ? data.trip.summary.length : routeKmOffset;

  return {
    name: spec.name,
    routeKm: round(routeKm, 3),
    geometryKm: round(routeKmOffset, 3),
    legCount: legs.length,
    strictM12ManeuverCount: strictCount,
    looseM12ManeuverCount: looseCount,
    strictSpan: span ? {
      ...span,
      normalizedBegin: round(span.beginKm / routeKmOffset),
      normalizedEnd: round(span.endKm / routeKmOffset),
      spanKm: round(span.endKm - span.beginKm, 3),
    } : null,
    legs: legReports,
  };
}

const reports = [];
for (const spec of routes) {
  const data = await route(spec);
  const report = analyze(spec, data);
  reports.push(report);
  console.log(`${spec.name}: route=${report.routeKm}km maneuvers=${report.legs.reduce((sum, leg) => sum + leg.maneuverCount, 0)} strictM12=${report.strictM12ManeuverCount} looseM12=${report.looseM12ManeuverCount} span=${report.strictSpan ? `${report.strictSpan.beginKm}-${report.strictSpan.endKm}km` : "none"}`);
}

const forward = reports.find((item) => item.name === "moscow-kazan");
const reverse = reports.find((item) => item.name === "kazan-moscow");
const bothHaveStrict = Boolean(forward?.strictSpan && reverse?.strictSpan);
let mirrorResidual = null;
if (bothHaveStrict) {
  const beginResidual = Math.abs(forward.strictSpan.normalizedBegin - (1 - reverse.strictSpan.normalizedEnd));
  const endResidual = Math.abs(forward.strictSpan.normalizedEnd - (1 - reverse.strictSpan.normalizedBegin));
  mirrorResidual = { begin: round(beginResidual), end: round(endResidual), max: round(Math.max(beginResidual, endResidual)) };
}

const validShapeIndexes = reports.every((report) => report.legs.flatMap((leg) => leg.maneuvers).filter((m) => m.strictM12).every((m) => m.validShapeIndexes));
const capability = bothHaveStrict && validShapeIndexes && mirrorResidual?.max <= 0.03
  ? "promising"
  : "insufficient";

const output = {
  generatedAt: new Date().toISOString(),
  diagnosticOnly: true,
  overpassRequests: 0,
  traceAttributeRequests: 0,
  capability,
  mirrorResidual,
  routes: reports,
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(`capability=${capability}; mirrorResidual=${mirrorResidual?.max ?? "n/a"}; overpass=0; trace_attributes=0`);
