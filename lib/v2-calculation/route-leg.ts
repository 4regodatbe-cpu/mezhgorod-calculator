import { valhalla, brouterFree, brouterFast, osrmRoute, type Located } from "@/lib/route-providers";
import type { Coordinate } from "@/lib/tolls";
import { validateTollEdges, type TollValidation } from "@/lib/toll-validator";
import { selectLiveRouteCandidates } from "@/lib/route-quality";
import { selectFreeRoute, tollsForApi } from "./free-route-selection";
import { calculateLegTolls } from "./route-leg-pricing";

export async function calculateLeg(from: Located, to: Located, departureAt?: string, diagnostics = false) {
  const [fastResult, valhallaFreeResult, brouterResult, osrmResult, brouterFastResult] = await Promise.allSettled([
    valhalla(from, to, 1),
    valhalla(from, to, 0),
    brouterFree(from, to),
    osrmRoute(from, to),
    brouterFast(from, to),
  ]);

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

  const selectedFreePromise = selectFreeRoute(valhallaFreeResult, brouterResult);
  const diagnosticFastValidationPromise: Promise<TollValidation | null> = diagnostics && routeGeometry.length > 2
    ? validateTollEdges(routeGeometry)
    : Promise.resolve(null);
  const [selectedFree, diagnosticFastValidation] = await Promise.all([selectedFreePromise, diagnosticFastValidationPromise]);
  const confirmedFree = selectedFree?.truth === "confirmed_free" ? selectedFree : null;
  const freeCandidate = selectedFree?.truth === "candidate_unverified" ? selectedFree : null;
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

  return {
    from: from.label,
    to: to.label,
    fast: { ...selectedFast.route, quality: selectedFast.quality, tolls: tollsForApi(tolls, fastValidation), tollValidation: fastValidation },
    free: confirmedFree ? { ...confirmedFree.route, quality: confirmedFree.quality, tollValidation: confirmedFree.validation } : null,
    freeCandidate: freeCandidate ? { ...freeCandidate.route, quality: freeCandidate.quality, tollValidation: freeCandidate.validation } : null,
    freeError: confirmedFree
      ? undefined
      : freeCandidate
        ? "Найден альтернативный маршрут, но независимая проверка не подтвердила отсутствие платных участков."
        : "Маршрутизаторы не смогли подтвердить полностью бесплатный вариант. Показан только быстрый маршрут.",
  };
}
