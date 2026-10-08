import { estimateTolls } from "@/lib/tolls";
import type { RouteSummary, RouteWithGeometry } from "@/lib/route-providers";
import { selectLiveRoute, type RouteQuality } from "@/lib/route-quality";
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

/** Avoid offering a detour with a disproportionate distance or time cost. */
export function withinDetourLimits(main: RouteSummary, candidate: RouteSummary) {
  if (main.meters <= 0 || main.seconds <= 0 || candidate.meters <= 0 || candidate.seconds <= 0) return false;
  const distanceRatio = candidate.meters / main.meters;
  const durationRatio = candidate.seconds / main.seconds;
  return distanceRatio <= 1.25 && durationRatio <= 1.5;
}

/** A payment-point bypass is worth calculating only when it materially saves time or distance. */
export function hasPracticalSavings(main: RouteSummary, candidate: RouteSummary) {
  if (main.meters <= 0 || main.seconds <= 0 || candidate.meters <= 0 || candidate.seconds <= 0) return false;
  const distanceSavingsMeters = main.meters - candidate.meters;
  const distanceSavingsPercent = distanceSavingsMeters / main.meters * 100;
  const timeSavingsSeconds = main.seconds - candidate.seconds;
  const timeSavingsPercent = timeSavingsSeconds / main.seconds * 100;
  const savesDistance = distanceSavingsMeters >= 10_000 && distanceSavingsPercent >= 1;
  const savesTime = timeSavingsSeconds >= 15 * 60 && timeSavingsPercent >= 5;
  return savesDistance || savesTime;
}

export function routeDifferenceEvidence(fast: RouteSummary, free: RouteSummary) {
  return hasPracticalSavings(fast, free);
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
    if (!withinDetourLimits(mainRoute, candidate.route) || !hasPracticalSavings(mainRoute, candidate.route)) continue;
    const validation = await validateFreeCandidate(candidate, index === 0 ? "Первый" : "Второй");
    if (validation.complete !== true || (validation.tollBoothCount ?? 0) !== 0) continue;

    const other = candidates[index + 1] ?? candidates[index - 1];
    return selectedCandidate(candidate, other, validation, "confirmed_payment_point_avoiding");
  }

  // Fail closed: an incomplete trace cannot prove that the route avoids every payment point.
  return null;
}
