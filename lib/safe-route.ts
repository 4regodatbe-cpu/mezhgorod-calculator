export type RoutePosition = { lat: number; lng: number };
export type RoutePoint = { label: string; region?: string; position: RoutePosition };

// Западная часть Краснодарского края после Крымского моста.
// Эта обязательная точка не даёт маршрутизаторам увести поездку
// между Крымом и материком через новые территории.
export const CRIMEA_SAFE_GATEWAY: RoutePosition = { lat: 45.2117, lng: 36.7161 };

const CRIMEA_MARKERS = [
  "крым", "севастопол", "симферопол", "ялта", "керч", "евпатори",
  "феодоси", "судак", "алушт", "джанко", "бахчисарай", "саки",
];

export function isCrimea(point: RoutePoint) {
  const text = `${point.label} ${point.region ?? ""}`.toLocaleLowerCase("ru-RU");
  return CRIMEA_MARKERS.some((marker) => text.includes(marker));
}

export function safeRoutePositions(from: RoutePoint, to: RoutePoint) {
  const fromCrimea = isCrimea(from);
  const toCrimea = isCrimea(to);
  if (fromCrimea === toCrimea) return [from.position, to.position];
  return [from.position, CRIMEA_SAFE_GATEWAY, to.position];
}
