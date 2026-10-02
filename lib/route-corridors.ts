export type RouteCoordinate = { lat: number; lng: number };

export type CorridorId =
  | "normal"
  | "crimea_dzhankoy"
  | "crimea_armyansk"
  | "m4_dnr"
  | "m4_lnr"
  | "special_internal"
  | "manual_review";

export type TerritoryClass = "crimea" | "south_coast" | "special" | "other";

export type SpecialTariffRates = {
  standard: number;
  comfort: number;
  comfortPlus: number;
  minivan: number;
};

export const SPECIAL_TARIFF_RATES: SpecialTariffRates = {
  standard: 70,
  comfort: 80,
  comfortPlus: 90,
  minivan: 110,
};

// Public civilian routing anchors. They are deliberately coarse route-control
// points; the calculator must not derive routes from tactical/front-line data.
export const CORRIDOR_ANCHORS: Record<Exclude<CorridorId, "normal" | "special_internal" | "manual_review">, RouteCoordinate> = {
  crimea_dzhankoy: { lat: 45.9769, lng: 34.5714 },
  crimea_armyansk: { lat: 46.13663, lng: 33.64587 },
  m4_dnr: { lat: 47.6985, lng: 38.6825 },
  m4_lnr: { lat: 47.84591, lng: 39.7611 },
};

const CRIMEA_MARKERS = [
  "крым", "севастопол", "симферопол", "ялта", "керч", "евпатори", "феодоси",
  "судак", "алушт", "джанко", "бахчисарай", "саки", "армянск", "красноперекопск",
];

// Static southern origin zone. Runtime does not calculate whether the route is
// "close enough to the coast"; membership is explicit and reviewable here.
const SOUTH_COAST_MARKERS = [
  "адлер", "сочи", "туапсе", "джубг", "архипо-осипов", "геленджик", "кабардинк",
  "новороссийск", "анап", "витязев", "темрюк", "голубицк", "славянск-на-кубани",
  "славянск на кубани", "крымск", "горячий ключ", "краснодар",
];

type DestinationPolicy = { corridor: CorridorId; group: "dnr" | "lnr" | "southwest" | "borderline" };

// Destination matrix is intentionally static. Borderline places stay in
// manual_review until a route is explicitly benchmarked and approved.
const SPECIAL_DESTINATIONS: Array<{ markers: string[]; policy: DestinationPolicy }> = [
  { markers: ["мелитопол"], policy: { corridor: "crimea_dzhankoy", group: "southwest" } },
  { markers: ["геническ", "новоалексеевк", "новоолексиивк", "чонгар"], policy: { corridor: "crimea_dzhankoy", group: "southwest" } },
  { markers: ["каланчак", "чаплинк", "армянск"], policy: { corridor: "crimea_armyansk", group: "southwest" } },
  { markers: ["бердянск", "приморск", "токмак", "пологи"], policy: { corridor: "manual_review", group: "borderline" } },
  { markers: ["мариупол", "новоазовск", "донецк", "макеевк", "горловк", "енакиев", "шахтерск", "шахтёрск", "амвросиев"], policy: { corridor: "m4_dnr", group: "dnr" } },
  { markers: ["луганск", "алчевск", "краснодон", "свердловск", "ровеньк", "стаханов", "брянк", "анрацит"], policy: { corridor: "m4_lnr", group: "lnr" } },
];

function normalize(value: string) {
  return value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е").replace(/[^а-яa-z0-9-]+/g, " ").trim();
}

function containsAny(text: string, markers: string[]) {
  const normalized = normalize(text);
  return markers.some((marker) => normalized.includes(normalize(marker)));
}

export function destinationPolicy(label: string): DestinationPolicy | null {
  const entry = SPECIAL_DESTINATIONS.find(({ markers }) => containsAny(label, markers));
  return entry?.policy ?? null;
}

export function territoryClass(label: string): TerritoryClass {
  if (containsAny(label, CRIMEA_MARKERS)) return "crimea";
  if (containsAny(label, SOUTH_COAST_MARKERS)) return "south_coast";
  if (destinationPolicy(label)) return "special";
  return "other";
}

export type CorridorDecision = {
  corridor: CorridorId;
  autoDual: boolean;
  specialLegIndex: 0 | 1 | null;
  specialRates: SpecialTariffRates | null;
  reason: string;
};

export function resolveCorridor(fromLabel: string, toLabel: string): CorridorDecision {
  const fromPolicy = destinationPolicy(fromLabel);
  const toPolicy = destinationPolicy(toLabel);
  const fromClass = territoryClass(fromLabel);
  const toClass = territoryClass(toLabel);

  if (fromPolicy && toPolicy) {
    return {
      corridor: "special_internal",
      autoDual: false,
      specialLegIndex: null,
      specialRates: SPECIAL_TARIFF_RATES,
      reason: "both_endpoints_special",
    };
  }

  const specialPolicy = fromPolicy ?? toPolicy;
  if (!specialPolicy) {
    return { corridor: "normal", autoDual: false, specialLegIndex: null, specialRates: null, reason: "ordinary_route" };
  }

  if (specialPolicy.corridor === "manual_review") {
    return {
      corridor: "manual_review",
      autoDual: true,
      specialLegIndex: fromPolicy ? 0 : 1,
      specialRates: SPECIAL_TARIFF_RATES,
      reason: "borderline_destination_requires_benchmark",
    };
  }

  const otherClass = fromPolicy ? toClass : fromClass;
  let corridor = specialPolicy.corridor;

  // Crimea/southern-coast origins use the pre-approved Crimea corridor only for
  // destinations explicitly assigned to it. Eastern destinations remain on the
  // M4 civilian corridor regardless of straight-line distance.
  if ((otherClass === "crimea" || otherClass === "south_coast") && specialPolicy.group === "southwest") {
    corridor = specialPolicy.corridor;
  } else if (specialPolicy.group === "dnr") {
    corridor = "m4_dnr";
  } else if (specialPolicy.group === "lnr") {
    corridor = "m4_lnr";
  }

  return {
    corridor,
    autoDual: true,
    specialLegIndex: fromPolicy ? 0 : 1,
    specialRates: SPECIAL_TARIFF_RATES,
    reason: `static_destination_policy:${specialPolicy.group}`,
  };
}

export function corridorAnchor(decision: CorridorDecision): RouteCoordinate | null {
  if (decision.corridor === "normal" || decision.corridor === "special_internal" || decision.corridor === "manual_review") return null;
  return CORRIDOR_ANCHORS[decision.corridor];
}
