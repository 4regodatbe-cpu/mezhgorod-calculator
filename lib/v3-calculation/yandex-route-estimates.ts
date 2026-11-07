import type { Point } from "@/lib/route-providers";

type AcceptedEstimate = {
  id: string;
  from: readonly [number, number];
  to: readonly [number, number];
  meters: number;
  rub: number;
  capturedOn: string;
};

// These are directional whole-route observations from the Yandex Maps fastest
// route cards. They must never be added to individual road components.
const ACCEPTED_ESTIMATES: readonly AcceptedEstimate[] = [
  { id: "spb-to-krasnodar", from: [30.314494, 59.938676], to: [38.975313, 45.035470], meters: 2_076_050, rub: 11_325, capturedOn: "2026-10-15" },
  { id: "krasnodar-to-spb", from: [38.975313, 45.035470], to: [30.314494, 59.938676], meters: 2_060_000, rub: 10_240, capturedOn: "2026-10-15" },
  { id: "zsd-blagodatnaya-to-primorsky", from: [30.324797, 59.876052], to: [30.244964, 59.983693], meters: 22_531, rub: 600, capturedOn: "2026-10-15" },
  { id: "zsd-primorsky-to-blagodatnaya", from: [30.244964, 59.983693], to: [30.324797, 59.876052], meters: 23_496, rub: 900, capturedOn: "2026-10-15" },
  { id: "kazan-to-moscow", from: [49.106414, 55.796127], to: [37.617644, 55.755819], meters: 853_950, rub: 4_400, capturedOn: "2026-10-15" },
];

const EARTH_RADIUS_METERS = 6_371_000;
const ENDPOINT_TOLERANCE_METERS = 75;
const ROUTE_DISTANCE_TOLERANCE = 0.05;

function distanceMeters(a: readonly [number, number], b: readonly [number, number]): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const [lngA, latA] = a.map(toRadians);
  const [lngB, latB] = b.map(toRadians);
  const deltaLat = latB - latA;
  const deltaLng = lngB - lngA;
  const haversine = Math.sin(deltaLat / 2) ** 2
    + Math.cos(latA) * Math.cos(latB) * Math.sin(deltaLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(haversine));
}

function pointCoordinate(point: Point | undefined): readonly [number, number] | null {
  const position = point?.position;
  if (!position || !Number.isFinite(position.lng) || !Number.isFinite(position.lat)) return null;
  return [position.lng, position.lat];
}

export function acceptedYandexRouteEstimate(input: {
  from: Point | undefined;
  to: Point | undefined;
  meters: number;
  departureAt: string;
}) {
  const from = pointCoordinate(input.from);
  const to = pointCoordinate(input.to);
  if (!from || !to || !Number.isFinite(input.meters) || input.meters <= 0) return null;
  const serviceDate = input.departureAt.slice(0, 10);
  return ACCEPTED_ESTIMATES.find((estimate) => {
    if (estimate.capturedOn !== serviceDate) return false;
    const endpointsMatch = distanceMeters(from, estimate.from) <= ENDPOINT_TOLERANCE_METERS
      && distanceMeters(to, estimate.to) <= ENDPOINT_TOLERANCE_METERS;
    const distanceRatio = Math.abs(input.meters - estimate.meters) / estimate.meters;
    return endpointsMatch && distanceRatio <= ROUTE_DISTANCE_TOLERANCE;
  }) ?? null;
}

export function yandexRouteEstimateTolls(estimate: NonNullable<ReturnType<typeof acceptedYandexRouteEstimate>>) {
  const formatted = new Intl.NumberFormat("ru-RU").format(estimate.rub);
  return {
    amount: estimate.rub,
    weekdayAmount: estimate.rub,
    weekendAmount: estimate.rub,
    period: `оценка Яндекс Карт от ${estimate.capturedOn}`,
    confidence: "matched" as const,
    pricingStatus: "priced" as const,
    segments: [`Яндекс Карты · весь маршрут ${estimate.id}: ~${formatted} ₽`],
  };
}
