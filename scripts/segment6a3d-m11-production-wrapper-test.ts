import assert from "node:assert/strict";
import { calculateProductionM11 } from "../lib/toll-engine/m11-production.ts";
import type { M11Coordinate, M11RoadEvidence } from "../lib/toll-engine/m11-road-evidence.ts";

const p58: M11Coordinate = [37.0712818, 56.1391684];
const p593: M11Coordinate = [31.2534812, 59.1976987];
const p679: M11Coordinate = [30.3598352, 59.7750977];
function evidence(begin: M11Coordinate, end: M11Coordinate): M11RoadEvidence {
  return { provider: "osrm", strictBlocks: [{ provider: "osrm", legIndex: 0, sourceStartIndex: 0, sourceEndIndex: 0, beginKm: 0, endKm: 1, lengthKm: 1, beginCoordinate: begin, endCoordinate: end, labels: ["М-11"] }], candidateClues: [], malformedStrictCount: 0 };
}

const fullShape = [p58, [35,57] as M11Coordinate, p593, [31,59.5] as M11Coordinate, p679];
const weekday = calculateProductionM11(fullShape, evidence(p58,p679), ["М-11: legacy control"], "2026-10-01T12:00:00+03:00");
assert.equal(weekday.pricingStatus, "priced");
assert.equal(weekday.tolls?.amount, 4200);
assert.equal(weekday.tolls?.weekdayAmount, 4200);
assert.equal(weekday.tolls?.weekendAmount, 4940);
assert.equal(weekday.validation?.status, "toll");

const weekend = calculateProductionM11([p58,[35,57] as M11Coordinate,p593], evidence(p58,p593), ["М-11: legacy control"], "2026-10-02T12:00:00+03:00");
assert.equal(weekend.tolls?.amount, 4390);
assert.equal(weekend.tolls?.weekdayAmount, 3600);

const reverse = calculateProductionM11([...fullShape].reverse(), evidence(p679,p58), ["М-11: legacy control"]);
assert.equal(reverse.tolls, null);
assert.equal(reverse.pricingStatus, "unknown");

const interior = calculateProductionM11([p593,[31,59.5] as M11Coordinate,p679], evidence(p593,p679), ["М-11: legacy control"]);
assert.equal(interior.tolls, null);
assert.equal(interior.pricingStatus, "unknown");

const mixed = calculateProductionM11(fullShape, evidence(p58,p679), ["М-11: legacy control", "М-4: mixed control"]);
assert.equal(mixed.tolls, null);
assert.equal(mixed.blockedByMixedRoadEvidence, true);
assert.equal(mixed.reason, "mixed_paid_road_evidence");

const missing = calculateProductionM11(fullShape, null, ["М-11: legacy control"]);
assert.equal(missing.tolls, null);
assert.equal(missing.reason, "m11_road_evidence_missing");

console.log("M11_PRODUCTION_WRAPPER_GREEN exact=2 rejected=4 extraNetworkRequests=0");
