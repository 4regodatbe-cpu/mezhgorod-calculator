import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildM11BoundaryModel } from "../lib/toll-engine/m11-boundaries.ts";

const section1558 = JSON.parse(await readFile(
  new URL("../data/tolls/m11/2026-04-24-15-58-category1.json", import.meta.url),
  "utf8",
));
const section58679 = JSON.parse(await readFile(
  new URL("../data/tolls/m11/2026-03-02-58-679-category1-a1-controls.json", import.meta.url),
  "utf8",
));

const model = buildM11BoundaryModel(section1558, section58679);
assert.equal(model.systems.length, 2, "expected exactly two M11 tariff-boundary systems");

const first = model.systems[0];
const second = model.systems[1];

assert.equal(first.systemId, "m11-15-58-ossp");
assert.equal(second.systemId, "m11-58-679-avtodor");
assert.equal(first.points.length, 7, "15-58 point count");
assert.equal(second.points.length, 21, "58-679 point count");

assert.deepEqual(
  first.points.map((point) => point.pointId),
  ["moscow", "sheremetyevo2", "sheremetyevo1", "zelenograd", "tskad", "mmk_a107", "solnechnogorsk"],
  "15-58 official point order must remain stable",
);
assert.deepEqual(
  second.points.map((point) => point.pointId),
  ["p58", "p67", "p89", "p97", "p124", "p147", "p159", "p177", "p209", "p214", "p258", "p330", "p348", "p385", "p402", "p444", "p524", "p545", "p647", "p668", "p679"],
  "58-679 official point order must remain stable",
);

for (const system of model.systems) {
  const ids = system.points.map((point) => point.pointId);
  assert.equal(new Set(ids).size, ids.length, `${system.systemId}: duplicate point id`);

  system.points.forEach((point, index) => {
    assert.equal(point.order, index, `${system.systemId}:${point.pointId}: contiguous order`);
    assert.equal(point.spatial.coordinate, null, `${system.systemId}:${point.pointId}: coordinate must remain unresolved`);
    assert.equal(point.spatial.status, "unresolved", `${system.systemId}:${point.pointId}: spatial status`);
    assert.equal(point.spatial.source, null, `${system.systemId}:${point.pointId}: no invented spatial source`);
  });
}

for (const point of first.points) {
  assert.equal(point.routeKm, null, `${point.pointId}: 15-58 route km must not be fabricated`);
  assert.equal(point.pvpKm, null, `${point.pointId}: 15-58 PVP km must not be fabricated`);
}

const kmChecks = new Map([
  ["p147", [149, 147]],
  ["p209", [208, 209]],
  ["p330", [334, 330]],
  ["p545", [543, 545]],
  ["p647", [646, 647]],
] as const);
for (const [pointId, [routeKm, pvpKm]] of kmChecks) {
  const point = second.points.find((candidate) => candidate.pointId === pointId);
  assert.ok(point, `${pointId}: missing point`);
  assert.equal(point.routeKm, routeKm, `${pointId}: routeKm`);
  assert.equal(point.pvpKm, pvpKm, `${pointId}: pvpKm`);
}

const serialized = JSON.stringify(model);
for (const forbidden of ["weekday", "weekend", "monThu", "friSun", "amount", "currency", "tariffs"]) {
  assert.equal(serialized.includes(forbidden), false, `boundary model must not expose monetary field: ${forbidden}`);
}

console.log(`M11_BOUNDARY_MODEL_GREEN systems=${model.systems.length} points=${first.points.length + second.points.length} coordinates=0`);
