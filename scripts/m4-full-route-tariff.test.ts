import test from "node:test";
import assert from "node:assert/strict";
import { fullM4RouteTariff } from "../lib/toll-engine/m4-full-route-tariff.ts";
import type { M4RoutePlazaValidation } from "../lib/toll-engine/m4-route-validator.ts";

function validation(kms: number[]): M4RoutePlazaValidation {
  const checks = kms.map((km) => ({
    km,
    model: "open" as const,
    status: "confirmed" as const,
    evidence: "map_matching" as const,
    nearestDistanceKm: 0,
    matchedNodeIds: [`node-${km}`],
    expectedNodeIds: [`node-${km}`],
    windowPointCount: 10,
    message: "confirmed",
  }));
  return {
    source: "Valhalla local PVP map matching + strict route traversal fallback",
    candidateRadiusKm: 1.5,
    windowHalfKm: 4,
    candidateCount: kms.length,
    checkedCandidateCount: kms.length,
    confirmedCount: kms.length,
    rejectedCount: 0,
    unknownCount: 0,
    complete: true,
    events: [],
    checks,
    elapsedMs: 0,
    message: "fixture",
  };
}

const northbound = [71, 133, 228, 322, 355, 416, 515, 545, 620, 636, 803, 911, 1046, 1093, 1184, 1223];

test("full Moscow—Krasnodar corridor uses the published route tariff on weekdays and weekends", () => {
  assert.deepEqual(fullM4RouteTariff(validation(northbound), "2026-10-08T10:00:00+03:00"), {
    weekdayAmount: 5040,
    weekendAmount: 6090,
    amount: 5040,
  });
  assert.deepEqual(fullM4RouteTariff(validation([...northbound].reverse()), "2026-10-09T10:00:00+03:00"), {
    weekdayAmount: 5040,
    weekendAmount: 6090,
    amount: 6090,
  });
});

test("a partial M-4 route does not receive the full-corridor fare", () => {
  assert.equal(fullM4RouteTariff(validation([515, 545, 620, 636, 803, 911, 1046, 1093, 1184, 1223]), "2026-10-09T10:00:00+03:00"), null);
  assert.equal(fullM4RouteTariff(validation([71, 133, 228, 322, 355, 416, 515]), "2026-10-08T10:00:00+03:00"), null);
});
