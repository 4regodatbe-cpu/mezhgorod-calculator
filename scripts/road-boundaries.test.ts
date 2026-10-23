import assert from "node:assert/strict";
import { test } from "node:test";
import fixture from "@/experiments/road-ref-boundaries/fixtures/granitnoe-kazan-m4.json";
import { normalizeRoadRef, roadBoundariesFromOsrm, roadBoundariesFromValhalla, roadRouteSignature } from "@/lib/toll-engine/road-boundaries";
import { resolveSelectedM4Endpoints } from "@/lib/toll-engine/m4-production";
import { matrixM4Component } from "@/experiments/nationwide-tolls/engine/m4-route-adapter.mjs";
import type { Coordinate } from "@/lib/tolls";
import type { TollValidation } from "@/lib/toll-validator";
import type { M11OsrmLeg, M11ValhallaLeg } from "@/lib/toll-engine/m11-road-evidence-types";

const legs = fixture.legs as M11ValhallaLeg[];
const geometry = legs.flatMap(leg => leg.coordinates);
const date = "2026-10-15T09:00:00+03:00";
const simple = (offset = 0): M11OsrmLeg[] => [{ steps: [
  { ref: "А-280", geometry: { coordinates: [[39 + offset, 47], [40 + offset, 47]] } },
  { ref: "M 4;E 115", geometry: { coordinates: [[40 + offset, 47], [40 + offset, 48]] } },
  { ref: "Р-260", geometry: { coordinates: [[40 + offset, 48], [41 + offset, 48]] } },
] }];
const shape = (input: M11OsrmLeg[]) => input.flatMap(leg => leg.steps!.flatMap(step => step.geometry!.coordinates!));

test("normalize complete road-number labels; do not accept prose or destinations", () => {
  for (const value of ["M4", "М – 4", "М-4"]) assert.equal(normalizeRoadRef(value), "М-4");
  assert.equal(normalizeRoadRef("R 260"), "Р-260");
  assert.equal(normalizeRoadRef("на М-4"), null);
  const input = simple(); input[0].steps![1].ref = "М-7";
  input[0].steps![1].destinations = "М-4; Москва";
  assert.equal(roadBoundariesFromOsrm(input, shape(input)).status, "not-detected");
});

test("regional connecting road refs and unnumbered named routes retain their identity", () => {
  assert.equal(normalizeRoadRef("03K-002"), "03К-002");
  assert.equal(normalizeRoadRef("22Н-0239"), "22Н-0239");
  assert.notEqual(normalizeRoadRef("60К-6-1"), normalizeRoadRef("60К-61"));
  const input = simple(); input[0].steps![2].ref = "22Н-0239";
  assert.deepEqual(roadBoundariesFromOsrm(input, shape(input)).exit!.to!.refs, ["22Н-0239"]);
  input[0].steps![2].ref = "ЗСД";
  assert.deepEqual(roadBoundariesFromOsrm(input, shape(input)).exit!.to!.names, ["ЗСД"]);
});

test("saved Granitnoe→Kazan maneuver labels identify the corridor but do not prove an exact tariff entry", async () => {
  const bounds = roadBoundariesFromValhalla(legs);
  assert.equal(bounds.status, "resolved");
  assert.equal(bounds.precision, "route-maneuver");
  assert.deepEqual(bounds.entry!.from!.names, ["Северный обход Ростова-на-Дону"]);
  assert.ok(bounds.entry!.to!.refs.includes("М-4"));
  assert.deepEqual(bounds.exit!.to!.refs, ["Р-260"]);
  assert.deepEqual(bounds.entry!.coordinate, geometry[legs[0].maneuvers![1].begin_shape_index!]);
  assert.deepEqual(bounds.exit!.coordinate, geometry[legs[0].maneuvers![2].end_shape_index!]);
  const paid: TollValidation = { status: "toll", source: "Valhalla map matching", tollEdgeCount: 2,
    checkedEdgeCount: 236, wayIds: ["1182567076", "31984600"], roadNames: ["М-4"],
    paidRoadEdges: [{ wayId: "1182567076", roadNames: ["М-4"] }, { wayId: "31984600", roadNames: ["М-4"] }],
    complete: true, boothEventCoverage: "complete", tollBooths: [], message: "saved selected paid edges" };
  const production = await resolveSelectedM4Endpoints(geometry, 3600, paid, bounds);
  assert.equal(production.candidate, true);
  assert.equal(production.exact, false);
  assert.deepEqual(production.m4PvpPreview!.confirmedPvps, []);
  assert.equal(matrixM4Component(production, date, 3600), null);
  // A different geometry must not reuse this selected-route access proof.
  const different = geometry.map(([lon, lat]): Coordinate => [lon + 1, lat]);
  const mismatch = await resolveSelectedM4Endpoints(different, 3600, paid, bounds);
  assert.equal(mismatch.roadBoundaries!.reason, "road_evidence_geometry_mismatch");
  assert.equal(matrixM4Component(mismatch, date, 3600), null);
});

