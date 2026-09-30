import { writeFile } from "node:fs/promises";

const locations = [
  { lat: 55.796289, lon: 49.108795 },
  { lat: 56.129057, lon: 40.406635 },
];
const query = {
  locations,
  costing: "auto",
  costing_options: { auto: { use_tolls: 1 } },
  units: "kilometers",
  shape_format: "polyline6",
  directions_options: { language: "ru-RU", units: "kilometers" },
};
const url = new URL("https://valhalla1.openstreetmap.de/route");
url.searchParams.set("json", JSON.stringify(query));

const response = await fetch(url, {
  headers: { Accept: "application/json", "User-Agent": "MezhgorodCalc/2.0" },
  signal: AbortSignal.timeout(60_000),
});
if (!response.ok) throw new Error(`Valhalla HTTP ${response.status}`);
const data = await response.json();
const maneuvers = (data.trip?.legs ?? []).flatMap((leg, legIndex) =>
  (leg.maneuvers ?? []).map((m, maneuverIndex) => ({
    legIndex,
    maneuverIndex,
    beginShapeIndex: m.begin_shape_index ?? null,
    endShapeIndex: m.end_shape_index ?? null,
    streetNames: m.street_names ?? [],
    beginStreetNames: m.begin_street_names ?? [],
    instruction: m.instruction ?? null,
  })),
);
const interesting = maneuvers.filter((item) => {
  const text = [...item.streetNames, ...item.beginStreetNames, item.instruction ?? ""].join(" ");
  return /(?:12|восток|vostok|м-|m-)/iu.test(text);
});
const report = {
  generatedAt: new Date().toISOString(),
  route: "Kazan -> Vladimir",
  lengthKm: data.trip?.summary?.length ?? null,
  maneuverCount: maneuvers.length,
  interesting,
  allNamedManeuvers: maneuvers.filter((item) => item.streetNames.length || item.beginStreetNames.length),
};
await writeFile("segment5b2d4d-m12-span-name-probe.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ lengthKm: report.lengthKm, maneuverCount: report.maneuverCount, interesting: report.interesting }));
