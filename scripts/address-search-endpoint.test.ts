import assert from "node:assert/strict";
import test from "node:test";
import { writeFileSync } from "node:fs";
import { NextRequest } from "next/server";
import { POST } from "../app/r/route";
import { GET } from "../app/api/suggest/route";
import type { Suggestion } from "../app/v2/components/types";
import type { PhotonFeature } from "../lib/photon-address-search";

const town = (id: number, name: string, coordinates: [number, number], state = "Краснодарский край"): PhotonFeature => ({
  geometry: { coordinates }, properties: { osm_type: "R", osm_id: id, osm_key: "place", osm_value: "city", name, state, country: "Россия", countrycode: "RU" },
});
const places: Record<string, PhotonFeature[]> = {
  Анапа: [town(1, "Анапа", [37.315, 44.895])],
  Краснодар: [town(2, "Краснодар", [38.976, 45.035])],
  Ростов: [town(3, "Ростов-на-Дону", [39.714, 47.222], "Ростовская область")],
  Донецк: [town(4, "Донецк", [37.8013407, 48.0158753], "Донецкая область"), town(5, "Донецк", [39.9509488, 48.3382864], "Ростовская область")],
  Москва: [town(6, "Москва", [37.617, 55.755], "Москва")],
  Сочи: [town(7, "Сочи", [39.723, 43.585])],
  Луганск: [town(8, "Луганск", [39.303, 48.574], "Луганская область")],
};
const immediate = () => new Promise<void>(resolve => setImmediate(resolve));
function post(query: string, signal?: AbortSignal) {
  return POST(new NextRequest("https://calculator.test/r", { method: "POST", signal,
    headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) }));
}
async function read(response: Response) {
  return { status: response.status, data: await response.json() as { items?: Suggestion[]; error?: string } };
}

