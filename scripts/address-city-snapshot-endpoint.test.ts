import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import switches from "../data/toll-feature-switches.json";
import snapshot from "../data/address-city-snapshot.json";
import { GET } from "../app/api/suggest/route";
import { POST } from "../app/r/route";

test("real GET and /r use optional snapshot only for full outage, respecting partial/empty/abort/off/deadline/expiry", async () => {
  const savedPilot=process.env.GEONAMES_LOCAL_PILOT;process.env.GEONAMES_LOCAL_PILOT="0";
  const saved = { fetch: globalThis.fetch, now: Date.now, warn: console.warn, error: console.error,
    enabled: switches.addressCitySnapshot, pool: switches.addressRequestPool };
  let mode = "outage", calls = 0, clock = Date.parse(snapshot.reviewedAt) + 1000;
  const originClock = clock;
  const rows: unknown[] = [];
  const diagnostics: unknown[][] = [];
  switches.addressCitySnapshot = true; switches.addressRequestPool = false;
  Date.now = () => clock; console.warn = (...args: unknown[]) => { diagnostics.push(args); }; console.error = () => {};
  globalThis.fetch = async input => {
    calls++; const url = new URL(String(input)); assert.equal(url.origin, "https://photon.komoot.io");
    if (mode === "budget") clock = originClock + 20_000;
    if (mode === "outage" || mode === "budget") return new Response("{}", { status: 503 });
    if (mode === "partial" && url.searchParams.get("countrycode") === "UA") return new Response("{}", { status: 503 });
    return new Response(JSON.stringify({ features: mode === "empty" ? [] : [{ geometry: { coordinates: [38.977, 45.035] },
      properties: { name: "Краснодар", state: "Краснодарский край", country: "Россия", countrycode: "RU", osm_type: "R", osm_id: 999, osm_key: "place", osm_value: "city" } }] }), { headers: { "Content-Type": "application/json" } });
  };
  const get = async (query: string, signal?: AbortSignal) => {
    const response = await GET(new NextRequest("https://test/api/suggest?q=" + encodeURIComponent(query), { signal }));
    return { status: response.status, data: await response.json() };
  };
  try {
    const failed = await get("Донецк"); assert.equal(failed.status, 200); assert.equal(failed.data.items.length, 2);
    assert.equal(failed.data.fallback.source, "reviewed_city_snapshot");
    const log = diagnostics.find(row => row[0] === "address_search_city_snapshot")?.[1] as { failures: Record<string, number>; sourceCount: number };
    assert.ok(log.failures.http_503 > 0); assert.ok(log.sourceCount > 0);
    assert.equal(JSON.stringify(log).includes("Донецк"), false);
    assert.deepEqual(failed.data.items, snapshot.records.slice(0, 2).map(x => x.suggestion));
    const proxy = await POST(new NextRequest("https://test/r", { method: "POST", body: JSON.stringify({ query: "Краснодар" }) }));
    const proxyBody = await proxy.json(); assert.equal(proxy.status, 200); assert.equal(proxyBody.items[0].id, "R-7373058");
    rows.push({ scenario: "full-outage-GET-and-r", statuses: [failed.status, proxy.status] });
    assert.equal((await get("Тарасовка")).status, 502);
    assert.equal((await get("Краснодар улица Ленина 1")).status, 502);
    switches.addressCitySnapshot = false; assert.equal((await get("Донецк")).status, 502); switches.addressCitySnapshot = true;
    const c = new AbortController(); c.abort(); const before = calls;
    assert.equal((await get("Донецк", c.signal)).status, 502); assert.equal(calls, before);
    mode = "partial"; const partial = await get("Краснодар"); assert.equal(partial.status, 200);
    assert.equal(partial.data.fallback, undefined); assert.equal(partial.data.items[0].id, "R-999");
    mode = "empty"; const empty = await get("Донецк"); assert.equal(empty.status, 200);
    assert.deepEqual(empty.data.items, []); assert.equal(empty.data.fallback, undefined);
    mode = "budget"; assert.equal((await get("Донецк")).status, 502);
    clock = Date.parse(snapshot.expiresAt); mode = "outage";
    assert.equal((await get("Донецк")).status, 502);
    rows.push({ scenario: "unknown-house-off-abort-partial-empty-budget-expiry", status: "PASS", mockFetches: calls, liveFetches: 0 });
    console.log(JSON.stringify({ addressCitySnapshotEndpoint: rows }));
  } finally {
    globalThis.fetch = saved.fetch; Date.now = saved.now; console.warn = saved.warn; console.error = saved.error;
    switches.addressCitySnapshot = saved.enabled; switches.addressRequestPool = saved.pool;
    if(savedPilot===undefined)delete process.env.GEONAMES_LOCAL_PILOT;else process.env.GEONAMES_LOCAL_PILOT=savedPilot;
  }
});
