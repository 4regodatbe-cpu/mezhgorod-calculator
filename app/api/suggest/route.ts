import { NextRequest, NextResponse } from "next/server";
import { SPECIAL_TERRITORY_BOUNDARIES } from "../../../lib/special-territory-boundaries.ts";
import { photonSearchUrls, rankPhotonFeatures, type PhotonFeature } from "../../../lib/photon-address-search.ts";

async function fetchPhoton(url: string): Promise<PhotonFeature[]> {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MezhgorodCalculator/1.0" },
    next: { revalidate: 300 },
  });
  if (!response.ok) throw new Error(`Photon ${response.status}`);
  const data = (await response.json()) as { features?: PhotonFeature[] };
  if (!Array.isArray(data.features)) throw new Error("Photon returned invalid features");
  return data.features;
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? request.nextUrl.searchParams.get("term") ?? "").trim();
  if (q.length < 3) return NextResponse.json({ items: [] });
  if (q.length > 200) return NextResponse.json({ error: "Слишком длинный поисковый запрос" }, { status: 400 });

  try {
    const outcomes = await Promise.allSettled(photonSearchUrls(q).map(fetchPhoton));
    const features = outcomes.flatMap((outcome) => outcome.status === "fulfilled" ? outcome.value : []);
    if (outcomes.every((outcome) => outcome.status === "rejected")) throw new Error("Photon unavailable");
    return NextResponse.json({ items: rankPhotonFeatures(features, SPECIAL_TERRITORY_BOUNDARIES) });
  } catch {
    return NextResponse.json({ error: "Подсказки адресов временно недоступны" }, { status: 502 });
  }
}
