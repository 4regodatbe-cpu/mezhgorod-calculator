import { NextRequest, NextResponse } from "next/server";
import { SPECIAL_TERRITORY_BOUNDARIES } from "../../../lib/special-territory-boundaries.ts";
import { rankPhotonFeatures, photonStreetMatchesSettlement } from "../../../lib/photon-address-search.ts";
import { settlementForStreetQuery } from "../../../lib/address-query.ts";
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
    let settlementFallback: Awaited<ReturnType<typeof searchLocalSettlements>> = null;
    try {
      const local = await searchLocalSettlements(q, request.signal);
      if (local) return NextResponse.json(local);
      const settlementQuery=settlementForStreetQuery(q);
      if(settlementQuery)settlementFallback=await searchLocalSettlements(settlementQuery,request.signal);
    } catch {
      if (request.signal.aborted) throw new Error("Cancelled");
      // Optional local data must not take down otherwise available Photon.
      // Never expose filesystem paths or merge corrupt/partial local results.
      console.warn("address_search_local_unavailable");
    }
    const cityOnly=(status: "unavailable"|"unconfirmed")=>NextResponse.json({ ...settlementFallback, partial:true,
      streetSearch:{status,precision:"settlement-centre",message:"Улица не подтверждена. Можно выбрать населённый пункт."} });
    const remainingMs=ADDRESS_SEARCH_BUDGET_MS-(Date.now()-started);
    if(remainingMs<=0){if(settlementFallback)return cityOnly("unavailable");throw new Error("Address budget expired");}
    const { features, sourceCount, failures, budgetExpired, unavailable } = await collectAddressFeatures(q, { signal: request.signal, budgetMs:remainingMs });
    if(request.signal.aborted)throw new Error("Cancelled");
    if (unavailable) {
      if(settlementFallback)return cityOnly("unavailable");
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
    const eligibleFeatures=settlementFallback
      ? features.filter(feature=>photonStreetMatchesSettlement(feature,q,settlementFallback.items[0]))
      : features;
    const confirmedStreetIds=new Set(settlementFallback?eligibleFeatures
      .map(feature=>`${feature.properties?.osm_type||"place"}-${feature.properties?.osm_id}`):[]);
    if(settlementFallback && !confirmedStreetIds.size)return cityOnly("unconfirmed");
    const items=rankPhotonFeatures(eligibleFeatures, SPECIAL_TERRITORY_BOUNDARIES, q).map(item=>{
      // GeoNames supplies an admitted Russian city name; never invent a
      // translation of a provider's unverified administrative label.
      const city=settlementFallback?.items[0].title;
      return city&&confirmedStreetIds.has(item.id)&&!item.label.includes(city)
        ? {...item,label:`${item.label}, ${city}`} : item;
    });
    return NextResponse.json({ items,
      partial: budgetExpired || Object.keys(failures).length > 0 });
  } catch {
    return NextResponse.json({ error: "Подсказки адресов временно недоступны" }, { status: 502 });
  }
}
