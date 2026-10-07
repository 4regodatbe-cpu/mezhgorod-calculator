import test from "node:test";
import assert from "node:assert/strict";
import { priceM4RoutePlazaValidation } from "../lib/toll-engine/m4-local-pricing.ts";
import type { M4RoutePlazaValidation } from "../lib/toll-engine/m4-route-validator.ts";

function validation(sequence: number[], confirmed: number[] = sequence, routeDurationSeconds = 3_600): M4RoutePlazaValidation {
  const checks = sequence.map((km) => ({
    km,
    routeProgressMeters: sequence.indexOf(km) * 10_000,
    model: km === 416 || km === 460 || km === 636 || km === 672 ? "mixed_entry_exit" as const : "open" as const,
    status: confirmed.includes(km) ? "confirmed" as const : "rejected" as const,
    evidence: "map_matching" as const,
    nearestDistanceKm: 0,
    matchedNodeIds: confirmed.includes(km) ? [`node-${km}`] : [],
    expectedNodeIds: [`node-${km}`],
    windowPointCount: 10,
    message: "fixture",
  }));
  return {
    source: "Valhalla local PVP map matching + strict route traversal fallback",
    candidateRadiusKm: 1.5,
    windowHalfKm: 4,
    candidateCount: checks.length,
    routeDistanceMeters: Math.max((checks.length - 1) * 10_000, 10_000),
    routeDurationSeconds,
    checkedCandidateCount: checks.length,
    confirmedCount: checks.filter((check) => check.status === "confirmed").length,
    rejectedCount: checks.filter((check) => check.status === "rejected").length,
    unknownCount: 0,
    complete: true,
    events: [],
    checks,
    elapsedMs: 0,
    message: "fixture",
  };
}

test("mixed M-4 zones are not charged from flanking open plazas when booth edges were bypassed", () => {
  const result = priceM4RoutePlazaValidation(validation([803, 672, 636, 620], [803, 620]));
  assert.equal(result.status, "none");
  assert.equal(result.amount, null);
  assert.deepEqual(result.pricedPlazas, []);
});

test("M-4 633-741 bills only the first actually traversed paid gate", () => {
  const northbound = priceM4RoutePlazaValidation(validation([803, 672, 636, 620]));
  assert.equal(northbound.status, "priced");
  assert.equal(northbound.weekdayAmount, 440);
  assert.equal(northbound.weekendAmount, 500);
  assert.deepEqual(northbound.pricedPlazas.map((item) => item.km), [672]);
  assert.equal(northbound.pricedPlazas[0]?.exitKm, 636);

  const southbound = priceM4RoutePlazaValidation(validation([620, 636, 672, 803]));
  assert.equal(southbound.status, "priced");
  assert.equal(southbound.weekdayAmount, 640);
  assert.equal(southbound.weekendAmount, 770);
  assert.deepEqual(southbound.pricedPlazas.map((item) => item.km), [636]);
  assert.equal(southbound.pricedPlazas[0]?.exitKm, 672);
});

test("M-4 633-741 charges at exit only when estimated gate transit exceeds 120 minutes", () => {
  const slow = priceM4RoutePlazaValidation(validation([803, 672, 636, 620], undefined, 50_000));
  assert.equal(slow.status, "priced");
  assert.equal(slow.weekdayAmount, 1_080);
  assert.equal(slow.weekendAmount, 1_270);
  assert.deepEqual(slow.pricedPlazas.map((item) => item.km), [636, 672]);
});

test("paired mixed-zone gates remain unresolved without route ETA", () => {
  const missingEta = validation([803, 672, 636, 620]);
  delete missingEta.routeDurationSeconds;
  const result = priceM4RoutePlazaValidation(missingEta);
  assert.equal(result.status, "unresolved");
  assert.equal(result.amount, null);
  assert.ok(result.unresolved.some((item) => item.code === "mixed_zone"));
});

test("a single verified 633-741 gate resolves to its published gate tariff", () => {
  const at636 = priceM4RoutePlazaValidation(validation([636, 620]));
  assert.equal(at636.status, "priced");
  assert.equal(at636.weekdayAmount, 640);

  const at672 = priceM4RoutePlazaValidation(validation([803, 672]));
  assert.equal(at672.status, "priced");
  assert.equal(at672.weekdayAmount, 440);
});

test("the 401-464 mixed zone is not billed when the route only has flanking open-PVP evidence", () => {
  const result = priceM4RoutePlazaValidation(validation([515, 460, 416, 339], [515, 339]));
  assert.equal(result.status, "none");
  assert.deepEqual(result.pricedPlazas, []);
});

test("the 401-464 mixed zone charges once when either paid gate is confirmed", () => {
  const oneGate = priceM4RoutePlazaValidation(validation([416]));
  assert.equal(oneGate.status, "priced");
  assert.equal(oneGate.weekdayAmount, 360);
  assert.equal(oneGate.weekendAmount, 480);

  const bothGates = priceM4RoutePlazaValidation(validation([460, 416]));
  assert.equal(bothGates.status, "priced");
  assert.equal(bothGates.weekdayAmount, 360);
  assert.equal(bothGates.weekendAmount, 480);
  assert.equal(bothGates.pricedPlazas.length, 1);
});

test("the 401-464 mixed zone adds an exit tariff when estimated transit exceeds 12 hours", () => {
  const result = priceM4RoutePlazaValidation(validation([460, 416], undefined, 50_000));
  assert.equal(result.status, "priced");
  assert.equal(result.weekdayAmount, 720);
  assert.equal(result.weekendAmount, 960);
  assert.deepEqual(result.pricedPlazas.map((item) => item.km), [416, 460]);
});
