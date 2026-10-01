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
const section1558Facilities = JSON.parse(await readFile(
  new URL("../data/tolls/m11/2026-02-24-15-58-facility-evidence.json", import.meta.url),
  "utf8",
));
const section58679Facilities = JSON.parse(await readFile(
  new URL("../data/tolls/m11/2026-03-02-58-679-facility-evidence.json", import.meta.url),
  "utf8",
));
const section58679Delta = JSON.parse(await readFile(
  new URL("../data/tolls/m11/2026-09-18-58-679-facility-delta.json", import.meta.url),
  "utf8",
));

const model = buildM11BoundaryModel(section1558, section58679, [
  section1558Facilities,
  section58679Facilities,
  section58679Delta,
]);
assert.equal(model.systems.length, 2, "expected exactly two M11 tariff-boundary systems");

const first = model.systems[0];
const second = model.systems[1];

assert.equal(first.systemId, "m11-15-58-ossp");
assert.equal(second.systemId, "m11-58-679-avtodor");
assert.equal(first.points.length, 7, "15-58 point count");
assert.equal(second.points.length, 21, "58-679 March tariff-point count");

assert.deepEqual(
  first.points.map((point) => point.pointId),
  ["moscow", "sheremetyevo2", "sheremetyevo1", "zelenograd", "tskad", "mmk_a107", "solnechnogorsk"],
  "15-58 official point order must remain stable",
);
assert.deepEqual(
  second.points.map((point) => point.pointId),
  ["p58", "p67", "p89", "p97", "p124", "p147", "p159", "p177", "p209", "p214", "p258", "p330", "p348", "p385", "p402", "p444", "p524", "p545", "p647", "p668", "p679"],
  "58-679 March official point order must remain stable",
);
assert.equal(second.points.some((point) => point.pointId === "p593"), false, "new PVP593 must not be fabricated into the March tariff matrix");

for (const system of model.systems) {
  const ids = system.points.map((point) => point.pointId);
  assert.equal(new Set(ids).size, ids.length, `${system.systemId}: duplicate point id`);
  system.points.forEach((point, index) => {
    assert.equal(point.order, index, `${system.systemId}:${point.pointId}: contiguous order`);
  });
}

for (const point of first.points) {
  assert.equal(point.routeKm, null, `${point.pointId}: tariff point route km must not be inferred from facility chainage`);
  assert.equal(point.pvpKm, null, `${point.pointId}: tariff point PVP km must not be inferred from facility chainage`);
}

const firstFacilities = first.points.flatMap((point) => point.facilities);
const secondFacilities = second.points.flatMap((point) => point.facilities);
assert.equal(firstFacilities.length, 9, "15-58 official facility evidence count");
assert.equal(first.unboundFacilities.length, 0, "15-58 should have no unbound facilities in current evidence");
assert.equal(secondFacilities.length, 21, "58-679 March matrix must attach one official PVP facility per tariff point");
assert.equal(second.unboundFacilities.length, 1, "58-679 must retain the September PVP593 as an unbound facility");

for (const facility of [...firstFacilities, ...secondFacilities, ...second.unboundFacilities]) {
  assert.equal(facility.spatial.coordinate, null, `${facility.facilityId}: coordinate must remain unresolved`);
  assert.equal(facility.spatial.status, "unresolved", `${facility.facilityId}: spatial status`);
  assert.equal(facility.spatial.source, null, `${facility.facilityId}: no invented coordinate source`);
}

for (const facility of firstFacilities) {
  assert.ok(facility.identitySource.includes("m11-neva.ru"), `${facility.facilityId}: official identity source`);
}
for (const facility of secondFacilities) {
  assert.ok(facility.identitySource.includes("avtodor-tr.ru"), `${facility.facilityId}: official March matrix source`);
  assert.equal(facility.facilityKind, "pvp_unspecified", `${facility.facilityId}: do not invent mainline/interchange topology from tariff table`);
  assert.notEqual(facility.tariffPointId, null, `${facility.facilityId}: March matrix PVP must be bound`);
}

const mmk = first.points.find((point) => point.pointId === "mmk_a107");
assert.ok(mmk, "missing MMK tariff point");
assert.deepEqual(
  mmk.facilities.map((facility) => [facility.facilityId, facility.routeKm]),
  [["pvp48-mmk-south", 48], ["pvp50-mmk-north", 50]],
  "one MMK tariff point must retain two directional physical PVP facilities",
);

const solnechnogorsk = first.points.find((point) => point.pointId === "solnechnogorsk");
assert.ok(solnechnogorsk, "missing Solnechnogorsk tariff point");
assert.deepEqual(
  solnechnogorsk.facilities.map((facility) => facility.facilityKind),
  ["mainline_pvp", "virtual_boundary"],
  "Solnechnogorsk must retain physical PVP plus separately unresolved virtual section boundary",
);

const expected1558Chainage = new Map([
  ["pvp21-moscow", 21],
  ["pvp24-sheremetyevo2", 24],
  ["pvp28-sheremetyevo1", 28],
  ["pvp36-zelenograd", 36],
  ["pvp47-tskad", 47],
  ["pvp48-mmk-south", 48],
  ["pvp50-mmk-north", 50],
  ["pvp58-solnechnogorsk", 58],
] as const);
for (const [facilityId, routeKm] of expected1558Chainage) {
  const facility = firstFacilities.find((candidate) => candidate.facilityId === facilityId);
  assert.ok(facility, `${facilityId}: missing facility`);
  assert.equal(facility.routeKm, routeKm, `${facilityId}: official route km`);
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
  assert.equal(point.facilities.length, 1, `${pointId}: exactly one March matrix facility`);
  assert.equal(point.facilities[0].routeKm, routeKm, `${pointId}: facility routeKm`);
  assert.equal(point.facilities[0].officialNumber, String(pvpKm), `${pointId}: facility PVP number`);
}

for (const point of second.points) {
  assert.equal(point.facilities.length, 1, `${point.pointId}: expected one bound March PVP facility`);
  const facility = point.facilities[0];
  assert.equal(facility.tariffPointId, point.pointId, `${point.pointId}: facility binding`);
  assert.equal(facility.routeKm, point.routeKm, `${point.pointId}: route chainage parity`);
  assert.equal(facility.officialNumber, String(point.pvpKm), `${point.pointId}: PVP chainage parity`);
}

const pvp593 = second.unboundFacilities[0];
assert.equal(pvp593.facilityId, "pvp593");
assert.equal(pvp593.tariffPointId, null, "PVP593 must remain unbound until a current tariff snapshot exists");
assert.equal(pvp593.routeKm, 593);
assert.equal(pvp593.officialNumber, "593");
assert.ok(pvp593.identitySource.includes("unitoll.ru"), "PVP593 official operator source");
assert.ok(pvp593.note?.includes("не является priceable"), "PVP593 must carry explicit non-priceable note");

const serialized = JSON.stringify(model);
for (const forbidden of ["weekday", "weekend", "monThu", "friSun", "amount", "currency", "tariffs"]) {
  assert.equal(serialized.includes(forbidden), false, `boundary model must not expose monetary field: ${forbidden}`);
}

console.log(
  `M11_BOUNDARY_MODEL_GREEN systems=${model.systems.length} points=${first.points.length + second.points.length} boundFacilities=${firstFacilities.length + secondFacilities.length} unboundFacilities=${second.unboundFacilities.length} coordinates=0`,
);
