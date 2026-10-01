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

export function selectLiveRoute(
  primary: RouteCandidate | undefined,
  secondary: RouteCandidate | undefined,
  golden?: GoldenRouteReference,
): { route: RouteSummary; provider: string; quality: RouteQuality } {
  const candidates = [primary, secondary].filter(Boolean) as RouteCandidate[];
  if (candidates.length === 0) throw new Error("ROUTE_UNAVAILABLE");

  const distanceSpread = primary && secondary ? percentSpread(primary.route.meters, secondary.route.meters) : null;
  const timeSpread = primary && secondary ? percentSpread(primary.route.seconds, secondary.route.seconds) : null;
  const providers = candidates.map((item) => item.name);

  let selected = primary ?? secondary!;
  if (golden && candidates.length > 1 && distanceSpread != null && distanceSpread > MAX_PROVIDER_DISTANCE_SPREAD_PERCENT) {
    selected = closestToGolden(candidates, golden);
  }

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

  if (distanceSpread != null && distanceSpread <= MAX_PROVIDER_DISTANCE_SPREAD_PERCENT) {
    return {
      route: selected.route,
      provider: selected.name,
      quality: {
        status: golden && !withinGolden ? "warning" : "verified",
        providers,
        distanceSpreadPercent: distanceSpread,
        timeSpreadPercent: timeSpread,
        goldenDistanceDeviationPercent: goldenDeviation,
        message: golden && !withinGolden
          ? `Сервисы согласны между собой, но live-маршрут вне контрольного диапазона ${golden.distanceTolerancePercent}%`
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
        : `Источники расходятся по расстоянию на ${distanceSpread}%. Проверьте маршрут перед поездкой`,
    },
  };
}
