import { writeFile } from "node:fs/promises";
import { valhalla, osrmRoute } from "../lib/route-providers.ts";
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "../lib/special-territory-boundaries.ts";
import { analyzeRoute, candidatePlans, followsPlan } from "../lib/special-territory-policy.ts";
import { splitRouteByTerritory } from "../lib/special-territory-geometry.ts";
import { measureTerritoryLegTimes, territoryTimingPlan } from "../lib/special-territory-time.ts";

const cases = [
  { name: "Krasnodar-Donetsk", from: { label: "Krasnodar", position: { lat: 45.04, lng: 38.98 } }, to: { label: "Donetsk", position: { lat: 48.0156, lng: 37.8029 } } },
  { name: "Simferopol-Donetsk", from: { label: "Simferopol", position: { lat: 44.9521, lng: 34.1024 } }, to: { label: "Donetsk", position: { lat: 48.0156, lng: 37.8029 } } },
];
const providers = [
  { name: "Valhalla", get: (from, to, positions) => valhalla(from, to, 1, positions) },
  { name: "OSRM", get: (from, to, positions) => osrmRoute(from, to, positions) },
];
const metersBetween = (a, b) => {
  const rad = Math.PI / 180, lat1 = a[1] * rad, lat2 = b[1] * rad;
  const dLat = (b[1] - a[1]) * rad, dLng = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371008.8 * 2 * Math.asin(Math.sqrt(h));
};
const legBreakdown = (route) => route.legs?.map((leg, index) => {
  try {
    const split = splitRouteByTerritory({ coordinates: leg.coordinates, routedDistanceMeters: leg.meters, routedDurationSeconds: leg.seconds, zones });
    return { index, seconds: leg.seconds, meters: Math.round(leg.meters), territories: [...new Set(split.pieces.map(piece => piece.territory ?? "ordinary"))], pieces: split.pieces.map(piece => ({ territory: piece.territory ?? "ordinary", meters: Math.round(piece.meters) })) };
  } catch (error) { return { index, seconds: leg.seconds, meters: Math.round(leg.meters), error: error instanceof Error ? error.message : String(error) }; }
}) ?? null;
const reports = [];
for (const sample of cases) {
  for (const plan of candidatePlans(sample.from.position, sample.to.position, zones)) {
    for (const provider of providers) {
      const row = { sample: sample.name, corridor: plan.corridor, provider: provider.name, status: "unverified" };
      try {
        let route = await provider.get(sample.from, sample.to, plan.positions);
        if (!followsPlan(route.coordinates, plan.positions, plan.corridor, true)) throw new Error("INITIAL_PLAN_MISMATCH");
        const split = analyzeRoute(route.coordinates, route.meters, route.seconds, sample.from.position, sample.to.position, zones);
        let timing = territoryTimingPlan(route, zones);
        let time = measureTerritoryLegTimes(route, timing.expected, zones);
        row.initialLegCount = route.legs?.length ?? 0;
        row.expectedTerritoryLegs = timing.expected.length;
        row.initialTiming = time;
        row.initialDistanceKm = Math.round(route.meters / 100) / 10;
        row.initialSpecialKm = Math.round(split.specialKm * 10) / 10;
        row.initialRouteSeconds = route.seconds;
        if (!time.verified) {
          row.rescanRounds = [];
          for (let attempt = 0; attempt < 3 && !time.verified; attempt++) {
            route = await provider.get(sample.from, sample.to, timing.positions);
            if (!followsPlan(route.coordinates, plan.positions, plan.corridor, true)) throw new Error("RESCAN_PLAN_MISMATCH");
            analyzeRoute(route.coordinates, route.meters, route.seconds, sample.from.position, sample.to.position, zones);
            time = measureTerritoryLegTimes(route, timing.expected, zones);
            row.rescanRounds.push({ attempt: attempt + 1, legCount: route.legs?.length ?? 0, timing: time, distanceKm: Math.round(route.meters / 100) / 10, routeSeconds: route.seconds, legBreakdown: legBreakdown(route) });
            row.rescanLegCount = route.legs?.length ?? 0;
            row.rescanLegBreakdown = legBreakdown(route);
            row.rescanTiming = time;
            row.rescanDistanceKm = Math.round(route.meters / 100) / 10;
            row.rescanRouteSeconds = route.seconds;
            row.rescanEndpointOffsetsMeters = route.legs?.map((leg, i) => {
              const start = leg.coordinates[0], end = leg.coordinates.at(-1);
              const fromPoint = timing.positions[i], toPoint = timing.positions[i + 1];
              return { start: Math.round(metersBetween(start, [fromPoint.lng, fromPoint.lat])), end: Math.round(metersBetween(end, [toPoint.lng, toPoint.lat])) };
            }) ?? null;
            if (!time.verified && attempt < 2) timing = territoryTimingPlan(route, zones);
          }
        }
        row.status = time.verified ? "verified" : "unverified";
        row.specialSeconds = time.specialSeconds;
        row.specialShare = time.verified && route.seconds > 0 ? Math.round((time.specialSeconds / route.seconds) * 1000) / 1000 : null;
        row.finalDistanceKm = Math.round(route.meters / 100) / 10;
        row.finalRouteSeconds = route.seconds;
      } catch (error) { row.error = error instanceof Error ? error.message : String(error); }
      reports.push(row);
      console.log(JSON.stringify(row));
    }
  }
}
for (const sample of cases) for (const provider of providers) {
  const group = reports.filter(x => x.sample === sample.name && x.provider === provider.name);
  const mainland = group.find(x => x.corridor === "mainland" && x.status === "verified");
  const crimea = group.find(x => x.corridor === "crimea" && x.status === "verified");
  console.log(JSON.stringify({ comparison: sample.name, provider: provider.name,
    verified: Boolean(mainland && crimea), mainlandSpecialSeconds: mainland?.specialSeconds ?? null,
    crimeaSpecialSeconds: crimea?.specialSeconds ?? null,
    crimeaWithin50Percent: Boolean(mainland && crimea && mainland.specialSeconds > 0 && crimea.specialSeconds <= mainland.specialSeconds * 0.5) }));
}
await writeFile("special-territory-live-probe.json", JSON.stringify(reports, null, 2) + "\n");
