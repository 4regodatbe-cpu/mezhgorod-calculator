import { analyzeRoute, followsPlan } from "../special-territory-policy.ts";
import { SPECIAL_TERRITORY_BOUNDARIES } from "../special-territory-boundaries.ts";
import { valhalla, brouterFast, osrmRoute, type Located } from "@/lib/route-providers";
import type { Coordinate } from "@/lib/tolls";
import { validateTollEdges, type TollValidation } from "@/lib/toll-validator";
import { selectLiveRouteCandidates } from "@/lib/route-quality";
import { selectFreeRoute, tollsForApi } from "./free-route-selection";
import { calculateLegTolls } from "./route-leg-pricing";

export async function calculateLeg(from: Located, to: Located, departureAt?: string, diagnostics = false, positions?: Array<{ lat:number; lng:number }>) {
  const rawResults = await Promise.allSettled([
    valhalla(from, to, 1, positions),
    valhalla(from, to, 1, positions, 43_200), // Keep toll roads eligible; strongly penalize crossing a toll booth.
    osrmRoute(from, to, positions),
    brouterFast(from, to, positions),
  ]);
  const [fastResult, valhallaBoothAvoidResult, osrmResult, brouterFastResult] = rawResults.map(result => {
    if (result.status === "rejected") return result;
    try {
      if(positions && !followsPlan(result.value.coordinates,positions,"mainland",false)) throw new Error("ROUTE_CONTROLS_MISSED");
      analyzeRoute(result.value.coordinates,result.value.meters,result.value.seconds,from.position,to.position,SPECIAL_TERRITORY_BOUNDARIES);
      return result;
    } catch(reason) { return {status:"rejected" as const,reason}; }
  });

  const selectedFast = selectLiveRouteCandidates([
    ...(fastResult.status === "fulfilled" ? [{ name: "Valhalla", route: fastResult.value }] : []),
    ...(osrmResult.status === "fulfilled" ? [{ name: "OSRM", route: osrmResult.value }] : []),
    ...(brouterFastResult.status === "fulfilled" ? [{ name: "BRouter", route: brouterFastResult.value }] : []),
  ]);

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

  const selectedFreePromise = selectFreeRoute(valhallaBoothAvoidResult, brouterFastResult);
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
    fast: { ...selectedFast.route, coordinates: routeGeometry, quality: selectedFast.quality, tolls: tollsForApi(tolls, fastValidation), tollValidation: fastValidation },
    free: confirmedFree ? { ...confirmedFree.route, quality: confirmedFree.quality, tollValidation: confirmedFree.validation } : null,
    freeCandidate: null,
    freeError: confirmedFree ? undefined : "Не удалось подтвердить вариант с объездом пунктов оплаты.",
  };
}
