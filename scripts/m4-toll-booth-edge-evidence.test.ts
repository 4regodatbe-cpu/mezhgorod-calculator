import test from "node:test";
import assert from "node:assert/strict";
import { classifyM4TraversalWithoutTollEdge, matchM4TollBoothEdges } from "../lib/toll-engine/m4-toll-booth-evidence.ts";
import { priceM4TollEvents } from "../lib/toll-engine/m4-engine.ts";

const expected = new Set(["pvp-node"]);
const boothEdge = (toll?: boolean) => ({ end_node: { type: "toll_booth", node_id: "pvp-node" }, toll });

test("a free toll-booth bypass is rejected and contributes no charge", () => {
  const match = matchM4TollBoothEdges(expected, [boothEdge(false)]);
  assert.equal(match.status, "rejected");
  assert.deepEqual(match.events, []);
  assert.deepEqual(match.matchedNodeIds, ["pvp-node"]);
  const freeOnly = priceM4TollEvents([{ osmNodeId: "pvp-node", wayId: null, roadNames: [], edgeIndex: 0, edgeToll: false }]);
  assert.equal(freeOnly.status, "none");
  assert.equal(freeOnly.amount, null);
});

test("a free booth edge at a second plaza cannot inflate an otherwise paid route", () => {
  const amount = priceM4TollEvents([
    { osmNodeId: "285903913", wayId: null, roadNames: [], edgeIndex: 0, edgeToll: true },
    { osmNodeId: "4341143825", wayId: null, roadNames: [], edgeIndex: 1, edgeToll: false },
  ], "2026-10-08T10:00:00+03:00");
  assert.equal(amount.status, "priced");
  assert.equal(amount.amount, 400, "only the traversed paid PVP 71 is charged, not free PVP 133");
  assert.deepEqual(amount.pricedPlazas.map((item) => item.km), [71]);
});

test("a toll-tagged edge at the expected booth remains chargeable", () => {
  const match = matchM4TollBoothEdges(expected, [boothEdge(true)]);
  assert.equal(match.status, "confirmed");
  assert.equal(match.events.length, 1);
  assert.equal(match.events[0]?.edgeToll, true);
});

test("missing edge toll evidence remains unknown instead of inventing a charge", () => {
  const match = matchM4TollBoothEdges(expected, [boothEdge()]);
  assert.equal(match.status, "unknown");
  assert.deepEqual(match.events, []);
});

test("geometric proximity alone cannot prove a paid toll crossing", () => {
  assert.equal(classifyM4TraversalWithoutTollEdge("strict_anchor_crossing_with_bidirectional_route_flanks"), "unknown");
  assert.equal(classifyM4TraversalWithoutTollEdge("outside_strict_traversal_radius"), "rejected");
});
