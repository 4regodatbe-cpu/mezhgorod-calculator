import { NextRequest, NextResponse } from "next/server";

type Point = { label: string; position?: { lat: number; lng: number } };
type Located = { label: string; position: { lat: number; lng: number } };
type HereRoute = { sections?: Array<{ summary?: { length?: number; duration?: number } }> };

async function geocode(point: Point): Promise<Located> {
  if (point.position) return { label: point.label, position: point.position };
  const url = new URL("https://geocode.search.hereapi.com/v1/geocode");
  url.searchParams.set("q", point.label);
  url.searchParams.set("in", "countryCode:RUS");
  url.searchParams.set("lang", "ru-RU");
  url.searchParams.set("limit", "1");
  url.searchParams.set("apiKey", process.env.HERE_API_KEY!);
  const response = await fetch(url);
  if (!response.ok) throw new Error("GEOCODE_UNAVAILABLE");
  const data = (await response.json()) as { items?: Array<{ title?: string; address?: { label?: string }; position?: { lat?: number; lng?: number } }> };
  const item = data.items?.[0];
  if (typeof item?.position?.lat !== "number" || typeof item.position.lng !== "number") throw new Error("ADDRESS_NOT_FOUND");
  return { label: item.address?.label ?? item.title ?? point.label, position: { lat: item.position.lat, lng: item.position.lng } };
}

async function build(origin: Located["position"], destination: Located["position"], avoidTolls: boolean) {
  const url = new URL("https://router.hereapi.com/v8/routes");
  url.searchParams.set("transportMode", "car");
  url.searchParams.set("origin", `${origin.lat},${origin.lng}`);
  url.searchParams.set("destination", `${destination.lat},${destination.lng}`);
  url.searchParams.set("routingMode", "fast");
  url.searchParams.set("return", "summary");
  if (avoidTolls) url.searchParams.set("avoid[features]", "tollRoad");
  url.searchParams.set("apiKey", process.env.HERE_API_KEY!);
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(response.status >= 500 || response.status === 429 ? "ROUTE_UNAVAILABLE" : "ROUTE_NOT_FOUND");
  const data = (await response.json()) as { routes?: HereRoute[] };
  const sections = data.routes?.[0]?.sections ?? [];
  const meters = sections.reduce((sum, section) => sum + (section.summary?.length ?? 0), 0);
  const seconds = sections.reduce((sum, section) => sum + (section.summary?.duration ?? 0), 0);
  if (!meters || !seconds) throw new Error("ROUTE_NOT_FOUND");
  return { meters, seconds, hasTolls: false, tollAmount: null as number | null };
}

export async function POST(request: NextRequest) {
  if (!process.env.HERE_API_KEY) return NextResponse.json({ error: "Сервис маршрутов ещё не настроен: отсутствует HERE_API_KEY" }, { status: 503 });
  try {
    const body = (await request.json()) as { from?: Point; to?: Point; rate?: number };
    if (!body.from?.label.trim() || !body.to?.label.trim()) return NextResponse.json({ error: "Укажите точки отправления и назначения" }, { status: 400 });
    if (!Number.isFinite(body.rate) || body.rate! <= 0 || body.rate! > 10000) return NextResponse.json({ error: "Введите корректную стоимость 1 км" }, { status: 400 });
    const [from, to] = await Promise.all([geocode(body.from), geocode(body.to)]);
    const [fast, free] = await Promise.all([build(from.position, to.position, false), build(from.position, to.position, true)]);
    const different = Math.abs(free.meters - fast.meters) > 250 || Math.abs(free.seconds - fast.seconds) > 120;
    fast.hasTolls = different;
    return NextResponse.json({ from: from.label, to: to.label, fast, free: different ? free : null, rate: body.rate });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const messages: Record<string, string> = {
      ADDRESS_NOT_FOUND: "Адрес не найден. Уточните населённый пункт, улицу или объект.",
      GEOCODE_UNAVAILABLE: "Поиск адресов временно недоступен. Попробуйте ещё раз позже.",
      ROUTE_NOT_FOUND: "Между выбранными точками не удалось построить автомобильный маршрут.",
      ROUTE_UNAVAILABLE: "Сервис маршрутов временно недоступен или исчерпан дневной лимит. Попробуйте позже.",
    };
    return NextResponse.json({ error: messages[code] ?? "Не удалось выполнить расчёт. Проверьте данные и повторите попытку." }, { status: code.endsWith("UNAVAILABLE") ? 502 : 400 });
  }
}
