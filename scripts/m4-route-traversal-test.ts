import assert from "node:assert/strict";
import { M4_PLAZA_NODES } from "../lib/toll-engine/m4-plaza-nodes.ts";
import { evaluateM4RouteTraversal, M4_ROUTE_TRAVERSAL_LIMITS } from "../lib/toll-engine/m4-route-traversal.ts";

const plaza = M4_PLAZA_NODES.find((item) => item.km === 1223);
assert.ok(plaza, "PVP 1223 must exist");
const anchor = plaza.anchors[0];

const through = evaluateM4RouteTraversal([
  [anchor.lon - 0.025, anchor.lat],
  [anchor.lon - 0.004, anchor.lat],
  [anchor.lon + 0.004, anchor.lat],
  [anchor.lon + 0.025, anchor.lat],
], plaza);
assert.equal(through.confirmed, true);
assert.ok(through.nearestDistanceKm < 0.01);
assert.ok(through.routeKmBefore >= M4_ROUTE_TRAVERSAL_LIMITS.minRouteFlankKm);
assert.ok(through.routeKmAfter >= M4_ROUTE_TRAVERSAL_LIMITS.minRouteFlankKm);

const parallelFar = evaluateM4RouteTraversal([
  [anchor.lon - 0.025, anchor.lat + 0.006],
  [anchor.lon, anchor.lat + 0.006],
  [anchor.lon + 0.025, anchor.lat + 0.006],
], plaza);
assert.equal(parallelFar.confirmed, false);
assert.equal(parallelFar.reason, "outside_strict_traversal_radius");

const endpointTouch = evaluateM4RouteTraversal([
  [anchor.lon - 0.001, anchor.lat],
  [anchor.lon, anchor.lat],
  [anchor.lon + 0.025, anchor.lat],
], plaza);
assert.equal(endpointTouch.confirmed, false);
assert.equal(endpointTouch.reason, "insufficient_route_flanks");

const uTurn = evaluateM4RouteTraversal([
  [anchor.lon - 0.025, anchor.lat],
  [anchor.lon, anchor.lat],
  [anchor.lon - 0.025, anchor.lat],
], plaza);
assert.equal(uTurn.confirmed, false);
assert.equal(uTurn.reason, "local_u_turn_or_sharp_reversal");

console.log("M4 strict route traversal regression passed", {
  throughDistanceKm: through.nearestDistanceKm,
  maxDistanceKm: M4_ROUTE_TRAVERSAL_LIMITS.maxDistanceKm,
});
