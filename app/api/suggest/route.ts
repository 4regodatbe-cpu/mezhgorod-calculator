import { NextRequest, NextResponse } from "next/server";

type PhotonFeature = { geometry?: { coordinates?: [number, number] }; properties?: Record<string, string | number | undefined> };

function getLabel(feature: PhotonFeature) {
  const p = feature.properties ?? {};
  const street = [p.street, p.housenumber].filter(Boolean).join(", ");
  return [p.name || street, p.city, p.state, p.country].filter(Boolean).join(", ");
}

function getRegion(feature: PhotonFeature) {
  const p = feature.properties ?? {};
  return [p.city || p.county || p.state, p.state, p.country]
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(", ");
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) return NextResponse.json({ items: [] });
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q); url.searchParams.set("limit", "6");
  try {
    const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "MezhgorodCalculator/1.0" }, next: { revalidate: 300 } });
    if (!response.ok) throw new Error(`Photon ${response.status}`);
    const data = (await response.json()) as { features?: PhotonFeature[] };
    const seen = new Set<string>();
    const items = (data.features ?? []).flatMap((feature, index) => {
      const coordinates = feature.geometry?.coordinates, label = getLabel(feature);
      if (!coordinates || !label || seen.has(label)) return [];
      seen.add(label);
      return [{ id: `${feature.properties?.osm_type ?? "place"}-${feature.properties?.osm_id ?? index}`, title: String(feature.properties?.name ?? feature.properties?.city ?? label), label, region: getRegion(feature), position: { lat: coordinates[1], lng: coordinates[0] } }];
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Подсказки адресов временно недоступны" }, { status: 502 });
  }
}
