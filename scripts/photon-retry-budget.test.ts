import assert from "node:assert/strict";
import test from "node:test";
import { fetchPhotonFeatures } from "../lib/photon-fetch.ts";
import { collectAddressFeatures } from "../lib/address-search-service.ts";

const connectError = () => new Error("fetch failed", { cause: { code: "UND_ERR_CONNECT_TIMEOUT" } });
const turn = () => new Promise<void>(resolve => setImmediate(resolve));

test("19 seconds spent connecting leave only one second for the retry", async t => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let calls = 0; let signal: AbortSignal | null | undefined;
  const pending = fetchPhotonFeatures("https://fixture.test/api", { fetchImpl: async (_url, init) => {
    calls++; signal = init?.signal;
    if (calls === 1) return new Promise<Response>((_, reject) => setTimeout(() => reject(connectError()), 19_000));
    return new Promise<Response>(() => {});
  } });
  const rejected = assert.rejects(pending, /timed out/u);
  t.mock.timers.tick(19_000); await turn();
  assert.equal(calls, 2); assert.equal(signal?.aborted, false);
  t.mock.timers.tick(999); await turn(); assert.equal(signal?.aborted, false);
  t.mock.timers.tick(1); await rejected; assert.equal(signal?.aborted, true);
});

test("queued request retry respects the collector's remaining budget rather than a new 20 seconds", async t => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let calls = 0; const signals: AbortSignal[] = [];
  const pending = collectAddressFeatures("Доне", { fetchFeatures: async (url, { signal }) => {
    // Simulate 17s already spent in the pool queue before this task starts.
    await new Promise<void>(resolve => setTimeout(resolve, 17_000));
    return fetchPhotonFeatures(url, { signal, fetchImpl: async (_url, init) => {
      calls++; signals.push(init!.signal!);
      if (calls <= 7) throw connectError();
      return new Promise<Response>(() => {});
    } });
  } });
  await turn(); t.mock.timers.tick(17_000); await turn();
  assert.equal(calls, 14);
  t.mock.timers.tick(3_000);
  const result = await pending;
  assert.equal(result.budgetExpired, true); assert.equal(result.unavailable, true);
  assert.equal(result.failures.budget, 7); assert.ok(signals.every(s => s.aborted));
});

test("a noncooperative retry's late result cannot escape caller cancellation", async () => {
  const caller = new AbortController(); let finish!: (response: Response) => void; let calls = 0;
  const pending = fetchPhotonFeatures("https://fixture.test/api", { signal: caller.signal, fetchImpl: async () => {
    if (++calls === 1) throw connectError();
    return new Promise<Response>(resolve => { finish = resolve; });
  } });
  const rejected = assert.rejects(pending, /cancelled/u);
  await turn(); assert.equal(calls, 2); caller.abort(); await rejected;
  finish(new Response(JSON.stringify({ features: [{ properties: { name: "obsolete" } }] })));
  await turn(); assert.equal(calls, 2);
});
