import assert from "node:assert/strict";
import { calculateM11MoscowToPetersburg } from "../lib/toll-engine/m11-moscow-production.ts";

type C = [number, number];
const route: C[] = [
  [38.9753,45.0355],
  [37.472,55.8842],
  [37.0712818,56.1391684],
  [31.2534812,59.1976987],
  [30.3598352,59.7750977],
  [30.3351,59.9343],
];

const thursdayEvening = calculateM11MoscowToPetersburg(route, 26 * 3600, "2026-10-01T19:00:00+03:00");
assert.equal(thursdayEvening.exact, true);
assert.equal(thursdayEvening.tolls?.weekdayAmount, 5330);
assert.equal(thursdayEvening.tolls?.weekendAmount, 6590);
assert.ok((thursdayEvening.tolls?.amount ?? 0) >= 5330);
assert.ok(thursdayEvening.evidence.entryAt);
assert.ok(thursdayEvening.evidence.p58At);

const missingP593: C[] = [route[0], route[1], route[2], route[4], route[5]];
const incomplete = calculateM11MoscowToPetersburg(missingP593, 26 * 3600, "2026-10-01T19:00:00+03:00");
assert.equal(incomplete.exact, false);
assert.equal(incomplete.tolls, null);

const reversed = calculateM11MoscowToPetersburg([...route].reverse(), 26 * 3600, "2026-10-01T19:00:00+03:00");
assert.equal(reversed.exact, false);
assert.equal(reversed.tolls, null);

console.log("M11 Moscow production regression: GREEN; weekday=5330 weekend(max Fri-Sun)=6590 RUB");
