import { estimateTolls } from "@/lib/tolls";
import type { RouteSummary, RouteWithGeometry } from "@/lib/route-providers";
import { selectLiveRoute, MAX_PROVIDER_DISTANCE_SPREAD_PERCENT, type RouteQuality } from "@/lib/route-quality";
import { validateTollEdges, type TollValidation } from "@/lib/toll-validator";
import type { RouteTollComponentId } from "@/lib/toll-engine/route-toll-composition";

const MIN_TOLL_VARIANT_DISTANCE_KM = 10;
const MIN_TOLL_VARIANT_DISTANCE_PERCENT = 1;
const MIN_TOLL_VARIANT_TIME_MINUTES = 15;
const MIN_TOLL_VARIANT_TIME_PERCENT = 5;

type FreeCandidate = { name: string; route: RouteWithGeometry };
type SelectedFree = {
  route: RouteSummary;
  quality: RouteQuality;
  validation: TollValidation;
  truth: "confirmed_free" | "candidate_unverified";
};
export type TollEstimate = ReturnType<typeof estimateTolls>;
type ApiTolls = Omit<TollEstimate, "amount" | "weekdayAmount" | "weekendAmount"> & {
  amount: number | null;
  weekdayAmount: number | null;
  weekendAmount: number | null;
  pricingStatus: "priced" | "free" | "unknown";
};

const MIN_TOLL_VARIANT_DISTANCE_KM = 10;
const MIN_TOLL_VARIANT_DISTANCE_PERCENT = 1;
const MIN_TOLL_VARIANT_TIME_MINUTES = 15;
const MIN_TOLL_VARIANT_TIME_PERCENT = 5;

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

export function routeDifferenceEvidence(fast: RouteSummary, free: RouteSummary) {
  const distanceDeltaKm = (free.meters - fast.meters) / 1000;
  const distancePercent = fast.meters > 0 ? (free.meters - fast.meters) / fast.meters * 100 : 0;
  const timeDeltaMinutes = (free.seconds - fast.seconds) / 60;
  const timePercent = fast.seconds > 0 ? (free.seconds - fast.seconds) / fast.seconds * 100 : 0;
  const distanceDiffers = distanceDeltaKm >= MIN_TOLL_VARIANT_DISTANCE_KM && distancePercent >= MIN_TOLL_VARIANT_DISTANCE_PERCENT;
  const timeDiffers = timeDeltaMinutes >= MIN_TOLL_VARIANT_TIME_MINUTES && timePercent >= MIN_TOLL_VARIANT_TIME_PERCENT;
  return distanceDiffers || timeDiffers;
}

function qualityForCandidate(selected: FreeCandidate, other: FreeCandidate | undefined, validation: TollValidation): RouteQuality {
  const base = selectLiveRoute(
    { name: selected.name, route: selected.route },
    other ? { name: other.name, route: other.route } : undefined,
  ).quality;
  if (validation.status === "free") return base;
  return {
    ...base,
    status: "warning",
    message: validation.message || "Независимая проверка бесплатности не завершена",
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

export async function selectFreeRoute(
  valhallaFreeResult: PromiseSettledResult<RouteWithGeometry>,
  brouterResult: PromiseSettledResult<RouteWithGeometry>,
): Promise<SelectedFree | null> {
  const candidates: FreeCandidate[] = [];
  if (valhallaFreeResult.status === "fulfilled") candidates.push({ name: "Valhalla", route: valhallaFreeResult.value });
  if (brouterResult.status === "fulfilled") candidates.push({ name: "BRouter", route: brouterResult.value });
  if (candidates.length === 0) return null;


  const first = candidates[0];
  const second = candidates[1];
  const firstValidation = await validateFreeCandidate(first, "Первый");

  if (firstValidation.status === "free") {
    return selectedCandidate(first, second, firstValidation, "confirmed_free");
  }

  let secondValidation: TollValidation | null = null;
  if (second) {
    secondValidation = await validateFreeCandidate(second, "Второй");
    if (secondValidation.status === "free") {
      return selectedCandidate(second, first, secondValidation, "confirmed_free");
    }
  }

  const firstUnknown = firstValidation.status === "unknown";
  const secondUnknown = second && secondValidation?.status === "unknown";
  if (!firstUnknown && !secondUnknown) return null;

  if (firstUnknown && !secondUnknown) {
    return selectedCandidate(first, second, firstValidation, "candidate_unverified");
  }
  if (second && secondUnknown && !firstUnknown) {
    return selectedCandidate(second, first, secondValidation!, "candidate_unverified");
  }

  if (second && secondValidation) {
    const selected = spreadPercent(first.route, second.route) > MAX_PROVIDER_DISTANCE_SPREAD_PERCENT
      ? (first.route.meters <= second.route.meters ? first : second)
      : first;
    const validation = selected === first ? firstValidation : secondValidation;
    const other = selected === first ? second : first;
    return selectedCandidate(selected, other, validation, "candidate_unverified");
  }

  return selectedCandidate(first, undefined, firstValidation, "candidate_unverified");
}
