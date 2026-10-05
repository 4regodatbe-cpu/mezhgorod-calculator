import { writeFile } from "node:fs/promises";
import { valhalla } from "../lib/route-providers.ts";
import { validateTollEdges } from "../lib/toll-validator.ts";
import { routeDifferenceEvidence } from "../lib/v2-calculation/free-route-selection.ts";

const from = { label: "Москва", position: { lat: 55.7558, lng: 37.6173 } };
const to = { label: "Краснодар", position: { lat: 45.0355, lng: 38.9753 } };
const penalties = [900, 1_200, 1_800, 2_400, 3_000, 3_600];
const mainRoute = await valhalla(from, to, 1);
const candidates = [];

for (const penalty of penalties) {
  try {
    const route = await valhalla(from, to, 1, undefined, penalty);
    const validation = await validateTollEdges(route.coordinates);
    candidates.push({
      penaltySeconds: penalty,
      distanceKm: Math.round(route.meters / 100) / 10,
      durationMinutes: Math.round(route.seconds / 60),
      differsEnoughFromMain: routeDifferenceEvidence(mainRoute, route),
      geometryPointCount: route.coordinates.length,
      validation: {
        status: validation.status,
        message: validation.message,
        tollEdgeCount: validation.tollEdgeCount,
        tollBoothCount: validation.tollBoothCount ?? 0,
        chunkCount: validation.chunkCount,
        checkedChunkCount: validation.checkedChunkCount,
        failedChunkCount: validation.failedChunkCount,
        complete: validation.complete,
        roadNames: validation.roadNames,
        tollBooths: validation.tollBooths,
      },
      accepted: validation.complete === true &&
        (validation.tollBoothCount ?? 0) === 0 &&
        routeDifferenceEvidence(mainRoute, route),
    });
  } catch (error) {
    candidates.push({
      penaltySeconds: penalty,
      error: error instanceof Error ? error.message : "ROUTE_OR_TRACE_FAILED",
      accepted: false,
    });
  }
}

const report = {
  from: from.label,
  to: to.label,
  main: { distanceKm: Math.round(mainRoute.meters / 100) / 10, durationMinutes: Math.round(mainRoute.seconds / 60) },
  request: { use_tolls: 1, penaltyCandidatesSeconds: penalties },
  candidates,
  meaning: "Paid road edges remain eligible. A candidate is accepted only after a complete trace finds no toll-booth node and the candidate differs enough from the main route.",
};
await writeFile("payment-point-avoidance-live-probe.json", JSON.stringify(report, null, 2) + "\n");
console.log("PAYMENT_POINT_AVOIDANCE_PROBE " + JSON.stringify(report));
