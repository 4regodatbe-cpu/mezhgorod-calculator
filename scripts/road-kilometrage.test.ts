import { test } from "node:test";
import assert from "node:assert/strict";
import { createKilometrageResolver, KILOMETRAGE_LIMITS, type KmAnchor, type KmSection } from "../lib/toll-engine/road-kilometrage";
import { optionalRoadKilometrage } from "../lib/toll-engine/optional-road-kilometrage";
import { roadRouteSignature, type RoadBoundary, type RoadBoundaryResolution } from "../lib/toll-engine/road-boundaries";
import { resolveSelectedM4Endpoints } from "../lib/toll-engine/m4-production";
import type { TollValidation } from "../lib/toll-validator";
import type { Coordinate } from "../lib/tolls";

const boundary = (side: "entry" | "exit", node: string, coordinate: Coordinate | null = null): RoadBoundary => ({
  id: `osm-transition:${node}:10>20`, kind: "road-transition", osmNodeId: node, fromWayId: "10", toWayId: "20",
  coordinate, sourceIndex: 0, connectorCount: 0,
  from: { refs: [side === "entry" ? "А-1" : "М-4"], names: [] },
  to: { refs: [side === "entry" ? "М-4" : "Р-2"], names: [] },
});
const evidence = (a = boundary("entry", "1"), b = boundary("exit", "2")): RoadBoundaryResolution => ({
  provider: "valhalla-trace", targetRef: "М-4", precision: "matched-road-edge", routeSignature: "test",
  status: "resolved", reason: "directed_graph_transitions_resolved", entry: a, exit: b,
});
const anchor = (node: string, km: number, extra: Partial<KmAnchor> = {}): KmAnchor => ({ roadRef: "М-4", scaleId: "test-scale",
  branchId: "test-main", osmNodeId: node, km, uncertaintyKm: 0.1, source: "synthetic-test-only", reviewed: true, ...extra });
const section = (extra: Partial<KmSection> = {}): KmSection => ({ roadRef: "М-4", scaleId: "test-scale", branchId: "test-main",
  accessRoadRefs: ["А-1", "Р-2"], coordinates: [[10, 10], [10.01, 10]], startKm: 100, endKm: 101,
  maxOffsetKm: 0.05, uncertaintyKm: 0.1, source: "synthetic-test-only", reviewed: true, ...extra });

test("kilometrage exact directed identities, increasing and decreasing selected traversal", () => {
  const resolve = createKilometrageResolver({ anchors: [anchor("1", 100), anchor("2", 200)], sections: [] });
  const before = evidence();
  assert.equal(resolve(before).direction, "increasing-km");
  assert.equal(resolve(before).status, "resolved");
  assert.equal(resolve(evidence(boundary("entry", "2"), boundary("exit", "1"))).direction, "decreasing-km");
  assert.equal(before.entry?.coordinate, null);
});

test("transition-specific row never leaks to another approach on same node", () => {
  const resolve = createKilometrageResolver({ anchors: [anchor("1", 100, { transitionId: "osm-transition:1:10>20" })], sections: [] });
  const value = evidence();
  assert.equal(resolve(value).entry.status, "known");
  value.entry!.id = "osm-transition:1:30>40";
  assert.equal(resolve(value).entry.status, "unknown");
});

test("calibrated local projection uses actual access refs and supports reversed scale", () => {
  const resolve = createKilometrageResolver({ anchors: [], sections: [section()] });
  const value = evidence(boundary("entry", "1", [10.002, 10.00001]), boundary("exit", "2", [10.008, 10]));
  assert.equal(resolve(value).entry.position?.km, 100.2);
  assert.equal(resolve(value).exit.position?.km, 100.8);
  assert.equal(resolve(value).direction, "increasing-km");
  const reverse = createKilometrageResolver({ anchors: [], sections: [section({ startKm: 101, endKm: 100 })] });
  assert.equal(reverse(value).direction, "decreasing-km");
  value.entry!.from!.refs = ["А-9"];
  assert.equal(resolve(value).entry.status, "unknown");
});

test("nearby branches / duplicate anchors / overlapping km ranges are not guessed", () => {
  const point = evidence(boundary("entry", "1", [10.004, 10]), boundary("exit", "2", [10.006, 10]));
  const duplicate = createKilometrageResolver({ anchors: [anchor("1", 10), anchor("1", 20)], sections: [] });
  assert.equal(duplicate(point).entry.status, "ambiguous");
  const parallel = createKilometrageResolver({ anchors: [], sections: [section(), section({ branchId: "bypass" })] });
  assert.equal(parallel(point).entry.status, "ambiguous");
  const overlapping = createKilometrageResolver({ anchors: [], sections: [section({ uncertaintyKm: 1 })] });
  assert.equal(overlapping(point).direction, "unknown");
  assert.ok(overlapping(point).stops.includes("km_direction_intervals_overlap"));
});

