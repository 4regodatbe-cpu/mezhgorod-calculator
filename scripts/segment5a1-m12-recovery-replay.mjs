import { writeFile } from "node:fs/promises";

const VALHALLA = "https://valhalla1.openstreetmap.de/route";
const MAX_ROUTE_GAP_KM = 1.5;
const RECOVERY_RADIUS_KM = 10;
const MIN_RUN_WITHOUT_MAP_MATCH = 5;

const points = [
  { name: "Москва", coordinate: [37.87, 55.75] },
  { name: "Электроугли", coordinate: [38.22, 55.72] },
  { name: "ЦКАД", coordinate: [38.46, 55.72] },
  { name: "Орехово-Зуево", coordinate: [38.94, 55.8] },
  { name: "Петушки", coordinate: [39.46, 55.93] },
  { name: "Владимир", coordinate: [40.41, 56.08] },
  { name: "Гусь-Хрустальный", coordinate: [40.65, 55.62] },
  { name: "Меленки", coordinate: [41.63, 55.34] },
  { name: "Муром", coordinate: [42.04, 55.58] },
  { name: "Дивеево", coordinate: [43.24, 55.04] },
  { name: "Арзамас", coordinate: [43.84, 55.39] },
  { name: "Сергач", coordinate: [45.47, 55.52] },
  { name: "Шумерля", coordinate: [46.42, 55.5] },
  { name: "Канаш", coordinate: [47.5, 55.5] },
  { name: "Большие Кайбицы", coordinate: [48.17, 55.4] },
  { name: "Ивановское (Р241); legacy label: Иннополис", coordinate: [48.75, 55.75] },
  { name: "Тетюши", coordinate: [48.84, 54.94] },
  { name: "аэропорт Казань", coordinate: [49.28, 55.61] },
  { name: "Казань (Р239)", coordinate: [49.12, 55.78] },
  { name: "Шали", coordinate: [49.66, 55.51] },
];

const adjacentTariffs = [176, 322, 244, 359, 636, 165, 522, 205, 510, 311, 602, 348, 392, 215, 243, 155, 280, 162, 62];

const routes = [
  { name: "moscow-kazan", from: { lat: 55.755819, lon: 37.617644 }, to: { lat: 55.796127, lon: 49.106405 }, officialAmount: 5847 },
  { name: "kazan-moscow", from: { lat: 55.796127, lon: 49.106405 }, to: { lat: 55.755819, lon: 37.617644 }, officialAmount: 5847 },
  { name: "moscow-shali", from: { lat: 55.755819, lon: 37.617644 }, to: { lat: 55.51, lon: 49.66 }, officialAmount: 5909 },
];

function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = (b[0] - a[0]) * rad;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function decodePolyline(encoded, precision = 6) {
  const coordinates = [];
  const factor = 10 ** precision;
  let index = 0;
  let lat = 0;
  let lng = 0;
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
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coordinates.push([lng / factor, lat / factor]);
  }
  return coordinates;
}

function densify(route) {
  if (route.length < 2) return route;
  const result = [route[0]];
  for (let index = 1; index < route.length; index += 1) {
    const from = route[index - 1];
    const to = route[index];
    const steps = Math.max(1, Math.ceil(distanceKm(from, to) / MAX_ROUTE_GAP_KM));
    for (let step = 1; step <= steps; step += 1) {
      const ratio = step / steps;
      result.push([
        from[0] + (to[0] - from[0]) * ratio,
        from[1] + (to[1] - from[1]) * ratio,
      ]);
    }
  }
  return result;
}

function nearest(route, point) {
  let index = -1;
  let best = Number.POSITIVE_INFINITY;
  route.forEach((coordinate, candidateIndex) => {
    const distance = distanceKm(coordinate, point);
    if (distance < best) {
      best = distance;
      index = candidateIndex;
    }
  });
  return { index, distanceKm: best, withinLegacyRadius: best <= RECOVERY_RADIUS_KM };
}

