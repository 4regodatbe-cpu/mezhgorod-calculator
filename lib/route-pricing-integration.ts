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
  const incomplete = input.legs.some(leg => !leg.territorySplit || !Number.isFinite(leg.distanceKm) || leg.distanceKm <= 0 || Math.abs(leg.territorySplit.ordinaryKm + leg.territorySplit.specialKm - leg.distanceKm) > 0.001);
  const pricingSegments: PricedSegment[] = [];
  if (!incomplete) for (const [i, leg] of input.legs.entries()) {
    const split = leg.territorySplit!;
    const specialKm = input.mode === "standard" ? 0 : split.specialKm;
    const normalKm = leg.distanceKm - specialKm;
    for (const descriptor of buildPricingSegments(normalKm, specialKm).segments) {
      const special = descriptor.tariffType === "special";
      const fallback = NORMAL_RATES[vehicle][normalKm <= 200 ? 0 : normalKm <= 500 ? 1 : 2];
      const override = special ? input.specialRateOverrides?.[vehicle] : input.manualRateByLeg?.[i] ?? input.normalRateOverrides?.[vehicle];
      const ratePerKm = Number.isFinite(override) && override! >= 1 && override! <= 10000 ? override! : special ? SPECIAL_RATES[vehicle] : fallback;
      pricingSegments.push({ ...descriptor, type: descriptor.tariffType, from: leg.from, to: leg.to, ratePerKm, amount: Math.round(descriptor.distanceKm * ratePerKm * multiplier), reason: special ? "Пробег внутри особых тарифных зон" : "Обычный тариф", reviewRequired: false });
    }
  }
  return { corridor: { id: "geometry" }, dualTariff: pricingSegments.some(s => s.type === "special"), pricingSegments, totalPrice: incomplete ? null : pricingSegments.reduce((sum,s) => sum+s.amount,0), reviewRequired: incomplete, requiresSplit: incomplete, multiplier };
}
