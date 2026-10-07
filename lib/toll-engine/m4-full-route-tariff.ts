import type { M4RoutePlazaValidation } from "@/lib/toll-engine/m4-route-validator";
import { highwayTariffPeriod } from "@/lib/toll-engine/tariff-period";
import { FULL_ROUTES } from "@/lib/toll-data";

/**
 * Avtodor's published no-transponder category-I total for the full
 * Moscow—Krasnodar M-4 corridor, effective 2026-03-02. This is a route-level
 * tariff: summing independently stored plaza tariffs overcharges this known
 * complete corridor (in particular when route matching confirms parallel
 * gates/sections separately).
 */
const MOSCOW_KRASNODAR = FULL_ROUTES.find((route) => route.name === "М-4: Москва — Краснодар");
const NORTH_GATE_KMS = new Set([62, 71]);
const SOUTH_GATE_KMS = new Set([1223]);
const MIN_CONFIRMED_PLAZAS = 8;

export function fullM4RouteTariff(validation: M4RoutePlazaValidation, departureAt?: string) {
  const sequence = validation.checks
    .filter((item) => item.status === "confirmed")
    .map((item) => item.km);
  if (new Set(sequence).size < MIN_CONFIRMED_PLAZAS) return null;

  const northAt = sequence.findIndex((km) => NORTH_GATE_KMS.has(km));
  const southAt = sequence.findIndex((km) => SOUTH_GATE_KMS.has(km));
  if (northAt < 0 || southAt < 0 || northAt === southAt) return null;

  const spansFullCorridor = northAt < southAt
    ? sequence.slice(northAt + 1, southAt).some((km) => km > 71 && km < 1223)
    : sequence.slice(southAt + 1, northAt).some((km) => km > 71 && km < 1223);
  if (!spansFullCorridor) return null;
  if (!MOSCOW_KRASNODAR) return null;

  const weekend = highwayTariffPeriod(departureAt).weekend;
  return {
    weekdayAmount: MOSCOW_KRASNODAR.weekday,
    weekendAmount: MOSCOW_KRASNODAR.weekend,
    amount: weekend ? MOSCOW_KRASNODAR.weekend : MOSCOW_KRASNODAR.weekday,
  };
}
