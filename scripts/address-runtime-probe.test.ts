import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runRuntimeAddressProbe } from "./address-search-runtime-probe.mjs";

function features(query: string) {
  const city = (name: string, coordinates: [number, number], osm_id: number, state = "Россия") => ({ geometry: { coordinates },
    properties: { name, osm_id, osm_type: "R", osm_key: "place", osm_value: "city", state, country: "Россия", countrycode: "RU" } });
  if (query.toLowerCase() === "ростов") return [city("Ростов-на-Дону", [39.7198, 47.2222], 1, "Ростовская область")];
  if (query.toLowerCase() === "красн") return [city("Краснодар", [38.98, 45.04], 2)];
  return [city("Донецк", [37.8013, 48.0158], 3), city("Донецк", [39.9509, 48.3382], 4, "Ростовская область")];
}
const response = (query: string) => ({ features: features(query), sourceCount: 7, failures: {}, budgetExpired: false, unavailable: false });
async function paths(t: { after: (fn: () => Promise<void>) => void }) {
  const root = await mkdtemp(join(tmpdir(), "runtime-address-probe-")); t.after(() => rm(root, { recursive: true, force: true }));
  return { outputPath: join(root, "result.json"), progressPath: join(root, "progress.json"), report: () => {} };
}

test("runtime probe persists checked cities/raw features/progress after every query", async t => {
  const options = await paths(t); let completed = 0;
  const result = await runRuntimeAddressProbe({ ...options, collect: async (query: string) => {
    const progress = JSON.parse(await readFile(options.progressPath, "utf8"));
    assert.equal(progress.completed, completed++); return response(query);
  } });
  assert.equal(result.progress.status, "PASS"); assert.equal(completed, 3);
  const saved = JSON.parse(await readFile(options.outputPath, "utf8"));
  assert.equal(saved.mode, "production-address-collector"); assert.equal(saved.rows[2].items[0].label, "Донецк — ДНР");
  assert.equal(saved.rows[2].rawFeatures.length, 2); assert.deepEqual(saved.remainingQueries, []);
});

test("full source failure stops further requests and never becomes successful empty results", async t => {
  const options = await paths(t); let calls = 0;
  const result = await runRuntimeAddressProbe({ ...options, collect: async () => {
    calls++; return { features: [], unavailable: true, failures: { source_cooldown: 7 }, sourceCount: 7, budgetExpired: false };
  } });
  assert.equal(calls, 1); assert.equal(result.progress.status, "SOURCE_UNAVAILABLE");
  assert.deepEqual(result.progress.remainingQueries, ["Красн", "Донецк"]);
  assert.equal(JSON.parse(await readFile(options.outputPath, "utf8")).rows[0].failures.source_cooldown, 7);
});

test("wrong nonempty city result is CHECK_FAILED while other independent cities are checked", async t => {
  const options = await paths(t);
  const result = await runRuntimeAddressProbe({ ...options, collect: async (query: string) => response(query === "Ростов" ? "Красн" : query) });
  assert.equal(result.rows.length, 3); assert.equal(result.rows[0].status, "CHECK_FAILED");
  assert.equal(result.progress.status, "CHECK_FAILED");
});

test("total budget preserves completed results and remaining queries", async t => {
  const options = await paths(t); let now = 0;
  const result = await runRuntimeAddressProbe({ ...options, now: () => now, totalBudgetMs: 10, collect: async (query: string) => {
    now += 11; return response(query);
  } });
  assert.equal(result.progress.status, "BUDGET_EXHAUSTED"); assert.equal(result.rows.length, 1);
  assert.equal(result.progress.remainingQueries.length, 2);
});

test("noncooperative collector/body is bounded and aborted with recoverable progress", async t => {
  const options = await paths(t); let signal: AbortSignal | undefined;
  const at = Date.now();
  const result = await runRuntimeAddressProbe({ ...options, perQueryBudgetMs: 10,
    collect: async (_query: string, input?: { signal?: AbortSignal }) => { signal = input?.signal; return new Promise<never>(() => {}); } });
  assert.equal(result.progress.status, "QUERY_TIMEOUT"); assert.equal(result.rows.length, 1);
  assert.equal(signal?.aborted, true); assert.ok(Date.now() - at < 500);
  assert.equal(JSON.parse(await readFile(options.progressPath, "utf8")).completed, 1);
});

test("transport errors are saved as bounded labels rather than dropped exceptions", async t => {
  const options = await paths(t);
  const result = await runRuntimeAddressProbe({ ...options, collect: async () => { throw new Error("private-url-or-query"); } });
  assert.equal(result.progress.status, "PROBE_ERROR"); assert.equal(result.rows[0].errorCode, "network_error");
  assert.doesNotMatch(await readFile(options.outputPath, "utf8"), /private-url-or-query/u);
});

test("probe rejects unbounded query counts or time limits before network work", async t => {
  const options = await paths(t);
  await assert.rejects(runRuntimeAddressProbe({ ...options, queries: ["one", "two", "three", "four"] }), /1–3/u);
  await assert.rejects(runRuntimeAddressProbe({ ...options, totalBudgetMs: 60_001 }), /60s/u);
  await assert.rejects(runRuntimeAddressProbe({ ...options, perQueryBudgetMs: 20_001 }), /20s/u);
});

test("default probe exercises production collector/pool with mocked fetch and concurrency2", async t => {
  const options = await paths(t); const original = globalThis.fetch;
  let active = 0, peak = 0, calls = 0;
  globalThis.fetch = async input => {
    active++; peak = Math.max(peak, active); calls++;
    try {
      await new Promise<void>(resolve => setImmediate(resolve));
      const query = new URL(String(input)).searchParams.get("q")!;
      return new Response(JSON.stringify({ features: features(query) }), { headers: { "Content-Type": "application/json" } });
    } finally { active--; }
  };
  try {
    const result = await runRuntimeAddressProbe(options);
    assert.equal(result.progress.status, "PASS"); assert.equal(calls, 21); assert.equal(peak, 2); assert.equal(active, 0);
  } finally { globalThis.fetch = original; }
});
