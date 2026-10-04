import assert from "node:assert/strict";
import fs from "node:fs";
import { composeRouteTolls, detectedFamiliesFromLegacySegments, type RouteTollComponent } from "../lib/toll-engine/route-toll-composition.ts";

const toll = (amount: number) => ({
  amount,
  weekdayAmount: amount,
  weekendAmount: amount,
  period: "понедельник–четверг",
  segments: [String(amount)],
  confidence: "matched" as const,
});

const complete: RouteTollComponent[] = [
  { id: "m4_a289", detected: true, tolls: toll(3810) },
  { id: "m11", detected: true, tolls: toll(4940) },
  { id: "ckad", detected: false, tolls: null },
];
const composed = composeRouteTolls(complete);
assert.equal(composed.status, "priced");
assert.equal(composed.tolls?.amount, 8750);

const missingConnector = composeRouteTolls([
  ...complete.slice(0, 2),
  { id: "ckad", detected: true, tolls: null, reason: "not priced" },
]);
assert.equal(missingConnector.status, "unknown");
assert.equal(missingConnector.tolls, null, "partial 8750 must never be returned as whole-route total");
assert.deepEqual(missingConnector.missing, ["ckad"]);

const partialM4 = composeRouteTolls([
  { id: "m4_a289", detected: true, tolls: { ...toll(3220), confidence: "partial" } },
  { id: "m11", detected: true, tolls: toll(4940) },
]);
assert.equal(partialM4.status, "unknown");
assert.equal(partialM4.tolls, null, "partial M-4 must never be added to an exact route total");
assert.deepEqual(partialM4.missing, ["m4_a289"]);
assert.deepEqual(partialM4.priced, ["m11"]);

const missingM11 = composeRouteTolls([
  { id: "m4_a289", detected: true, tolls: toll(3810) },
  { id: "m11", detected: true, tolls: null },
]);
assert.equal(missingM11.status, "unknown");
assert.equal(missingM11.tolls, null);

assert.deepEqual(
  [...detectedFamiliesFromLegacySegments(["М-4: участок", "ЦКАД: участок", "М-11: Нева"])].sort(),
  ["ckad", "m11", "m4_a289"].sort(),
);
assert.ok(detectedFamiliesFromLegacySegments(["М-4 + М-11: составной маршрут"]).has("m11"));
assert.ok(detectedFamiliesFromLegacySegments(["М-4 + М-11: составной маршрут"]).has("m4_a289"));

const apiRoute = fs.readFileSync("lib/v2-calculation/route-leg-pricing.ts", "utf8");
assert.ok(apiRoute.includes('calculateProductionCkadM4M11(routeGeometry, valhallaEvidence?.m11RoadEvidence)'), "CKAD production engine must be wired into live route composition");
assert.ok(apiRoute.includes('tolls: productionCkad.tolls'), "CKAD exact tolls must feed the route-level component");
assert.ok(apiRoute.includes('legacyFamilies.has("ckad") || productionCkad.candidate'), "CKAD detection must include strict production evidence");

console.log("Systemic toll composition test: GREEN");
