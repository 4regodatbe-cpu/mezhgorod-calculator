import assert from "node:assert/strict";
import { test } from "node:test";
import { roadBoundariesFromTrace, type RoadTraceEdge } from "@/lib/toll-engine/road-trace-boundaries";
import { resolveSelectedM4Endpoints } from "@/lib/toll-engine/m4-production";
import { matrixM4Component } from "@/experiments/nationwide-tolls/engine/m4-route-adapter.mjs";
import type { Coordinate } from "@/lib/tolls";
import type { TollValidation } from "@/lib/toll-validator";

// Synthetic graph tests stay far from the real M4 booth inventory so the
// endpoint resolver must not make an incidental live plaza request.
const route: Coordinate[] = [[10, 10], [10, 11]];
const edge = (names: string[], way: number, node: number, begin: number, end: number): RoadTraceEdge =>
  ({ names, way_id: way, end_node: { node_id: node }, begin_shape_index: begin, end_shape_index: end });
const source = () => [edge(["А-280"], 10, 100, 0, 1), edge(["М-4"], 20, 200, 1, 2), edge(["Р-260"], 30, 300, 2, 3)];

test("selected graph nodes and directed way pairs identify transitions without invented coordinates", () => {
  const bounds = roadBoundariesFromTrace([source()], route);
  assert.equal(bounds.status, "resolved"); assert.equal(bounds.precision, "matched-road-edge");
  assert.equal(bounds.entry!.id, "osm-transition:100:10>20");
  assert.equal(bounds.exit!.id, "osm-transition:200:20>30");
  assert.equal(bounds.entry!.coordinate, null);
});

test("a verified directed overlap joins M4 across trace chunks with different shape indices", () => {
  const a = source().slice(0, 2);
  const b = [edge(["М-4"], 20, 200, 0, 4), edge(["Р-260"], 30, 300, 4, 5)];
  assert.equal(roadBoundariesFromTrace([a, b], route).status, "resolved");
  b[0].end_node!.node_id = 201;
  assert.equal(roadBoundariesFromTrace([a, b], route).status, "unknown");
});

test("an unproven join outside the target span does not erase an independently bound M4 transition", () => {
  const extra = [edge(["М-7"], 90, 900, 0, 1)];
  assert.equal(roadBoundariesFromTrace([source(), extra], route).status, "resolved");
});

test("incomplete coverage, repeated target blocks and malformed shape order cannot authorize a vector", () => {
  assert.equal(roadBoundariesFromTrace([source(), null], route).status, "unknown");
  const reentry = [...source(), edge(["М-4"], 40, 400, 3, 4)];
  assert.equal(roadBoundariesFromTrace([reentry], route).status, "unknown");
  const bad = source(); bad[1].end_shape_index = 0;
  assert.notEqual(roadBoundariesFromTrace([bad], route).status, "resolved");
});

test("missing OSM node/way identity cannot be replaced by a nearest-booth or numeric ref guess", () => {
  const bad = source(); delete bad[0].end_node;
  const bounds = roadBoundariesFromTrace([bad], route);
  assert.equal(bounds.status, "partial"); assert.equal(bounds.entry, null);
});

test("beginning on M4 is not a fabricated entry junction", () => {
  const bounds = roadBoundariesFromTrace([source().slice(1)], route);
  assert.equal(bounds.status, "partial"); assert.equal(bounds.entry!.kind, "route-endpoint");
});

test("BRouter-style route without instructions uses its own complete graph trace", async () => {
  const bounds = roadBoundariesFromTrace([source()], route);
  const trace: TollValidation = { status: "toll", source: "Valhalla map matching", complete: true,
    boothEventCoverage: "complete", tollBooths: [], checkedEdgeCount: 3, tollEdgeCount: 1,
    wayIds: ["20"], roadNames: ["М-4"], message: "selected BRouter trace",
    paidRoadEdges: [{ wayId: "20", roadNames: ["М-4"] }], m4RoadBoundaries: bounds };
  const production = await resolveSelectedM4Endpoints(route, 3600, trace);
  const quote = matrixM4Component(production, "2026-10-15T09:00:00+03:00", 3600)!;
  assert.equal(quote.tariffVector!.from, bounds.entry!.id);
  assert.equal(quote.tariffVector!.priceStatus, "unknown"); assert.equal(quote.tolls, null);
  const partial = await resolveSelectedM4Endpoints(route, 3600, { ...trace, complete: false, boothEventCoverage: "partial" });
  assert.equal(partial.roadBoundaries!.reason, "road_trace_incomplete");
  assert.equal(matrixM4Component(partial, "2026-10-15T09:00:00+03:00", 3600), null);
});
