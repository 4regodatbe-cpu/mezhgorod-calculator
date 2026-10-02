import { corridorAnchor, resolveCorridor } from "@/lib/route-corridors";

export type RoutePosition = { lat: number; lng: number };
export type RoutePoint = { label: string; region?: string; position: RoutePosition };

// Западная часть Краснодарского края после Крымского моста.
// Эта обязательная точка не даёт маршрутизаторам увести поездку
// между Крымом и материком через другие сухопутные направления.
export const CRIMEA_SAFE_GATEWAY: RoutePosition = { lat: 45.2117, lng: 36.7161 };

const CRIMEA_MARKERS = [
  "крым", "севастопол", "симферопол", "ялта", "керч", "евпатори",
  "феодоси", "судак", "алушт", "джанко", "бахчисарай", "саки",
  "армянск", "красноперекопск",
];

export function isCrimea(point: RoutePoint) {
  const text = `${point.label} ${point.region ?? ""}`.toLocaleLowerCase("ru-RU");
  return CRIMEA_MARKERS.some((marker) => text.includes(marker));
}

function samePosition(a: RoutePosition, b: RoutePosition) {
  return Math.abs(a.lat - b.lat) < 0.00001 && Math.abs(a.lng - b.lng) < 0.00001;
}

function pushUnique(list: RoutePosition[], point: RoutePosition) {
  if (!list.some((item) => samePosition(item, point))) list.push(point);
}

export function safeRoutePositions(from: RoutePoint, to: RoutePoint) {
  const decision = resolveCorridor(from.label, to.label);
  const fromCrimea = isCrimea(from);
  const toCrimea = isCrimea(to);
  const positions: RoutePosition[] = [from.position];

  const usesCrimeaCorridor = decision.corridor === "crimea_dzhankoy" || decision.corridor === "crimea_armyansk";
  const usesEasternCorridor = decision.corridor === "m4_dnr" || decision.corridor === "m4_lnr";

  // Any route that enters/leaves Crimea, plus an explicitly selected Crimea
  // corridor from the southern zone, must use the Crimean Bridge gateway.
  if (fromCrimea !== toCrimea || usesCrimeaCorridor || (usesEasternCorridor && (fromCrimea || toCrimea))) {
    pushUnique(positions, CRIMEA_SAFE_GATEWAY);
  }

  const anchor = corridorAnchor(decision);
  if (anchor) pushUnique(positions, anchor);

  pushUnique(positions, to.position);
  return positions;
}
