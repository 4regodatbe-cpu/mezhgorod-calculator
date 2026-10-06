import { analyzeRoute, findPlanLegStretchAnomaly, followsPlan } from "../special-territory-policy.ts";
import { SPECIAL_TERRITORY_BOUNDARIES } from "../special-territory-boundaries.ts";
import { valhalla, brouterFast, osrmRoute, type Located } from "@/lib/route-providers";
import type { Coordinate } from "@/lib/tolls";
import { validateTollEdges, type TollValidation } from "@/lib/toll-validator";
import { selectLiveRouteCandidates } from "@/lib/route-quality";
import { selectFreeRoute, tollsForApi } from "./free-route-selection";
import { calculateLegTolls } from "./route-leg-pricing";

export async function calculateLeg(from: Located, to: Located, departureAt?: string, diagnostics = false, positions?: Array<{ lat:number; lng:number }>) {
  const rejectedStretchProviders = new Map<string, number>();
  const rawResults = await Promise.allSettled([
    valhalla(from, to, 1, positions),
    valhalla(from, to, 1, positions, 900), // Prefer short local bypasses without making every booth overwhelmingly expensive.
    valhalla(from, to, 1, positions, 1_200), // Allow partial M-4 use where a verified plaza bypass exists.
    valhalla(from, to, 1, positions, 43_200), // Keep a full-detour candidate as a fallback.
    osrmRoute(from, to, positions),
    brouterFast(from, to, positions),
  ]);
  const resultNames = ["Valhalla", "Valhalla 900s bypass", "Valhalla 1,200s bypass", "Valhalla full bypass", "OSRM", "BRouter"];
  const [fastResult, valhallaModerateAvoidResult, valhallaPartialTollResult, valhallaHighAvoidResult, osrmResult, brouterFastResult] = rawResults.map((result, index) => {
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

  const selectedFast = selectLiveRouteCandidates([
    ...(fastResult.status === "fulfilled" ? [{ name: "Valhalla", route: fastResult.value }] : []),
    ...(osrmResult.status === "fulfilled" ? [{ name: "OSRM", route: osrmResult.value }] : []),
    ...(brouterFastResult.status === "fulfilled" ? [{ name: "BRouter", route: brouterFastResult.value }] : []),
  ]);

  const fastQuality = rejectedStretchProviders.size ? {
    ...selectedFast.quality,
    status: "warning" as const,
    providers: [...new Set([...selectedFast.quality.providers, ...rejectedStretchProviders.keys()])],
    message: `Отклонены чрезмерно длинные контрольные плечи: ${[...rejectedStretchProviders].map(([name, ratio]) => `${name} (${ratio.toFixed(1)}×)`).join(", ")}. Проверьте выбранный маршрут перед поездкой`,
  } : selectedFast.quality;

  const routeGeometry = selectedFast.provider === "Valhalla" && fastResult.status === "fulfilled" && fastResult.value.coordinates.length > 0
    ? fastResult.value.coordinates
    : selectedFast.provider === "OSRM" && osrmResult.status === "fulfilled" && osrmResult.value.coordinates.length > 0
      ? osrmResult.value.coordinates
      : selectedFast.provider === "BRouter" && brouterFastResult.status === "fulfilled" && brouterFastResult.value.coordinates.length > 0
        ? brouterFastResult.value.coordinates
        : fastResult.status === "fulfilled" && fastResult.value.coordinates.length > 0
          ? fastResult.value.coordinates
          : osrmResult.status === "fulfilled" && osrmResult.value.coordinates.length > 0
            ? osrmResult.value.coordinates
            : brouterFastResult.status === "fulfilled" && brouterFastResult.value.coordinates.length > 0
              ? brouterFastResult.value.coordinates
              : [[from.position.lng, from.position.lat], [to.position.lng, to.position.lat]] as Coordinate[];

  const selectedFreePromise = selectFreeRoute(selectedFast.route, [
    { name: "Valhalla local bypass", result: valhallaModerateAvoidResult },
    { name: "Valhalla partial M-4 bypass", result: valhallaPartialTollResult },
    { name: "BRouter", result: brouterFastResult },
    { name: "Valhalla full bypass", result: valhallaHighAvoidResult },
  ]);
  const diagnosticFastValidationPromise: Promise<TollValidation | null> = diagnostics && routeGeometry.length > 2
    ? validateTollEdges(routeGeometry)
    : Promise.resolve(null);
  const [selectedFree, diagnosticFastValidation] = await Promise.all([selectedFreePromise, diagnosticFastValidationPromise]);
  const confirmedFree = selectedFree?.truth === "confirmed_no_toll_booths" ? selectedFree : null;
  const valhallaEvidence = selectedFast.provider === "Valhalla" && fastResult.status === "fulfilled" ? fastResult.value : null;
  const pricing = await calculateLegTolls({
    routeGeometry,
    routeSeconds: selectedFast.route.seconds,
    departureAt,
    selectedFastProvider: selectedFast.provider,
    selectedFastRoute: selectedFast.route,
    valhallaEvidence,
    confirmedFreeRoute: confirmedFree?.route ?? null,
    diagnosticFastValidation,
  });
  const { tolls, fastValidation } = pricing;

  // `free` is the legacy response key for the payment-point-avoiding alternative;
  // the route may still use tolled road segments when it avoids their booths.

  return {
    from: from.label,
    to: to.label,
    fast: { ...selectedFast.route, coordinates: routeGeometry, quality: fastQuality, tolls: tollsForApi(tolls, fastValidation), tollValidation: fastValidation },
    free: confirmedFree ? { ...confirmedFree.route, quality: confirmedFree.quality, tollValidation: confirmedFree.validation } : null,
    freeCandidate: null,
    freeError: confirmedFree ? undefined : "Не удалось подтвердить вариант с объездом пунктов оплаты.",
  };
}
