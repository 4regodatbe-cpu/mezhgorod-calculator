import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { fetchJsonWithin } from "./bounded-json-fetch.mjs";
import { runAddressSearchProbe } from "./address-search-live-probe.mjs";

const never = (): Promise<Response> => new Promise<Response>(() => {});
type FetchHandler = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
const fetchMock = (handler: FetchHandler): typeof globalThis.fetch => async (input, init) => handler(input, init);
const urls = (query: string) => [`https://offline.invalid/global/${query}`, `https://offline.invalid/ua/${query}`];
const quiet = () => {};

test("hanging headers are bounded and the source is aborted even if it ignores cancellation", async () => {
  let signal: AbortSignal | undefined;
  const started = performance.now();
  await assert.rejects(fetchJsonWithin("https://offline.invalid", {
    timeoutMs: 25,
    fetchImpl: fetchMock(async (_url, options) => { signal = options?.signal ?? undefined; return never(); }),
  }), { name: "ProbeTimeoutError" });
  assert.equal(signal?.aborted, true);
  assert.ok(performance.now() - started < 1000);
});

test("headers arriving successfully cannot bypass the deadline while JSON body hangs", async () => {
  let signal: AbortSignal | undefined;
  const response = new Response(new ReadableStream({ start() {} }));
  const started = performance.now();
  await assert.rejects(fetchJsonWithin("https://offline.invalid/body", {
    timeoutMs: 25,
    fetchImpl: fetchMock(async (_url, options) => { signal = options?.signal ?? undefined; return response; }),
  }), { name: "ProbeTimeoutError" });
  assert.equal(signal?.aborted, true);
  assert.ok(performance.now() - started < 1000);
});

test("expired total budget starts no source request; invalid time limits fail promptly", async () => {
  let calls = 0;
  const fetchImpl = fetchMock(async () => { calls++; return new Response("{}"); });
  await assert.rejects(fetchJsonWithin("https://offline.invalid", { fetchImpl, deadlineAt: performance.now() - 1 }), { name: "ProbeBudgetError" });
  for (const timeoutMs of [0, -1, NaN, Infinity]) {
    await assert.rejects(fetchJsonWithin("https://offline.invalid", { fetchImpl, timeoutMs }), RangeError);
  }
  assert.equal(calls, 0);
});

test("HTTP and malformed JSON failures remain explicit and abort unread response work", async () => {
  let signal: AbortSignal | undefined;
  await assert.rejects(fetchJsonWithin("https://offline.invalid", {
    fetchImpl: fetchMock(async (_url, options) => { signal = options?.signal ?? undefined; return new Response("error", { status: 503 }); }),
  }), /Photon HTTP 503/);
  assert.equal(signal?.aborted, true);
  await assert.rejects(fetchJsonWithin("https://offline.invalid", { fetchImpl: fetchMock(async () => new Response("invalid-json")) }), SyntaxError);
});

test("successful source JSON and original report array/ranking contract survive incremental writes", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "address-probe-ok-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const outputPath = join(dir, "report.json"), progressPath = join(dir, "progress.json");
  let firstSaved = false;
  const { reports, progress } = await runAddressSearchProbe({
    queries: ["Москва", "Краснодар"],
    queryUrls(query: string) {
      if (query === "Краснодар") {
        const saved = JSON.parse(readFileSync(outputPath, "utf8"));
        const state = JSON.parse(readFileSync(progressPath, "utf8"));
        assert.equal(saved.length, 1);
        assert.equal(saved[0].query, "Москва");
        assert.equal(state.status, "IN_PROGRESS");
        assert.equal(state.completed, 1);
        firstSaved = true;
      }
      return urls(query);
    },
    fetchImpl: fetchMock(async () => new Response(JSON.stringify({ features: [{
      geometry: { coordinates: [37.6173, 55.7558] },
      properties: { name: "Москва", country: "Россия", countrycode: "RU", osm_key: "place", osm_value: "city", osm_id: 2555133, osm_type: "R" },
    }] }))),
    outputPath, progressPath, report: quiet,
  });
  assert.equal(firstSaved, true);
  assert.equal(progress.status, "DONE");
  assert.equal(progress.completed, 2);
  assert.deepEqual(progress.remainingQueries, []);
  assert.deepEqual(JSON.parse(await readFile(outputPath, "utf8")), JSON.parse(JSON.stringify(reports)));
  assert.equal(reports[0].globalStatus, "fulfilled");
  assert.equal(reports[0].ukraineStatus, "fulfilled");
  assert.equal(reports[0].failedSources, 0);
  assert.equal(reports[0].rankingChecks.moscowFirst, true);
});

test("global budget bounds concurrent stalled sources, saves partial results and stops later cities", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "address-probe-budget-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  let calls = 0;
  const outputPath = join(dir, "report.json"), progressPath = join(dir, "progress.json");
  const started = performance.now();
  const { progress } = await runAddressSearchProbe({
    queries: ["Москва", "Краснодар", "Ялта"], queryUrls: urls,
    fetchImpl: fetchMock(async () => { calls++; return never(); }),
    requestTimeoutMs: 1000, totalTimeoutMs: 35,
    outputPath, progressPath, report: quiet,
  });
  assert.ok(performance.now() - started < 1000);
  assert.equal(calls, 2);
  assert.equal(progress.status, "BUDGET_EXHAUSTED");
  assert.equal(progress.completed, 1);
  assert.deepEqual(progress.remainingQueries, ["Краснодар", "Ялта"]);
  const saved = JSON.parse(await readFile(outputPath, "utf8"));
  assert.equal(saved.length, 1);
  assert.equal(saved[0].failedSources, 2);
  assert.deepEqual(saved[0].sourceErrors.map((e: { name: string }) => e.name), ["ProbeBudgetError", "ProbeBudgetError"]);
  assert.equal(JSON.parse(await readFile(progressPath, "utf8")).status, "BUDGET_EXHAUSTED");
});

test("budget exhaustion on the final city is still reported instead of a false DONE", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "address-probe-final-budget-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const { progress } = await runAddressSearchProbe({
    queries: ["Москва"], queryUrls: urls, fetchImpl: fetchMock(never),
    requestTimeoutMs: 1000, totalTimeoutMs: 25,
    outputPath: join(dir, "report.json"), report: quiet,
  });
  assert.equal(progress.completed, 1);
  assert.equal(progress.status, "BUDGET_EXHAUSTED");
});

test("one unavailable source is a recorded failure, while the other source and following city still finish", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "address-probe-partial-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  let calls = 0;
  const { reports, progress } = await runAddressSearchProbe({
    queries: ["Москва", "Краснодар"], queryUrls: urls,
    fetchImpl: fetchMock(async (input) => { calls++; return String(input).includes("/global/") ? never() : new Response(JSON.stringify({ features: [] })); }),
    requestTimeoutMs: 20, totalTimeoutMs: 1000,
    outputPath: join(dir, "report.json"), report: quiet,
  });
  assert.equal(calls, 4);
  assert.equal(progress.status, "DONE");
  assert.equal(progress.failedSources, 2);
  assert.equal(reports[0].globalStatus, "rejected");
  assert.equal(reports[0].ukraineStatus, "fulfilled");
  assert.ok(reports[0].sourceErrors);
  assert.ok(reports[0].sourceErrors[0]);
  assert.equal(reports[0].sourceErrors[0].name, "ProbeTimeoutError");
  assert.equal(reports[1].failedSources, 1);
});
