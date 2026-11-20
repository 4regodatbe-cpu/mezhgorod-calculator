import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { calculationProbeCase, summarizeCalculation, runCalculationHandlerProbe, superviseCalculationProbe } from "./calculation-runtime-probe.mjs";
const body = { legs: [{ fast: { meters: 170000, seconds: 10000, tolls: { pricingStatus: "priced", amount: 620 } } }] };
const input = { httpStatus: 200, body, serverTiming: "calc_total;dur=50, routing;dur=30", elapsedMs: 60 };
test("runtime report distinguishes successful timing, slow request and HTTP failure", () => {
  assert.equal(summarizeCalculation(input).status, "PASS");
  assert.equal(summarizeCalculation({ ...input, elapsedMs: 10001 }).status, "OVER_TARGET");
  assert.equal(summarizeCalculation({ ...input, httpStatus: 502 }).status, "API_ERROR");
  assert.equal(summarizeCalculation({ ...input, body: {} }).status, "INVALID_RESPONSE");
  for (const serverTiming of [null, "calc_total;dur=NaN", "calc_total;dur=1, calc_total;dur=2"]) assert.equal(summarizeCalculation({ ...input, serverTiming }).status, "TIMING_INVALID");
});
test("unknown price stays null and cannot be converted into a free/complete total", () => {
  const unknown = { legs: [{ fast: { ...body.legs[0].fast, tolls: { pricingStatus: "unknown", amount: null } } }] };
  const result = summarizeCalculation({ ...input, body: unknown });
  assert.equal(result.status, "PASS"); assert.equal(result.tollAmount, null);
  assert.equal(result.tariffIndependentlyVerified, false); assert.equal(result.deployedBrowserEndToEnd, false);
  unknown.legs[0].fast.tolls.amount = 0 as never;
  assert.equal(summarizeCalculation({ ...input, body: unknown }).status, "PRICE_INTEGRITY_ERROR");
});
test("one injected handler call preserves the complete body and atomic result", async t => {
  const dir = await mkdtemp(join(tmpdir(), "calculation-runtime-")); t.after(() => rm(dir, { recursive: true, force: true }));
  let calls = 0;
  const outputPath = join(dir, "result.json");
  const result = await runCalculationHandlerProbe({ outputPath, requestFactory: () => ({}), handler: async () => {
    calls++; return new Response(JSON.stringify(body), { headers: { "Server-Timing": input.serverTiming } });
  } });
  assert.equal(calls, 1); assert.deepEqual(result.body, body);
  assert.deepEqual(JSON.parse(await readFile(outputPath, "utf8")), result);
});
test("supervisor bounds a stalled child and retains progress; crash cannot pass", async t => {
  const dir = await mkdtemp(join(tmpdir(), "calculation-supervisor-")); t.after(() => rm(dir, { recursive: true, force: true }));
  for (const [source, expected] of [["setInterval(()=>{},1000)", "PROCESS_TIMEOUT"], ["process.exit(2)", "WORKER_ERROR"], ["", "WORKER_ERROR"]]) {
    const result = await superviseCalculationProbe({ outputPath: join(dir, "result.json"), timeoutMs: source.includes("setInterval") ? 100 : 2000,
      args: ["-e", source], quiet: true });
    assert.equal(result.status, expected); assert.equal(result.partial.status, "IN_PROGRESS");
    assert.ok(result.supervisorElapsedMs < 5000);
  }
});
test("supervisor preserves a completed child result and body", async t => {
  const dir = await mkdtemp(join(tmpdir(), "calculation-complete-")); t.after(() => rm(dir, { recursive: true, force: true }));
  const outputPath = join(dir, "result.json");
  const payload = { schemaVersion: 1, status: "PASS", body, ...calculationProbeCase() };
  const source = "require('node:fs').writeFileSync(process.argv[1],process.argv[2])";
  const result = await superviseCalculationProbe({ outputPath, timeoutMs: 2000,
    args: ["-e", source, outputPath, JSON.stringify(payload)], quiet: true });
  assert.equal(result.status, "PASS"); assert.deepEqual(result.body, body);
  assert.equal(JSON.parse(await readFile(outputPath, "utf8")).status, "PASS");
});
test("special probe binds the requested case, branch and detailed timing", async t => {
  const dir = await mkdtemp(join(tmpdir(), "calculation-special-")); t.after(() => rm(dir, { recursive: true, force: true }));
  const specialBody = { ...body, specialEndpoint: true };
  const serverTiming = "calc_total;dur=90, special_options;dur=80, routing;dur=20, provider_valhalla;dur=10, provider_osrm;dur=20, toll_matching;dur=50, toll_pricing;dur=10";
  let calledWith: unknown;
  const result = await runCalculationHandlerProbe({ caseId: "donetsk-moscow", outputPath: join(dir, "result.json"),
    requestFactory: (request: unknown) => request, handler: async (request: unknown) => {
      calledWith = request;
      return new Response(JSON.stringify(specialBody), { headers: { "Server-Timing": serverTiming } });
    } });
  assert.equal(result.status, "PASS"); assert.equal(result.caseId, "donetsk-moscow");
  assert.deepEqual(calledWith, calculationProbeCase("donetsk-moscow").request);
  assert.equal(result.request.from.position.lng, 37.8029);
  assert.equal(summarizeCalculation({ ...input, body: specialBody, expectedSpecial: true }).status, "TIMING_INVALID");
  assert.equal(summarizeCalculation({ ...input, expectedSpecial: true, serverTiming }).status, "ROUTE_POLICY_MISMATCH");
  assert.equal(calculationProbeCase().caseId, "anapa-krasnodar");
  await assert.rejects(superviseCalculationProbe({ caseId: "unexpected", outputPath: join(dir, "not-created.json") }), RangeError);
  await assert.rejects(readFile(join(dir, "not-created.json")), { code: "ENOENT" });
});
test("a child cannot report another case as the requested run", async t => {
  const dir = await mkdtemp(join(tmpdir(), "calculation-wrong-case-")); t.after(() => rm(dir, { recursive: true, force: true }));
  const outputPath = join(dir, "result.json");
  const payload = { schemaVersion: 1, status: "PASS", body, ...calculationProbeCase() };
  const result = await superviseCalculationProbe({ outputPath, caseId: "donetsk-moscow", timeoutMs: 2000, quiet: true,
    args: ["-e", "require('node:fs').writeFileSync(process.argv[1],process.argv[2])", outputPath, JSON.stringify(payload)] });
  assert.equal(result.status, "WORKER_ERROR"); assert.equal(result.caseId, "donetsk-moscow");
  assert.equal(result.partial.caseId, "anapa-krasnodar");
});
