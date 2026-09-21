import { NextRequest, NextResponse } from "next/server";

type HereItem = {
  id?: string;
  title?: string;
  address?: { label?: string };
  position?: { lat?: number; lng?: number };
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) return NextResponse.json({ items: [] });
  if (!process.env.HERE_API_KEY) return NextResponse.json({ error: "Сервис маршрутов ещё не настроен" }, { status: 503 });

  const url = new URL("https://geocode.search.hereapi.com/v1/geocode");
  url.searchParams.set("q", q);
  url.searchParams.set("in", "countryCode:RUS");
  url.searchParams.set("lang", "ru-RU");
  url.searchParams.set("limit", "6");
  url.searchParams.set("apiKey", process.env.HERE_API_KEY);
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HERE ${response.status}`);
    const data = (await response.json()) as { items?: HereItem[] };
    const items = (data.items ?? []).flatMap((item, index) => {
      const lat = item.position?.lat;
      const lng = item.position?.lng;
      if (typeof lat !== "number" || typeof lng !== "number") return [];
      const title = item.title ?? item.address?.label ?? q;
      return [{
        id: item.id ?? `${lat},${lng}-${index}`,
        title,
        label: item.address?.label ?? title,
        position: { lat, lng },
      }];
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Подсказки адресов временно недоступны" }, { status: 502 });
  }
}
