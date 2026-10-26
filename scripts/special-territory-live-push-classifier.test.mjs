import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyChangedPaths,
  classifyPullRequestDelta,
  formatGitHubOutput,
  findPreviousCompletedRun,
  hasReliablePreviousChecks,
} from "./classify-special-territory-live-push.mjs";

const previousHead = "1".repeat(40);
const currentHead = "2".repeat(40);

test("GitHub output contains only valid key-value commands", () => {
  assert.equal(formatGitHubOutput({ shouldRunLive: false, reason: "head-already-checked" }),
    "should_run_live=false\nreason=head-already-checked\n");
});

function comparison(paths, overrides = {}) {
  return {
    status: "ahead",
    files: paths.map((filename) => ({ filename, status: "modified" })),
    ...overrides,
  };
}

test("an independent diagnostic/docs update does not start live_probe", () => {
  const result = classifyPullRequestDelta(previousHead, currentHead, comparison([
    "docs/checkpoints/diagnostic.md",
    "experiments/nationwide-tolls/checks/run-1/result.json",
    "scripts/v2-issue2-github-capture.mjs",
  ]));
  assert.equal(result.shouldRunLive, false);
});

test("a route algorithm change in the current PR update starts live_probe", () => {
  assert.equal(classifyPullRequestDelta(previousHead, currentHead, comparison([
    "lib/v3-calculation/route-leg-pricing.ts",
  ])).shouldRunLive, true);
  assert.equal(classifyPullRequestDelta(previousHead, currentHead, comparison([
    "data/tolls/m12-current.json",
  ])).shouldRunLive, true);
});

test("a test-only update retains PR verification without starting live_probe", () => {
  assert.equal(classifyChangedPaths([
    "lib/v3-calculation/route-leg-pricing.test.ts",
    "scripts/special-territory-live-push-classifier.test.mjs",
  ]).shouldRunLive, false);
});

test("changing the workflow itself starts PR verify but not live_probe", () => {
  assert.equal(classifyPullRequestDelta(previousHead, currentHead, comparison([
    ".github/workflows/special-territory-policy.yml",
  ])).shouldRunLive, false);
});

test("a code change accompanied by tests still starts live_probe", () => {
  assert.equal(classifyPullRequestDelta(previousHead, currentHead, comparison([
    "lib/v3-calculation/route-leg-pricing.ts",
    "lib/v3-calculation/route-leg-pricing.test.ts",
  ])).shouldRunLive, true);
});

test("a repeated event for an already checked head skips duplicate live jobs", () => {
  assert.equal(classifyPullRequestDelta(previousHead, previousHead, null).shouldRunLive, false);
  assert.equal(classifyPullRequestDelta(previousHead, currentHead, { status: "identical" }).shouldRunLive, false);
});

test("an incomplete comparison fails open to live_probe", () => {
  assert.equal(classifyPullRequestDelta(previousHead, currentHead, null).shouldRunLive, true);
  assert.equal(classifyPullRequestDelta(null, currentHead, comparison(["docs/WORK_LOG.md"])).shouldRunLive, true);
  assert.equal(classifyPullRequestDelta(previousHead, currentHead, comparison([], { status: "diverged" })).shouldRunLive, true);
  assert.equal(classifyPullRequestDelta(previousHead, currentHead, comparison([], { files: Array(300).fill({ filename: "docs/unknown" }) })).shouldRunLive, true);
  assert.equal(classifyPullRequestDelta("invalid", currentHead, comparison([])).shouldRunLive, true);
});

test("the prior baseline must be a completed run associated with this PR", () => {
  const good = {
    id: 10, status: "completed", conclusion: "success", head_sha: "9".repeat(40),
    created_at: "2026-10-26T10:00:00Z", pull_requests: [{ number: 14, head: { sha: previousHead } }],
  };
  const otherPr = { ...good, id: 11, pull_requests: [{ number: 13, head: { sha: currentHead } }] };
  const current = { ...good, id: 12, pull_requests: [{ number: 14, head: { sha: currentHead } }] };
  const unfinished = { ...good, id: 13, status: "in_progress" };
  assert.equal(findPreviousCompletedRun([otherPr, unfinished, current], 14, 12), null);
  assert.equal(findPreviousCompletedRun([good], 14, 99)?.checked_head_sha, previousHead);
  assert.equal(findPreviousCompletedRun([{ ...good, pull_requests: [] }], 14, 99), null);
});

test("a prior baseline requires completed classification/live checks or legacy runtime probes", () => {
  assert.equal(hasReliablePreviousChecks([
    { name: "verify", status: "completed", conclusion: "success" },
    { name: "classify_live_scope", status: "completed", conclusion: "success" },
    { name: "live_probe", status: "completed", conclusion: "skipped" },
  ]), true);
  assert.equal(hasReliablePreviousChecks([
    { name: "verify", status: "completed", conclusion: "success" },
    { name: "classify_live_scope", status: "completed", conclusion: "failure" },
    { name: "live_probe", status: "completed", conclusion: "success" },
  ]), true);
  assert.equal(hasReliablePreviousChecks([
    { name: "verify", status: "completed", conclusion: "success" },
    { name: "classify_live_scope", status: "completed", conclusion: "failure" },
    { name: "live_probe", status: "skipped", conclusion: "skipped" },
  ]), false);
  assert.equal(hasReliablePreviousChecks([
    { name: "verify", status: "completed", conclusion: "success" },
    { name: "live_probe", status: "completed", steps: [{ name: "Probe live provider geometry and per-leg times", status: "completed", conclusion: "success" }] },
    { name: "calculation_timing", status: "completed", conclusion: "success" },
  ]), true);
  assert.equal(hasReliablePreviousChecks([
    { name: "verify", status: "completed", conclusion: "failure" },
    { name: "live_probe", status: "completed", steps: [] },
  ]), false);
  assert.equal(hasReliablePreviousChecks([
    { name: "verify", status: "completed", conclusion: "success" },
    { name: "live_probe", status: "completed", steps: [] },
  ]), false);
});
