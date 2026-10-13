import { buildPricingSegments, type PricingSegment } from "./route-pricing-segments.ts";
import type { TerritorySplit } from "./special-territory-geometry.ts";
export type PricingVehicle = "standard" | "comfort" | "comfort_plus" | "minivan";
export type PricedSegment = PricingSegment & { type: PricingSegment["tariffType"]; from: string; to: string; ratePerKm: number; amount: number; reason: string; reviewRequired: boolean };
const NORMAL_RATES: Record<PricingVehicle, [number, number, number]> = { standard: [35,32,30], comfort: [40,35,32.5], comfort_plus: [45,37,35], minivan: [55,50,45] };
export const SPECIAL_RATES: Record<PricingVehicle, number> = { standard:70, comfort:80, comfort_plus:90, minivan:110 };
export function calculateRoutePricing(input: {
  legs: Array<{ from: string; to: string; distanceKm: number; territorySplit?: TerritorySplit }>;
  from: string; to: string; vehicle?: PricingVehicle;
  normalRateOverrides?: Partial<Record<PricingVehicle, number>>;
  specialRateOverrides?: Partial<Record<PricingVehicle, number>>;
  manualRateByLeg?: Array<number | null | undefined>;
  mode?: "standard" | "dual"; multiplier?: number;
}) {
  const vehicle = input.vehicle ?? "comfort";
  const multiplier = Number.isFinite(input.multiplier) && input.multiplier! >= 1 && input.multiplier! <= 6 ? input.multiplier! : 1;
  // Text labels never establish a tariff zone. Missing geometry is not a normal-zone result.
  let incomplete = !NORMAL_RATES[vehicle] || input.legs.length === 0 || input.legs.some(leg => {
    const split = leg.territorySplit;
    return !split || !Number.isFinite(leg.distanceKm) || leg.distanceKm <= 0 ||
      !Number.isFinite(split.ordinaryKm) || !Number.isFinite(split.specialKm) ||
      split.ordinaryKm < 0 || split.specialKm < 0 ||
      Math.abs(split.ordinaryKm + split.specialKm - leg.distanceKm) > Math.max(1e-9,leg.distanceKm*1e-12);
  });
  const pricingSegments: PricedSegment[] = [];
  const unroundedAmounts: number[] = [];
  if (!incomplete) for (const [i, leg] of input.legs.entries()) {
    const split = leg.territorySplit!;
    const specialKm = input.mode === "standard" ? 0 : Math.min(leg.distanceKm, split.specialKm);
    const normalKm = leg.distanceKm - specialKm;
    for (const descriptor of buildPricingSegments(normalKm, specialKm).segments) {
      const special = descriptor.tariffType === "special";
      const fallback = NORMAL_RATES[vehicle][normalKm <= 200 ? 0 : normalKm <= 500 ? 1 : 2];
      const override = special ? input.specialRateOverrides?.[vehicle] : input.manualRateByLeg?.[i] ?? input.normalRateOverrides?.[vehicle];
      const ratePerKm = Number.isFinite(override) && override! >= 1 && override! <= 10000 ? override! : special ? SPECIAL_RATES[vehicle] : fallback;
      const rawAmount = descriptor.distanceKm * ratePerKm * multiplier;
      unroundedAmounts.push(rawAmount);
      pricingSegments.push({ ...descriptor, type: descriptor.tariffType, from: leg.from, to: leg.to, ratePerKm, amount: 0, reason: special ? "Пробег внутри особых тарифных зон" : "Обычный тариф", reviewRequired: false });
    }
  }
  const rawTotal = unroundedAmounts.reduce((sum,amount)=>sum+amount,0);
  if (!unroundedAmounts.every(amount=>Number.isFinite(amount)&&amount>=0&&amount<=Number.MAX_SAFE_INTEGER)
    || !Number.isSafeInteger(Math.round(rawTotal))) incomplete = true;
  if (incomplete) pricingSegments.length = 0;
  else {
    // Round the fare once, then distribute integer rubles deterministically so
    // displayed parts add up to the exact same displayed trip total.
    const fractions = unroundedAmounts.map((amount,index)=>({index,fraction:amount-Math.floor(amount)}))
      .sort((a,b)=>b.fraction-a.fraction||a.index-b.index);
    for (const [index,amount] of unroundedAmounts.entries()) pricingSegments[index].amount=Math.floor(amount);
    const remainder = Math.round(rawTotal)-pricingSegments.reduce((sum,segment)=>sum+segment.amount,0);
    for (let index=0;index<remainder;index++) pricingSegments[fractions[index].index].amount++;
  }
  return { corridor: { id: "geometry" }, dualTariff: pricingSegments.some(s => s.type === "special"), pricingSegments, totalPrice: incomplete ? null : pricingSegments.reduce((sum,s) => sum+s.amount,0), reviewRequired: incomplete, requiresSplit: incomplete, multiplier };
}
