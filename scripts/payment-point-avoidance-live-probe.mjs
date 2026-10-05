import { writeFile } from "node:fs/promises";
import { valhalla } from "../lib/route-providers.ts";
import { selectFreeRoute } from "../lib/v2-calculation/free-route-selection.ts";

const from = {
  label: "Москва",
  position: { lat: 55.7558, lng: 37.6173 },
};
const to = {
  label: "Краснодар",
  position: { lat: 45.0355, lng: 38.9753 },
};

const [route, mainRoute] = await Promise.all([
  valhalla(from, to, 1, undefined, 43_200),
  valhalla(from, to, 1),
]);
const selected = await selectFreeRoute(
  mainRoute,
  { status: "fulfilled", value: route },
  { status: "rejected", reason: new Error("BRouter fallback not part of this focused probe") },
);

const report = {
  from: from.label,
  to: to.label,
  provider: "Valhalla",
  request: { use_tolls: 1, toll_booth_penalty: 43_200 },
  mainDistanceKm: Math.round(mainRoute.meters / 100) / 10,
  distanceKm: Math.round(route.meters / 100) / 10,
  mainDurationMinutes: Math.round(mainRoute.seconds / 60),
  durationMinutes: Math.round(route.seconds / 60),
  geometryPointCount: route.coordinates.length,
  candidateSelected: selected !== null,
  admission: selected?.truth ?? "rejected",
  validation: selected?.validation ?? null,
  meaning: "Paid road edges remain allowed; the alternative is selected by observed toll-booth nodes.",
};
await writeFile("payment-point-avoidance-live-probe.json", JSON.stringify(report, null, 2) + "\n");
console.log("PAYMENT_POINT_AVOIDANCE_PROBE " + JSON.stringify(report));
