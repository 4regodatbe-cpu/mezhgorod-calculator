import test from "node:test";
import assert from "node:assert/strict";
import {
  confirmedFreeToll,
  currentTollPeriod,
  displayQuote,
  resolveTollAmount,
  shortPlaceName,
  totalWithToll,
  unverifiedToll,
} from "../app/v2/components/quote-presentation.ts";
import type { TollView } from "../app/v2/components/types.ts";

const changingToll: TollView = {
  amount: 6090,
  weekdayAmount: 6090,
  weekendAmount: 8400,
  period: "weekday",
  segments: ["M-4"],
  confidence: "matched",
  pricingStatus: "priced",
};

test("current quote period uses the Europe/Moscow weekday", () => {
  assert.equal(currentTollPeriod(new Date("2026-10-04T21:35:00.000Z")), "weekday");
  assert.equal(currentTollPeriod(new Date("2026-10-08T21:30:00.000Z")), "weekend");
});

test("short copy labels retain the city and remove longer address details", () => {
  assert.equal(shortPlaceName("Краснодар, городской округ Краснодар, Краснодарский край, Россия"), "Краснодар");
  assert.equal(shortPlaceName("г. Москва, Россия"), "Москва");
  assert.equal(shortPlaceName("город Москва, Россия"), "Москва");
});

test("weekday and weekend toll selection drives every fare total", () => {
  const weekday = resolveTollAmount(changingToll, "weekday");
  const weekend = resolveTollAmount(changingToll, "weekend");
  assert.equal(weekday.amount, 6090);
  assert.equal(weekend.amount, 8400);
  assert.equal(totalWithToll(33855, weekday), 39945);
  assert.equal(totalWithToll(33855, weekend), 42255);
});

test("unknown tolls stay unknown and confirmed-free routes get an explicit zero", () => {
  assert.equal(resolveTollAmount(unverifiedToll, "weekday").amount, null);
  assert.equal(resolveTollAmount(undefined, "weekday").amount, null);
  assert.equal(totalWithToll(33855, resolveTollAmount(unverifiedToll, "weekday")), null);
  assert.equal(resolveTollAmount(confirmedFreeToll, "weekday").amount, 0);
  assert.equal(totalWithToll(33855, resolveTollAmount(confirmedFreeToll, "weekday")), 33855);
});

test("manual toll override is applied to totals without treating it as provider evidence", () => {
  const manual = resolveTollAmount(unverifiedToll, "weekday", "2750");
  assert.equal(manual.status, "manual");
  assert.equal(totalWithToll(33855, manual), 36605);
});

test("displayed whole-ruble components add up to the displayed total", () => {
  assert.equal(totalWithToll(100.6, { status: "priced", amount: 0.6 }), 102);
});


test("unknown toll shows a base-only amount and never a complete trip total", () => {
  assert.deepEqual(displayQuote(44946, resolveTollAmount(unverifiedToll, "weekday")), {
    kind: "base-only",
    label: "Итого без дорог",
    amount: 44946,
  });
  assert.deepEqual(displayQuote(44946, { status: "unknown", amount: 0 }), {
    kind: "base-only",
    label: "Итого без дорог",
    amount: 44946,
  });
});

test("confirmed-free and priced tolls show a complete trip total", () => {
  assert.deepEqual(displayQuote(44946, resolveTollAmount(confirmedFreeToll, "weekday")), {
    kind: "complete",
    label: "Итого за поездку",
    amount: 44946,
  });
  assert.deepEqual(displayQuote(44946, resolveTollAmount(changingToll, "weekday")), {
    kind: "complete",
    label: "Итого за поездку",
    amount: 51036,
  });
});
