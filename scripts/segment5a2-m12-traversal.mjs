import { writeFile } from "node:fs/promises";

const VALHALLA = "https://valhalla1.openstreetmap.de/route";
const OVERPASS_ENDPOINTS = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];
const CORRIDOR_BOXES = [
  "55.45,37.55,56.35,40.80",
  "54.90,40.60,56.25,43.90",
  "54.75,43.70,56.25,46.80",
  "54.70,46.60,56.35,49.95",
];

// Deliberately strict for a diagnostic.  Real gantries/booths physically crossed by
// the route should project very close to its centreline.  Wider evidence bands are
// reported separately rather than silently widening the acceptance radius.
const ACCEPT_RADIUS_KM = 1.0;
const EVIDENCE_RADIUS_KM = 5.0;

const routes = [
  { name: "moscow-kazan", from: { lat: 55.755819, lon: 37.617644 }, to: { lat: 55.796127, lon: 49.106405 } },
  { name: "kazan-moscow", from: { lat: 55.796127, lon: 49.106405 }, to: { lat: 55.755819, lon: 37.617644 } },
];

function haversineKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const value = Math.sin(dLat / 2) ** 2
    + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function decodePolyline(encoded, precision = 6) {
  const coordinates = [];
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
    coordinates.push([lon / factor, lat / factor]);
  }
  return coordinates;
}

