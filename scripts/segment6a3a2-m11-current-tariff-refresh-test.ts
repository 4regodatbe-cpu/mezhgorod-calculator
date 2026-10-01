import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const historical = JSON.parse(await readFile(
  new URL("../data/tolls/m11/2026-03-02-58-679-category1-a1-controls.json", import.meta.url),
  "utf8",
));
const current = JSON.parse(await readFile(
  new URL("../data/tolls/m11/2026-10-01-58-679-category1-a1-current.json", import.meta.url),
  "utf8",
));
const facilityDelta = JSON.parse(await readFile(
  new URL("../data/tolls/m11/2026-09-18-58-679-facility-delta.json", import.meta.url),
  "utf8",
));

assert.equal(historical.systemId, "m11-58-679-avtodor");
assert.equal(current.systemId, historical.systemId);
assert.equal(current.snapshotKind, "current_diagnostic_a1");
assert.equal(current.observedCurrentAt, "2026-10-01");
assert.equal(current.extraction.completeMatrix, false);
assert.equal(current.extraction.usage, "diagnostic_controls_only_not_for_arbitrary_pair_pricing");

const historicalIds = historical.points.map((point: { id: string }) => point.id);
const currentIds = current.points.map((point: { id: string }) => point.id);

assert.equal(historicalIds.length, 21, "historical March point count must remain 21");
assert.equal(historicalIds.includes("p593"), false, "historical March snapshot must remain immutable and must not gain p593");
assert.equal(currentIds.length, 22, "current snapshot must contain 22 ordered points");
assert.deepEqual(currentIds, [
  "p58", "p67", "p89", "p97", "p124", "p147", "p159", "p177", "p209", "p214", "p258",
  "p330", "p348", "p385", "p402", "p444", "p524", "p545", "p593", "p647", "p668", "p679",
]);

const p593 = current.points.find((point: { id: string }) => point.id === "p593");
assert.ok(p593, "current snapshot must contain p593");
assert.equal(p593.routeKm, 593);
assert.equal(p593.pvpKm, 593);
assert.equal(p593.corridorLabel, "Любань");
assert.equal(p593.physicalFacilityOpenedAt, "2026-09-18");
assert.equal(p593.facilityEvidenceId, "pvp593");

assert.equal(facilityDelta.effectiveFrom, "2026-09-18");
assert.equal(facilityDelta.facilities.length, 1);
assert.equal(facilityDelta.facilities[0].facilityId, "pvp593");
assert.equal(facilityDelta.facilities[0].routeKm, 593);

assert.deepEqual(current.verifiedControlsFromP58, {
  p593: { monThu: 3600, friSun: 4390 },
  p679: { monThu: 4200, friSun: 4940 },
});
assert.equal(Object.keys(current.verifiedControlsFromP58).length, 2, "A1 must expose only two directly observed current controls");

assert.deepEqual(historical.verifiedRowFromP58.p679, { monThu: 3900, friSun: 4200 }, "historical March p58→p679 must stay unchanged");
assert.equal(current.verifiedControlsFromP58.p679.monThu, 4200, "current p58→p679 monThu control");
assert.equal(current.verifiedControlsFromP58.p679.friSun, 4940, "current p58→p679 friSun control");

const serialized = JSON.stringify(current);
assert.equal(serialized.includes("593→679"), true, "non-derivation rule must explicitly mention 593→679");
assert.equal("p593To679" in current, false, "no derived 593→679 amount is allowed");
assert.equal("matrix" in current, false, "A1 must not masquerade as a complete matrix");

console.log(`M11_CURRENT_A1_GREEN historicalPoints=${historicalIds.length} currentPoints=${currentIds.length} controls=${Object.keys(current.verifiedControlsFromP58).length}`);
