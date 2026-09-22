import { NextRequest, NextResponse } from "next/server";
import { estimateTolls, type Coordinate } from "@/lib/tolls";

type Point = { label: string; position?: { lat: number; lng: number } };
type Located = { label: string; position: { lat: number; lng: number } };

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
  const [fast, free, routeGeometry] = await Promise.all([valhalla(from, to, 1), valhalla(from, to, 0), geometry(from, to)]);
  return { from: from.label, to: to.label, fast: { ...fast, tolls: estimateTolls(routeGeometry, departureAt) }, free };
}

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