test("different branches, scales and partial trace cannot establish direction", () => {
  for (const extra of [{ branchId: "bypass" }, { scaleId: "old-scale" }]) {
    const resolve = createKilometrageResolver({ anchors: [anchor("1", 100), anchor("2", 200, extra)], sections: [] });
    assert.equal(resolve(evidence()).direction, "unknown");
  }
  const resolve = createKilometrageResolver({ anchors: [anchor("1", 100), anchor("2", 200)], sections: [] });
  assert.equal(resolve({ ...evidence(), status: "partial" }).direction, "unknown");
  assert.equal(resolve({ ...evidence(), status: "unknown" }).entry.status, "unknown");
});

test("missing geometry, wrong target road and out-of-section coordinates stay unknown", () => {
  const resolve = createKilometrageResolver({ anchors: [], sections: [section()] });
  assert.equal(resolve(evidence()).entry.reason, "km_coordinate_and_anchor_missing");
  for (const p of [[10.02, 10], [9.9999, 10], [10.005, 10.1]] as Coordinate[]) {
    assert.equal(resolve(evidence(boundary("entry", "1", p))).entry.status, "unknown");
  }
  const value = evidence(boundary("entry", "1", [10.005, 10])); value.entry!.to!.refs = ["М-11"];
  assert.equal(resolve(value).entry.reason, "km_target_road_mismatch");
});

test("unreviewed/bad rows log stops without blocking valid independent rows", () => {
  const resolve = createKilometrageResolver({ anchors: [anchor("1", 100, { reviewed: false }), anchor("2", 200)],
    sections: [section({ startKm: -1 })] });
  const result = resolve(evidence());
  assert.equal(result.entry.status, "unknown"); assert.equal(result.exit.status, "known");
  assert.deepEqual(result.stops.slice(0, 2), ["km_invalid_anchor:0", "km_invalid_section:0"]);
});

test("registry and lookup budgets fail closed; no partial nearest choice", () => {
  const anchors = Array.from({ length: KILOMETRAGE_LIMITS.anchors + 1 }, () => anchor("1", 100));
  assert.ok(createKilometrageResolver({ anchors, sections: [] })(evidence()).stops.includes("km_registry_limit_exceeded"));
  const coordinates = Array.from({ length: 65 }, (_, i) => [10 + i * 0.0001, 10] as Coordinate);
  const sections = Array.from({ length: 65 }, () => section({ coordinates, endKm: 100.7 }));
  const result = createKilometrageResolver({ anchors: [], sections })(evidence(boundary("entry", "1", [10.003, 10])));
  assert.equal(result.entry.reason, "km_lookup_budget_exceeded");
});

test("switch disables module, existing named PVP anchors work without network", () => {
  assert.equal(optionalRoadKilometrage(evidence(), false).status, "disabled");
  const result = optionalRoadKilometrage(evidence(boundary("entry", "1755090321"), boundary("exit", "285903913")));
  assert.equal(result.entry.position?.km, 62); assert.equal(result.exit.position?.km, 71);
  assert.equal(result.direction, "increasing-km");
  assert.equal(result.diagnosticOnly, true);
});

test("real retained M4 transitions remain unknown kilometres without invented data", () => {
  const a = boundary("entry", "4443232947"); a.id = "osm-transition:4443232947:447135768>1182567076";
  const b = boundary("exit", "358467208"); b.id = "osm-transition:358467208:1211606940>28835034";
  const result = optionalRoadKilometrage(evidence(a, b));
  assert.equal(result.status, "unknown"); assert.equal(result.entry.position, null); assert.equal(result.exit.position, null);
  assert.ok(result.stops.includes("entry:km_coordinate_and_anchor_missing"));
});

test("selected-route integration rejects foreign geometry before kilometrage and keeps price null", async () => {
  const route: Coordinate[] = [[10, 10], [10, 11]];
  const graph = { ...evidence(), routeSignature: roadRouteSignature(route) };
  const trace = { complete: true, boothEventCoverage: "complete", m4RoadBoundaries: graph,
    paidRoadEdges: [{ roadNames: ["М-4"] }], tollBooths: [] } as unknown as TollValidation;
  const result = await resolveSelectedM4Endpoints(route, 100, trace);
  assert.equal(result.m4PvpPreview?.roadKilometrage?.status, "unknown"); assert.equal(result.tolls, null);
  const foreign = await resolveSelectedM4Endpoints([[11, 10], [11, 11]], 100, trace);
  assert.equal(foreign.roadBoundaries?.reason, "road_evidence_geometry_mismatch");
  assert.equal(foreign.m4PvpPreview?.roadKilometrage?.entry.position, null);
});
