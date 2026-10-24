import assert from "node:assert/strict";
import test from "node:test";
import { createCalculationTiming } from "../lib/calculation-timing";

test("timing preserves values and records overlapping stages without summing request duration", async () => {
  let now = 0;
  const timing = createCalculationTiming({ clock: () => now, logger: () => {} });
  const value = {};
  let complete!: () => void;
  const pending = timing.measure("provider_valhalla", () => new Promise<void>(resolve => { complete = resolve; }));
  now = 5;
  assert.equal(timing.measureSync("response_pricing", () => value), value);
  now = 10;
  complete(); await pending;
  assert.equal(await timing.measure("geocoding", () => value), value);
  const result = timing.finish(200)!;
  assert.equal(result.summary.handlerElapsedMs, 10);
  assert.equal(result.summary.overTarget, false);
  assert.equal(result.summary.stages.find(row => row.stage === "provider_valhalla")?.totalMs, 10);
  assert.match(result.header!, /calc_total;dur=10/);
  assert.equal(timing.finish(500), result);
  const before = JSON.stringify(result);
  await timing.measure("routing", () => value);
  assert.equal(JSON.stringify(result), before);
});

test("timing preserves original synchronous and asynchronous errors", async () => {
  let now = 0;
  const timing = createCalculationTiming({ clock: () => now++, logger: () => {} });
  const error = new Error("original");
  assert.throws(() => timing.measureSync("routing", () => { throw error; }), e => e === error);
  await assert.rejects(timing.measure("routing", async () => { throw error; }), e => e === error);
  assert.equal(timing.finish(502)!.summary.stages[0].errors, 2);
});

test("disabled timing performs no instrumentation", async () => {
  const fail = () => { throw new Error("must not be called"); };
  const timing = createCalculationTiming({ enabled: false, clock: fail, logger: fail });
  const value = {};
  assert.equal(timing.measureSync("routing", () => value), value);
  assert.equal(await timing.measure("routing", () => value), value);
  assert.equal(timing.finish(200), null);
});

test("unavailable clocks and loggers cannot break the calculation", async () => {
  for (const clock of [() => NaN, () => { throw new Error("clock"); }]) {
    const timing = createCalculationTiming({ clock, logger: () => { throw new Error("logger"); } });
    assert.equal(await timing.measure("routing", () => 42), 42);
    const result = timing.finish(200)!;
    assert.equal(result.summary.handlerElapsedMs, null);
    assert.equal(result.summary.overTarget, null);
    assert.deepEqual(result.summary.stops, ["timing_clock_unavailable", "timing_log_unavailable"]);
  }
});

test("backwards clock is unknown and a slow valid request exceeds the target", () => {
  let now = 100;
  const backwards = createCalculationTiming({ clock: () => now, logger: () => {} });
  now = 90;
  assert.equal(backwards.finish(200)!.summary.overTarget, null);
  now = 0;
  const slow = createCalculationTiming({ clock: () => now, logger: () => {} });
  now = 10_001;
  assert.equal(slow.finish(200)!.summary.overTarget, true);
});
