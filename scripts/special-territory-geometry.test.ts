import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyTerritory,
  qualifiesCrimeaAlternative,
  selectSpecialTerritoryOptions,
  splitRouteByTerritory,
  validateTerritories,
  type SpecialTerritoryId,
  type VerifiedTerritory,
} from "../lib/special-territory-geometry.ts";
import { SPECIAL_TERRITORY_BOUNDARIES } from "../lib/special-territory-boundaries.ts";

const ids: SpecialTerritoryId[] = ["dnr", "lnr", "zaporizhzhia", "kherson"];
const zones: VerifiedTerritory[] = ids.map((id, index) => {
  const x = index === 0 ? -1 : 10 + index * 3;
  return {
    id,
    verified: true,
    source: { url: "https://example.gov/territory-boundaries", title: "Synthetic test source", checkedAt: "2026-10-03" },
    geometry: { type: "Polygon", coordinates: [[[x, -1], [x + 2, -1], [x + 2, 1], [x, 1], [x, -1]]] },
  };
});

test("requires verified, sourced boundaries for all four special territories", () => {
  assert.doesNotThrow(() => validateTerritories(zones));
  assert.throws(() => validateTerritories(zones.slice(0, 3)), /All four/);
  assert.throws(() => validateTerritories(zones.map((zone, index) => index ? zone : { ...zone, verified: false })), /verified=true/);
  assert.equal(classifyTerritory({ lat: 0, lng: 0 }, zones), "dnr");
  assert.equal(classifyTerritory({ lat: 5, lng: 5 }, zones), null);
});

test("loads the four OCHA ADM1 boundary features and classifies representative points", () => {
  assert.equal(SPECIAL_TERRITORY_BOUNDARIES.length, 4);
  assert.doesNotThrow(() => validateTerritories(SPECIAL_TERRITORY_BOUNDARIES));
  assert.deepEqual(
    [
      classifyTerritory({ lat: 48.0156, lng: 37.8029 }, SPECIAL_TERRITORY_BOUNDARIES),
      classifyTerritory({ lat: 48.574, lng: 39.3078 }, SPECIAL_TERRITORY_BOUNDARIES),
      classifyTerritory({ lat: 47.8388, lng: 35.1396 }, SPECIAL_TERRITORY_BOUNDARIES),
      classifyTerritory({ lat: 46.6354, lng: 32.6169 }, SPECIAL_TERRITORY_BOUNDARIES),
    ],
    ["dnr", "lnr", "zaporizhzhia", "kherson"],
  );
});

test("splits actual route geometry across every crossed special region", () => {
  const result = splitRouteByTerritory({
    coordinates: [[-2, 0], [2, 0]],
    routedDistanceMeters: 400_000,
    routedDurationSeconds: 20_000,
    zones,
  });
  assert.equal(result.verified, true);
  assert.equal(result.timeIsEstimated, true);
  assert.ok(Math.abs(result.specialKm / 400 - 0.5) < 0.001);
  assert.ok(Math.abs(result.ordinaryKm + result.specialKm - 400) < 0.0001);
  assert.ok(Math.abs(result.specialSeconds - 10_000) < 1);
});

test("does not guess on a boundary and compares cumulative time inside the territories", () => {
  assert.throws(() => classifyTerritory({ lat: 0, lng: -1 }, zones), /BOUNDARY_AMBIGUOUS/);
  assert.equal(qualifiesCrimeaAlternative(10_000, 5_000, 0.5, true), true);
  assert.equal(qualifiesCrimeaAlternative(10_000, 5_001, 0.5, true), false);
  assert.equal(qualifiesCrimeaAlternative(10_000, 1_000), false, "unverified time estimates cannot qualify Crimea");
  assert.equal(qualifiesCrimeaAlternative(0, 0, 0.5, true), false);
});

test("selects one route per corridor and keeps mainland first when Crimea qualifies", () => {
  const routes = [
    { id: "mainland-paid", corridor: "mainland" as const, tollStatus: "paid" as const, meters: 500_000, seconds: 20_000 },
    { id: "mainland-free", corridor: "mainland" as const, tollStatus: "free" as const, meters: 550_000, seconds: 22_000 },
    { id: "crimea-free", corridor: "crimea" as const, tollStatus: "free" as const, meters: 520_000, seconds: 21_000 },
  ];
  assert.deepEqual(selectSpecialTerritoryOptions(routes, 10_000, 5_000, true).map((route) => route.id), ["mainland-paid", "crimea-free"]);
  assert.deepEqual(selectSpecialTerritoryOptions(routes, 10_000, 5_001, true).map((route) => route.id), ["mainland-paid"]);
  assert.deepEqual(selectSpecialTerritoryOptions(routes, 10_000, 1_000).map((route) => route.id), ["mainland-paid"]);
});
