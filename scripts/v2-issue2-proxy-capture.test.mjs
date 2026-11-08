import assert from "node:assert/strict";
import test from "node:test";
import { buildCaseRequest, DEFAULT_DEPARTURE, preflight } from "./v2-issue2-proxy-capture.mjs";

test("B10 proxy requests are restricted to the two approved V2 controls", () => {
  const yeisk = buildCaseRequest("yeisk-to-moscow");
  const maykop = buildCaseRequest("maykop-to-moscow");
  assert.deepEqual(yeisk, {
    mode: "standard",
    from: { label: "Ейск", position: { lat: 46.711524, lng: 38.276451 } },
    to: { label: "Москва", position: { lat: 55.755819, lng: 37.617644 } },
    departureAt: DEFAULT_DEPARTURE,
  });
  assert.equal(maykop.from.position.lat, 44.609826);
  assert.throws(() => buildCaseRequest("moscow-to-yeisk"), /CASE_NOT_ALLOWED/);
  assert.throws(() => buildCaseRequest("yeisk-to-moscow", "not-a-date"), /INVALID_DEPARTURE/);
});

test("B10 preflight reaches the V2 validation guard with no network", async () => {
  const result = await preflight();
  assert.equal(result.status, "PASS");
  assert.equal(result.invalidStatus, 400);
  assert.equal(result.fetchCalls, 0);
  assert.deepEqual(result.caseIds, ["yeisk-to-moscow", "maykop-to-moscow"]);
});
