import assert from "node:assert/strict";
import test from "node:test";
import { createPhotonRequestPool } from "../lib/photon-request-pool";
import type { PhotonFeature } from "../lib/photon-address-search";
import { collectAddressFeatures } from "../lib/address-search-service";
import { fetchPhotonFeatures, photonFailureReason } from "../lib/photon-fetch";

const features: PhotonFeature[] = [{ geometry: { coordinates: [38.97, 45.03] }, properties: { name: "Краснодар" } }];
const tick = () => new Promise<void>(resolve => setImmediate(resolve));
function deferred() {
  let resolve!: (value: PhotonFeature[]) => void, reject!: (reason: Error) => void;
  const promise = new Promise<PhotonFeature[]>((a, b) => { resolve = a; reject = b; });
  return { promise, resolve, reject };
}

test("global pool caps concurrent requests across different address queries", async () => {
  const calls: ReturnType<typeof deferred>[] = [];
  const pool = createPhotonRequestPool({ fetchFeatures: async () => {
    const pending = deferred(); calls.push(pending); return pending.promise;
  } });
  const results = Array.from({ length: 8 }, (_, i) => pool.get(`https://photon.test/${i}`));
  await tick(); assert.equal(calls.length, 2); assert.equal(pool.stats().active, 2);
  for (let i = 0; i < 8; i++) { calls[i].resolve(features); await tick(); assert.ok(pool.stats().active <= 2); }
  assert.equal((await Promise.all(results)).length, 8);
  assert.equal(pool.stats().inFlight, 0); assert.equal(pool.stats().active, 0);
});

test("same URL shares one fetch; cancelling A does not cancel subscriber B", async () => {
  const reply = deferred(), a = new AbortController(), b = new AbortController();
  let signal: AbortSignal | undefined;
  const pool = createPhotonRequestPool({ fetchFeatures: async (_url, options) => { signal = options.signal; return reply.promise; } });
  const first = pool.get("https://photon.test/shared", { signal: a.signal });
  const second = pool.get("https://photon.test/shared", { signal: b.signal });
  const cancelled = assert.rejects(first, /cancelled/u);
  await tick(); a.abort(); await cancelled;
  assert.equal(signal?.aborted, false); reply.resolve(features); assert.deepEqual(await second, features);
  assert.equal(pool.stats().started, 1); assert.equal(pool.stats().sharedJoins, 1);
  assert.deepEqual(await pool.get("https://photon.test/shared"), features);
  assert.equal(pool.stats().cacheHits, 1);
});

test("clearing last subscriber aborts request; immediate retyping cannot reuse abandoned task", async () => {
  const calls: Array<{ signal?: AbortSignal; pending: ReturnType<typeof deferred> }> = [];
  const pool = createPhotonRequestPool({ fetchFeatures: async (_url, { signal }) => {
    const pending = deferred(); calls.push({ signal, pending });
    signal?.addEventListener("abort", () => pending.reject(new Error("aborted")), { once: true });
    return pending.promise;
  } });
  const caller = new AbortController();
  const old = pool.get("https://photon.test/retype", { signal: caller.signal });
  const check = assert.rejects(old, /cancelled/u);
  await tick(); caller.abort();
  const next = pool.get("https://photon.test/retype");
  await check; await tick();
  assert.equal(calls[0].signal?.aborted, true); assert.equal(calls.length, 2);
  calls[1].pending.resolve(features); assert.deepEqual(await next, features);
  assert.equal(pool.stats().inFlight, 0);
});

test("queued cancelled prefixes never reach the provider and free queue capacity", async () => {
  const active = deferred(); let calls = 0;
  const pool = createPhotonRequestPool({ concurrency: 1, maxQueued: 1, fetchFeatures: async () => { calls++; return active.promise; } });
  const first = pool.get("https://photon.test/active");
  const caller = new AbortController();
  const queued = pool.get("https://photon.test/old-prefix", { signal: caller.signal });
  const check = assert.rejects(queued, /cancelled/u);
  await assert.rejects(pool.get("https://photon.test/overflow"), /queue full/u);
  caller.abort(); await check; assert.equal(pool.stats().queued, 0);
  active.resolve(features); await first; await tick(); assert.equal(calls, 1);
});

