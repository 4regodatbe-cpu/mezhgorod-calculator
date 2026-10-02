export type PricingSegmentType = "normal" | "special";

export type VehicleTariff = "standard" | "comfort" | "comfort_plus" | "minivan";

export type PricingSegment = {
  type: PricingSegmentType;
  distanceKm: number;
  tariff: VehicleTariff;
  ratePerKm: number;
  amount: number;
  reason: string;
};

export const SPECIAL_RATES: Record<VehicleTariff, number> = {
  standard: 70,
  comfort: 80,
  comfort_plus: 90,
  minivan: 110,
};

const NORMAL_RATES: Record<VehicleTariff, number[]> = {
  standard: [35, 32, 30],
  comfort: [40, 35, 32.5],
  comfort_plus: [45, 37, 35],
  minivan: [55, 50, 45],
};

export function normalRate(vehicle: VehicleTariff, distanceKm: number) {
  const rates = NORMAL_RATES[vehicle];
  if (distanceKm <= 200) return rates[0];
  if (distanceKm <= 500) return rates[1];
  return rates[2];
}

export function buildPricingSegments(input: {
  distanceKm: number;
  vehicle: VehicleTariff;
  specialDistanceKm?: number;
}): PricingSegment[] {
  const specialKm = Math.max(0, Math.min(input.specialDistanceKm ?? 0, input.distanceKm));
  const normalKm = input.distanceKm - specialKm;
  const segments: PricingSegment[] = [];

  if (normalKm > 0) {
    const rate = normalRate(input.vehicle, normalKm);
    segments.push({
      type: "normal",
      distanceKm: normalKm,
      tariff: input.vehicle,
      ratePerKm: rate,
      amount: Math.round(normalKm * rate),
      reason: "Обычный участок маршрута",
    });
  }

  if (specialKm > 0) {
    const rate = SPECIAL_RATES[input.vehicle];
    segments.push({
      type: "special",
      distanceKm: specialKm,
      tariff: input.vehicle,
      ratePerKm: rate,
      amount: Math.round(specialKm * rate),
      reason: "Специальный коридор",
    });
  }

  return segments;
}

export function totalSegmentPrice(segments: PricingSegment[]) {
  return segments.reduce((sum, segment) => sum + segment.amount, 0);
}
