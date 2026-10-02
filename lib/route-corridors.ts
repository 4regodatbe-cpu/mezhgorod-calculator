export type RouteCoordinate = { lat: number; lng: number };

export type CorridorId =
  | "normal"
  | "crimea_dzhankoy"
  | "crimea_armyansk"
  | "m4_dnr"
  | "m4_lnr"
  | "special_internal"
  | "manual_review";

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

export type CorridorDecision = {
  corridor: CorridorId;
  autoDual: boolean;
  specialLegIndex: 0 | 1 | null;
  specialRates: SpecialTariffRates | null;
  reason: string;
};

type Policy = { corridor: CorridorId; group: "dnr" | "lnr" | "southwest" | "borderline" };

const DESTINATIONS: Array<{ markers: string[]; policy: Policy }> = [
  { markers: ["мелитопол", "бердянск", "приморск", "токмак", "пологи"], policy: { corridor: "manual_review", group: "borderline" } },
  { markers: ["геническ", "новоалексеевк", "чонгар", "каланчак", "чаплинк"], policy: { corridor: "crimea_dzhankoy", group: "southwest" } },
  { markers: ["мариупол", "новоазовск", "донецк", "макеевк", "горловк", "енакиев", "шахтерск", "амвросиев"], policy: { corridor: "m4_dnr", group: "dnr" } },
  { markers: ["луганск", "алчевск", "краснодон", "свердловск", "ровеньк", "стаханов", "анрацит"], policy: { corridor: "m4_lnr", group: "lnr" } },
];

function normalize(value: string) {
  return value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е");
}

export function destinationPolicy(label: string): Policy | null {
  const value = normalize(label);
  return DESTINATIONS.find((item) => item.markers.some((marker) => value.includes(normalize(marker))))?.policy ?? null;
}

export function resolveCorridor(fromLabel: string, toLabel: string): CorridorDecision {
  const from = destinationPolicy(fromLabel);
  const to = destinationPolicy(toLabel);

  if (from && to) {
    return { corridor: "special_internal", autoDual: true, specialLegIndex: null, specialRates: SPECIAL_TARIFF_RATES, reason: "both_special" };
  }

  const policy = from ?? to;
  if (!policy) {
    return { corridor: "normal", autoDual: false, specialLegIndex: null, specialRates: null, reason: "ordinary_route" };
  }

  return {
    corridor: policy.corridor,
    autoDual: true,
    specialLegIndex: from ? 0 : 1,
    specialRates: SPECIAL_TARIFF_RATES,
    reason: policy.group === "borderline" ? "benchmark_required" : `static_policy:${policy.group}`,
  };
}