function pathDistance(route, fromIndex, toIndex) {
  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  let total = 0;
  for (let index = start + 1; index <= end; index += 1) total += distanceKm(route[index - 1], route[index]);
  return total;
}

function buildRuns(indexes) {
  if (!indexes.length) return [];
  const sorted = [...indexes].sort((a, b) => a - b);
  const runs = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i] - sorted[i - 1] <= 2) runs[runs.length - 1].push(sorted[i]);
    else runs.push([sorted[i]]);
  }
  return runs.sort((a, b) => b.length - a.length || a[0] - b[0]);
}

async function routeGeometry(from, to) {
  const body = {
    locations: [from, to],
    costing: "auto",
    units: "kilometers",
    directions_type: "none",
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 70_000);
  try {
    const response = await fetch(VALHALLA, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "user-agent": "MezhgorodSegment5A1/1.0",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    const summary = data.trip?.summary;
    const geometry = (data.trip?.legs ?? []).flatMap((leg) => leg.shape ? decodePolyline(leg.shape) : []);
    if (!summary?.length || geometry.length < 2) throw new Error("Valhalla returned no usable route geometry");
    return { geometry, km: summary.length, seconds: summary.time };
  } finally {
    clearTimeout(timer);
  }
}

function replayLegacy(route) {
  const dense = densify(route);
  const anchorEvidence = points.map((point, pointIndex) => {
    const hit = nearest(dense, point.coordinate);
    return {
      pointIndex,
      name: point.name,
      coordinate: point.coordinate,
      nearestRouteIndex: hit.index,
      nearestDistanceKm: Math.round(hit.distanceKm * 1000) / 1000,
      withinLegacyRadius: hit.withinLegacyRadius,
    };
  });

  const segments = adjacentTariffs.map((amount, index) => {
    const start = anchorEvidence[index];
    const end = anchorEvidence[index + 1];
    const directKm = distanceKm(points[index].coordinate, points[index + 1].coordinate);
    const eligibleAnchors = start.withinLegacyRadius && end.withinLegacyRadius && start.nearestRouteIndex !== end.nearestRouteIndex;
    const travelledKm = eligibleAnchors ? pathDistance(dense, start.nearestRouteIndex, end.nearestRouteIndex) : null;
    const minKm = directKm * 0.68 - 12;
    const maxKm = directKm * 1.75 + 12;
    const matched = eligibleAnchors && travelledKm >= minKm && travelledKm <= maxKm;
    return {
      index,
      name: `${points[index].name} → ${points[index + 1].name}`,
      amount,
      startDistanceKm: start.nearestDistanceKm,
      endDistanceKm: end.nearestDistanceKm,
      startRouteIndex: start.nearestRouteIndex,
      endRouteIndex: end.nearestRouteIndex,
      directionAlongRoute: start.nearestRouteIndex < end.nearestRouteIndex ? "forward" : "reverse",
      directKm: Math.round(directKm * 10) / 10,
      travelledKm: travelledKm == null ? null : Math.round(travelledKm * 10) / 10,
      travelledDirectRatio: travelledKm == null ? null : Math.round((travelledKm / directKm) * 1000) / 1000,
      legacyMinKm: Math.round(minKm * 10) / 10,
      legacyMaxKm: Math.round(maxKm * 10) / 10,
      matched,
      rejectionReason: matched ? null : !start.withinLegacyRadius || !end.withinLegacyRadius
        ? "anchor outside 10 km legacy radius"
        : start.nearestRouteIndex === end.nearestRouteIndex
          ? "both anchors map to same route index"
          : `travelled distance outside legacy envelope ${minKm.toFixed(1)}..${maxKm.toFixed(1)} km`,
    };
  });

  const matchedIndexes = segments.filter((segment) => segment.matched).map((segment) => segment.index);
  const runs = buildRuns(matchedIndexes);
  const longestRun = runs[0] ?? [];
  const accepted = longestRun.length >= MIN_RUN_WITHOUT_MAP_MATCH;
  const allMatchedAmount = segments.filter((segment) => segment.matched).reduce((sum, segment) => sum + segment.amount, 0);
  const longestRunAmount = longestRun.reduce((sum, index) => sum + segments[index].amount, 0);

  return {
    densePointCount: dense.length,
    anchorEvidence,
    segments,
    matchedIndexes,
    runs,
    longestRun,
    longestRunLength: longestRun.length,
    minimumRequiredRun: MIN_RUN_WITHOUT_MAP_MATCH,
    acceptedByLegacyWithoutMapMatch: accepted,
    oldRecoveryWouldSumAllMatchedAmount: accepted ? allMatchedAmount : 0,
    longestRunAmount,
    discontinuousMatchedIndexesOutsideLongestRun: matchedIndexes.filter((index) => !longestRun.includes(index)),
  };
}

const results = [];
for (const spec of routes) {
  const startedAt = Date.now();
  try {
    const live = await routeGeometry(spec.from, spec.to);
    const replay = replayLegacy(live.geometry);
    const result = {
      ...spec,
      ok: true,
      wallElapsedMs: Date.now() - startedAt,
      routeKm: Math.round(live.km * 10) / 10,
      routeSeconds: live.seconds,
      routePointCount: live.geometry.length,
      officialAmount: spec.officialAmount,
      replay,
      legacyVsOfficialDifference: replay.oldRecoveryWouldSumAllMatchedAmount - spec.officialAmount,
    };
    results.push(result);
    console.log(`\n${spec.name}: route=${result.routeKm} km points=${result.routePointCount} matched=${replay.matchedIndexes.length}/19 longestRun=${replay.longestRunLength} accepted=${replay.acceptedByLegacyWithoutMapMatch}`);
    console.log(`  legacyAllMatched=${replay.oldRecoveryWouldSumAllMatchedAmount} official=${spec.officialAmount} longestRunAmount=${replay.longestRunAmount} diff=${result.legacyVsOfficialDifference}`);
    for (const segment of replay.segments) {
      console.log(`  ${segment.matched ? "MATCH" : "MISS "} #${segment.index} ${segment.name}: anchors=${segment.startDistanceKm.toFixed(3)}/${segment.endDistanceKm.toFixed(3)}km travelled=${segment.travelledKm ?? "-"} direct=${segment.directKm} ratio=${segment.travelledDirectRatio ?? "-"}${segment.rejectionReason ? ` reason=${segment.rejectionReason}` : ""}`);
    }
  } catch (error) {
    results.push({ ...spec, ok: false, wallElapsedMs: Date.now() - startedAt, error: error instanceof Error ? error.message : String(error) });
    console.log(`ERROR ${spec.name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const successful = results.filter((result) => result.ok);
const report = {
  generatedAt: new Date().toISOString(),
  algorithmSnapshot: {
    recoveryRadiusKm: RECOVERY_RADIUS_KM,
    maxDenseGapKm: MAX_ROUTE_GAP_KM,
    minimumRunWithoutMapMatch: MIN_RUN_WITHOUT_MAP_MATCH,
    matchingEnvelope: "travelled >= direct*0.68-12 && travelled <= direct*1.75+12",
    knownLegacyBehavior: "when accepted, current recoverCorridorTolls sums every matched segment, not only the longest run",
  },
  summary: {
    requestedRoutes: routes.length,
    successfulRoutes: successful.length,
    routesAcceptedByLegacy: successful.filter((result) => result.replay.acceptedByLegacyWithoutMapMatch).length,
    routesMatchingOfficialAmountExactly: successful.filter((result) => result.replay.oldRecoveryWouldSumAllMatchedAmount === result.officialAmount).length,
  },
  results,
};

await writeFile("segment5a1-m12-recovery-replay.json", `${JSON.stringify(report, null, 2)}\n`);

if (successful.length === 0) process.exitCode = 1;
