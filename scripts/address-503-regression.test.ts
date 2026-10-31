import assert from "node:assert/strict";
import test from "node:test";
import { collectAddressFeatures } from "../lib/address-search-service";
import { photonSearchUrls, rankPhotonFeatures, type PhotonFeature } from "../lib/photon-address-search";
import { createPhotonRequestPool } from "../lib/photon-request-pool";
import { SPECIAL_TERRITORY_BOUNDARIES } from "../lib/special-territory-boundaries";

const tick = () => new Promise<void>(resolve => setImmediate(resolve));
const donetsk: PhotonFeature[] = [{
  geometry: { coordinates: [37.8013407, 48.0158753] },
  properties: { name: "Донецк", osm_id: 1413957, osm_type: "R", osm_key: "place", osm_value: "city", countrycode: "UA" },
}];

test("seven city variants share ONE upstream origin, not seven independent Photon providers", () => {
  for (const query of ["Ростов", "Красн", "Донецк"]) {
    const urls = photonSearchUrls(query);
    assert.equal(urls.length, 7);
    assert.deepEqual([...new Set(urls.map(url => new URL(url).origin))], ["https://photon.komoot.io"]);
  }
});

test("saved CI 4x503 + 3xcooldown is reproducible without timeout, ranking or missing-city assumptions", async () => {
  // A controlled completion order consistent with CI counts, NOT evidence of
  // the real provider's completion order or the cause of its HTTP responses.
  const calls: Array<{ reject: (error: Error) => void }> = [];
  const pool = createPhotonRequestPool({ fetchFeatures: async () => new Promise<PhotonFeature[]>((_resolve, reject) => {
    calls.push({ reject });
  }) });
  const resultPromise = collectAddressFeatures("Донецк", { fetchFeatures: pool.get });
  await tick(); assert.equal(calls.length, 2);
  calls[0].reject(new Error("Photon 503")); await tick(); assert.equal(calls.length, 3);
  calls[1].reject(new Error("Photon 503")); await tick(); assert.equal(calls.length, 4);
  calls[2].reject(new Error("Photon 503")); await tick();
  calls[3].reject(new Error("Photon 503"));
  const result = await resultPromise;
  assert.deepEqual(result.failures, { http_503: 4, source_cooldown: 3 });
  assert.equal(result.unavailable, true); assert.equal(result.budgetExpired, false);
  assert.equal(result.features.length, 0); assert.equal(pool.stats().started, 4);
  assert.equal(pool.stats().active, 0); assert.equal(pool.stats().queued, 0); assert.equal(pool.stats().inFlight, 0);
});

test("another query can inherit origin cooldown; it expires and a recovered source serves Donetsk", async () => {
  let now = 0, failed = true, calls = 0;
  const pool = createPhotonRequestPool({ concurrency: 1, now: () => now, fetchFeatures: async () => {
    calls++; if (failed) throw new Error("Photon 503"); return donetsk;
  } });
  const failedPrefix = await collectAddressFeatures("Красн", { fetchFeatures: pool.get });
  assert.deepEqual(failedPrefix.failures, { http_503: 3, source_cooldown: 4 });
  assert.equal(calls, 3);
  failed = false;
  const paused = await collectAddressFeatures("Донецк", { fetchFeatures: pool.get });
  assert.equal(calls, 3); assert.deepEqual(paused.failures, { source_cooldown: 7 });
  assert.equal(paused.unavailable, true); assert.equal(paused.budgetExpired, false);
  now = 15_001;
  const recovered = await collectAddressFeatures("Донецк", { fetchFeatures: pool.get });
  assert.equal(calls, 10); assert.equal(recovered.unavailable, false); assert.deepEqual(recovered.failures, {});
  const items = rankPhotonFeatures(recovered.features, SPECIAL_TERRITORY_BOUNDARIES, "Донецк");
  assert.equal(items[0].id, "R-1413957"); assert.match(items[0].label, /ДНР/u);
  assert.equal(pool.stats().active, 0); assert.equal(pool.stats().inFlight, 0);
});

test("one503 does not discard healthy Donetsk variants or create a false unavailable result", async () => {
  let calls = 0;
  const pool = createPhotonRequestPool({ concurrency: 1, fetchFeatures: async () => {
    if (++calls === 1) throw new Error("Photon 503"); return donetsk;
  } });
  const result = await collectAddressFeatures("Донецк", { fetchFeatures: pool.get });
  assert.equal(calls, 7); assert.equal(result.unavailable, false); assert.equal(result.budgetExpired, false);
  assert.deepEqual(result.failures, { http_503: 1 }); assert.equal(result.features.length, 6);
  assert.equal(pool.stats().circuitRejected, 0); assert.equal(pool.stats().active, 0);
});
