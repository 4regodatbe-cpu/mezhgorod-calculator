import { NextRequest, NextResponse } from "next/server";

type Point = { label: string; region?: string; position?: { lat: number; lng: number } };
type Located = { label: string; region: string; position: { lat: number; lng: number } };

async function geocode(point: Point): Promise<Located> {
  if (point.position) return { label: point.label, region: point.region || "Не определён", position: point.position };
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", point.label); url.searchParams.set("limit", "1");
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "MezhgorodCalculator/1.0" } });
  if (!response.ok) throw new Error("GEOCODE_UNAVAILABLE");
  const data = (await response.json()) as { features?: Array<{ geometry?: { coordinates?: [number, number] }; properties?: Record<string, string | undefined> }> };
  const item = data.features?.[0], coordinates = item?.geometry?.coordinates;
  if (!coordinates) throw new Error("ADDRESS_NOT_FOUND");
  const p = item?.properties ?? {}, label = [p.name, p.city, p.state, p.country].filter(Boolean).join(", ") || point.label;
  const region = [p.city || p.county || p.state, p.state, p.country].filter((value, index, values) => value && values.indexOf(value) === index).join(", ") || "Не определён";
  return { label, region, position: { lat: coordinates[1], lng: coordinates[0] } };
}

async function build(origin: Located["position"], destination: Located["position"]) {
  const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = new URL(`https://router.project-osrm.org/route/v1/driving/${coordinates}`);
  url.searchParams.set("overview", "false"); url.searchParams.set("steps", "false");
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "MezhgorodCalculator/1.0" } });
  if (!response.ok) throw new Error(response.status >= 500 || response.status === 429 ? "ROUTE_UNAVAILABLE" : "ROUTE_NOT_FOUND");
  const data = (await response.json()) as { code?: string; routes?: Array<{ distance?: number; duration?: number }> };
  const route = data.routes?.[0];
  if (data.code !== "Ok" || !route?.distance || !route.duration) throw new Error("ROUTE_NOT_FOUND");
  return { meters: route.distance, seconds: route.duration };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { from?: Point; to?: Point; rate?: number };
    if (!body.from?.label.trim() || !body.to?.label.trim()) return NextResponse.json({ error: "Укажите точки отправления и назначения" }, { status: 400 });
    if (!Number.isFinite(body.rate) || body.rate! <= 0 || body.rate! > 10000) return NextResponse.json({ error: "Введите корректную стоимость 1 км" }, { status: 400 });
    const [from, to] = await Promise.all([geocode(body.from), geocode(body.to)]);
    const route = await build(from.position, to.position);
    return NextResponse.json({ from: from.label, to: to.label, route, rate: body.rate, analytics: { fromRegion: from.region, toRegion: to.region } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const messages: Record<string, string> = { ADDRESS_NOT_FOUND: "Адрес не найден. Уточните населённый пункт, улицу или объект.", GEOCODE_UNAVAILABLE: "Поиск адресов временно недоступен. Попробуйте ещё раз позже.", ROUTE_NOT_FOUND: "Между выбранными точками не удалось построить автомобильный маршрут.", ROUTE_UNAVAILABLE: "Сервис маршрутов временно недоступен. Попробуйте позже." };
    return NextResponse.json({ error: messages[code] ?? "Не удалось выполнить расчёт. Проверьте данные и повторите попытку." }, { status: code.endsWith("UNAVAILABLE") ? 502 : 400 });
  }
}
