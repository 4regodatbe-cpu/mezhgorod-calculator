import { writeFile } from "node:fs/promises";
import { valhalla, osrmRoute } from "../lib/route-providers.ts";
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "../lib/special-territory-boundaries.ts";
import { analyzeRoute, candidatePlans, followsPlan } from "../lib/special-territory-policy.ts";
import { splitRouteByTerritory } from "../lib/special-territory-geometry.ts";
import { measureTerritoryLegTimes, territoryTimingPlan } from "../lib/special-territory-time.ts";
import { calculateLegTolls } from "../lib/v2-calculation/route-leg-pricing.ts";
import { tollsForApi } from "../lib/v2-calculation/free-route-selection.ts";
import { calculateM4Core } from "../lib/toll-engine/m4-core.ts";

const krasnodar = { label: "Krasnodar", position: { lat: 45.04, lng: 38.98 } };
const donetsk = { label: "Donetsk", position: { lat: 48.0158753, lng: 37.8013407 } };
const moscow = { label: "Москва", position: { lat: 55.7505412, lng: 37.6174782 } };
const simferopol = { label: "Simferopol", position: { lat: 44.9521, lng: 34.1024 } };
// Representative city-centre coordinates. Explicit points avoid ambiguous homonyms in free-text geocoding.
const feodosia = { label: "Феодосия", position: { lat: 45.033669, lng: 35.3753628 } };
const mariupol = { label: "Мариуполь", position: { lat: 47.1, lng: 37.55 } };
const yalta = { label: "Ялта", position: { lat: 44.4987874, lng: 34.1689358 } };
const volnovakha = { label: "Волноваха — ДНР", position: { lat: 47.6014517, lng: 37.4934079 } };
const cases = [
  { name: "Feodosia-Mariupol", from: feodosia, to: mariupol },
  { name: "Yalta-Donetsk", from: yalta, to: donetsk },
  // User screenshot reference: Yandex 991 km / about 2,060 ₽ toll (weekday), route via Crimea bridge, Krasnodar, Rostov and Mariupol.
  { name: "Yalta-Volnovakha", from: yalta, to: volnovakha, referenceDistanceKm: 991, referenceTollRub: 2060, referenceWeekendTollRub: 2533 },
  { name: "Krasnodar-Donetsk", from: krasnodar, to: donetsk },
  { name: "Donetsk-Krasnodar", from: donetsk, to: krasnodar },
  // User-provided Yandex screenshot (2026-10-04): 1,220 km fast route, 1,230 km alternative.
  { name: "Donetsk-Moscow", from: donetsk, to: moscow, referenceDistanceKm: 1220, referenceTollRub: 3810 },
  { name: "Volnovakha-Moscow", from: volnovakha, to: moscow },
  { name: "Simferopol-Donetsk", from: simferopol, to: donetsk },
  { name: "Donetsk-Simferopol", from: donetsk, to: simferopol },
  { name: "Simferopol-Krasnodar", from: simferopol, to: krasnodar },
  { name: "Krasnodar-Simferopol", from: krasnodar, to: simferopol },
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
    return { index, seconds: leg.seconds, meters: Math.round(leg.meters), territories: [...new Set(split.pieces.map(piece => piece.territory ?? "ordinary"))], pieces: split.pieces.map(piece => ({ territory: piece.territory ?? "ordinary", meters: Math.round(piece.meters * 1000) / 1000 })) };
  } catch (error) { return { index, seconds: leg.seconds, meters: Math.round(leg.meters), error: error instanceof Error ? error.message : String(error) }; }
}) ?? null;
const reports = [];
for (const sample of cases) {
  for (const plan of candidatePlans(sample.from.position, sample.to.position, zones)) {
    for (const provider of providers) {
      const row = { sample: sample.name, from: sample.from.label, to: sample.to.label, fromPosition: sample.from.position, toPosition: sample.to.position, corridor: plan.corridor, provider: provider.name, referenceDistanceKm: sample.referenceDistanceKm ?? null, status: "unverified" };
      try {
        let route = await provider.get(sample.from, sample.to, plan.positions);
        if (!followsPlan(route.coordinates, plan.positions, plan.corridor, true)) {
          row.planPositions = plan.positions;
          row.planPositionOffsetsMeters = plan.positions.map(point => Math.round(Math.min(...route.coordinates.map(coordinate => metersBetween(coordinate, [point.lng, point.lat])))));
          throw new Error("INITIAL_PLAN_MISMATCH");
        }
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
          route = await provider.get(sample.from, sample.to, timing.positions);
          if (!followsPlan(route.coordinates, plan.positions, plan.corridor, true)) throw new Error("RESCAN_PLAN_MISMATCH");
          analyzeRoute(route.coordinates, route.meters, route.seconds, sample.from.position, sample.to.position, zones);
          time = measureTerritoryLegTimes(route, timing.expected, zones);
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
          const refined = territoryTimingPlan(route, zones);
          const refinedLegMeters = refined.positions.slice(1).map((point, i) => metersBetween([refined.positions[i].lng, refined.positions[i].lat], [point.lng, point.lat]));
          row.refinedPlan = { expectedLegCount: refined.expected.length, positions: refined.positions.length, minimumControlSpacingMeters: refinedLegMeters.length ? Math.round(Math.min(...refinedLegMeters) * 1000) / 1000 : null, zeroOrNearZeroLegCount: refinedLegMeters.filter(meters => meters < 1).length };
        }
        row.status = time.verified ? "verified" : "unverified";
        row.specialSeconds = time.specialSeconds;
        row.specialShare = time.verified && route.seconds > 0 ? Math.round((time.specialSeconds / route.seconds) * 1000) / 1000 : null;
        row.finalDistanceKm = Math.round(route.meters / 100) / 10;
        row.finalRouteSeconds = route.seconds;
        if (sample.name === "Donetsk-Moscow" || sample.name === "Volnovakha-Moscow" || sample.name === "Yalta-Volnovakha") {
          const priced = await calculateLegTolls({
            routeGeometry: route.coordinates,
            routeSeconds: route.seconds,
            departureAt: "2026-10-08T10:00:00+03:00",
            selectedFastProvider: provider.name,
            selectedFastRoute: route,
            valhallaEvidence: provider.name === "Valhalla" ? route : null,
            confirmedFreeRoute: null,
            diagnosticFastValidation: null,
          });
          const tolls = tollsForApi(priced.tolls, priced.fastValidation);
          const m4 = sample.name.endsWith("-Moscow") ? await calculateM4Core(route.coordinates, "2026-10-08T10:00:00+03:00", route.seconds) : null;
          row.tollProbe = {
            m4RouteDistanceMeters: m4?.validation.routeDistanceMeters ?? null,
            m4RouteDurationSeconds: m4?.validation.routeDurationSeconds ?? null,
            m4Plazas: m4?.pricing.pricedPlazas.map((item) => ({ id: item.id, km: item.km, direction: item.direction, entryKm: item.entryKm ?? null, exitKm: item.exitKm ?? null, weekday: item.weekday, weekend: item.weekend, selectedAmount: item.selectedAmount, verification: item.verification })) ?? null,
            m4Unresolved: m4?.pricing.unresolved.map((item) => ({ code: item.code, kms: item.kms, message: item.message })) ?? null,
            m4Checks: m4?.validation.checks.map((item) => ({ km: item.km, routeProgressMeters: item.routeProgressMeters ?? null, status: item.status, evidence: item.evidence, matchedNodeIds: item.matchedNodeIds, message: item.message })) ?? null,
            m4EdgeEvents: m4?.validation.events.map((item) => ({ osmNodeId: item.osmNodeId, edgeToll: item.edgeToll, wayId: item.wayId, roadNames: item.roadNames })) ?? null,
            referenceWeekdayTollRub: sample.referenceTollRub ?? null,
            referenceWeekendTollRub: sample.referenceWeekendTollRub ?? null,
            weekendTollDeviationRub: tolls.weekendAmount == null || sample.referenceWeekendTollRub == null ? null : tolls.weekendAmount - sample.referenceWeekendTollRub,
            weekdayTollDeviationRub: tolls.weekdayAmount == null || sample.referenceTollRub == null ? null : tolls.weekdayAmount - sample.referenceTollRub,
            pricingStatus: tolls.pricingStatus,
            amount: tolls.amount,
            weekdayAmount: tolls.weekdayAmount,
            weekendAmount: tolls.weekendAmount,
            confidence: tolls.confidence,
            segments: tolls.segments,
            validation: { status: priced.fastValidation.status, message: priced.fastValidation.message },
          };
        }
        row.referenceDistanceDeviationPercent = sample.referenceDistanceKm
          ? Math.round((route.meters / 1000 - sample.referenceDistanceKm) / sample.referenceDistanceKm * 1000) / 10
          : null;
      } catch (error) { row.error = error instanceof Error ? error.message : String(error); }
      reports.push(row);
      console.log(JSON.stringify(row));
    }
  }
}
for(const sample of cases){
 const plan=candidatePlans(sample.from.position,sample.to.position,zones)[0];
 console.log(JSON.stringify({selection:sample.name,from:sample.from.label,to:sample.to.label,preferredCorridor:plan?.corridor??null,waypointCount:plan?.positions.length??0}));
}
await writeFile("special-territory-live-probe.json",JSON.stringify(reports,null,2)+"\n");
