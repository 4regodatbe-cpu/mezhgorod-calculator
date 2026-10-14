import assert from "node:assert/strict";
import { estimateTolls } from "../lib/tolls.ts";
import { M12 } from "../lib/toll-data/m11-m12.ts";

function moscowToKazanP239Route(): [number, number][] {
  const route: [number, number][] = [[37.62, 55.76]];
  // The first 18 published adjacent prices end at Kazan (P239). The 19th
  // section is the separate Kazan—Shali span and is intentionally excluded.
  for (const section of M12.slice(0, 18)) {
    route.push(section.start, section.end);
  }
  return route;
}

for (const route of [moscowToKazanP239Route(), moscowToKazanP239Route().reverse()]) {
  const quote = estimateTolls(route, "2026-10-13T12:00:00+03:00");
  assert.equal(quote.weekdayAmount, 5847);
  assert.equal(quote.weekendAmount, 5847);
  assert.deepEqual(quote.segments, ["М-12: Москва — Казань"]);
}

console.log("M12_FULL_ROUTE_TARIFF_GREEN moscow-to-kazan-p239=5847 bothDirections=true shaliExcluded=true");
