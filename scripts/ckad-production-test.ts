import assert from "node:assert/strict";
import { calculateProductionCkadM4M11 } from "../lib/toll-engine/ckad-production.ts";
import type { M11RoadEvidence } from "../lib/toll-engine/m11-road-evidence.ts";

type C = [number, number];
const arc: C[] = [
  [37.75, 55.32], [37.80, 55.35], [38.05, 55.39], [38.34, 55.53], [38.35, 55.65],
  [38.46, 55.72], [38.50, 55.90], [37.92, 56.13], [37.55, 56.18], [37.42, 56.20], [37.30, 56.24],
];
const evidence: M11RoadEvidence = {
  provider: "valhalla",
  malformedStrictCount: 0,
  candidateClues: [],
  strictBlocks: [{
    provider: "valhalla", legIndex: 0, sourceStartIndex: 1, sourceEndIndex: 2,
    beginKm: 170, endKm: 190, lengthKm: 20,
    beginCoordinate: [37.42, 56.20], endCoordinate: [37.30, 56.24], labels: ["М-11"],
  }],
};

const forward = calculateProductionCkadM4M11(arc, evidence);
assert.equal(forward.exact, true);
assert.equal(forward.tolls?.amount, 2517);
assert.equal(forward.tolls?.weekdayAmount, 2517);
assert.equal(forward.tolls?.weekendAmount, 2517);

const reverseRoute = [...arc].reverse();
const reverseEvidence: M11RoadEvidence = {
  ...evidence,
  strictBlocks: evidence.strictBlocks.map((block) => ({ ...block, beginCoordinate: block.endCoordinate, endCoordinate: block.beginCoordinate })),
};
const reverse = calculateProductionCkadM4M11(reverseRoute, reverseEvidence);
assert.equal(reverse.exact, true);
assert.equal(reverse.tolls?.amount, 2517);

const incomplete = calculateProductionCkadM4M11([[37.75,55.32],[38.05,55.39],[37.55,56.18],[37.42,56.20]], evidence);
assert.equal(incomplete.exact, false);
assert.equal(incomplete.tolls, null);

const noM11 = calculateProductionCkadM4M11(arc, null);
assert.equal(noM11.exact, false);
assert.equal(noM11.tolls, null);
assert.equal(noM11.candidate, true);

console.log("CKAD production regression: GREEN; east-arc no-transponder total=2517 RUB");
