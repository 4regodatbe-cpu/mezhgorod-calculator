import { resolveCorridor } from "@/lib/route-corridors";

export type RoutePosition = { lat: number; lng: number };
export type RoutePoint = { label: string; region?: string; position: RoutePosition };

// Западная часть Краснодарского края после Крымского моста.
// Эта обязательная точка не даёт маршрутизаторам увести поездку
// между Крымом и материком через другие сухопутные направления.
export const CRIMEA_SAFE_GATEWAY: RoutePosition = { lat: 45.2117, lng: 36.7161 };

const SOUTH_COAST_MARKERS = [\n  "адлер", "сочи", "туапсе", "джубг", "архипо-осипов", "геленджик", "кабардинк",\n  "новороссийск", "анап", "витязев", "темрюк", "голубицк", "славянск-на-кубани",\n  "славянск на кубани", "крымск", "горячий ключ", "краснодар",\n];\n\nconst CRIMEA_MARKERS = [
  "крым", "севастопол", "симферопол", "ялта", "керч", "евпатори",
  "феодоси", "судак", "алушт", "джанко", "бахчисарай", "саки",
  "армянск", "красноперекопск",
];

function isSouthCoast(point: RoutePoint) {\n  const text = `${point.label} ${point.region ?? ""}`.toLocaleLowerCase("ru-RU");\n  return SOUTH_COAST_MARKERS.some((marker) => text.includes(marker));\n}\n\nexport function isCrimea(point: RoutePoint) {
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
  const fromClass = territoryClass(from.label);
  const toClass = territoryClass(to.label);
  const positions: RoutePosition[] = [from.position];

  const usesCrimeaCorridor = decision.corridor === "crimea_dzhankoy" || decision.corridor === "crimea_armyansk";
  const usesEasternCorridor = decision.corridor === "m4_dnr" || decision.corridor === "m4_lnr";
  const southToSpecial = usesCrimeaCorridor && (isSouthCoast(from) || isSouthCoast(to));
  const ordinaryCrimeaMainland = decision.corridor === "normal" && fromCrimea !== toCrimea;
  const crimeaToEastern = usesEasternCorridor && (fromCrimea || toCrimea);

  // South-coast -> southwest-special routes enter Crimea over the Crimean Bridge.
  // Crimea -> southwest-special routes already start north/west of that bridge and
  // must not be sent backwards over it.
  if (southToSpecial || ordinaryCrimeaMainland || crimeaToEastern) {
    pushUnique(positions, CRIMEA_SAFE_GATEWAY);
  }

  const anchor = corridorAnchor(decision);
  if (anchor) pushUnique(positions, anchor);

  pushUnique(positions, to.position);
  return positions;
}
