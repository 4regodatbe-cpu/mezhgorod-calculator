import { NextRequest, NextResponse } from "next/server";
import { SPECIAL_TERRITORY_BOUNDARIES } from "../../../lib/special-territory-boundaries.ts";
import { photonSearchUrls, rankPhotonFeatures } from "../../../lib/photon-address-search.ts";
import { fetchPhotonFeatures } from "../../../lib/photon-fetch.ts";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? request.nextUrl.searchParams.get("term") ?? "").trim();
  if (q.length < 3) return NextResponse.json({ items: [] });
  if (q.length > 200) return NextResponse.json({ error: "Слишком длинный поисковый запрос" }, { status: 400 });

  try {
    const outcomes = await Promise.allSettled(photonSearchUrls(q).map((url) => fetchPhotonFeatures(url, { signal: request.signal })));
    const features = outcomes.flatMap((outcome) => outcome.status === "fulfilled" ? outcome.value : []);
    if (outcomes.every((outcome) => outcome.status === "rejected")) throw new Error("Photon unavailable");
    return NextResponse.json({ items: rankPhotonFeatures(features, SPECIAL_TERRITORY_BOUNDARIES, q) });
  } catch {
    return NextResponse.json({ error: "Подсказки адресов временно недоступны" }, { status: 502 });
  }
}
