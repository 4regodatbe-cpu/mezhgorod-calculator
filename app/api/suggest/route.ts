import { NextRequest, NextResponse } from "next/server";
import { SPECIAL_TERRITORY_BOUNDARIES } from "../../../lib/special-territory-boundaries.ts";
import { rankPhotonFeatures } from "../../../lib/photon-address-search.ts";
import { collectAddressFeatures, ADDRESS_SEARCH_BUDGET_MS } from "../../../lib/address-search-service.ts";
import { searchCitySnapshot } from "../../../lib/address-city-snapshot.ts";
import { searchLocalSettlements } from "../../../lib/local-settlement-search.ts";

export const preferredRegion = "fra1";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? request.nextUrl.searchParams.get("term") ?? "").trim();
  if (q.length < 3) return NextResponse.json({ items: [] });
  if (q.length > 200) return NextResponse.json({ error: "Слишком длинный поисковый запрос" }, { status: 400 });

  const started = Date.now();
  try {
    const local = await searchLocalSettlements(q, request.signal);
    if (local) return NextResponse.json(local);
    const { features, sourceCount, failures, budgetExpired, unavailable } = await collectAddressFeatures(q, { signal: request.signal });
    if (unavailable) {
      const fallback = searchCitySnapshot(q, { signal: request.signal, deadlineAt: started + ADDRESS_SEARCH_BUDGET_MS });
      if (fallback.status === "ready") {
        console.warn("address_search_city_snapshot", { snapshotId: fallback.meta.snapshotId, itemCount: fallback.items.length,
          elapsedMs: Date.now() - started, sourceCount, failures, budgetExpired });
        return NextResponse.json({ items: fallback.items, fallback: fallback.meta });
      }
      if (!request.signal.aborted) {
        console.error("address_search_unavailable", { elapsedMs: Date.now() - started, sourceCount, failures, budgetExpired });
      }
      throw new Error("Photon unavailable");
    }
    if (!request.signal.aborted && Object.keys(failures).length) {
      console.warn("address_search_partial", { elapsedMs: Date.now() - started, sourceCount, failures, budgetExpired });
    }
    return NextResponse.json({ items: rankPhotonFeatures(features, SPECIAL_TERRITORY_BOUNDARIES, q),
      partial: budgetExpired || Object.keys(failures).length > 0 });
  } catch {
    return NextResponse.json({ error: "Подсказки адресов временно недоступны" }, { status: 502 });
  }
}
