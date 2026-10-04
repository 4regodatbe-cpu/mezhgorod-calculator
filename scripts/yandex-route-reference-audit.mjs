import { readFile, writeFile } from "node:fs/promises";
import { valhalla, osrmRoute } from "../lib/route-providers.ts";
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "../lib/special-territory-boundaries.ts";
import { analyzeRoute, candidatePlans, followsPlan } from "../lib/special-territory-policy.ts";
import { territoryTimingPlan, measureTerritoryLegTimes } from "../lib/special-territory-time.ts";
import { selectLiveRouteCandidates } from "../lib/route-quality.ts";
import { calculateLegTolls } from "../lib/v2-calculation/route-leg-pricing.ts";
import { tollsForApi } from "../lib/v2-calculation/free-route-selection.ts";
import { calculateM4Core } from "../lib/toll-engine/m4-core.ts";
import { priceA289Route } from "../lib/toll-engine/a289-engine.ts";

const snapshot = JSON.parse(await readFile(new URL("../benchmarks/routes/yandex-2026-10-04/screenshot-observations.json", import.meta.url), "utf8"));
const providers = [
  { name: "Valhalla", get: (from, to, positions) => valhalla(from, to, 1, positions) },
  { name: "OSRM", get: (from, to, positions) => osrmRoute(from, to, positions) },
];
const results = [];
for (const sample of snapshot.routes) {
  const from = { label: sample.from.label, position: sample.from.position };
  const to = { label: sample.to.label, position: sample.to.position };
  const plans = candidatePlans(from.position, to.position, zones);
  const candidates = [];
  const records = [];
  if (!plans.length) {
    results.push({ id: sample.id, error: "NO_ROUTE_PLAN" });
    continue;
  }
  const plan = plans[0];
  for (const provider of providers) {
    const row = {
      id: sample.id, from: from.label, to: to.label, corridor: plan.corridor,
      provider: provider.name, yandexReference: sample.candidates[0], routeStatus: "requested",
    };
    try {
      let route = await provider.get(from, to, plan.positions);
      if (!followsPlan(route.coordinates, plan.positions, plan.corridor, true)) throw new Error("ROUTING_PLAN_MISMATCH");
      const split = analyzeRoute(route.coordinates, route.meters, route.seconds, from.position, to.position, zones);
      let timingPlan = territoryTimingPlan(route, zones);
      let timing = measureTerritoryLegTimes(route, timingPlan.expected, zones);
      row.initialLegCount = route.legs?.length ?? 0;
      row.initialTiming = timing;
      if (!timing.verified) {
        route = await provider.get(from, to, timingPlan.positions);
        if (!followsPlan(route.coordinates, plan.positions, plan.corridor, true)) throw new Error("TIMING_RESCAN_PLAN_MISMATCH");
        analyzeRoute(route.coordinates, route.meters, route.seconds, from.position, to.position, zones);
        timing = measureTerritoryLegTimes(route, timingPlan.expected, zones);
        row.rescanTiming = timing;
        row.rescanLegCount = route.legs?.length ?? 0;
      }
      row.routeStatus = "returned";
      row.timingVerification = timing.verified ? "verified" : "unverified";
      row.distanceKm = Math.round(route.meters / 100) / 10;
      row.durationMinutes = Math.round(route.seconds / 60);
      row.distanceDeltaKm = Math.round((route.meters / 1000 - sample.candidates[0].distanceKm) * 10) / 10;
      row.distanceDeltaPercent = Math.round((route.meters / 1000 - sample.candidates[0].distanceKm) / sample.candidates[0].distanceKm * 1000) / 10;
      row.durationDeltaMinutes = Math.round(route.seconds / 60 - sample.candidates[0].durationMinutes);
      row.specialKm = Math.round(split.specialKm * 10) / 10;
      row.ordinaryKm = Math.round(split.ordinaryKm * 10) / 10;
      row.specialSeconds = timing.verified ? timing.specialSeconds : null;
      row.routeSeconds = route.seconds;
      candidates.push({ name: provider.name, route });
      records.push(row);
    } catch (error) {
      row.routeStatus = "error";
      row.error = error instanceof Error ? error.message : String(error);
      records.push(row);
    }
  }
  const quality = candidates.length
    ? selectLiveRouteCandidates(candidates.map(({ name, route }) => ({ name, route })))
    : null;
  let tollProbe = null;
  if (quality) {
    const selected = candidates.find(({ name }) => name === quality.provider);
    if (selected) {
      try {
        const priced = await calculateLegTolls({
          routeGeometry: selected.route.coordinates,
          routeSeconds: selected.route.seconds,
          selectedFastProvider: selected.name,
          selectedFastRoute: selected.route,
          valhallaEvidence: selected.name === "Valhalla" ? selected.route : null,
          confirmedFreeRoute: null,
          diagnosticFastValidation: null,
        });
        const tolls = tollsForApi(priced.tolls, priced.fastValidation);
        let componentBreakdown = null;
        if (sample.id === "tomsk-chernomorskoe") {
          const m4 = await calculateM4Core(selected.route.coordinates);
          const a289 = priceA289Route(selected.route.coordinates);
          componentBreakdown = {
            m4: {
              status: m4.pricing.status,
              weekdayAmount: m4.pricing.weekdayAmount,
              weekendAmount: m4.pricing.weekendAmount,
              pricedPlazas: m4.pricing.pricedPlazas.map(({ km, weekday, weekend, verification }) => ({ km, weekday, weekend, verification })),
              unresolved: m4.pricing.unresolved,
            },
            a289: {
              weekdayAmount: a289.weekdayAmount,
              weekendAmount: a289.weekendAmount,
              crossedFrames: a289.crossedFrames,
              segments: a289.segments,
            },
          };
        }
        tollProbe = {
          selectedProvider: selected.name,
          pricingStatus: tolls.pricingStatus,
          amount: tolls.amount,
          weekdayAmount: tolls.weekdayAmount,
          weekendAmount: tolls.weekendAmount,
          confidence: tolls.confidence,
          componentBreakdown,
          segments: tolls.segments,
          validation: { status: priced.fastValidation.status, message: priced.fastValidation.message },
        };
      } catch (error) {
        tollProbe = { error: error instanceof Error ? error.message : String(error) };
      }
    }
  }
  const result = {
    id: sample.id,
    from: from.label,
    to: to.label,
    preferredCorridor: plan.corridor,
    controls: plan.positions.length,
    yandexCandidates: sample.candidates,
    identityComparison: "not-verifiable-from-screenshot-without-Yandex-route-geometry",
    providerQuality: quality?.quality ?? null,
    selectedProvider: quality?.provider ?? null,
    providerRoutes: records,
    selectedRouteTolls: tollProbe,
  };
  results.push(result);
  console.log(JSON.stringify(result));
}
await writeFile("yandex-route-reference-audit.json", JSON.stringify(results, null, 2) + "\n");
