import { distance, durationWithDays, money } from "../../v2/components/format";
import { tariffNames } from "../../v2/components/pricing-data";
import { resolveTollAmount, shortPlaceName, type TollPeriod } from "../../v2/components/quote-presentation";
import type { Leg, TollView, Trip } from "../../v2/components/types";

export function roundFareForCopy(value: number): number {
  const rubles = Math.round(value);
  const thousands = Math.floor(rubles / 1000) * 1000;
  const rest = rubles - thousands;
  return thousands + (rest < 200 ? 0 : rest < 700 ? 500 : 1000);
}

export function buildV3Copy(leg: Leg, trip: Trip, toll: TollView | undefined, period: TollPeriod, manualToll?: string, fareOnly = false): string {
  const lines = [`${shortPlaceName(leg.from)} → ${shortPlaceName(leg.to)}`, `${distance(trip.meters)} · ${durationWithDays(trip.seconds)}`, ""];
  const classes = [["standard", "standard"], ["comfort", "comfort"], ["comfortPlus", "comfort_plus"], ["minivan", "minivan"]] as const;
  for (const [rate, vehicle] of classes) {
    const price = trip.pricingByVehicle?.[vehicle];
    const amount = price && !price.requiresSplit ? price.totalPrice : null;
    lines.push(`${tariffNames[rate]}: ${typeof amount === "number" && Number.isFinite(amount) && amount >= 0 ? money(roundFareForCopy(amount)) : "Не рассчитано"}`);
  }
  if (!fareOnly) {
    const resolved = resolveTollAmount(toll, period, manualToll);
    if (resolved.status !== "free" && !(resolved.status === "manual" && resolved.amount === 0)) {
      lines.push("");
      if (resolved.amount !== null && resolved.amount > 0) lines.push(`Ориентировочная стоимость платных дорог: ${money(resolved.amount)}`);
      lines.push("Платные дороги оплачиваются отдельно.");
    }
  }
  return lines.join("\n");
}
