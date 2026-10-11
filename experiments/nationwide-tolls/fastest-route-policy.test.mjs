import assert from "node:assert/strict";
import { test } from "node:test";
import { selectFastestRoute } from "./fastest-route-policy.mjs";

const fastPaid = { id: "fast-paid", seconds: 100, tollStatus: "priced", tollAmountRub: 420 };
const slowerFree = { id: "slower-free", seconds: 130, tollStatus: "free", tollAmountRub: 0 };

test("selects the fastest toll route even when a slower free route exists", () => {
  const result = selectFastestRoute([fastPaid, slowerFree]);
  assert.equal(result.route.id, "fast-paid");
  assert.equal(result.shownRouteCount, 1);
  assert.equal(result.tollStatus, "priced");
  assert.equal(result.tollAmountRub, 420);
});

test("selects the fastest free route when it is actually fastest", () => {
  const result = selectFastestRoute([slowerFree, { ...fastPaid, seconds: 90 }]);
  assert.equal(result.route.id, "fast-paid");
  assert.equal(result.tollStatus, "priced");
});

test("returns free only when the chosen route is verified free", () => {
  const result = selectFastestRoute([slowerFree, { id: "fast-free", seconds: 90, tollStatus: "free", tollAmountRub: 0 }]);
  assert.equal(result.route.id, "fast-free");
  assert.equal(result.tollStatus, "free");
  assert.equal(result.tollAmountRub, 0);
});

test("does not replace fastest unknown toll status with a slower known route", () => {
  const result = selectFastestRoute([
    { id: "fast-unknown", seconds: 90, tollStatus: "unknown", tollAmountRub: 0 },
    slowerFree,
  ]);
  assert.equal(result.route.id, "fast-unknown");
  assert.equal(result.tollStatus, "unknown");
  assert.equal(result.tollAmountRub, null);
});

test("equal duration preserves provider order deterministically", () => {
  const result = selectFastestRoute([
    { id: "provider-a", seconds: 100, tollStatus: "free", tollAmountRub: 0 },
    { id: "provider-b", seconds: 100, tollStatus: "priced", tollAmountRub: 500 },
  ]);
  assert.equal(result.route.id, "provider-a");
});

test("filters malformed candidates and fails when none remain", () => {
  const result = selectFastestRoute([
    { id: "invalid", seconds: 0, tollStatus: "free" },
    fastPaid,
  ]);
  assert.equal(result.route.id, "fast-paid");
  assert.throws(() => selectFastestRoute([]), /ROUTE_UNAVAILABLE/);
  assert.throws(() => selectFastestRoute([{ id: "bad", seconds: -1, tollStatus: "free" }]), /ROUTE_UNAVAILABLE/);
});

test("a chosen priced route with unverified amount keeps amount unknown", () => {
  const result = selectFastestRoute([
    { id: "fast", seconds: 70, tollStatus: "priced", tollAmountRub: null },
  ]);
  assert.equal(result.tollStatus, "priced");
  assert.equal(result.tollAmountRub, null);
});
