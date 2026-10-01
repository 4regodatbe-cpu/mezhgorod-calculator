import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildM11FacilitySpatialEvidence, type M11FacilitySpatialEvidence } from "../lib/toll-engine/m11-spatial-anchors.ts";
import { resolveM11Boundaries } from "../lib/toll-engine/m11-boundary-resolver.ts";
import type { M11Coordinate, M11RoadEvidence } from "../lib/toll-engine/m11-road-evidence.ts";

const points = JSON.parse(await readFile(new URL("../data/tolls/m11/2026-10-01-58-679-category1-a1-current.json", import.meta.url), "utf8"));
const spatial = JSON.parse(await readFile(new URL("../data/tolls/m11/2026-10-01-58-679-spatial-anchors.json", import.meta.url), "utf8"));
const facilities = buildM11FacilitySpatialEvidence(points, spatial);
const p58: M11Coordinate = [37.0712818, 56.1391684];
const p593: M11Coordinate = [31.2534812, 59.1976987];
const p679: M11Coordinate = [30.3598352, 59.7750977];
const moscowSection: M11Coordinate = [37.45, 55.95];

function strict(begin: M11Coordinate, end: M11Coordinate): M11RoadEvidence {
  return { provider: "osrm", strictBlocks: [{ provider: "osrm", legIndex: 0, sourceStartIndex: 0, sourceEndIndex: 0, beginKm: 0, endKm: 1, lengthKm: 1, beginCoordinate: begin, endCoordinate: end, labels: ["М-11"] }], candidateClues: [], malformedStrictCount: 0 };
}
function expectStatus(name: string, evidence: M11RoadEvidence, shape: M11Coordinate[], status: "resolved" | "unresolved", expectedPair?: [string,string], useFacilities = facilities) {
  const result = resolveM11Boundaries({ evidence, routeGeometry: shape, spatialFacilities: useFacilities });
  assert.equal(result.status, status, name);
  if (status === "resolved") {
    assert.equal(result.status, "resolved");
    if (result.status === "resolved" && expectedPair) assert.deepEqual([result.entryPointId, result.exitPointId], expectedPair, name);
  }
  return result;
}

expectStatus("full 58-679", strict(p58, p679), [p58, [35,57], p593, [31,59.5], p679], "resolved", ["p58","p679"]);
expectStatus("58-679 partial", strict(p593, p679), [p593, [31,59.5], p679], "resolved", ["p593","p679"]);
expectStatus("reverse", strict(p679, p58), [p679, [31,59.5], p593, [35,57], p58], "resolved", ["p679","p58"]);

const crossSystem = expectStatus("cross-system must not invent p58 entry", strict(moscowSection, p593), [moscowSection, p58, [35,57], p593], "unresolved");
assert.ok(crossSystem.unresolvedReasons.includes("entry_not_proven_at_strict_m11_start"));

const section1558 = expectStatus("15-58 without trusted anchor set", strict(moscowSection, p58), [moscowSection, p58], "unresolved");
assert.ok(section1558.unresolvedReasons.includes("only_one_verified_boundary_crossing"));

const candidateOnly: M11RoadEvidence = { provider: "osrm", strictBlocks: [], candidateClues: [{ provider: "osrm", legIndex: 0, sourceIndex: 0, reasons: ["destination_m11"], beginKm: 0, endKm: 1, beginCoordinate: p58, endCoordinate: p593, labels: ["М-11"] }], malformedStrictCount: 0 };
expectStatus("candidate-only", candidateOnly, [p58,p593], "unresolved");

const nonM11: M11RoadEvidence = { provider: "osrm", strictBlocks: [], candidateClues: [], malformedStrictCount: 0 };
expectStatus("non-M11", nonM11, [[40,55],[41,56]], "unresolved");

const ambiguous: M11FacilitySpatialEvidence[] = [
  ...facilities,
  { systemId: "m11-58-679-avtodor", facilityId: "ambiguous-control", tariffPointId: "p593", officialIdentitySource: "fixture", anchors: [{ anchorId: "fixture-ambiguous", coordinate: { lat: p679[1], lon: p679[0] }, status: "independently_verified_infrastructure", source: "fixture", sourceObjectId: "fixture:1" }] },
];
const ambiguousResult = expectStatus("ambiguous same-position", strict(p58,p679), [p58,[35,57],p679], "unresolved", undefined, ambiguous);
assert.ok(ambiguousResult.unresolvedReasons.includes("ambiguous_boundary_crossing"));

console.log("M11_BOUNDARY_FIXTURE_GATE_GREEN controls=8 unsupportedRemainUnresolved=true");
