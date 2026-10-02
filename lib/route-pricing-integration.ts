import { buildPricingSegments, totalSegmentPrice, type VehicleTariff, type PricingSegment } from "@/lib/route-pricing-segments";
import { resolveCorridor, type RouteCorridor } from "@/lib/route-corridors";

export type RoutePricingResult = {
  corridor: RouteCorridor | null;
  dualTariff: boolean;
  pricingSegments: PricingSegment[];
  totalPrice: number;
};

export function calculateRoutePricing(input: {
  from: string;
  to: string;
  distanceKm: number;
  vehicle?: VehicleTariff;
  specialDistanceKm?: number;
}): RoutePricingResult {
  const vehicle = input.vehicle ?? "comfort";
  const corridor = resolveCorridor(input.from, input.to);

  const pricingSegments = buildPricingSegments({
    distanceKm: input.distanceKm,
    vehicle,
    specialDistanceKm: corridor?.specialRateEnabled ? input.specialDistanceKm : 0,
  });

  return {
    corridor,
    dualTariff: pricingSegments.some((segment) => segment.type === "special"),
    pricingSegments,
    totalPrice: totalSegmentPrice(pricingSegments),
  };
}
