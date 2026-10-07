import { estimateTolls } from "@/lib/tolls";
import type { RouteSummary, RouteWithGeometry } from "@/lib/route-providers";
import { selectLiveRoute, MAX_PROVIDER_DISTANCE_SPREAD_PERCENT, type RouteQuality } from "@/lib/route-quality";
import { validateTollEdges, type TollValidation } from "@/lib/toll-validator";
import type { RouteTollComponentId } from "@/lib/toll-engine/route-toll-composition";

type FreeCandidate = { name: string; route: RouteWithGeometry };
type SelectedFree = {
  route: RouteWithGeometry;
  quality: RouteQuality;
  validation: TollValidation;
  truth: "confirmed_payment_point_avoiding";
};
export type TollEstimate = ReturnType<typeof estimateTolls>;
type ApiTolls = Omit<TollEstimate, "amount" | "weekdayAmount" | "weekendAmount"> & {
  amount: number | null;
  weekdayAmount: number | null;
  weekendAmount: number | null;
  pricingStatus: "priced" | "free" | "unknown";
};


export function unknownValidation(message: string): TollValidation {
  return {
    status: "unknown",
    source: "Valhalla map matching",
    tollEdgeCount: 0,
    checkedEdgeCount: 0,
    wayIds: [],
    roadNames: [],
    message,
  };
}

export function compositionValidation(priced: RouteTollComponentId[], message: string): TollValidation {
  return {
    status: "toll",
    source: "Route toll composition",
    tollEdgeCount: priced.length,
    checkedEdgeCount: priced.length,
    wayIds: [],
    roadNames: priced,
    message,
    complete: true,
  };
}

export function tollsForApi(tolls: TollEstimate, validation: TollValidation): ApiTolls {
  const hasPositivePrice = tolls.amount > 0 || tolls.weekdayAmount > 0 || tolls.weekendAmount > 0;
  if (hasPositivePrice) return { ...tolls, pricingStatus: "priced" };
  if (validation.status === "free") return { ...tolls, pricingStatus: "free" };
  return {
    ...tolls,
    amount: null,
    weekdayAmount: null,
    weekendAmount: null,
    pricingStatus: "unknown",
  };
}

export function zeroUnknownTolls(base: TollEstimate, segments: string[]): TollEstimate {
  return {
    ...base,
    amount: 0,
    weekdayAmount: 0,
    weekendAmount: 0,
    segments,
    confidence: "none",
  };
}

function spreadPercent(a: RouteSummary, b: RouteSummary) {
  return Math.round((Math.abs(a.meters - b.meters) / ((a.meters + b.meters) / 2)) * 1000) / 10;
}

/** Avoid offering a detour with a disproportionate distance or time cost. */
export function withinDetourLimits(main: RouteSummary, candidate: RouteSummary) {
  if (main.meters <= 0 || main.seconds <= 0 || candidate.meters <= 0 || candidate.seconds <= 0) return false;
  const distanceRatio = candidate.meters / main.meters;
  const durationRatio = candidate.seconds / main.seconds;
  return distanceRatio <= 1.25 && durationRatio <= 1.5;
}

export function routeDifferenceEvidence(fast: RouteSummary, free: RouteSummary) {
  // Keep as compatibility helper; practical bounds are asymmetric because a
  // payment-point bypass can legitimately cost more distance and time.
  return withinDetourLimits(fast, free);
}

function qualityForCandidate(selected: FreeCandidate, other: FreeCandidate | undefined, validation: TollValidation): RouteQuality {
  const base = selectLiveRoute(
    { name: selected.name, route: selected.route },
    other ? { name: other.name, route: other.route } : undefined,
  ).quality;
  if (validation.complete && (validation.tollBoothCount ?? 0) === 0) {
    if (validation.tollEdgeCount === 0) return base;
    return {
      ...base,
      status: "warning",
      message: "Пункты оплаты объезжены, но маршрут проходит по платным участкам; стоимость требует отдельной проверки",
    };
  }
  return {
    ...base,
    status: "warning",
    message: validation.tollBoothCount ? "На маршруте обнаружены пункты оплаты" : "Проверка пунктов оплаты не завершена",
  };
}

function selectedCandidate(
  selected: FreeCandidate,
  other: FreeCandidate | undefined,
  validation: TollValidation,
  truth: SelectedFree["truth"],
): SelectedFree {
  return {
    route: selected.route,
    quality: qualityForCandidate(selected, other, validation),
    validation,
    truth,
  };
}

async function validateFreeCandidate(candidate: FreeCandidate, ordinal: "Первый" | "Второй") {
  return candidate.route.coordinates.length > 2
    ? validateTollEdges(candidate.route.coordinates)
    : unknownValidation(`${ordinal} источник не вернул геометрию`);
}

// Legacy API field names say “free”; this route avoids payment points, but may contain tolled road sections.
export async function selectFreeRoute(
  mainRoute: RouteSummary,
  alternativeResults: Array<{ name: string; result: PromiseSettledResult<RouteWithGeometry> }>,
): Promise<SelectedFree | null> {
  const candidates: FreeCandidate[] = alternativeResults.flatMap(({ name, result }) =>
    result.status === "fulfilled" ? [{ name, route: result.value }] : [],
  );
  if (candidates.length === 0) return null;

  // Try candidates in preference order. Stop at the first complete route that
  // avoids every payment point and stays within the detour limits; do not
  // spend extra requests validating candidates with disproportionate detours.
  for (const [index, candidate] of candidates.entries()) {
    if (!withinDetourLimits(mainRoute, candidate.route)) continue;
    const validation = await validateFreeCandidate(candidate, index === 0 ? "Первый" : "Второй");
    if (validation.complete !== true || (validation.tollBoothCount ?? 0) !== 0) continue;

    const other = candidates[index + 1] ?? candidates[index - 1];
    return selectedCandidate(candidate, other, validation, "confirmed_payment_point_avoiding");
  }

  // Fail closed: an incomplete trace cannot prove that the route avoids every payment point.
  return null;
}