test("same pair of road refs at different locations has different directed transition IDs", () => {
  const a = roadBoundariesFromOsrm(simple(), shape(simple()));
  const b = roadBoundariesFromOsrm(simple(1), shape(simple(1)));
  assert.equal(a.status, "resolved"); assert.equal(b.status, "resolved");
  assert.notEqual(a.entry!.id, b.entry!.id); assert.notEqual(a.exit!.id, b.exit!.id);
  const reverse: M11OsrmLeg[] = [{ steps: [...simple()[0].steps!].reverse().map(step => ({
    ...step, geometry: { coordinates: [...step.geometry!.coordinates!].reverse() },
  })) }];
  const r = roadBoundariesFromOsrm(reverse, shape(reverse));
  assert.equal(r.status, "resolved");
  assert.deepEqual(r.entry!.coordinate, a.exit!.coordinate);
  assert.deepEqual(r.entry!.from!.refs, ["Р-260"]);
  assert.notEqual(r.entry!.id, a.exit!.id);
});

test("an old begin_street_names label does not extend M4 onto a different selected road", () => {
  const input: M11ValhallaLeg[] = [{ coordinates: [[40, 47], [40, 48]], maneuvers: [{
    street_names: ["Р-260"], begin_street_names: ["М-4"], begin_shape_index: 0, end_shape_index: 1,
  }] }];
  assert.equal(roadBoundariesFromValhalla(input).status, "not-detected");
});

test("concurrent E-road labels do not split a continuous M4 block", () => {
  assert.equal(roadBoundariesFromValhalla(legs).status, "resolved");
  assert.ok(roadBoundariesFromValhalla(legs).entry!.to!.refs.includes("E-50"));
  assert.ok(!roadBoundariesFromValhalla(legs).exit!.from!.refs.includes("E-50"));
});

test("discontinuous/malformed selected geometry cannot prove road boundaries", () => {
  const disconnected = simple(); disconnected[0].steps![2].geometry!.coordinates![0] = [43, 48];
  assert.equal(roadBoundariesFromOsrm(disconnected, shape(disconnected)).reason, "road_geometry_discontinuous");
  const bad = structuredClone(legs); bad[0].maneuvers![1].end_shape_index = 999999;
  const bounds = roadBoundariesFromValhalla(bad);
  assert.equal(bounds.status, "unknown"); assert.equal(bounds.reason, "road_geometry_incomplete");
  assert.equal(bounds.entry, null);
});

test("exit/re-entry is not silently folded into a single outer tariff vector", () => {
  const input = simple(); input[0].steps!.push(
    { ref: "М-4", geometry: { coordinates: [[41, 48], [41, 49]] } },
    { ref: "Р-260", geometry: { coordinates: [[41, 49], [42, 49]] } });
  const bounds = roadBoundariesFromOsrm(input, shape(input));
  assert.equal(bounds.status, "unknown"); assert.equal(bounds.reason, "multiple_road_traversals");
});

test("starting on M4 is partial access evidence, not a fabricated entry interchange", () => {
  const input = simple(); input[0].steps!.shift();
  const bounds = roadBoundariesFromOsrm(input, shape(input));
  assert.equal(bounds.status, "partial"); assert.equal(bounds.entry!.kind, "route-endpoint");
  assert.equal(matrixM4Component({ candidate: true, exact: false, roadBoundaries: bounds }, date, 3600), null);
});

test("road names alone do not introduce a new toll charge or override legacy matrix prices", () => {
  const bounds = roadBoundariesFromValhalla(legs);
  assert.equal(matrixM4Component({ candidate: false, exact: false, roadBoundaries: bounds }, date, 3600), null);
  const known = matrixM4Component({ candidate: true, exact: true, endpointOnly: true,
    roadBoundaries: bounds, m4PvpPreview: { confirmedPvps: ["m4-1184", "m4-1223"] } }, date, 3600)!;
  assert.equal(known.tolls!.amount, 700);
  assert.equal(known.tariffVector!.selectionBasis, "confirmed-payment-boundaries");
  assert.equal(known.tariffVector!.priceStatus, "known");
});

test("only a short continuous unnamed connector can link two named road transitions", () => {
  const input = simple(); const steps = input[0].steps!;
  steps[1].geometry!.coordinates![1] = [40, 47.99];
  steps.splice(2, 0, { geometry: { coordinates: [[40, 47.99], [40, 48]] } });
  const bounds = roadBoundariesFromOsrm(input, shape(input));
  assert.equal(bounds.status, "resolved"); assert.equal(bounds.exit!.connectorCount, 1);
  const long = structuredClone(input); long[0].steps![2].geometry!.coordinates = [[40, 47.99], [41, 47.99], [40, 48]];
  assert.equal(roadBoundariesFromOsrm(long, shape(long)).reason, "road_connector_unresolved");
});

test("road evidence signature binds all vertices, not merely endpoints", () => {
  const changed = structuredClone(geometry); changed[5][0] += 0.001;
  assert.notEqual(roadRouteSignature(changed), roadRouteSignature(geometry));
});

test("internally continuous OSRM steps from another candidate cannot annotate the selected shape", () => {
  const input = simple();
  const bounds = roadBoundariesFromOsrm(input, shape(simple(1)));
  assert.equal(bounds.status, "unknown");
  assert.equal(bounds.reason, "road_steps_not_on_selected_geometry");
});
