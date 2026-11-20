export type RegionalTollProductId = "ufa-east" | "tolyatti" | "odintsovo" | "bagration" | "msd" | "zsd" | "shmsd" | "voznesensky" | "udmurt-bridges" | "khabarovsk" | "mytishchi" | "ryazan" | "amur-bridge" | "pskov-unresolved" | "unknown-paid-road";
export type RouteTollComponentId = "m4_a289" | "m4" | "m4-545" | "a289" | "krasnodar-west-bypass" | "m11" | "m11-15-58" | "m11-58-679" | "m11-679-684" | "m12" | "ckad" | "m1" | "m3" | "ckad-small-vyazemy" | "regional" | RegionalTollProductId;

export type RouteTollValue = {
  amount: number;
  weekdayAmount: number;
  weekendAmount: number;
  period: string;
  segments: string[];
  confidence: "matched";
};

export type RouteTollComponentValue = Omit<RouteTollValue, "confidence"> & {
  confidence: "matched" | "partial";
};

export type RouteTollComponent = {
  id: RouteTollComponentId;
  detected: boolean;
  tolls: RouteTollComponentValue | null;
  reason?: string | null;
};

export type RouteTollComposition =
  | { status: "none"; tolls: null; missing: RouteTollComponentId[]; priced: RouteTollComponentId[] }
  | { status: "unknown"; tolls: null; missing: RouteTollComponentId[]; priced: RouteTollComponentId[] }
  | { status: "priced"; tolls: RouteTollValue; missing: []; priced: RouteTollComponentId[] };

const roadRefPatterns: readonly [RegExp, RouteTollComponentId][] = [
  [/(?:^|[^а-яa-z0-9])[мm]\s*[-‐‑–—]?\s*4(?=$|[^а-яa-z0-9])/u, "m4_a289"],
  [/(?:^|[^а-яa-z0-9])[аa]\s*[-‐‑–—]?\s*289(?=$|[^а-яa-z0-9])/u, "m4_a289"],
  [/(?:^|[^а-яa-z0-9])[мm]\s*[-‐‑–—]?\s*11(?=$|[^а-яa-z0-9])/u, "m11"],
  [/(?:^|[^а-яa-z0-9])[мm]\s*[-‐‑–—]?\s*12(?=$|[^а-яa-z0-9])/u, "m12"],
  [/(?:^|[^а-яa-z0-9])[мm]\s*[-‐‑–—]?\s*1(?=$|[^а-яa-z0-9])/u, "m1"],
  [/(?:^|[^а-яa-z0-9])[мm]\s*[-‐‑–—]?\s*3(?=$|[^а-яa-z0-9])/u, "m3"],
];

export function detectedFamiliesFromLegacySegments(segments: readonly string[]) {
  const families = new Set<RouteTollComponentId>();
  for (const raw of segments) {
    const value = raw.toLocaleLowerCase("ru-RU");
    // Intersecting road names are CKAD endpoints, not extra traversals.
    if (/^цкад\s*:/u.test(value)) { families.add("ckad"); continue; }
    for (const [pattern, family] of roadRefPatterns) if (pattern.test(value)) families.add(family);
    if (value.includes("цкад")) families.add("ckad");
    if (value.includes("восточный выезд") || value.includes("обход тольятти")) families.add("regional");
  }
  return families;
}

export function composeRouteTolls(components: readonly RouteTollComponent[]): RouteTollComposition {
  const detected = components.filter((item) => item.detected);
  if (detected.length === 0) return { status: "none", tolls: null, missing: [], priced: [] };

  // A partial component is useful diagnostic evidence, but it cannot make the
  // route-level total exact. Treat it as missing for final composition while
  // preserving the component payload for diagnostics upstream.
  const valid = (item: RouteTollComponent) => !["unknown-paid-road","pskov-unresolved"].includes(item.id) && item.tolls?.confidence === "matched" &&
    [item.tolls.amount, item.tolls.weekdayAmount, item.tolls.weekendAmount].every(value => Number.isSafeInteger(value) && value >= 0);
  const duplicateIds = new Set(detected.filter((item, index) => detected.findIndex(other => other.id === item.id) !== index).map(item => item.id));
  // The old V2 aggregate overlaps all three independent V3 products.
  // Mixing the two representations cannot charge the same road twice.
  if (detected.some(item => item.id === "m4_a289") && detected.some(item =>
    ["m4", "a289", "krasnodar-west-bypass"].includes(item.id))) {
    return {status:"unknown",tolls:null,missing:detected.map(item=>item.id),priced:[]};
  }
  if (detected.some(item => item.id === "m11") && detected.some(item =>
    ["m11-15-58", "m11-58-679", "m11-679-684"].includes(item.id))) {
    return {status:"unknown",tolls:null,missing:detected.map(item=>item.id),priced:[]};
  }
  const regionalIds = ["ufa-east","tolyatti","odintsovo","bagration","msd","zsd","shmsd","voznesensky","udmurt-bridges","khabarovsk","mytishchi","ryazan","amur-bridge","pskov-unresolved","unknown-paid-road"];
  if (detected.some(item=>item.id === "regional") && detected.some(item=>regionalIds.includes(item.id))) {
    return {status:"unknown",tolls:null,missing:detected.map(item=>item.id),priced:[]};
  }
  const missing = [...new Set(detected.filter((item) => !valid(item) || duplicateIds.has(item.id)).map((item) => item.id))];
  const priced = detected.filter((item) => valid(item) && !duplicateIds.has(item.id)).map((item) => item.id);
  if (missing.length > 0) return { status: "unknown", tolls: null, missing, priced };

  const values = detected.map((item) => item.tolls!).filter((item) => item.confidence === "matched");
  const amount = values.reduce((sum, item) => sum + item.amount, 0);
  const weekdayAmount = values.reduce((sum, item) => sum + item.weekdayAmount, 0);
  const weekendAmount = values.reduce((sum, item) => sum + item.weekendAmount, 0);
  if (![amount, weekdayAmount, weekendAmount].every(Number.isSafeInteger)) {
    return { status: "unknown", tolls: null, missing: detected.map(item => item.id), priced: [] };
  }
  return {
    status: "priced",
    tolls: {
      amount,
      weekdayAmount,
      weekendAmount,
      period: values[0]?.period ?? "",
      segments: values.flatMap((item) => item.segments),
      confidence: "matched",
    },
    missing: [],
    priced,
  };
}
