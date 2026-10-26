import test from "node:test";
import assert from "node:assert/strict";
import { classifyChangedPaths, classifyPushEvent } from "./classify-special-territory-live-push.mjs";

function push(files, overrides = {}) {
  return {
    ref: "refs/heads/fix/v3-missing-route-prices-2026-10-15",
    before: "1".repeat(40),
    after: "2".repeat(40),
    size: 1,
    commits: [{ added: [], modified: files, removed: [] }],
    ...overrides,
  };
}

test("an independent diagnostic/docs update does not start live_probe", () => {
  const result = classifyPushEvent(push([
    "docs/checkpoints/diagnostic.md",
    "experiments/nationwide-tolls/checks/run-1/result.json",
    "scripts/v2-issue2-github-capture.mjs",
  ]));
  assert.equal(result.shouldRunLive, false);
});

test("a route algorithm change in the current push starts live_probe", () => {
  assert.equal(classifyPushEvent(push(["lib/v3-calculation/route-leg-pricing.ts"])).shouldRunLive, true);
  assert.equal(classifyPushEvent(push(["data/tolls/m12-current.json"])).shouldRunLive, true);
});

test("a test-only update retains PR verification without starting live_probe", () => {
  assert.equal(classifyChangedPaths([
    "lib/v3-calculation/route-leg-pricing.test.ts",
    "scripts/special-territory-live-push-classifier.test.mjs",
  ]).shouldRunLive, false);
});

test("changing this workflow starts PR verify but not the wide live audit", () => {
  assert.equal(classifyPushEvent(push([".github/workflows/special-territory-policy.yml"])).shouldRunLive, false);
});

test("runtime plus test changes still start live_probe", () => {
  assert.equal(classifyPushEvent(push([
    "lib/v3-calculation/route-leg-pricing.ts",
    "lib/v3-calculation/route-leg-pricing.test.ts",
  ])).shouldRunLive, true);
});

test("incomplete push metadata fails open to live_probe", () => {
  assert.equal(classifyPushEvent(push(["docs/WORK_LOG.md"], { size: 2 })).shouldRunLive, true);
  assert.equal(classifyPushEvent(push(["docs/WORK_LOG.md"], { before: "0".repeat(40) })).shouldRunLive, true);
  assert.equal(classifyChangedPaths([]).shouldRunLive, true);
});
