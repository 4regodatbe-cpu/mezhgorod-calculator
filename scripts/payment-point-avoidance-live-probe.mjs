import { writeFile } from "node:fs/promises";
import { valhalla } from "../lib/route-providers.ts";
import { validateTollEdges } from "../lib/toll-validator.ts";
import { routeDifferenceEvidence } from "../lib/v2-calculation/free-route-selection.ts";

const from = { label: "Москва", position: { lat: 55.7558, lng: 37.6173 } };
const to = { label: "Краснодар", position: { lat: 45.0355, lng: 38.9753 } };

const [mainRoute, moderate, high] = await Promise.all([
  valhalla(from, to, 1),
  valhalla(from, to, 1, undefined, 900),
  valhalla(from, to, 1, undefined, 43_200),
]);
const moderateValidation = await validateTollEdges(moderate.coordinates);
const highValidation = await validateTollEdges(high.coordinates);

const summary = (route, validation) => ({
  distanceKm: Math.round(route.meters / 100) / 10,
  durationMinutes: Math.round(route.seconds / 60),
  differsEnoughFromMain: routeDifferenceEvidence(mainRoute, route),
  validation,
  accepted: validation.complete === true && (validation.tollBoothCount ?? 0) === 0 &&
    routeDifferenceEvidence(mainRoute, route),
});
const report = {
  from: from.label,
  to: to.label,
  main: { distanceKm: Math.round(mainRoute.meters / 100) / 10, durationMinutes: Math.round(mainRoute.seconds / 60) },
  request: { use_tolls: 1, penaltyCandidatesSeconds: [900, 43_200] },
  geometryPointCounts: { moderate: moderate.coordinates.length, high: high.coordinates.length },
  candidates: {
    moderatePenalty: summary(moderate, moderateValidation),
    highPenalty: summary(high, highValidation),
  },
  meaning: "Paid road edges are allowed; a route is accepted only if full map matching finds no payment-point node and the route differs enough from the main route.",
};
await writeFile("payment-point-avoidance-live-probe.json", JSON.stringify(report, null, 2) + "\n");
console.log("PAYMENT_POINT_AVOIDANCE_PROBE " + JSON.stringify(report));