async function fetchJsonWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.remark || data?.error || `HTTP ${response.status}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function routeGeometry(spec) {
  const data = await fetchJsonWithTimeout(VALHALLA, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "user-agent": "MezhgorodSegment5A2/1.0",
    },
    body: JSON.stringify({
      locations: [spec.from, spec.to],
      costing: "auto",
      units: "kilometers",
      directions_type: "none",
    }),
  }, 70_000);

  const geometry = (data.trip?.legs ?? []).flatMap((leg) => leg.shape ? decodePolyline(leg.shape) : []);
  if (geometry.length < 2 || !data.trip?.summary?.length) throw new Error(`${spec.name}: no usable route geometry`);
  return { geometry, km: data.trip.summary.length, seconds: data.trip.summary.time };
}

async function queryInventory() {
  const byId = new Map();
  const attempts = [];

  for (let boxIndex = 0; boxIndex < CORRIDOR_BOXES.length; boxIndex += 1) {
    const bbox = CORRIDOR_BOXES[boxIndex];
    const query = `[out:json][timeout:35];(node["highway"="toll_gantry"](${bbox});node["barrier"="toll_booth"](${bbox}););out body;`;
    let succeeded = false;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      const startedAt = Date.now();
      try {
        const body = new URLSearchParams({ data: query });
        const data = await fetchJsonWithTimeout(endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            "user-agent": "MezhgorodM12Traversal/1.0 (GitHub Actions)",
          },
          body,
        }, 50_000);
        if (!Array.isArray(data.elements)) throw new Error("response has no elements array");
        for (const element of data.elements) {
          if (element.type === "node" && Number.isFinite(element.lat) && Number.isFinite(element.lon)) {
            byId.set(`${element.type}/${element.id}`, element);
          }
        }
        attempts.push({ boxIndex: boxIndex + 1, endpoint, ok: true, elapsedMs: Date.now() - startedAt, count: data.elements.length });
        succeeded = true;
        break;
      } catch (error) {
        attempts.push({ boxIndex: boxIndex + 1, endpoint, ok: false, elapsedMs: Date.now() - startedAt, error: error instanceof Error ? error.message : String(error) });
      }
    }

    if (!succeeded) throw new Error(`all Overpass endpoints failed for corridor box ${boxIndex + 1}`);
  }

  return { candidates: [...byId.values()], attempts };
}

function cumulativeDistances(route) {
  const cumulative = [0];
  for (let i = 1; i < route.length; i += 1) cumulative.push(cumulative[i - 1] + haversineKm(route[i - 1], route[i]));
  return cumulative;
}

function projectPointToSegment(point, a, b) {
  const meanLatRad = ((point[1] + a[1] + b[1]) / 3) * Math.PI / 180;
  const lonScale = 111.320 * Math.cos(meanLatRad);
  const latScale = 110.574;
  const bx = (b[0] - a[0]) * lonScale;
  const by = (b[1] - a[1]) * latScale;
  const px = (point[0] - a[0]) * lonScale;
  const py = (point[1] - a[1]) * latScale;
  const denominator = bx * bx + by * by;
  const rawT = denominator > 0 ? (px * bx + py * by) / denominator : 0;
  const t = Math.max(0, Math.min(1, rawT));
  const projected = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  return { t, projected, distanceKm: haversineKm(point, projected) };
}

function projectToRoute(route, cumulative, point) {
  let best = null;
  for (let i = 1; i < route.length; i += 1) {
    const hit = projectPointToSegment(point, route[i - 1], route[i]);
    if (!best || hit.distanceKm < best.distanceKm) {
      const segmentKm = cumulative[i] - cumulative[i - 1];
      best = {
        segmentIndex: i - 1,
        segmentFraction: hit.t,
        projectedCoordinate: hit.projected,
        distanceKm: hit.distanceKm,
        chainageKm: cumulative[i - 1] + segmentKm * hit.t,
      };
    }
  }
  return best;
}

function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function summarizeCandidate(candidate, hit, routeKm) {
  const accepted = hit.distanceKm <= ACCEPT_RADIUS_KM;
  const evidenceBand = hit.distanceKm <= EVIDENCE_RADIUS_KM;
  return {
    osmType: candidate.type,
    osmId: candidate.id,
    coordinate: [candidate.lon, candidate.lat],
    tags: candidate.tags ?? {},
    nearestDistanceKm: round(hit.distanceKm),
    chainageKm: round(hit.chainageKm),
    remainingKm: round(Math.max(0, routeKm - hit.chainageKm)),
    segmentIndex: hit.segmentIndex,
    segmentFraction: round(hit.segmentFraction, 5),
    projectedCoordinate: hit.projectedCoordinate.map((value) => round(value, 6)),
    accepted,
    evidenceBand,
    rejectionReason: accepted ? null : evidenceBand ? `outside strict ${ACCEPT_RADIUS_KM} km route radius` : `more than ${EVIDENCE_RADIUS_KM} km from route`,
  };
}

function identity(item) {
  return `${item.osmType}/${item.osmId}`;
}

const startedAt = Date.now();
const inventory = await queryInventory();
const routeResults = [];

for (const spec of routes) {
  const live = await routeGeometry(spec);
  const cumulative = cumulativeDistances(live.geometry);
  const projected = inventory.candidates.map((candidate) => {
    const hit = projectToRoute(live.geometry, cumulative, [candidate.lon, candidate.lat]);
    return summarizeCandidate(candidate, hit, cumulative[cumulative.length - 1]);
  });
  const accepted = projected.filter((item) => item.accepted).sort((a, b) => a.chainageKm - b.chainageKm || a.osmId - b.osmId);
  const nearbyRejected = projected.filter((item) => !item.accepted && item.evidenceBand).sort((a, b) => a.nearestDistanceKm - b.nearestDistanceKm || a.chainageKm - b.chainageKm);
  routeResults.push({
    name: spec.name,
    valhallaKm: round(live.km, 1),
    geometryKm: round(cumulative[cumulative.length - 1], 1),
    routeSeconds: live.seconds,
    routePointCount: live.geometry.length,
    acceptedCount: accepted.length,
    nearbyRejectedCount: nearbyRejected.length,
    accepted,
    nearbyRejected,
  });

  console.log(`\n${spec.name}: ${live.km.toFixed(1)} km, routePoints=${live.geometry.length}, accepted=${accepted.length}, nearbyRejected=${nearbyRejected.length}`);
  for (const item of accepted) {
    console.log(`  ACCEPT ${identity(item)} chainage=${item.chainageKm.toFixed(3)}km lateral=${item.nearestDistanceKm.toFixed(3)}km ${item.tags.name ?? item.tags.ref ?? item.tags.highway ?? item.tags.barrier ?? ""}`);
  }
  for (const item of nearbyRejected) {
    console.log(`  NEAR   ${identity(item)} chainage=${item.chainageKm.toFixed(3)}km lateral=${item.nearestDistanceKm.toFixed(3)}km`);
  }
}

const forward = routeResults.find((route) => route.name === "moscow-kazan");
const reverse = routeResults.find((route) => route.name === "kazan-moscow");
const forwardIds = forward?.accepted.map(identity) ?? [];
const reverseIds = reverse?.accepted.map(identity) ?? [];
const reverseIdsInForwardOrder = [...reverseIds].reverse();
const sameAcceptedSet = forwardIds.length === reverseIds.length && [...forwardIds].sort().join("|") === [...reverseIds].sort().join("|");
const exactMirroredOrder = forwardIds.join("|") === reverseIdsInForwardOrder.join("|");

const report = {
  generatedAt: new Date().toISOString(),
  wallElapsedMs: Date.now() - startedAt,
  diagnosticOnly: true,
  thresholds: {
    acceptRadiusKm: ACCEPT_RADIUS_KM,
    evidenceRadiusKm: EVIDENCE_RADIUS_KM,
    policy: "strict acceptance radius is not widened to make the traversal pass; 1..5 km candidates remain evidence only",
  },
  inventory: {
    corridorBoxes: CORRIDOR_BOXES,
    candidateCount: inventory.candidates.length,
    attempts: inventory.attempts,
  },
  mirrorComparison: {
    sameAcceptedSet,
    exactMirroredOrder,
    forwardIds,
    reverseIds,
    reverseIdsInForwardOrder,
    missingFromReverse: forwardIds.filter((id) => !reverseIds.includes(id)),
    extraInReverse: reverseIds.filter((id) => !forwardIds.includes(id)),
  },
  routes: routeResults,
};

await writeFile("segment5a2-m12-traversal.json", `${JSON.stringify(report, null, 2)}\n`);

console.log(`\nmirror: sameAcceptedSet=${sameAcceptedSet} exactMirroredOrder=${exactMirroredOrder}`);
console.log(`inventoryCandidates=${inventory.candidates.length} wallElapsedMs=${report.wallElapsedMs}`);

// 5A2 is intentionally diagnostic: fail only when route/inventory acquisition itself
// is unusable.  Traversal invariants become hard gates in 5A3 after evidence review.
if (!forward || !reverse || forward.acceptedCount === 0 || reverse.acceptedCount === 0) process.exitCode = 1;
