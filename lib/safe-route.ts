import { resolveCorridor } from "./route-corridors";

export type RoutePosition = { lat: number; lng: number };
export type RoutePoint = { label: string; region?: string; position: RoutePosition };

// Existing public route-control point for Crimea Bridge routing.
export const CRIMEA_SAFE_GATEWAY: RoutePosition = { lat: 45.2117, lng: 36.7161 };

const SOUTH_COAST_MARKERS = [
  "адлер", "сочи", "туапсе", "джубг", "архипо-осипов", "геленджик", "кабардинк",
  "новороссийск", "анап", "витязев", "темрюк", "голубицк", "славянск-на-кубани",
  "славянск на кубани", "крымск", "горячий ключ", "краснодар",
];

const CRIMEA_MARKERS = [
  "крым", "севастопол", "симферопол", "ялта", "керч", "евпатори",
  "феодоси", "судак", "алушт", "джанко", "бахчисарай", "саки",
  "армянск", "красноперекопск",
];

function includesMarker(point: RoutePoint, markers: string[]) {
  const text = `${point.label} ${point.region ?? ""}`.toLocaleLowerCase("ru-RU").replace(/ё/g, "е");
  return markers.some((marker) => text.includes(marker));
}

function isSouthCoast(point: RoutePoint) {
  return includesMarker(point, SOUTH_COAST_MARKERS);
}

export function isCrimea(point: RoutePoint) {
  return includesMarker(point, CRIMEA_MARKERS);
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
  const southToSpecial = usesCrimeaCorridor && (isSouthCoast(from) || isSouthCoast(to));
  const ordinaryCrimeaMainland = decision.corridor === "normal" && fromCrimea !== toCrimea;
  const crimeaToEastern = usesEasternCorridor && (fromCrimea || toCrimea);

  if (southToSpecial || ordinaryCrimeaMainland || crimeaToEastern) {
    pushUnique(positions, CRIMEA_SAFE_GATEWAY);
  }

  // Corridor-specific static anchors were removed from route-corridors.ts.
  // Leave corridor selection to live routers instead of restoring unverified points.
  pushUnique(positions, to.position);
  return positions;
}
