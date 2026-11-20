import test from "node:test";
import assert from "node:assert/strict";
import { matrixM11TailComponent } from "../lib/toll-engine/m11-tail-component.ts";

test("the selected M-11 679–684 tail fare is direction-independent at 94 RUB", () => {
  const result = matrixM11TailComponent(true, "2026-10-13T09:00:00+03:00")!;
  assert.equal(result.tolls?.amount, 94);
  assert.equal(result.tolls?.weekdayAmount, 94);
  assert.equal(result.tolls?.weekendAmount, 94);
  assert.equal(result.tolls?.confidence, "matched");
  assert.equal(result.reason, "user_approved_m11_tail_94_rub_for_both_directions");
});

test("the 94 RUB tail fare does not apply before the order effective date", () => {
  const result = matrixM11TailComponent(true, "2026-09-03T23:59:59+03:00")!;
  assert.equal(result.tolls, null);
  assert.equal(result.reason, "m11_tail_94_fare_not_effective_at_departure");
});

test("an undetected tail does not create a charge", () => {
  assert.equal(matrixM11TailComponent(false, "2026-10-13T09:00:00+03:00"), null);
});
