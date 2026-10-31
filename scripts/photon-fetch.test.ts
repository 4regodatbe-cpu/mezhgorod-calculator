import assert from "node:assert/strict";
import test from "node:test";
import { fetchPhotonFeatures, photonFailureReason, PHOTON_REQUEST_TIMEOUT_MS } from "../lib/photon-fetch.ts";

test("a valid slow prefix response survives the former ten-second deadline", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const features = [{ geometry: { coordinates: [37.8, 48] }, properties: { name: "Донецьк" } }];
  let upstreamSignal: AbortSignal | undefined;
  const pending = fetchPhotonFeatures("https://photon.test/prefix", {
    fetchImpl: async (_url, init) => {
      upstreamSignal = init?.signal ?? undefined;
      return new Promise<Response>((resolve) => setTimeout(() => resolve(response(features)), 11_300));
    },
  });
  t.mock.timers.tick(11_300);
  assert.deepEqual(await pending, features);
  assert.equal(upstreamSignal?.aborted, false);
  assert.equal(PHOTON_REQUEST_TIMEOUT_MS, 20_000);
});

test("failure diagnostics distinguish provider failures without exposing raw text", () => {
  assert.equal(photonFailureReason(new Error("Photon request timed out")), "deadline");
  assert.equal(photonFailureReason(new Error("Photon request cancelled")), "cancelled");
  assert.equal(photonFailureReason(new Error("Photon 503")), "http_503");
  assert.equal(photonFailureReason(new Error("Photon 429")), "http_429");
  assert.equal(photonFailureReason(new Error("Photon returned invalid features")), "invalid_response");
  assert.equal(photonFailureReason(new Error("fetch failed", { cause: { code: "UND_ERR_CONNECT_TIMEOUT" } })), "connect_timeout");
  assert.equal(photonFailureReason(new Error("private address https://secret.invalid")), "network_error");
});

function response(features: unknown[], status = 200): Response {
  return new Response(JSON.stringify({ features }), { status, headers: { "Content-Type": "application/json" } });
}

test("a transient connect timeout gets one fresh attempt within the original deadline", async () => {
  let calls = 0;
  const features = [{ properties: { name: "Recovered" } }];
  const result = await fetchPhotonFeatures("https://photon.test/api", { fetchImpl: async () => {
    if (++calls === 1) throw new Error("fetch failed", { cause: { code: "UND_ERR_CONNECT_TIMEOUT" } });
    return response(features);
  } });
  assert.deepEqual(result, features); assert.equal(calls, 2);
});

test("persistent connect timeout is bounded to two attempts", async () => {
  let calls = 0;
  await assert.rejects(fetchPhotonFeatures("https://photon.test/api", { fetchImpl: async () => {
    calls++; throw new Error("fetch failed", { cause: { code: "UND_ERR_CONNECT_TIMEOUT" } });
  } }), /fetch failed/u);
  assert.equal(calls, 2);
});

test("caller cancellation after connect failure never starts a retry", async () => {
  let calls = 0; const caller = new AbortController();
  await assert.rejects(fetchPhotonFeatures("https://photon.test/api", { signal: caller.signal, fetchImpl: async () => {
    calls++; caller.abort(); throw new Error("fetch failed", { cause: { code: "UND_ERR_CONNECT_TIMEOUT" } });
  } }), /cancelled/u);
  assert.equal(calls, 1);
});

test("retry cannot restart the original deadline or accept a late response", async () => {
  let calls = 0; let retrySignal: AbortSignal | null | undefined;
  await assert.rejects(fetchPhotonFeatures("https://photon.test/api", { timeoutMs: 25, fetchImpl: async (_url, init) => {
    if (++calls === 1) throw new Error("fetch failed", { cause: { code: "UND_ERR_CONNECT_TIMEOUT" } });
    retrySignal = init?.signal; return new Promise<Response>(() => {});
  } }), /timed out/u);
  assert.equal(calls, 2); assert.equal(retrySignal?.aborted, true);
});

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
