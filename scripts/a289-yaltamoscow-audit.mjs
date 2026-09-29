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

const anchors = [
  { name: "Темрюк", lon: 37.42, lat: 45.25 },
  { name: "Варениковская", lon: 37.64, lat: 45.14 },
  { name: "Славянск-на-Кубани", lon: 38.14, lat: 45.24 },
  { name: "Марьянская", lon: 38.62, lat: 45.09 },
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

function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function nearest(route, anchor) {
  let best = Number.POSITIVE_INFINITY;
  let bestIndex = -1;
  route.forEach((point, index) => {
    const d = distanceKm(point, [anchor.lon, anchor.lat]);
    if (d < best) {
      best = d;
      bestIndex = index;
    }
  });
  return { distanceKm: Math.round(best * 1000) / 1000, index: bestIndex, point: route[bestIndex] };
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
    headers: { Accept: "application/json", "User-Agent": "MezhgorodA289Audit/1.0" },
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
  const audit = anchors.map((anchor) => ({ anchor: anchor.name, ...nearest(built.geometry, anchor) }));
  const nearAllA289Anchors = audit.every((item) => item.distanceKm <= 8);
  results.push({
    name: test.name,
    routeKm: built.km,
    routeMinutes: built.minutes,
    geometryPoints: built.geometry.length,
    nearAllA289Anchors,
    audit,
  });
  console.log(`=== ${test.name} ===`);
  console.table(audit.map(({ anchor, distanceKm, index }) => ({ anchor, distanceKm, index })));
  console.log(`nearAllA289Anchors=${nearAllA289Anchors}`);
}

await writeFile("a289-yaltamoscow-audit.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`);
