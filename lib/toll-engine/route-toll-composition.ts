export type RouteTollComponentId = "m4_a289" | "m11" | "m12" | "ckad" | "m1" | "m3" | "regional";

export type RouteTollValue = {
  amount: number;
  weekdayAmount: number;
  weekendAmount: number;
  period: string;
  segments: string[];
  confidence: "matched" | "partial";
};

export type RouteTollComponent = {
  id: RouteTollComponentId;
  detected: boolean;
  tolls: RouteTollValue | null;
  reason?: string | null;
};

export type RouteTollComposition =
  | { status: "none"; tolls: null; missing: RouteTollComponentId[]; priced: RouteTollComponentId[] }
  | { status: "unknown"; tolls: null; missing: RouteTollComponentId[]; priced: RouteTollComponentId[] }
  | { status: "priced"; tolls: RouteTollValue; missing: []; priced: RouteTollComponentId[] };

export function detectedFamiliesFromLegacySegments(segments: readonly string[]) {
  const families = new Set<RouteTollComponentId>();
  for (const raw of segments) {
    const value = raw.toLocaleLowerCase("ru-RU");
    if (/м\s*[-–—]?\s*4|m\s*[-–—]?\s*4/u.test(value)) families.add("m4_a289");
    if (/а\s*[-–—]?\s*289|a\s*[-–—]?\s*289/u.test(value)) families.add("m4_a289");
    if (/м\s*[-–—]?\s*11|m\s*[-–—]?\s*11/u.test(value)) families.add("m11");
    if (/м\s*[-–—]?\s*12|m\s*[-–—]?\s*12/u.test(value)) families.add("m12");
    if (value.includes("цкад")) families.add("ckad");
    if (/м\s*[-–—]?\s*1(?::|\s|$)|m\s*[-–—]?\s*1(?::|\s|$)/u.test(value)) families.add("m1");
    if (/м\s*[-–—]?\s*3(?::|\s|$)|m\s*[-–—]?\s*3(?::|\s|$)/u.test(value)) families.add("m3");
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
  const missing = detected.filter((item) => !item.tolls || item.tolls.confidence !== "matched").map((item) => item.id);
  const priced = detected.filter((item) => item.tolls?.confidence === "matched").map((item) => item.id);
  if (missing.length > 0) return { status: "unknown", tolls: null, missing, priced };

  const values = detected.map((item) => item.tolls!).filter((item) => item.confidence === "matched");
  return {
    status: "priced",
    tolls: {
      amount: values.reduce((sum, item) => sum + item.amount, 0),
      weekdayAmount: values.reduce((sum, item) => sum + item.weekdayAmount, 0),
      weekendAmount: values.reduce((sum, item) => sum + item.weekendAmount, 0),
      period: values[0]?.period ?? "",
      segments: values.flatMap((item) => item.segments),
      confidence: "matched",
    },
    missing: [],
    priced,
  };
}