test("pre-aborted callers invoke neither pool provider nor low-level fetch", async () => {
  const caller = new AbortController(); caller.abort(); let calls = 0;
  const pool = createPhotonRequestPool({ fetchFeatures: async () => { calls++; return features; } });
  await assert.rejects(pool.get("https://photon.test/cancelled", { signal: caller.signal }), /cancelled/u);
  await assert.rejects(fetchPhotonFeatures("https://photon.test/cancelled", { signal: caller.signal,
    fetchImpl: async () => { calls++; return new Response("{}"); } }), /cancelled/u);
  assert.equal(calls, 0);
});

test("three consecutive503/429 failures pause queue; retry after cooldown works", async () => {
  for (const code of [503, 429]) {
    let now = 100, calls = 0, failed = true;
    const pool = createPhotonRequestPool({ concurrency: 1, cooldownMs: 15, now: () => now,
      fetchFeatures: async () => { calls++; if (failed) throw new Error(`Photon ${code}`); return features; } });
    const results = await Promise.allSettled(["one", "two", "three", "four", "five"].map(name => pool.get(`https://photon.test/${name}`)));
    assert.ok(results.every(result => result.status === "rejected")); assert.equal(calls, 3);
    await assert.rejects(pool.get("https://photon.test/six"), /cooling down/u); assert.equal(calls, 3);
    failed = false; now += 16;
    assert.deepEqual(await pool.get("https://photon.test/one"), features); assert.equal(calls, 4);
    assert.equal(pool.stats().inFlight, 0);
  }
});

test("healthy cached results survive cooldown; TTL/LRU/empty responses stay bounded", async () => {
  let now = 0, calls = 0;
  const pool = createPhotonRequestPool({ maxCacheEntries: 2, cacheTtlMs: 10, failureThreshold: 1, now: () => now,
    fetchFeatures: async url => { calls++; if (url.endsWith("bad")) throw new Error("Photon 503"); return url.endsWith("empty") ? [] : features; } });
  await pool.get("https://photon.test/a"); await pool.get("https://photon.test/b");
  await pool.get("https://photon.test/a"); await pool.get("https://photon.test/c");
  assert.equal(pool.stats().cached, 2); assert.equal(calls, 3);
  await pool.get("https://photon.test/b"); assert.equal(calls, 4);
  now = 11; await pool.get("https://photon.test/b"); assert.equal(calls, 5);
  await pool.get("https://photon.test/empty"); await pool.get("https://photon.test/empty"); assert.equal(calls, 7);
  await assert.rejects(pool.get("https://photon.test/bad"), /503/u);
  assert.deepEqual(await pool.get("https://photon.test/b"), features); assert.equal(calls, 8);
});

test("one partial503 never blocks next city, and successes reset the failure streak", async () => {
  let calls = 0;
  const pool = createPhotonRequestPool({ concurrency: 1, fetchFeatures: async url => {
    calls++; if (url.includes("bad")) throw new Error("Photon 503"); return features;
  } });
  for (let i = 0; i < 3; i++) {
    await assert.rejects(pool.get(`https://photon.test/bad-${i}`), /503/u);
    assert.deepEqual(await pool.get(`https://photon.test/city-${i}`), features);
  }
  assert.equal(calls, 6); assert.equal(pool.stats().circuitRejected, 0);
});

