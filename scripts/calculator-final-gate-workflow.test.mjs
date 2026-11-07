import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { summarizeRoute } from "./v3-live-route-contract.mjs";

const workflow = readFileSync(new URL("../.github/workflows/calculator-final-gate.yml", import.meta.url), "utf8");
const v3Gate = readFileSync(new URL("./v3-production-readiness.mjs", import.meta.url), "utf8");
const routeAudit = readFileSync(new URL("./v3-live-route-audit.mjs", import.meta.url), "utf8");
const routeContract = readFileSync(new URL("./v3-live-route-contract.mjs", import.meta.url), "utf8");
const apiSmoke = readFileSync(new URL("./api-contract-smoke.mjs", import.meta.url), "utf8");

test("final gate runs on feature-branch push and current PR base without write permissions", () => {
  assert.match(workflow, /pull_request:[\s\S]*branches:\s*\[main, audit\/v3-matrix-provenance-2026-10-14\]/);
  assert.match(workflow, /push:[\s\S]*branches:\s*\[fix\/v3-missing-route-prices-2026-10-15\]/);
  assert.doesNotMatch(workflow, /workflow_dispatch:/, "the prepared invocation is push-triggered, not a manual action absent from main");
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  assert.doesNotMatch(workflow, /contents:\s*write/);
});

test("workflow calls only scripts available in the checkout and keeps V2 checks separate", () => {
  for (const path of [
    "scripts/segment8-golden-corpus-test.ts",
    "scripts/v3-verified-route-integrity.mjs",
    "scripts/v3-freshness-contract.mjs",
  ]) {
    assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), false, `${path} must remain removed rather than be stubbed`);
    assert.doesNotMatch(workflow, new RegExp(path.replaceAll(".", "\\.")));
  }
  assert.match(workflow, /Legacy V2 safety and shared tariff truth gates/);
  assert.match(workflow, /Current V3 production-readiness truth gates/);
  assert.match(workflow, /Current V3 live route audit/);
  assert.match(workflow, /id: v3_live\n\s*continue-on-error: true/);
  assert.match(workflow, /id: tariff_freshness\n\s*continue-on-error: true/);
  assert.match(workflow, /name: Final aggregate gate[\s\S]*LIVE_OUTCOME[\s\S]*FRESHNESS_OUTCOME/);
  assert.doesNotMatch(workflow, /scripts\/(?:segment3-free-truth|live-user-route-audit|route-monitor)\.mjs/);
  assert.match(workflow, /pnpm test:route-benchmark/);
  assert.match(workflow, /scripts\/v3-pipeline-integrity\.test\.ts/);
  assert.match(workflow, /scripts\/v3-final-price-integrity\.test\.ts/);
  assert.match(workflow, /scripts\/v3-unpriced-coverage-audit\.test\.ts/);
});

test("live route audit is V3-only, bounded, one-pass, and omits provider geometry", () => {
  assert.match(routeAudit, /\/api\/v3\/calculate/);
  assert.match(routeAudit, /requestCount: results\.length/);
  assert.match(routeAudit, /const cases = \[/);
  assert.equal((routeAudit.match(/\["(?:yalta-|donetsk-|moscow-|tver-|golubitskaya-)/g) || []).length, 6);
  assert.match(routeAudit, /\["yalta-krasnodar", "Ялта", \[34\.166301, 44\.495205\]/, "live audit coordinates are [longitude, latitude]");
  assert.doesNotMatch(routeAudit, /\/api\/v2\/calculate/);
  assert.doesNotMatch(routeAudit, /retry|attempt\s*<|setTimeout\(.*fetch/);
  assert.doesNotMatch(routeAudit, /[,{]\s*(?:coordinates|geometry|providerResponse|rawResponse)\s*:/);
  assert.match(routeContract, /safeUnknown/);
  assert.match(routeAudit, /version\.matchesExpected/);
});

test("API smoke validates V3 contracts without making successful route-provider requests", () => {
  assert.match(apiSmoke, /V3 rejects an invalid calculation mode/);
  assert.match(apiSmoke, /V3 rejects invalid coordinates before routing providers are called/);
  assert.match(apiSmoke, /V3 rejects malformed JSON/);
  assert.match(apiSmoke, /legacy V2/);
  assert.doesNotMatch(apiSmoke, /expected\s*\}\s*,\s*200\)/);
});

test("V3 readiness requires root V3, retains V2, and fails closed for toll uncertainty", () => {
  assert.match(v3Gate, /redirect\("\/v3"\)/);
  assert.match(v3Gate, /legacy V2 route must remain present/);
  assert.match(v3Gate, /pricingStatus: "priced" \| "free" \| "unknown"/);
  assert.match(v3Gate, /amount: null/);
  assert.match(v3Gate, /unknown V3 toll pricing must preserve null amounts/);
});

test("live API route summaries distinguish a strict price, an estimate, and an unknown price", () => {
  const base = { meters: 1000, seconds: 120, quality: { providers: ["OSRM"], status: "single" }, pricingByVehicle: { standard: {} } };
  const priced = summarizeRoute({ fast: { ...base, tolls: { pricingStatus: "priced", amount: 240, weekdayAmount: 220, weekendAmount: 260, segments: ["m4"] } } });
  assert.equal(priced.ok, true);
  assert.equal(priced.tollPricingStatus, "priced");
  assert.equal(priced.tollAmount, 240);

  const unknown = summarizeRoute({ fast: { ...base, tolls: { pricingStatus: "unknown", amount: null, weekdayAmount: null, weekendAmount: null, segments: ["m12"] } } });
  assert.equal(unknown.ok, true);
  assert.equal(unknown.tollAmount, null);
  assert.equal(unknown.safeUnknown, true);

  const falseZero = summarizeRoute({ fast: { ...base, tolls: { pricingStatus: "unknown", amount: 0, weekdayAmount: null, weekendAmount: null } } });
  assert.equal(falseZero.ok, false);
  assert.equal(falseZero.safeUnknown, false);

  const estimate = summarizeRoute({ fast: { ...base, tollEstimate: { status: "estimated", totalRub: 500, knownPartRub: 500, confirmedPartRub: null } } });
  assert.equal(estimate.ok, true);
  assert.equal(estimate.tollPricingStatus, "estimated");
  assert.equal(estimate.tollAmount, 500);

  const unknownEstimate = summarizeRoute({ fast: { ...base, tollEstimate: { status: "unknown", totalRub: null, knownPartRub: null, confirmedPartRub: null } } });
  assert.equal(unknownEstimate.ok, true);
  assert.equal(unknownEstimate.tollAmount, null);
  assert.equal(summarizeRoute({ fast: { ...base, tolls: { pricingStatus: "unknown", amount: null, weekdayAmount: null, weekendAmount: null }, quality: { providers: [] } } }).ok, false);
});
