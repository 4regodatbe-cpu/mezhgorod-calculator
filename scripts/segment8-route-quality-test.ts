import assert from "node:assert/strict";
import { selectLiveRoute, percentSpread, type GoldenRouteReference } from "../lib/route-quality.ts";

const route = (km: number, min: number) => ({ meters: km * 1000, seconds: min * 60 });
const golden: GoldenRouteReference = { meters: 1000_000, seconds: 600 * 60, distanceTolerancePercent: 3, source: "fixture", verifiedAt: "2026-10-01" };

assert.equal(percentSpread(1_000_000, 1_020_000), 2);

const agree = selectLiveRoute({ name: "A", route: route(1005, 600) }, { name: "B", route: route(1015, 630) }, golden);
assert.equal(agree.provider, "A");
assert.equal(agree.route.meters, 1_005_000, "golden reference must not replace live route");
assert.equal(agree.quality.status, "verified");
assert.equal(agree.quality.distanceSpreadPercent, 1);
assert.equal(agree.quality.timeSpreadPercent, 4.9);

const disagree = selectLiveRoute({ name: "A", route: route(1120, 600) }, { name: "B", route: route(1010, 650) }, golden);
assert.equal(disagree.provider, "B", "when live providers materially disagree, golden QA may choose the closer live provider");
assert.equal(disagree.route.meters, 1_010_000);
assert.notEqual(disagree.route.meters, golden.meters);
assert.equal(disagree.quality.status, "verified");

const badTogether = selectLiveRoute({ name: "A", route: route(1100, 600) }, { name: "B", route: route(1110, 620) }, golden);
assert.equal(badTogether.provider, "A");
assert.equal(badTogether.quality.status, "warning", "provider agreement must not override a golden-band failure");

const singleGood = selectLiveRoute({ name: "A", route: route(1020, 600) }, undefined, golden);
assert.equal(singleGood.quality.status, "verified");
assert.equal(singleGood.route.meters, 1_020_000);

const singleNoGolden = selectLiveRoute(undefined, { name: "B", route: route(900, 500) });
assert.equal(singleNoGolden.quality.status, "single");
assert.equal(singleNoGolden.provider, "B");

assert.throws(() => selectLiveRoute(undefined, undefined), /ROUTE_UNAVAILABLE/);
console.log("Segment 8 route-quality corpus: GREEN");
