import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { calculateProductionM12 } from "../lib/toll-engine/m12-production.ts";

const fixture = JSON.parse(await readFile("data/fixtures/m12-route-projections-2026-09-30.json", "utf8"));
const route = fixture.routes.find((item) => item.id === "kazan->vladimir");
assert.ok(route, "kazan->vladimir fixture missing");
assert.equal(route.expected.status, "unknown", "fixture must remain an unknown control");

const result = calculateProductionM12(
  route.coordinates,
  route.strictM12Span,
  [],
  "2026-09-30T12:00:00+03:00",
);

assert.equal(result.core.status, "unknown", "production adapter must preserve core unknown status");
assert.equal(result.core.amountRub, null, "unknown core must use null amount, never zero");
assert.notEqual(result.core.amountRub, 0, "unknown core must not become 0 RUB");
assert.equal(result.tolls, null, "unknown M12 must not emit TollEstimate");
assert.equal(result.validation, null, "unknown M12 must not claim exact validation");
assert.equal(result.blockedByMixedRoadEvidence, false, "pure M12 unknown fixture should not be blocked as mixed-road evidence");

console.log("Segment 5B2D-4C passed: M12 unknown remains null/unpriced, never 0 RUB");
