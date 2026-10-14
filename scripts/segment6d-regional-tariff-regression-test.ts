import assert from "node:assert/strict";
import { estimateTolls } from "../lib/tolls.ts";

const eastbound = [[49.09, 53.56], [49.27, 53.51], [49.48, 53.45]] as [number, number][];
const westbound = [...eastbound].reverse();

for (const route of [eastbound, westbound]) {
  const weekday = estimateTolls(route, "2026-10-13T12:00:00+03:00");
  const weekend = estimateTolls(route, "2026-10-17T12:00:00+03:00");
  assert.equal(weekday.weekdayAmount, 320, "category-I full Tolyatti span is 320 RUB");
  assert.equal(weekend.weekendAmount, 320, "category-I full Tolyatti span is 320 RUB all days");
  assert.deepEqual(weekday.segments, ["Обход Тольятти"]);
}

console.log("REGIONAL_TARIFF_REGRESSION_GREEN tolyatti=320 bothDirections=true");
