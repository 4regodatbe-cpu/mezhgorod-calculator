import assert from "node:assert/strict";

import currentSnapshot from "../data/tolls/m11/2026-10-01-58-679-category1-a1-current.json" with { type: "json" };
import {
  buildM11CurrentPartialTariffModel,
  m11CurrentPartialTariffModel,
  priceM11CurrentPartialCategory1,
  type M11CurrentA1Snapshot,
} from "../lib/toll-engine/m11-current-tariffs.ts";

const model = m11CurrentPartialTariffModel();

assert.equal(model.systemId, "m11-58-679-avtodor");
assert.equal(model.pointIds.length, 22);
assert.equal(model.pointIds[0], "p58");
assert.equal(model.pointIds[18], "p593");
assert.equal(model.pointIds[21], "p679");
assert.equal(model.sourceDocumentOrder, "№ 274");
assert.equal(model.sourceDocumentDate, "2026-09-03");
assert.equal(model.tariffEffectiveFrom, null);
assert.deepEqual(Object.keys(model.directControlsFromP58).sort(), ["p593", "p679"]);

const exactControls = [
  ["p58", "p593", "monThu", 3600],
  ["p58", "p593", "friSun", 4390],
  ["p58", "p679", "monThu", 4200],
  ["p58", "p679", "friSun", 4940],
] as const;

for (const [fromPointId, toPointId, profile, expectedAmount] of exactControls) {
  const result = priceM11CurrentPartialCategory1(fromPointId, toPointId, profile);
  assert.equal(result.status, "priced", `${fromPointId}->${toPointId}:${profile} must be priced`);
  assert.equal(result.amountRub, expectedAmount);
  assert.equal(result.reason, null);
  assert.equal(result.sourceDocumentOrder, "№ 274");
}

const unknownControls = [
  ["p593", "p58", "monThu", "reverse_direction_not_verified"],
  ["p679", "p58", "friSun", "reverse_direction_not_verified"],
  ["p593", "p679", "monThu", "directed_pair_not_verified"],
  ["p67", "p89", "friSun", "directed_pair_not_verified"],
  ["p58", "p58", "monThu", "same_point_not_verified"],
  ["p58", "p593", "holiday", "unsupported_profile"],
  ["p999", "p593", "monThu", "unknown_point"],
] as const;

for (const [fromPointId, toPointId, profile, expectedReason] of unknownControls) {
  const result = priceM11CurrentPartialCategory1(fromPointId, toPointId, profile);
  assert.equal(result.status, "unknown", `${fromPointId}->${toPointId}:${profile} must stay unknown`);
  assert.equal(result.amountRub, null, `${fromPointId}->${toPointId}:${profile} must not fabricate zero`);
  assert.equal(result.reason, expectedReason);
}

function cloneSnapshot(): M11CurrentA1Snapshot {
  return structuredClone(currentSnapshot) as M11CurrentA1Snapshot;
}

{
  const malformed = cloneSnapshot();
  malformed.verifiedControlsFromP58.p999 = { monThu: 1, friSun: 1 };
  malformed.extraction.verifiedControlCount += 1;
  assert.throws(
    () => buildM11CurrentPartialTariffModel(malformed),
    /M11_CURRENT_CONTROL_UNKNOWN_POINT:p999/,
  );
}

{
  const malformed = cloneSnapshot();
  malformed.verifiedControlsFromP58.p593.monThu = -1;
  assert.throws(
    () => buildM11CurrentPartialTariffModel(malformed),
    /M11_CURRENT_INVALID_AMOUNT:p58>p593:monThu:-1/,
  );
}

{
  const malformed = cloneSnapshot();
  malformed.verifiedControlsFromP58.p593.friSun = 4390.5;
  assert.throws(
    () => buildM11CurrentPartialTariffModel(malformed),
    /M11_CURRENT_INVALID_AMOUNT:p58>p593:friSun:4390.5/,
  );
}

{
  const malformed = cloneSnapshot();
  malformed.points.push({ id: "p58" });
  malformed.extraction.orderedPointCount += 1;
  assert.throws(
    () => buildM11CurrentPartialTariffModel(malformed),
    /M11_CURRENT_DUPLICATE_POINT_ID/,
  );
}

{
  const malformed = cloneSnapshot();
  malformed.extraction.completeMatrix = true;
  assert.throws(
    () => buildM11CurrentPartialTariffModel(malformed),
    /M11_CURRENT_PARTIAL_CORE_REQUIRES_INCOMPLETE_A1/,
  );
}

console.log(
  `M11_CURRENT_PARTIAL_CORE_GREEN points=${model.pointIds.length} directPairs=${Object.keys(model.directControlsFromP58).length} exactLookups=${exactControls.length} unknownLookups=${unknownControls.length}`,
);
