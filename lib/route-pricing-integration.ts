import { buildPricingSegments, type PricingSegment } from "./route-pricing-segments.ts";
import { resolveCorridor, type CorridorDecision } from "./route-corridors.ts";

export type PricingVehicle = "standard" | "comfort" | "comfort_plus" | "minivan";

export type PricedSegment = PricingSegment & {
  type: PricingSegment["tariffType"];
  from: string;
  to: string;
  ratePerKm: number;
  amount: number;
  reason: string;
  reviewRequired: boolean;
};

const NORMAL_RATES: Record<PricingVehicle, [number, number, number]> = {
  standard: [35, 32, 30],
  comfort: [40, 35, 32.5],
  comfort_plus: [45, 37, 35],
  minivan: [55, 50, 45],
};

const VEHICLE_RATE_KEY: Record<PricingVehicle, keyof NonNullable<CorridorDecision["specialRates"]>> = {
  standard: "standard",
  comfort: "comfort",
  comfort_plus: "comfortPlus",
  minivan: "minivan",
};

function normalRate(vehicle: PricingVehicle, distanceKm: number) {
  const rates = NORMAL_RATES[vehicle];
  if (distanceKm <= 200) return rates[0];
  if (distanceKm <= 500) return rates[1];
  return rates[2];
}

export function calculateRoutePricing(input: {
  legs: Array<{ from: string; to: string; distanceKm: number }>;
  from: string;
  to: string;
  vehicle?: PricingVehicle;
}) {
  const vehicle = input.vehicle ?? "comfort";
  const corridor = resolveCorridor(input.from, input.to);
  const pricingSegments: PricedSegment[] = [];

  for (const leg of input.legs) {
    const distanceKm = Math.max(0, Math.round(leg.distanceKm * 10) / 10);
    if (distanceKm === 0) continue;

    const decision = resolveCorridor(leg.from, leg.to);
    // "manual_review" is intentionally not charged at the special rate until
    // its route policy has been verified against a benchmark.
    const special = decision.autoDual && decision.corridor !== "manual_review"
      && decision.specialRates !== null;
    const descriptors = buildPricingSegments(
      special ? 0 : distanceKm,
      special ? distanceKm : 0,
    );

    for (const descriptor of descriptors.segments) {
      const ratePerKm = descriptor.tariffType === "special"
        ? decision.specialRates![VEHICLE_RATE_KEY[vehicle]]
        : normalRate(vehicle, descriptor.distanceKm);
      pricingSegments.push({
        ...descriptor,
        type: descriptor.tariffType,
        from: leg.from,
        to: leg.to,
        ratePerKm,
        amount: Math.round(descriptor.distanceKm * ratePerKm),
        reason: descriptor.tariffType === "special"
          ? decision.reason
          : decision.corridor === "manual_review"
            ? "Требуется проверка коридора; применён обычный тариф"
            : "Обычный участок маршрута",
        reviewRequired: decision.corridor === "manual_review",
      });
    }
  }

  return {
    corridor: { id: corridor.corridor },
    dualTariff: pricingSegments.some((segment) => segment.tariffType === "special"),
    pricingSegments,
    totalPrice: pricingSegments.reduce((sum, segment) => sum + segment.amount, 0),
    reviewRequired: pricingSegments.some((segment) => segment.reviewRequired),
  };
}
