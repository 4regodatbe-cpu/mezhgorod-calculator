import test from "node:test";
import assert from "node:assert/strict";
import { priceM4TollEvents } from "../lib/toll-engine/m4-engine.ts";

const event = (osmNodeId: string, edgeIndex: number) => ({
  osmNodeId,
  wayId: "m4-way",
  roadNames: ["М-4 Дон"],
  edgeIndex,
  edgeToll: true,
});

test("M-4 priced plaza breakdown preserves ID, selected tariff, direction truth and deduplicates same plaza", () => {
  const weekday = priceM4TollEvents([event("285903913", 1), event("3036681110", 2)], "2026-10-08T10:00:00+03:00");
  assert.equal(weekday.status, "priced");
  assert.equal(weekday.amount, 400);
  assert.equal(weekday.pricedPlazas.length, 1);
  assert.deepEqual(weekday.pricedPlazas[0], {
    id: "m4-71",
    km: 71,
    direction: "unknown",
    weekday: 400,
    weekend: 500,
    selectedAmount: 400,
    verification: "exact_name",
    matchedNodeIds: ["285903913", "3036681110"],
    source: "OSM name + Avtodor",
  });

  const weekend = priceM4TollEvents([event("285903913", 1)], "2026-10-09T10:00:00+03:00");
  assert.equal(weekend.pricedPlazas[0]?.selectedAmount, 500);
});