test("an in-flight success clears an already-open circuit", async () => {
  const success = deferred(); let failures = 0;
  const pool = createPhotonRequestPool({ concurrency: 2, fetchFeatures: async url => {
    if (url.endsWith("good")) return success.promise;
    failures++; throw new Error("Photon 503");
  } });
  const good = pool.get("https://photon.test/good");
  const errors = await Promise.allSettled([1, 2, 3].map(i => pool.get(`https://photon.test/bad-${i}`)));
  assert.ok(errors.every(result => result.status === "rejected")); assert.equal(failures, 3);
  await assert.rejects(pool.get("https://photon.test/blocked"), /cooling down/u);
  success.resolve(features); await good;
  // A different good URL is a fresh fetch, not a cache hit.
  assert.deepEqual(await pool.get("https://photon.test/new-good"), features);
});

test("the complete failure streak must fit within15seconds, not just each adjacent gap", async () => {
  let now = 0, calls = 0;
  const pool = createPhotonRequestPool({ concurrency: 1, now: () => now, fetchFeatures: async () => { calls++; throw new Error("Photon 503"); } });
  for (let i = 0; i < 4; i++) {
    await assert.rejects(pool.get(`https://photon.test/failure-${i}`), /503/u); now += 10_000;
  }
  assert.equal(calls, 4); assert.equal(pool.stats().circuitRejected, 0);
});

test("source cooldown does not block another origin and has bounded diagnostic labels", async () => {
  const pool = createPhotonRequestPool({ concurrency: 1, fetchFeatures: async url => {
    if (url.includes("bad.test")) throw new Error("Photon 503"); return features;
  } });
  const results = await Promise.allSettled([pool.get("https://bad.test/one"), pool.get("https://good.test/two")]);
  assert.equal(results[0].status, "rejected"); assert.equal(results[1].status, "fulfilled");
  assert.equal(photonFailureReason(new Error("Photon source cooling down")), "source_cooldown");
  assert.equal(photonFailureReason(new Error("Photon request queue full")), "queue_full");
});

test("collector keeps partial positives and every original variant", async () => {
  let calls = 0;
  const result = await collectAddressFeatures("Донецк", { fetchFeatures: async () => {
    calls++; if (calls === 2) return features; throw new Error("Photon 503");
  } });
  assert.equal(calls, 7); assert.equal(result.sourceCount, 7); assert.equal(result.unavailable, false);
  assert.deepEqual(result.features, features); assert.deepEqual(result.failures, { http_503: 6 });
});

test("collector total budget includes queue and does not hang on a non-cooperative fetch", async () => {
  const start = Date.now();
  const result = await collectAddressFeatures("Донецк", { budgetMs: 15, fetchFeatures: async () => new Promise(() => {}) });
  assert.equal(result.unavailable, true); assert.equal(result.budgetExpired, true);
  assert.equal(result.failures.budget, 7); assert.ok(Date.now() - start < 500);
});

test("collector preserves the previously observed usable11.3second prefix response", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const pending = collectAddressFeatures("Донецк", { fetchFeatures: async () => new Promise(resolve => setTimeout(() => resolve(features), 11_300)) });
  await Promise.resolve(); t.mock.timers.tick(11_300);
  const result = await pending;
  assert.equal(result.unavailable, false); assert.equal(result.budgetExpired, false); assert.equal(result.features.length, 7);
});

test("collector caller cancellation stops all queued variants without opening cooldown", async () => {
  const caller = new AbortController(); let calls = 0;
  const pool = createPhotonRequestPool({ fetchFeatures: async (_url, { signal }) => {
    calls++; return new Promise((_, reject) => signal?.addEventListener("abort", () => reject(new Error("cancelled")), { once: true }));
  } });
  const pending = collectAddressFeatures("Макеевка", { signal: caller.signal, fetchFeatures: pool.get });
  await tick(); caller.abort();
  const result = await pending; await tick();
  assert.equal(calls, 2); assert.equal(result.unavailable, true); assert.equal(result.failures.cancelled, 12);
  assert.equal(pool.stats().queued, 0); assert.equal(pool.stats().active, 0); assert.equal(pool.stats().circuitRejected, 0);
});
