import fs from "node:fs";

const path = "app/api/v2/calculate/route.ts";
let source = fs.readFileSync(path, "utf8");
const replace = (from, to, label) => {
  if (!source.includes(from)) throw new Error(`Patch anchor not found: ${label}`);
  source = source.replace(from, to);
};

replace(
  'import { MAX_PROVIDER_DISTANCE_SPREAD_PERCENT, selectLiveRoute, type GoldenRouteReference, type RouteQuality } from "@/lib/route-quality";',
  'import { MAX_PROVIDER_DISTANCE_SPREAD_PERCENT, selectLiveRoute, selectLiveRouteCandidates, type GoldenRouteReference, type RouteQuality } from "@/lib/route-quality";',
  "route-quality import",
);

replace(
`async function brouterFree(from: Located, to: Located): Promise<RouteWithGeometry> {
  const url = new URL("https://brouter.de/brouter");
  url.searchParams.set("lonlats", safeRoutePositions(from, to).map((point) => \`${'${point.lng},${point.lat}'}\`).join("|"));
  url.searchParams.set("profile", "car-vario");
  url.searchParams.set("profile:avoid_toll", "1");
  url.searchParams.set("alternativeidx", "0");
  url.searchParams.set("format", "geojson");
  const response = await fetch(url, {
    headers: { Accept: "application/geo+json", "User-Agent": "MezhgorodCalc/2.0" },
    cache: "force-cache",
    next: { revalidate: 86_400 },
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error("ROUTE_UNAVAILABLE");
  const data = (await response.json()) as {
    features?: Array<{
      properties?: { "track-length"?: string | number; "total-time"?: string | number };
      geometry?: { coordinates?: Coordinate[] };
    }>;
  };
  const feature = data.features?.[0];
  const properties = feature?.properties;
  const meters = Number(properties?.["track-length"]);
  const seconds = Number(properties?.["total-time"]);
  if (!Number.isFinite(meters) || !Number.isFinite(seconds) || meters <= 0 || seconds <= 0) throw new Error("ROUTE_NOT_FOUND");
  return { meters: Math.round(meters), seconds: Math.round(seconds), coordinates: feature?.geometry?.coordinates ?? [] };
}`,
`async function brouterRoute(from: Located, to: Located, avoidTolls: boolean): Promise<RouteWithGeometry> {
  const url = new URL("https://brouter.de/brouter");
  url.searchParams.set("lonlats", safeRoutePositions(from, to).map((point) => \`${'${point.lng},${point.lat}'}\`).join("|"));
  url.searchParams.set("profile", "car-vario");
  if (avoidTolls) url.searchParams.set("profile:avoid_toll", "1");
  url.searchParams.set("alternativeidx", "0");
  url.searchParams.set("format", "geojson");
  const response = await fetch(url, {
    headers: { Accept: "application/geo+json", "User-Agent": "MezhgorodCalc/2.0" },
    cache: "force-cache",
    next: { revalidate: 21_600 },
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error("ROUTE_UNAVAILABLE");
  const data = (await response.json()) as {
    features?: Array<{
      properties?: { "track-length"?: string | number; "total-time"?: string | number };
      geometry?: { coordinates?: Coordinate[] };
    }>;
  };
  const feature = data.features?.[0];
  const properties = feature?.properties;
  const meters = Number(properties?.["track-length"]);
  const seconds = Number(properties?.["total-time"]);
  if (!Number.isFinite(meters) || !Number.isFinite(seconds) || meters <= 0 || seconds <= 0) throw new Error("ROUTE_NOT_FOUND");
  return { meters: Math.round(meters), seconds: Math.round(seconds), coordinates: feature?.geometry?.coordinates ?? [] };
}

function brouterFree(from: Located, to: Located) {
  return brouterRoute(from, to, true);
}

function brouterFast(from: Located, to: Located) {
  return brouterRoute(from, to, false);
}`,
  "BRouter routing helper",
);

replace(
`  const [fastResult, valhallaFreeResult, brouterResult, osrmResult] = await Promise.allSettled([
    valhalla(from, to, 1),
    valhalla(from, to, 0),
    brouterFree(from, to),
    osrmRoute(from, to),
  ]);

  const selectedFast = selectLiveRoute(
    fastResult.status === "fulfilled" ? { name: "Valhalla", route: fastResult.value } : undefined,
    osrmResult.status === "fulfilled" ? { name: "OSRM", route: osrmResult.value } : undefined,
    goldenRouteReference(from.label, to.label, "fast"),
  );`,
`  const [fastResult, valhallaFreeResult, brouterResult, osrmResult, brouterFastResult] = await Promise.allSettled([
    valhalla(from, to, 1),
    valhalla(from, to, 0),
    brouterFree(from, to),
    osrmRoute(from, to),
    brouterFast(from, to),
  ]);

  const selectedFast = selectLiveRouteCandidates([
    ...(fastResult.status === "fulfilled" ? [{ name: "Valhalla", route: fastResult.value }] : []),
    ...(osrmResult.status === "fulfilled" ? [{ name: "OSRM", route: osrmResult.value }] : []),
    ...(brouterFastResult.status === "fulfilled" ? [{ name: "BRouter", route: brouterFastResult.value }] : []),
  ], goldenRouteReference(from.label, to.label, "fast"));`,
  "three-provider fast selection",
);

replace(
`  const routeGeometry = selectedFast.provider === "Valhalla" && fastResult.status === "fulfilled" && fastResult.value.coordinates.length > 0
    ? fastResult.value.coordinates
    : selectedFast.provider === "OSRM" && osrmResult.status === "fulfilled" && osrmResult.value.coordinates.length > 0
      ? osrmResult.value.coordinates
      : fastResult.status === "fulfilled" && fastResult.value.coordinates.length > 0
        ? fastResult.value.coordinates
        : osrmResult.status === "fulfilled" && osrmResult.value.coordinates.length > 0
          ? osrmResult.value.coordinates
          : [[from.position.lng, from.position.lat], [to.position.lng, to.position.lat]] as Coordinate[];`,
`  const routeGeometry = selectedFast.provider === "Valhalla" && fastResult.status === "fulfilled" && fastResult.value.coordinates.length > 0
    ? fastResult.value.coordinates
    : selectedFast.provider === "OSRM" && osrmResult.status === "fulfilled" && osrmResult.value.coordinates.length > 0
      ? osrmResult.value.coordinates
      : selectedFast.provider === "BRouter" && brouterFastResult.status === "fulfilled" && brouterFastResult.value.coordinates.length > 0
        ? brouterFastResult.value.coordinates
        : fastResult.status === "fulfilled" && fastResult.value.coordinates.length > 0
          ? fastResult.value.coordinates
          : osrmResult.status === "fulfilled" && osrmResult.value.coordinates.length > 0
            ? osrmResult.value.coordinates
            : brouterFastResult.status === "fulfilled" && brouterFastResult.value.coordinates.length > 0
              ? brouterFastResult.value.coordinates
              : [[from.position.lng, from.position.lat], [to.position.lng, to.position.lat]] as Coordinate[];`,
  "selected fast geometry",
);

fs.writeFileSync(path, source);
console.log("Fast-router fallback patch applied");
