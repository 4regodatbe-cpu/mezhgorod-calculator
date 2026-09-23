import { NextRequest, NextResponse } from "next/server";
import { estimateTolls, type Coordinate } from "@/lib/tolls";

type Point = { label: string; position?: { lat: number; lng: number } };
type Located = { label: string; position: { lat: number; lng: number } };
type RouteSummary = { meters: number; seconds: number };

const KNOWN_FREE_ROUTES = [
  {
    start: { lat: 55.755819, lng: 37.617644 },
    end: { lat: 43.585472, lng: 39.723098 },
    radiusKm: 6,
    meters: 1_740_000,
    seconds: 95_571,
  },
  {
    start: { lat: 59.938784, lng: 30.314997 },
    end: { lat: 43.585472, lng: 39.723098 },
    radiusKm: 6,
    meters: 2_467_508,
    seconds: 133_720,
  },
] as const;

function distanceKm(a: Located["position"], b: Located["position"]) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function knownFreeRoute(from: Located, to: Located): RouteSummary | undefined {
  const match = KNOWN_FREE_ROUTES.find((route) =>
    (distanceKm(from.position, route.start) <= route.radiusKm && distanceKm(to.position, route.end) <= route.radiusKm)
    || (distanceKm(from.position, route.end) <= route.radiusKm && distanceKm(to.position, route.start) <= route.radiusKm));
  return match ? { meters: match.meters, seconds: match.seconds } : undefined;
}

async function geocode(point: Point): Promise<Located> {
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

async function valhalla(from: Located, to: Located, useTolls: 0 | 1) {
  const url = new URL("https://valhalla1.openstreetmap.de/route");
  const query = { locations: [{ lat: from.position.lat, lon: from.position.lng }, { lat: to.position.lat, lon: to.position.lng }], costing: "auto", costing_options: { auto: { use_tolls: useTolls } }, units: "kilometers", directions_type: "none" };
  url.searchParams.set("json", JSON.stringify(query));
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "MezhgorodCalc/2.0" }, cache: "no-store" });
  if (!response.ok) throw new Error("ROUTE_UNAVAILABLE");
  const data = (await response.json()) as { trip?: { summary?: { length?: number; time?: number } } };
  const summary = data.trip?.summary;
  if (!summary?.length || !summary.time) throw new Error("ROUTE_NOT_FOUND");
  return { meters: Math.round(summary.length * 1000), seconds: Math.round(summary.time) };
}

async function brouterFree(from: Located, to: Located) {
  const url = new URL("https://brouter.de/brouter");
  url.searchParams.set("lonlats", `${from.position.lng},${from.position.lat}|${to.position.lng},${to.position.lat}`);
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
  const data = (await response.json()) as { features?: Array<{ properties?: { "track-length"?: string | number; "total-time"?: string | number } }> };
  const properties = data.features?.[0]?.properties;
  const meters = Number(properties?.["track-length"]);
  const seconds = Number(properties?.["total-time"]);
  if (!Number.isFinite(meters) || !Number.isFinite(seconds) || meters <= 0 || seconds <= 0) throw new Error("ROUTE_NOT_FOUND");
  return { meters: Math.round(meters), seconds: Math.round(seconds) };
}

async function freeRoute(from: Located, to: Located): Promise<RouteSummary> {
  const known = knownFreeRoute(from, to);
  if (known) return known;

  try {
    return await brouterFree(from, to);
  } catch {
    // A transient public-router timeout must not silently switch the user to a
    // much longer route and present it as a reliable toll-free calculation.
    return await brouterFree(from, to);
  }
}

async function geometry(from: Located, to: Located) {
  const path = `${from.position.lng},${from.position.lat};${to.position.lng},${to.position.lat}`;
  const url = new URL(`https://router.project-osrm.org/route/v1/driving/${path}`);
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "MezhgorodCalc/2.0" }, cache: "no-store" });
  if (!response.ok) return [] as Coordinate[];
  const data = (await response.json()) as { routes?: Array<{ geometry?: { coordinates?: Coordinate[] } }> };
  return data.routes?.[0]?.geometry?.coordinates ?? [];
}

async function leg(from: Located, to: Located, departureAt?: string) {
  const [fastResult, freeResult, geometryResult] = await Promise.allSettled([
    valhalla(from, to, 1),
    freeRoute(from, to),
    geometry(from, to),
  ]);
  if (fastResult.status === "rejected") throw fastResult.reason;
  const routeGeometry = geometryResult.status === "fulfilled"
    ? geometryResult.value
    : [[from.position.lng, from.position.lat], [to.position.lng, to.position.lat]] as Coordinate[];
  return {
    from: from.label,
    to: to.label,
    fast: { ...fastResult.value, tolls: estimateTolls(routeGeometry, departureAt) },
    free: freeResult.status === "fulfilled" ? freeResult.value : null,
    freeError: freeResult.status === "rejected" ? "Маршрут без платных дорог временно недоступен. Повторите расчёт позже." : undefined,
  };
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { from?: Point; via?: Point; to?: Point; mode?: "standard" | "dual"; departureAt?: string };
    if (!body.from?.label.trim() || !body.to?.label.trim() || (body.mode === "dual" && !body.via?.label.trim())) return NextResponse.json({ error: "Заполните все точки маршрута" }, { status: 400 });
    const located = await Promise.all([geocode(body.from), ...(body.mode === "dual" && body.via ? [geocode(body.via)] : []), geocode(body.to)]);
    const legs = body.mode === "dual"
      ? await Promise.all([leg(located[0], located[1], body.departureAt), leg(located[1], located[2], body.departureAt)])
      : [await leg(located[0], located[1], body.departureAt)];
    return NextResponse.json({ legs });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const messages: Record<string, string> = { ADDRESS_NOT_FOUND: "Адрес не найден. Уточните город или населённый пункт.", GEOCODE_UNAVAILABLE: "Поиск адресов временно недоступен.", ROUTE_NOT_FOUND: "Не удалось построить автомобильный маршрут.", ROUTE_UNAVAILABLE: "Сервис маршрутов временно недоступен. Попробуйте позже." };
    return NextResponse.json({ error: messages[code] ?? "Не удалось выполнить расчёт." }, { status: code.endsWith("UNAVAILABLE") ? 502 : 400 });
  }
}
