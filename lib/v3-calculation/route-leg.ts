import { analyzeRoute, findPlanLegStretchAnomaly, followsPlan } from "../special-territory-policy.ts";
import { SPECIAL_TERRITORY_BOUNDARIES } from "../special-territory-boundaries.ts";
import { valhalla, brouterFast, osrmRoute, type Located } from "@/lib/route-providers";
import type { Coordinate } from "@/lib/tolls";
import { validateTollEdges, type TollValidation } from "@/lib/toll-validator";
import { selectLiveRouteCandidates } from "@/lib/route-quality";
import { selectFreeRoute, tollsForApi } from "../v2-calculation/free-route-selection";
import { calculateLegTolls } from "./route-leg-pricing";
import { selectFastestRoute } from "@/experiments/nationwide-tolls/fastest-route-policy.mjs";

export async function calculateLeg(from: Located, to: Located, departureAt?: string, diagnostics = false, positions?: Array<{ lat:number; lng:number }>, fastestOnly = false) {
  const rejectedStretchProviders = new Map<string, number>();
  const rawResults = await Promise.allSettled([
    valhalla(from, to, 1, positions),
    fastestOnly ? Promise.reject(new Error("FASTEST_ONLY_SKIP_BYPASS")) : valhalla(from, to, 1, positions, 900), // V2-only payment-point bypass candidate.
    fastestOnly ? Promise.reject(new Error("FASTEST_ONLY_SKIP_BYPASS")) : valhalla(from, to, 1, positions, 1_200), // V2-only partial M-4 bypass candidate.
    osrmRoute(from, to, positions),
    brouterFast(from, to, positions),
  ]);
  const resultNames = ["Valhalla", "Valhalla 900s bypass", "Valhalla 1,200s bypass", "OSRM", "BRouter"];
  const [fastResult, valhallaModerateAvoidResult, valhallaPartialTollResult, osrmResult, brouterFastResult] = rawResults.map((result, index) => {
    if (result.status === "rejected") return result;
    try {
      if (positions) {
        const stretch = findPlanLegStretchAnomaly(result.value.coordinates, positions);
        if (stretch) {
          rejectedStretchProviders.set(resultNames[index], stretch.stretchRatio);
          throw new Error("ROUTING_PLAN_LEG_STRETCH");
        }
        if (!followsPlan(result.value.coordinates, positions, "mainland", false)) throw new Error("ROUTE_CONTROLS_MISSED");
      }
      analyzeRoute(result.value.coordinates, result.value.meters, result.value.seconds, from.position, to.position, SPECIAL_TERRITORY_BOUNDARIES);
      return result;
    } catch(reason) { return {status:"rejected" as const,reason}; }
  });

  const routeCandidates = [
    ...(fastResult.status === "fulfilled" ? [{ name: "Valhalla", route: fastResult.value }] : []),
    ...(valhallaModerateAvoidResult.status === "fulfilled" ? [{ name: "Valhalla local routing candidate", route: valhallaModerateAvoidResult.value }] : []),
    ...(valhallaPartialTollResult.status === "fulfilled" ? [{ name: "Valhalla partial toll candidate", route: valhallaPartialTollResult.value }] : []),
    ...(osrmResult.status === "fulfilled" ? [{ name: "OSRM", route: osrmResult.value }] : []),
    ...(brouterFastResult.status === "fulfilled" ? [{ name: "BRouter", route: brouterFastResult.value }] : []),
  ];
  const selectedFast = fastestOnly
    ? (() => {
        const winner = selectFastestRoute(routeCandidates.map((candidate) => ({
          id: candidate.name,
          seconds: candidate.route.seconds,
          tollStatus: "unknown",
          route: candidate.route,
          provider: candidate.name,
        })));
        return {
          route: winner.route.route,
          provider: winner.route.provider,
          quality: {
            status: "single" as const,
            providers: [winner.route.provider],
            distanceSpreadPercent: null,
            timeSpreadPercent: null,
            goldenDistanceDeviationPercent: null,
            message: "Выбран единственный допустимый маршрут с минимальным временем",
          },
        };
      })()
    : selectLiveRouteCandidates(routeCandidates);

  const fastQuality = rejectedStretchProviders.size ? {
    ...selectedFast.quality,
    status: "warning" as const,
    providers: [...new Set([...selectedFast.quality.providers, ...rejectedStretchProviders.keys()])],
    message: `Отклонены чрезмерно длинные контрольные плечи: ${[...rejectedStretchProviders].map(([name, ratio]) => `${name} (${ratio.toFixed(1)}×)`).join(", ")}. Проверьте выбранный маршрут перед поездкой`,
  } : selectedFast.quality;

  // Keep pricing evidence attached to the exact candidate chosen by the fastest-only selector.
  // Provider labels alone are insufficient: there are multiple Valhalla candidates with different geometry.
  const selectedFastRoute = routeCandidates.find((candidate) => candidate.name === selectedFast.provider)?.route ?? selectedFast.route;
  const routeGeometry = selectedFastRoute.coordinates.length > 0
    ? selectedFastRoute.coordinates
    : [[from.position.lng, from.position.lat], [to.position.lng, to.position.lat]] as Coordinate[];

  const selectedFreePromise = fastestOnly
    ? Promise.resolve(null)
    : selectFreeRoute(selectedFast.route, [
        { name: "Valhalla local bypass", result: valhallaModerateAvoidResult },
        { name: "Valhalla partial M-4 bypass", result: valhallaPartialTollResult },
        { name: "BRouter", result: brouterFastResult },
      ]);
  const diagnosticFastValidationPromise: Promise<TollValidation | null> = diagnostics && routeGeometry.length > 2
    ? validateTollEdges(routeGeometry)
    : Promise.resolve(null);
  let [selectedFree, diagnosticFastValidation] = await Promise.all([selectedFreePromise, diagnosticFastValidationPromise]);
  // The expensive full-detour search is a genuine fallback; keep it off the
  // critical path when a faster candidate already passes the complete booth trace.
  if (!fastestOnly && !selectedFree) {
    try {
      const route = await valhalla(from, to, 1, positions, 43_200);
      if (positions) {
        const stretch = findPlanLegStretchAnomaly(route.coordinates, positions);
        if (stretch) {
          rejectedStretchProviders.set("Valhalla full bypass", stretch.stretchRatio);
          throw new Error("ROUTING_PLAN_LEG_STRETCH");
        }
        if (!followsPlan(route.coordinates, positions, "mainland", false)) throw new Error("ROUTE_CONTROLS_MISSED");
      }
      analyzeRoute(route.coordinates, route.meters, route.seconds, from.position, to.position, SPECIAL_TERRITORY_BOUNDARIES);
      selectedFree = await selectFreeRoute(selectedFast.route, [
        { name: "Valhalla full bypass", result: { status: "fulfilled", value: route } },
      ]);
    } catch {
      // A failed fallback only means no confirmed payment-point-avoiding option.
    }
  }
  const confirmedFree = selectedFree?.truth === "confirmed_payment_point_avoiding" ? selectedFree : null;
  const selectedFastIsValhalla = selectedFast.provider.startsWith("Valhalla");
  const valhallaEvidence = selectedFastIsValhalla ? selectedFastRoute : null;
  const selectedFastPricingProvider = selectedFastIsValhalla ? "Valhalla" : selectedFast.provider;
  const pricing = await calculateLegTolls({
    routeGeometry,
    routeSeconds: selectedFast.route.seconds,
    departureAt,
    selectedFastProvider: selectedFastPricingProvider,
    selectedFastRoute: selectedFastRoute,
    valhallaEvidence,
    confirmedFreeRoute: fastestOnly ? null : confirmedFree?.route ?? null,
    diagnosticFastValidation,
  });
  const { tolls, fastValidation, m4PvpPreview, nationalTollCoverage } = pricing;

  // `free` is the legacy response key for the payment-point-avoiding alternative;
  // the route may still use tolled road segments when it avoids their booths.

  return {
    from: from.label,
    to: to.label,
    fast: { ...selectedFast.route, coordinates: routeGeometry, quality: fastQuality, tolls: tollsForApi(tolls, fastValidation), tollValidation: fastValidation, m4PvpPreview, nationalTollCoverage },
    free: !fastestOnly && confirmedFree ? { ...confirmedFree.route, quality: confirmedFree.quality, tollValidation: confirmedFree.validation } : null,
    freeCandidate: null,
    freeError: confirmedFree ? undefined : "Не удалось подтвердить вариант с объездом пунктов оплаты.",
  };
}
