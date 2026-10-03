import { SPECIAL_TARIFF_RATES, type SpecialTariffRates } from "./route-corridors.ts";

export type PricingSegment = {
  distanceKm: number;
  tariffType: "normal" | "special";
};

export type RoutePricingResult = {
  segments: PricingSegment[];
  dualTariff: boolean;
  specialRates: SpecialTariffRates | null;
};

/**
 * V2 pricing model:
 * route selection decides where the special segment starts.
 * Pricing only consumes the resulting segments.
 */
export function buildPricingSegments(
  normalDistanceKm: number,
  specialDistanceKm: number,
): RoutePricingResult {
  const segments: PricingSegment[] = [];

  if (normalDistanceKm > 0) {
    segments.push({
      distanceKm: normalDistanceKm,
      tariffType: "normal",
    });
  }

  if (specialDistanceKm > 0) {
    segments.push({
      distanceKm: specialDistanceKm,
      tariffType: "special",
    });
  }

  return {
    segments,
    dualTariff: specialDistanceKm > 0,
    specialRates: specialDistanceKm > 0 ? SPECIAL_TARIFF_RATES : null,
  };
}