test("real endpoint/proxy flow survives sequential replacements, shared cancellation and partial outage", async () => {
  const originalFetch = globalThis.fetch, originalError = console.error, originalWarn = console.warn;
  const savedPilot=process.env.GEONAMES_LOCAL_PILOT;process.env.GEONAMES_LOCAL_PILOT="0";
  const diagnostics: unknown[][] = [], evidence: Record<string, unknown>[] = [];
  const calledUrls: string[] = [];
  let active = 0, peak = 0, abandonedStarted = 0;
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.origin, "https://photon.komoot.io");
    calledUrls.push(url.toString()); active++; peak = Math.max(peak, active);
    const query = url.searchParams.get("q")!;
    const queryKey = Object.keys(places).find(name => name.toLocaleLowerCase("ru-RU") === query.toLocaleLowerCase("ru-RU"));
    try {
      if (query.toLocaleLowerCase("ru-RU") === "предыдущийпрефикс") {
        abandonedStarted++;
        await new Promise<never>((_resolve, reject) => {
          if (init?.signal?.aborted) reject(new Error("aborted"));
          else init?.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
        });
      }
      await immediate();
      if (queryKey === "Сочи" && url.searchParams.get("countrycode") === "UA") return new Response("{}", { status: 503 });
      if (query.toLocaleLowerCase("ru-RU") === "полныйотказ") return new Response("{}", { status: 503 });
      assert.ok(queryKey, `Unexpected deterministic query: ${query}`);
      return new Response(JSON.stringify({ features: places[queryKey] }), { headers: { "Content-Type": "application/json" } });
    } finally { active--; }
  };
  console.error = (...args: unknown[]) => { diagnostics.push(args); };
  console.warn = (...args: unknown[]) => { diagnostics.push(args); };
  try {
    for (const query of ["Анапа", "Краснодар", "Ростов"]) {
      const result = await read(await post(query));
      assert.equal(result.status, 200); assert.ok(result.data.items?.length);
      assert.ok(result.data.items[0].title.includes(query));
      evidence.push({ step: "sequential-replacement", query, status: result.status, first: result.data.items[0].label });
    }

    const clearing = new AbortController();
    const obsolete = post("ПредыдущийПрефикс", clearing.signal);
    for (let i = 0; i < 50 && abandonedStarted < 2; i++) await immediate();
    assert.equal(abandonedStarted, 2); clearing.abort();
    const donetsk = await read(await post("Донецк"));
    assert.equal((await obsolete).status, 502);
    assert.equal(donetsk.status, 200);
    assert.equal(donetsk.data.items?.[0].label, "Донецк — ДНР");
    assert.match(donetsk.data.items?.[1].label ?? "", /Ростовская область/u);
    assert.equal(abandonedStarted, 2);
    evidence.push({ step: "clear-old-prefix-then-donetsk", status: donetsk.status, abandonedFetches: abandonedStarted,
      labels: donetsk.data.items?.map(item => item.label) });

    const beforeCache = calledUrls.length;
    const cached = await read(await GET(new NextRequest("https://calculator.test/api/suggest?q=" + encodeURIComponent("Донецк"))));
    assert.equal(cached.status, 200); assert.equal(calledUrls.length, beforeCache);
    evidence.push({ step: "same-query-through-GET-cache", extraFetches: calledUrls.length - beforeCache });

    const fromA = new AbortController(), beforeShared = calledUrls.length;
    const a = post("Москва", fromA.signal), b = post("Москва");
    for (let i = 0; i < 50 && calledUrls.length === beforeShared; i++) await immediate();
    fromA.abort();
    const resultB = await read(await b); const resultA = await a;
    assert.equal(resultA.status, 502); assert.equal(resultB.status, 200);
    assert.ok(resultB.data.items?.[0].label.includes("Москва"));
    const sharedCalls = calledUrls.slice(beforeShared);
    assert.equal(sharedCalls.length, 7); assert.equal(new Set(sharedCalls).size, 7);
    evidence.push({ step: "two-fields-same-query-cancel-A", statusA: resultA.status, statusB: resultB.status, upstreamFetches: sharedCalls.length });

    const partial = await read(await post("Сочи"));
    assert.equal(partial.status, 200); assert.ok(partial.data.items?.[0].label.includes("Сочи"));
    const nextCity = await read(await post("Луганск"));
    assert.equal(nextCity.status, 200); assert.equal(nextCity.data.items?.[0].label, "Луганск — ЛНР");
    evidence.push({ step: "partial-503-does-not-block-next-city", partialStatus: partial.status, nextCityStatus: nextCity.status });
    const beforeTotalOutage = calledUrls.length;
    const totalOutage = await read(await post("ПолныйОтказ"));
    assert.equal(totalOutage.status, 502);
    assert.ok(calledUrls.length - beforeTotalOutage <= 4);
    const beforeOutageRetry = calledUrls.length;
    const unavailable = await read(await post("НовыйПрефикс"));
    assert.equal(unavailable.status, 502); assert.ok(unavailable.data.error); assert.equal(unavailable.data.items, undefined);
    const repeated = await read(await post("НовыйПрефикс")); assert.equal(repeated.status, 502);
    assert.equal(calledUrls.length, beforeOutageRetry);
    const stillCached = await read(await post("Донецк"));
    assert.equal(stillCached.status, 200); assert.equal(stillCached.data.items?.[0].label, "Донецк — ДНР");
    evidence.push({ step: "three-consecutive-503-then-origin-cooldown", positiveStatus: partial.status, newQueryStatus: unavailable.status,
      totalOutageFetches: beforeOutageRetry - beforeTotalOutage,
      retryExtraFetches: calledUrls.length - beforeOutageRetry, cachedDonetskStatus: stillCached.status });

    const short = await read(await post("Я")); assert.equal(short.status, 200); assert.deepEqual(short.data.items, []);
    assert.equal((await GET(new NextRequest("https://calculator.test/api/suggest?q=" + "x".repeat(201)))).status, 400);
    assert.equal((await POST(new NextRequest("https://calculator.test/r", { method: "POST", body: "{" }))).status, 400);
    assert.ok(diagnostics.some(row => row[0] === "address_search_partial"));
    assert.ok(diagnostics.some(row => row[0] === "address_search_unavailable"));
    assert.doesNotMatch(JSON.stringify(diagnostics), /Донецк|Москва|Сочи|НовыйПрефикс|https:\/\//u);
    assert.ok(peak <= 2); assert.equal(active, 0);
    if (process.env.ADDRESS_ENDPOINT_EVIDENCE_PATH) writeFileSync(process.env.ADDRESS_ENDPOINT_EVIDENCE_PATH,
      JSON.stringify({ sourceBaseCommit: process.env.ADDRESS_ENDPOINT_SOURCE_COMMIT ?? null, scope: "deterministic Next endpoint/proxy with Photon mocks; not live/browser/mobile",
        liveRequests: 0, peakUpstream: peak, mockFetches: calledUrls.length, evidence,
        diagnosticCodes: [...new Set(diagnostics.map(row => row[0]))] }, null, 2) + "\n");
  } finally { globalThis.fetch = originalFetch; console.error = originalError; console.warn = originalWarn;
    if(savedPilot===undefined)delete process.env.GEONAMES_LOCAL_PILOT;else process.env.GEONAMES_LOCAL_PILOT=savedPilot; }
});
