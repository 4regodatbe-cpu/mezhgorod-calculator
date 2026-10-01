import assert from "node:assert/strict";
import { selectM11CurrentCategory1Tariff } from "../lib/toll-engine/m11-current-selection.ts";
import type { M11BoundaryResolution } from "../lib/toll-engine/m11-boundary-resolver.ts";

function resolved(from: string, to: string): M11BoundaryResolution {
  return { status: "resolved", entryPointId: from, exitPointId: to, crossings: [], confidence: "independently_verified_spatial", unresolvedReasons: [] };
}
const unresolved: M11BoundaryResolution = { status: "unresolved", entryPointId: null, exitPointId: null, crossings: [], confidence: "insufficient", unresolvedReasons: ["entry_not_proven_at_strict_m11_start"] };

assert.deepEqual(
  [selectM11CurrentCategory1Tariff(resolved("p58","p593"), "monThu").status, selectM11CurrentCategory1Tariff(resolved("p58","p593"), "monThu").amountRub],
  ["priced", 3600],
);
assert.equal(selectM11CurrentCategory1Tariff(resolved("p58","p593"), "friSun").amountRub, 4390);
assert.equal(selectM11CurrentCategory1Tariff(resolved("p58","p679"), "monThu").amountRub, 4200);
assert.equal(selectM11CurrentCategory1Tariff(resolved("p58","p679"), "friSun").amountRub, 4940);

for (const [from,to,profile,reason] of [
  ["p593","p58","monThu","reverse_direction_not_verified"],
  ["p679","p58","friSun","reverse_direction_not_verified"],
  ["p593","p679","monThu","directed_pair_not_verified"],
  ["p58","p58","monThu","same_point_not_verified"],
  ["p58","p593","holiday","unsupported_profile"],
] as const) {
  const result = selectM11CurrentCategory1Tariff(resolved(from,to), profile);
  assert.equal(result.status, "unknown");
  assert.equal(result.amountRub, null);
  assert.equal(result.reason, reason);
}

const boundaryUnknown = selectM11CurrentCategory1Tariff(unresolved, "monThu");
assert.equal(boundaryUnknown.status, "unknown");
assert.equal(boundaryUnknown.amountRub, null);
assert.equal(boundaryUnknown.reason, "boundary_unresolved");
assert.deepEqual("boundaryReasons" in boundaryUnknown ? boundaryUnknown.boundaryReasons : [], ["entry_not_proven_at_strict_m11_start"]);

console.log("M11_CURRENT_SELECTION_GREEN pricedControls=4 unknownControls=6 falseZero=0");
