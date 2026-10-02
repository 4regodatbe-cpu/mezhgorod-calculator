import { writeFile } from "node:fs/promises";

const ROUTES = [
  {
    name: "yalta-moscow",
    points: [
      { lat: 44.495205, lon: 34.166301 },
      { lat: 45.2117, lon: 36.7161 },
      { lat: 55.755819, lon: 37.617644 },
    ],
  },
  {
    name: "moscow-yalta",
    points: [
      { lat: 55.755819, lon: 37.617644 },
      { lat: 45.2117, lon: 36.7161 },
      { lat: 44.495205, lon: 34.166301 },
    ],
  },
];

// OSM highway=toll_gantry nodes inventoried on 2026-09-30.
// Multiple nodes may represent opposite carriageways or duplicate mapping;
// this audit deliberately reports every observed node before production rules
// choose one normalized anchor per physical charging frame.
const gantries = [
  { group: "РВП 23 км", id: "13022464435", lon: 38.5327744, lat: 45.171408 },
  { group: "РВП 23 км", id: "13022464436", lon: 38.5326562, lat: 45.1713281 },
  { group: "РВП 82 км", id: "12439881648", lon: 37.8330177, lat: 45.1961096 },
  { group: "РВП 82 км", id: "12787972033", lon: 37.8066089, lat: 45.1955326 },
  { group: "РВП 103 км", id: "12439892927", lon: 37.5878131, lat: 45.168457 },
  { group: "РВП 103 км", id: "12806246303", lon: 37.5877882, lat: 45.1683514 },
  { group: "unlabelled-A289-candidate", id: "9516280711", lon: 37.6244358, lat: 45.1649198 },
  { group: "unlabelled-A289-candidate", id: "12787971946", lon: 37.6246064, lat: 45.1650058 },
];

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

function pointToSegmentKm(anchor, a, b) {
  const latScale = 110.574;
  const lonScale = 111.320 * Math.cos(anchor.lat * Math.PI / 180);
  const ax = (a[0] - anchor.lon) * lonScale;
  const ay = (a[1] - anchor.lat) * latScale;
  const bx = (b[0] - anchor.lon) * lonScale;
  const by = (b[1] - anchor.lat) * latScale;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared <= 1e-12) return Math.hypot(ax, ay);
  const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
  return Math.hypot(ax + t * dx, ay + t * dy);
}

function nearestSegment(route, anchor) {
  let best = Number.POSITIVE_INFINITY;
  let bestIndex = -1;
  for (let index = 0; index < route.length - 1; index += 1) {
    const d = pointToSegmentKm(anchor, route[index], route[index + 1]);
    if (d < best) {
      best = d;
      bestIndex = index;
    }
  }
  return {
    distanceKm: Math.round(best * 1000) / 1000,
    segmentIndex: bestIndex,
    fromPoint: route[bestIndex],
    toPoint: route[bestIndex + 1],
  };
}

async function route(test) {
  const url = new URL("https://valhalla1.openstreetmap.de/route");
  url.searchParams.set("json", JSON.stringify({
    locations: test.points,
    costing: "auto",
    costing_options: { auto: { use_tolls: 1 } },
    units: "kilometers",
    directions_type: "none",
  }));
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MezhgorodA289Audit/1.1" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Valhalla HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const data = await response.json();
  const legs = data.trip?.legs ?? [];
  const geometry = legs.flatMap((leg) => leg.shape ? decodePolyline(leg.shape) : []);
  return {
    km: data.trip?.summary?.length ?? null,
    minutes: data.trip?.summary?.time ? data.trip.summary.time / 60 : null,
    geometry,
  };
}

const results = [];
for (const test of ROUTES) {
  const built = await route(test);
  const audit = gantries.map((gantry) => ({ ...gantry, ...nearestSegment(built.geometry, gantry) }));
  const crossedGroups = [...new Set(audit.filter((item) => item.distanceKm <= 0.12).map((item) => item.group))];
  results.push({
    name: test.name,
    routeKm: built.km,
    routeMinutes: built.minutes,
    geometryPoints: built.geometry.length,
    crossedGroupsAt120m: crossedGroups,
    audit,
  });
  console.log(`=== ${test.name} ===`);
  console.table(audit.map(({ group, id, distanceKm, segmentIndex }) => ({ group, id, distanceKm, segmentIndex })));
  console.log(`crossedGroupsAt120m=${crossedGroups.join(",") || "none"}`);
}

await writeFile("a289-yaltamoscow-audit.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`);
