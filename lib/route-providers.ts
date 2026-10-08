import { safeRoutePositions } from "@/lib/safe-route";
import type { Coordinate } from "@/lib/tolls";
import { deriveM11EvidenceFromValhalla, type M11RoadEvidence, type M11ValhallaManeuver } from "@/lib/toll-engine/m11-road-evidence";
import { deriveStrictM12Span, type M12StrictRouteSpan } from "@/lib/toll-engine/m12-valhalla-span";

export type Point = { label: string; position?: { lat: number; lng: number } };
export type Located = { label: string; position: { lat: number; lng: number } };
export type RouteSummary = { meters: number; seconds: number };
export type RouteWithGeometry = RouteSummary & {
  coordinates: Coordinate[];
  legs?: Array<RouteSummary & { coordinates: Coordinate[] }>;
  m12StrictSpan?: M12StrictRouteSpan | null;
  m11RoadEvidence?: M11RoadEvidence | null;
};

export async function geocode(point: Point): Promise<Located> {
  if (point.position) return { label: point.label, position: point.position };
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", point.label);
  url.searchParams.set("limit", "1");
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "MezhgorodCalc/2.0" } });
  if (!response.ok) throw new Error("GEOCODE_UNAVAILABLE");
  const data = (await response.json()) as { features?: Array<{ geometry?: { coordinates?: Coordinate }; properties?: Record<string, string | undefined> }> };
  const item = data.features?.[0];
  const coordinates = item?.geometry?.coordinates;
  if (!coordinates) throw new Error("ADDRESS_NOT_FOUND");
  const p = item?.properties ?? {};
  return { label: [p.name, p.city, p.state].filter(Boolean).join(", ") || point.label, position: { lng: coordinates[0], lat: coordinates[1] } };
}

function decodePolyline(encoded: string, precision = 6): Coordinate[] {
  const coordinates: Coordinate[] = [];
  const factor = 10 ** precision;
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;
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
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coordinates.push([lng / factor, lat / factor]);
  }
  return coordinates;
}

export async function valhalla(from: Located, to: Located, useTolls: 0 | 1, positions = safeRoutePositions(from, to), tollBoothPenalty = 0): Promise<RouteWithGeometry> {
  const url = new URL("https://valhalla1.openstreetmap.de/route");
  const query = {
    locations: positions.map((point) => ({ lat: point.lat, lon: point.lng, type: "break" })),
    costing: "auto",
    costing_options: { auto: { use_tolls: useTolls, ...(tollBoothPenalty > 0 ? { toll_booth_penalty: tollBoothPenalty } : {}) } },
    units: "kilometers",
    shape_format: "polyline6",
    ...(useTolls === 1
      ? { directions_options: { language: "ru-RU", units: "kilometers" } }
      : { directions_type: "none" }),
  };
  url.searchParams.set("json", JSON.stringify(query));
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MezhgorodCalc/2.0" },
    cache: "force-cache",
    next: { revalidate: 21_600 },
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error("ROUTE_UNAVAILABLE");
  const data = (await response.json()) as {
    trip?: {
      summary?: { length?: number; time?: number };
      legs?: Array<{ summary?: { length?: number; time?: number }; shape?: string; maneuvers?: M11ValhallaManeuver[] }>;
    };
  };
  const summary = data.trip?.summary;
  if (!summary?.length || !summary.time) throw new Error("ROUTE_NOT_FOUND");
  const decodedLegs = (data.trip?.legs ?? []).map((item) => ({
    coordinates: item.shape ? decodePolyline(item.shape) : [],
    maneuvers: item.maneuvers,
    meters: Number(item.summary?.length) * 1000,
    seconds: Number(item.summary?.time),
  }));
  const coordinates = decodedLegs.flatMap((item) => item.coordinates);
  const m12StrictSpan = useTolls === 1 ? deriveStrictM12Span(decodedLegs) : null;
  const m11RoadEvidence = useTolls === 1 ? deriveM11EvidenceFromValhalla(decodedLegs) : null;
  return {
    meters: Math.round(summary.length * 1000),
    seconds: Math.round(summary.time),
    coordinates,
    legs: decodedLegs,
    m12StrictSpan,
    m11RoadEvidence,
  };
}

async function brouterRoute(from: Located, to: Located, avoidTolls: boolean, positions = safeRoutePositions(from, to)): Promise<RouteWithGeometry> {
  const url = new URL("https://brouter.de/brouter");
  url.searchParams.set("lonlats", positions.map((point) => `${point.lng},${point.lat}`).join("|"));
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

export function brouterFree(from: Located, to: Located, positions = safeRoutePositions(from, to)) {
  return brouterRoute(from, to, true, positions);
}

export function brouterFast(from: Located, to: Located, positions = safeRoutePositions(from, to)) {
  return brouterRoute(from, to, false, positions);
}

export async function osrmRoute(from: Located, to: Located, positions = safeRoutePositions(from, to)): Promise<RouteWithGeometry> {
  const path = positions.map((point) => `${point.lng},${point.lat}`).join(";");
  const url = new URL(`https://router.project-osrm.org/route/v1/driving/${path}`);
  url.searchParams.set("overview", "full");
  url.searchParams.set("steps", "true");
  url.searchParams.set("geometries", "geojson");
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MezhgorodCalc/2.0" },
    cache: "force-cache",
    next: { revalidate: 21_600 },
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error("ROUTE_UNAVAILABLE");
  const data = (await response.json()) as { routes?: Array<{ distance?: number; duration?: number; geometry?: { coordinates?: Coordinate[] }; legs?: Array<{ distance?: number; duration?: number; steps?: Array<{ geometry?: { coordinates?: Coordinate[] } }> }> }> };
  const route = data.routes?.[0];
  if (!route?.distance || !route.duration) throw new Error("ROUTE_NOT_FOUND");
  return { meters: Math.round(route.distance), seconds: Math.round(route.duration), coordinates: route.geometry?.coordinates ?? [] as Coordinate[], legs: route.legs?.map(leg => ({ meters: Number(leg.distance), seconds: Number(leg.duration), coordinates: (leg.steps ?? []).flatMap(step => step.geometry?.coordinates ?? []) })) };
}
