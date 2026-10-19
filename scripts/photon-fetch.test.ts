import assert from "node:assert/strict";
import test from "node:test";
import { fetchPhotonFeatures } from "../lib/photon-fetch.ts";

function response(features: unknown[], status = 200): Response {
  return new Response(JSON.stringify({ features }), { status, headers: { "Content-Type": "application/json" } });
}

test("Photon fetch returns parsed features and preserves the cache window", async () => {
  let requestInit: RequestInit | undefined;
  const features = [{ geometry: { coordinates: [38.9, 45] }, properties: { name: "Краснодар" } }];
  const result = await fetchPhotonFeatures("https://photon.test/api", {
    fetchImpl: async (_url, init) => { requestInit = init; return response(features); },
  });
  assert.deepEqual(result, features);
  assert.equal((requestInit as (RequestInit & { next: { revalidate: number } }) | undefined)?.next.revalidate, 300);
  assert.ok(requestInit?.signal instanceof AbortSignal);
});

test("Photon fetch rejects promptly on deadline and aborts the upstream request", async () => {
  let observedSignal: AbortSignal | undefined;
  const started = Date.now();
  await assert.rejects(fetchPhotonFeatures("https://photon.test/stall", {
    timeoutMs: 20,
    fetchImpl: async (_url, init) => {
      observedSignal = init?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => observedSignal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true }));
    },
  }), /timed out/u);
  assert.ok(Date.now() - started < 500);
  assert.equal(observedSignal?.aborted, true);
});

test("Photon fetch forwards caller cancellation", async () => {
  const caller = new AbortController();
  const pending = fetchPhotonFeatures("https://photon.test/stall", {
    signal: caller.signal,
    timeoutMs: 1_000,
    fetchImpl: async (_url, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
      setTimeout(() => caller.abort(), 5);
    }),
  });
  await assert.rejects(pending, /cancelled/u);
});

test("an unavailable Photon source remains an individual failed result", async () => {
  await assert.rejects(fetchPhotonFeatures("https://photon.test/503", {
    fetchImpl: async () => response([], 503),
  }), /Photon 503/u);
});
