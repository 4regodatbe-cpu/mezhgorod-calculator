import assert from "node:assert/strict";
import { selectLiveRouteCandidates } from "../lib/route-quality.ts";

const majority = selectLiveRouteCandidates([
  { name: "Valhalla", route: { meters: 2_135_000, seconds: 115_000 } },
  { name: "OSRM", route: { meters: 2_269_600, seconds: 116_340 } },
  { name: "BRouter", route: { meters: 2_145_000, seconds: 117_000 } },
]);
assert.equal(majority.provider, "Valhalla");
assert.equal(majority.quality.status, "verified");
assert.deepEqual(majority.quality.providers, ["Valhalla", "OSRM", "BRouter"]);
assert.match(majority.quality.message, /большинством live-сервисов/);

const onlyOne = selectLiveRouteCandidates([
  { name: "BRouter", route: { meters: 2_140_000, seconds: 117_500 } },
]);
assert.equal(onlyOne.quality.status, "single");

// A stored/golden control is QA only: it must not overrule two mutually
// agreeing live providers. It may downgrade confidence when their majority is
// outside the control band.
const golden = selectLiveRouteCandidates([
  { name: "Valhalla", route: { meters: 2_300_000, seconds: 120_000 } },
  { name: "OSRM", route: { meters: 2_260_000, seconds: 118_000 } },
  { name: "BRouter", route: { meters: 2_135_000, seconds: 117_000 } },
], { meters: 2_135_000, seconds: null, distanceTolerancePercent: 3, source: "real-user QA", verifiedAt: "2026-10-01" });
assert.equal(golden.provider, "OSRM");
assert.equal(golden.quality.status, "warning");
assert.match(golden.quality.message, /вне контрольного диапазона/);

console.log("Route-quality majority regression: GREEN");
