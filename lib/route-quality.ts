export type RouteSummary = { meters: number; seconds: number };
export type RouteCandidate = { name: string; route: RouteSummary };
export type GoldenRouteReference = {
  meters: number;
  seconds?: number | null;
  distanceTolerancePercent: number;
  source: string;
  verifiedAt: string;
};
export type RouteQuality = {
  status: "verified" | "single" | "warning";
  providers: string[];
  distanceSpreadPercent: number | null;
  timeSpreadPercent: number | null;
  goldenDistanceDeviationPercent: number | null;
  message: string;
};

export const MAX_PROVIDER_DISTANCE_SPREAD_PERCENT = 7;

export function percentSpread(a: number, b: number) {
  if (!(a > 0) || !(b > 0)) return null;
  return Math.round((Math.abs(a - b) / ((a + b) / 2)) * 1000) / 10;
}

export function percentDeviation(actual: number, expected: number) {
  if (!(actual > 0) || !(expected > 0)) return null;
  return Math.round((Math.abs(actual - expected) / expected) * 1000) / 10;
}

function closestToGolden(candidates: readonly RouteCandidate[], golden: GoldenRouteReference) {
  return [...candidates].sort((a, b) =>
    Math.abs(a.route.meters - golden.meters) - Math.abs(b.route.meters - golden.meters))[0];
}

function peerAgreementCount(candidate: RouteCandidate, candidates: readonly RouteCandidate[]) {
  return candidates.filter((other) => other !== candidate && (percentSpread(candidate.route.meters, other.route.meters) ?? Number.POSITIVE_INFINITY) <= MAX_PROVIDER_DISTANCE_SPREAD_PERCENT).length;
}

function bestAgreementPeer(candidate: RouteCandidate, candidates: readonly RouteCandidate[]) {
  return candidates
    .filter((other) => other !== candidate)
    .map((other) => ({ other, spread: percentSpread(candidate.route.meters, other.route.meters) }))
    .filter((item): item is { other: RouteCandidate; spread: number } => item.spread != null)
    .sort((a, b) => a.spread - b.spread)[0] ?? null;
}

export function selectLiveRouteCandidates(
  candidates: readonly RouteCandidate[],
  golden?: GoldenRouteReference,
): { route: RouteSummary; provider: string; quality: RouteQuality } {
  if (candidates.length === 0) throw new Error("ROUTE_UNAVAILABLE");
  const providers = candidates.map((item) => item.name);

  let selected = candidates[0];
  if (candidates.length > 1) {
    const ranked = candidates
      .map((candidate, index) => ({ candidate, index, peers: peerAgreementCount(candidate, candidates) }))
      .sort((a, b) => b.peers - a.peers || a.index - b.index);
    const bestPeerCount = ranked[0].peers;
    if (bestPeerCount > 0) selected = ranked[0].candidate;
    else if (golden) selected = closestToGolden(candidates, golden);
  }

  const agreement = bestAgreementPeer(selected, candidates);
  const distanceSpread = agreement?.spread ?? (candidates.length > 1 ? percentSpread(candidates[0].route.meters, candidates[1].route.meters) : null);
  const timeSpread = agreement ? percentSpread(selected.route.seconds, agreement.other.route.seconds) : null;
  const goldenDeviation = golden ? percentDeviation(selected.route.meters, golden.meters) : null;
  const withinGolden = golden && goldenDeviation != null && goldenDeviation <= golden.distanceTolerancePercent;

  if (candidates.length === 1) {
    return {
      route: selected.route,
      provider: selected.name,
      quality: {
        status: withinGolden ? "verified" : "single",
        providers,
        distanceSpreadPercent: null,
        timeSpreadPercent: null,
        goldenDistanceDeviationPercent: goldenDeviation,
        message: withinGolden
          ? `Один сервис; расстояние в пределах контрольного диапазона (${golden!.source})`
          : "Результат получен от одного сервиса",
      },
    };
  }

  if (agreement && agreement.spread <= MAX_PROVIDER_DISTANCE_SPREAD_PERCENT) {
    const outliers = candidates.length - 2;
    return {
      route: selected.route,
      provider: selected.name,
      quality: {
        status: golden && !withinGolden ? "warning" : "verified",
        providers,
        distanceSpreadPercent: agreement.spread,
        timeSpreadPercent: timeSpread,
        goldenDistanceDeviationPercent: goldenDeviation,
        message: golden && !withinGolden
          ? `Согласованные live-источники вне контрольного диапазона ${golden.distanceTolerancePercent}%`
          : outliers > 0
            ? `Расстояние подтверждено большинством live-сервисов; ${outliers} источник расходится`
            : "Расстояние подтверждено двумя сервисами",
      },
    };
  }

  return {
    route: selected.route,
    provider: selected.name,
    quality: {
      status: golden && withinGolden ? "verified" : "warning",
      providers,
      distanceSpreadPercent: distanceSpread,
      timeSpreadPercent: timeSpread,
      goldenDistanceDeviationPercent: goldenDeviation,
      message: golden && withinGolden
        ? `Источники расходятся; выбран live-провайдер, попадающий в контрольный диапазон (${golden.source})`
        : `Live-источники существенно расходятся. Проверьте маршрут перед поездкой`,
    },
  };
}

export function selectLiveRoute(
  primary: RouteCandidate | undefined,
  secondary: RouteCandidate | undefined,
  golden?: GoldenRouteReference,
) {
  return selectLiveRouteCandidates([primary, secondary].filter(Boolean) as RouteCandidate[], golden);
}
