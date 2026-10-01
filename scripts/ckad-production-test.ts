import assert from "node:assert/strict";
import { resolveCkadEastArcEvidence, type CkadM11Evidence } from "../lib/toll-engine/ckad-evidence.ts";
import { priceOtherRoadVerifiedSections } from "../lib/toll-engine/other-road-current-tariffs.ts";

type C = [number, number];
const arc: C[] = [
  [37.75, 55.32], [37.80, 55.35], [38.05, 55.39], [38.34, 55.53], [38.35, 55.65],
  [38.46, 55.72], [38.50, 55.90], [37.92, 56.13], [37.55, 56.18], [37.42, 56.20], [37.30, 56.24],
];
const evidence: CkadM11Evidence = {
  malformedStrictCount: 0,
  strictBlocks: [{ beginCoordinate: [37.42, 56.20], endCoordinate: [37.30, 56.24] }],
};

const forward = resolveCkadEastArcEvidence(arc, evidence);
assert.equal(forward.status, "verified");
if (forward.status === "verified") assert.equal(forward.direction, "m4_to_m11");

const reverseRoute = [...arc].reverse();
const reverseEvidence: CkadM11Evidence = {
  malformedStrictCount: 0,
  strictBlocks: [{ beginCoordinate: [37.30, 56.24], endCoordinate: [37.42, 56.20] }],
};
const reverse = resolveCkadEastArcEvidence(reverseRoute, reverseEvidence);
assert.equal(reverse.status, "verified");
if (reverse.status === "verified") assert.equal(reverse.direction, "m11_to_m4");

const incomplete = resolveCkadEastArcEvidence([[37.75,55.32],[38.05,55.39],[37.55,56.18],[37.42,56.20]], evidence);
assert.equal(incomplete.status, "unresolved");
const noM11 = resolveCkadEastArcEvidence(arc, null);
assert.equal(noM11.status, "unresolved");
if (noM11.status === "unresolved") assert.equal(noM11.candidate, true);

const ids = [
  "ckad-dom-m4", "ckad-m5-dom", "ckad-egor-m5", "ckad-nosov-egor", "ckad-m12-nosov",
  "ckad-m7-m12", "ckad-m8-m7", "ckad-a104-m8", "ckad-a107-a104", "ckad-m11-a107",
] as const;
const priced = priceOtherRoadVerifiedSections({ status: "verified", roadId: "ckad", sectionIds: ids }, "noTransponder", "allDays");
assert.equal(priced.status, "priced");
if (priced.status === "priced") assert.equal(priced.amountRub, 2517);

console.log("CKAD production regression: GREEN; east-arc no-transponder total=2517 RUB");
