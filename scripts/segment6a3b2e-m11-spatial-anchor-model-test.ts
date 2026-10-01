import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildM11FacilitySpatialEvidence } from "../lib/toll-engine/m11-spatial-anchors.ts";

const currentPoints = JSON.parse(await readFile(
  new URL("../data/tolls/m11/2026-10-01-58-679-category1-a1-current.json", import.meta.url),
  "utf8",
));
const spatialSnapshot = JSON.parse(await readFile(
  new URL("../data/tolls/m11/2026-10-01-58-679-spatial-anchors.json", import.meta.url),
  "utf8",
));

const evidence = buildM11FacilitySpatialEvidence(currentPoints, spatialSnapshot);
assert.equal(evidence.length, 3);
const byPoint = new Map(evidence.map((item) => [item.tariffPointId, item]));
const p58 = byPoint.get("p58");
const p593 = byPoint.get("p593");
const p679 = byPoint.get("p679");
assert.ok(p58 && p593 && p679);
assert.equal(p58.anchors.length, 4, "PVP58 must preserve two observed physical anchor groups without centroid synthesis");
assert.equal(p593.anchors.length, 2, "PVP593 must preserve both observed booth anchors");
assert.equal(p679.anchors.length, 1, "PVP679 control retains the directly M11-bound booth anchor");
assert.deepEqual(
  p593.anchors.map((anchor) => [anchor.anchorId, anchor.coordinate.lat, anchor.coordinate.lon]),
  [
    ["osm-node-13249401006", 59.1976987, 31.2534812],
    ["osm-node-14162143275", 59.20392, 31.2595577],
  ],
);
for (const item of evidence) {
  assert.equal(currentPoints.points.some((point: { id: string }) => point.id === item.tariffPointId), true);
  assert.equal(item.anchors.every((anchor) => anchor.status === "independently_verified_infrastructure"), true);
  assert.equal(item.anchors.every((anchor) => anchor.source.includes("openstreetmap.org")), true);
}
assert.equal(p593.officialIdentitySource.includes("unitoll.ru"), true);

const duplicate = structuredClone(spatialSnapshot);
duplicate.facilities[1].anchors[0].anchorId = duplicate.facilities[0].anchors[0].anchorId;
assert.throws(() => buildM11FacilitySpatialEvidence(currentPoints, duplicate), /M11_DUPLICATE_SPATIAL_ANCHOR/);

const unknownPoint = structuredClone(spatialSnapshot);
unknownPoint.facilities[0].tariffPointId = "p999";
assert.throws(() => buildM11FacilitySpatialEvidence(currentPoints, unknownPoint), /M11_SPATIAL_UNKNOWN_TARIFF_POINT/);

const invalidCoordinate = structuredClone(spatialSnapshot);
invalidCoordinate.facilities[0].anchors[0].lat = 1000;
assert.throws(() => buildM11FacilitySpatialEvidence(currentPoints, invalidCoordinate), /M11_INVALID_SPATIAL_ANCHOR_COORDINATE/);

const empty = structuredClone(spatialSnapshot);
empty.facilities[0].anchors = [];
assert.throws(() => buildM11FacilitySpatialEvidence(currentPoints, empty), /M11_SPATIAL_EMPTY_ANCHORS/);

const serialized = JSON.stringify(evidence);
for (const forbidden of ["monThu", "friSun", "amountRub", "currency", "tariffs"]) {
  assert.equal(serialized.includes(forbidden), false, `spatial evidence must remain money-free: ${forbidden}`);
}

console.log(`M11_MULTI_ANCHOR_SPATIAL_GREEN facilities=${evidence.length} anchors=${evidence.reduce((sum, item) => sum + item.anchors.length, 0)} syntheticCoordinates=0`);
