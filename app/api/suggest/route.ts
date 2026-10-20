import { NextRequest, NextResponse } from "next/server";
import { SPECIAL_TERRITORY_BOUNDARIES } from "../../../lib/special-territory-boundaries.ts";
import { photonSearchUrls, rankPhotonFeatures } from "../../../lib/photon-address-search.ts";
import { fetchPhotonFeatures, photonFailureReason } from "../../../lib/photon-fetch.ts";

export const preferredRegion = "fra1";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? request.nextUrl.searchParams.get("term") ?? "").trim();
  if (q.length < 3) return NextResponse.json({ items: [] });
  if (q.length > 200) return NextResponse.json({ error: "Слишком длинный поисковый запрос" }, { status: 400 });

  const started = Date.now();
  try {
    const outcomes = await Promise.allSettled(photonSearchUrls(q).map((url) => fetchPhotonFeatures(url, { signal: request.signal })));
    const features = outcomes.flatMap((outcome) => outcome.status === "fulfilled" ? outcome.value : []);
    if (outcomes.every((outcome) => outcome.status === "rejected")) {
      if (!request.signal.aborted) {
        const failures: Record<string, number> = {};
        for (const outcome of outcomes) {
          if (outcome.status !== "rejected") continue;
          const reason = photonFailureReason(outcome.reason);
          failures[reason] = (failures[reason] ?? 0) + 1;
        }
        console.error("address_search_unavailable", { elapsedMs: Date.now() - started, sourceCount: outcomes.length, failures });
      }
      throw new Error("Photon unavailable");
    }
    return NextResponse.json({ items: rankPhotonFeatures(features, SPECIAL_TERRITORY_BOUNDARIES, q) });
  } catch {
    return NextResponse.json({ error: "Подсказки адресов временно недоступны" }, { status: 502 });
  }
}
