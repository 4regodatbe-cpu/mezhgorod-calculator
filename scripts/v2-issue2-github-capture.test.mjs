import test from "node:test";
import assert from "node:assert/strict";
import { selectCaptureCaseIds } from "./select-v2-issue2-cases.mjs";

const CASE_IDS = ["yeisk-to-moscow", "maykop-to-moscow"];

test("capture selection defaults to both prepared cases", () => {
  assert.deepEqual(selectCaptureCaseIds(undefined, CASE_IDS), ["yeisk-to-moscow", "maykop-to-moscow"]);
});

test("Maykop-only selection is exact and does not include Eisk", () => {
  assert.deepEqual(selectCaptureCaseIds("maykop-to-moscow", CASE_IDS), ["maykop-to-moscow"]);
  assert.deepEqual(selectCaptureCaseIds(" maykop-to-moscow ", CASE_IDS), ["maykop-to-moscow"]);
});

test("a selected subset may be supplied as a unique comma-separated list", () => {
  assert.deepEqual(selectCaptureCaseIds("yeisk-to-moscow, maykop-to-moscow", CASE_IDS), CASE_IDS);
});

test("empty, duplicate, or unknown case selections fail before network work", () => {
  assert.throws(() => selectCaptureCaseIds("", CASE_IDS), /B10_CAPTURE_CASES_EMPTY/);
  assert.throws(() => selectCaptureCaseIds("maykop-to-moscow,maykop-to-moscow", CASE_IDS), /B10_CAPTURE_CASES_DUPLICATE/);
  assert.throws(() => selectCaptureCaseIds("maykop-to-moscow,unknown", CASE_IDS), /B10_CAPTURE_CASES_NOT_ALLOWED/);
});
