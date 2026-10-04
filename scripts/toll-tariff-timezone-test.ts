import test from "node:test";
import assert from "node:assert/strict";
import { highwayTariffPeriod } from "../lib/toll-engine/tariff-period.ts";

test("M-4/A-289 tariff period uses Moscow calendar day at UTC day boundary", () => {
  const sundayLateUtc = highwayTariffPeriod("2026-10-04T20:30:00.000Z");
  assert.equal(sundayLateUtc.weekend, true);
  assert.equal(sundayLateUtc.period, "пятница–воскресенье");

  // 21:30 UTC is 00:30 Monday in Moscow; the Vercel host's UTC Sunday must not win.
  const mondayEarlyMoscow = highwayTariffPeriod("2026-10-04T21:30:00.000Z");
  assert.equal(mondayEarlyMoscow.weekend, false);
  assert.equal(mondayEarlyMoscow.period, "понедельник–четверг");
});

test("Moscow Friday start belongs to weekend tariff period", () => {
  const fridayLateUtc = highwayTariffPeriod("2026-10-02T20:30:00.000Z");
  assert.equal(fridayLateUtc.weekend, true);
});
