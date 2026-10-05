import { writeFile } from "node:fs/promises";
import { valhalla } from "../lib/route-providers.ts";
import { selectFreeRoute } from "../lib/v2-calculation/free-route-selection.ts";

const from = { label: "Москва", position: { lat: 55.7558, lng: 37.6173 } };
const to = { label: "Краснодар", position: { lat: 45.0355, lng: 38.9753 } };

const [mainRoute, moderate, high] = await Promise.all([
  valhalla(from, to, 1),
  valhalla(from, to, 1, undefined, 900),
  valhalla(from, to, 1, undefined, 43_200),
]);
const [moderateSelected, highSelected] = await Promise.all([
  selectFreeRoute(mainRoute, [{ name: "Valhalla penalty 900", result: { status: "fulfilled", value: moderate } }]),
  selectFreeRoute(mainRoute, [{ name: "Valhalla penalty 43200", result: { status: "fulfilled", value: high } }]),
]);

const summary = (route, selected) => ({
  distanceKm: Math.round(route.meters / 100) / 10,
  durationMinutes: Math.round(route.seconds / 60),
  candidateSelected: selected !== null,
  validation: selected?.validation ?? null,
});
const report = {
  from: from.label,
  to: to.label,
  main: { distanceKm: Math.round(mainRoute.meters / 100) / 10, durationMinutes: Math.round(mainRoute.seconds / 60) },
  request: { use_tolls: 1, penaltyCandidatesSeconds: [900, 43_200] },
  geometryPointCounts: { moderate: moderate.coordinates.length, high: high.coordinates.length },
  candidates: {
    moderatePenalty: summary(moderate, moderateSelected),
    highPenalty: summary(high, highSelected),
  },
  meaning: "Both candidates permit tolled edges; only a complete trace with no payment-point node may be selected.",
};
await writeFile("payment-point-avoidance-live-probe.json", JSON.stringify(report, null, 2) + "\n");
console.log("PAYMENT_POINT_AVOIDANCE_PROBE " + JSON.stringify(report));
