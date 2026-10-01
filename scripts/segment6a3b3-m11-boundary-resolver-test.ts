import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildM11FacilitySpatialEvidence } from "../lib/toll-engine/m11-spatial-anchors.ts";
import { resolveM11Boundaries } from "../lib/toll-engine/m11-boundary-resolver.ts";
import type { M11Coordinate, M11RoadEvidence } from "../lib/toll-engine/m11-road-evidence.ts";

const currentPoints = JSON.parse(await readFile(new URL("../data/tolls/m11/2026-10-01-58-679-category1-a1-current.json", import.meta.url), "utf8"));
const spatialSnapshot = JSON.parse(await readFile(new URL("../data/tolls/m11/2026-10-01-58-679-spatial-anchors.json", import.meta.url), "utf8"));
const facilities = buildM11FacilitySpatialEvidence(currentPoints, spatialSnapshot);

const p58: M11Coordinate = [37.0712818, 56.1391684];
const p593: M11Coordinate = [31.2534812, 59.1976987];
const p679: M11Coordinate = [30.3598352, 59.7750977];
const shape: M11Coordinate[] = [p58, [35.5, 57.0], [33.2, 58.0], p593, [30.8, 59.5], p679];

function strictEvidence(begin: M11Coordinate, end: M11Coordinate): M11RoadEvidence {
  return {
    provider: "osrm",
    strictBlocks: [{
      provider: "osrm",
      legIndex: 0,
      sourceStartIndex: 0,
      sourceEndIndex: 0,
      beginKm: 0,
      endKm: 620,
      lengthKm: 620,
      beginCoordinate: begin,
      endCoordinate: end,
      labels: ["М-11"],
    }],
    candidateClues: [],
    malformedStrictCount: 0,
  };
}

const full = resolveM11Boundaries({ evidence: strictEvidence(p58, p679), routeGeometry: shape, spatialFacilities: facilities });
assert.equal(full.status, "resolved");
if (full.status === "resolved") {
  assert.equal(full.entryPointId, "p58");
  assert.equal(full.exitPointId, "p679");
  assert.deepEqual(full.crossings.map((item) => item.tariffPointId), ["p58", "p593", "p679"]);
}

const partialShape: M11Coordinate[] = [p58, [35.5, 57.0], [33.2, 58.0], p593];
const partial = resolveM11Boundaries({ evidence: strictEvidence(p58, p593), routeGeometry: partialShape, spatialFacilities: facilities });
assert.equal(partial.status, "resolved");
if (partial.status === "resolved") assert.deepEqual([partial.entryPointId, partial.exitPointId], ["p58", "p593"]);

const reverseShape = [...shape].reverse();
const reverse = resolveM11Boundaries({ evidence: strictEvidence(p679, p58), routeGeometry: reverseShape, spatialFacilities: facilities });
assert.equal(reverse.status, "resolved");
if (reverse.status === "resolved") assert.deepEqual([reverse.entryPointId, reverse.exitPointId], ["p679", "p58"]);

const candidateOnly: M11RoadEvidence = {
  provider: "osrm",
  strictBlocks: [],
  candidateClues: [{ provider: "osrm", legIndex: 0, sourceIndex: 0, reasons: ["destination_m11"], beginKm: 0, endKm: 10, beginCoordinate: p58, endCoordinate: p593, labels: ["М-11"] }],
  malformedStrictCount: 0,
};
assert.deepEqual(resolveM11Boundaries({ evidence: candidateOnly, routeGeometry: partialShape, spatialFacilities: facilities }).unresolvedReasons, ["no_strict_m11_road_evidence"]);

const malformed = strictEvidence(p58, p679);
malformed.malformedStrictCount = 1;
assert.equal(resolveM11Boundaries({ evidence: malformed, routeGeometry: shape, spatialFacilities: facilities }).status, "unresolved");

const oneShape: M11Coordinate[] = [p58, [37.0, 56.2]];
const one = resolveM11Boundaries({ evidence: strictEvidence(p58, oneShape[1]), routeGeometry: oneShape, spatialFacilities: facilities });
assert.equal(one.status, "unresolved");
assert.deepEqual(one.unresolvedReasons, ["only_one_verified_boundary_crossing"]);

const unrelated: M11Coordinate[] = [[40, 55], [41, 56], [42, 57]];
const none = resolveM11Boundaries({ evidence: strictEvidence(unrelated[0], unrelated[2]), routeGeometry: unrelated, spatialFacilities: facilities });
assert.equal(none.status, "unresolved");
assert.deepEqual(none.unresolvedReasons, ["no_verified_boundary_crossing"]);

const serialized = JSON.stringify(full);
for (const forbidden of ["amount", "amountRub", "monThu", "friSun", "currency", "tariffRub"]) {
  assert.equal(serialized.includes(forbidden), false, `resolver output must be money-free: ${forbidden}`);
}

console.log("M11_BOUNDARY_RESOLVER_GREEN controls=7 moneyFields=0");
