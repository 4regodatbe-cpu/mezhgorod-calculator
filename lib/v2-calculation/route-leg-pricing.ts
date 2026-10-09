import { estimateTolls, type Coordinate } from "@/lib/tolls";
import nationalCatalog from "@/experiments/nationwide-tolls/national-registry.json";
import { inspectNationwideCandidates } from "@/experiments/nationwide-tolls/national-preview.mjs";
import { auditM1M3SelectedRoute } from "@/experiments/nationwide-tolls/m1-m3-gate-evidence.mjs";
import m1m3OfficialGates from "@/experiments/nationwide-tolls/m1-m3-official-gates.json";
import { recoverCorridorTolls } from "@/lib/toll-recovery";
import { validateTollEdges, type TollValidation } from "@/lib/toll-validator";
import { calculateProductionM4, type ProductionM4Result } from "@/lib/toll-engine/m4-production";
import { calculateProductionM11 } from "@/lib/toll-engine/m11-production";
import { calculateM11MoscowToPetersburg } from "@/lib/toll-engine/m11-moscow-production";
import { calculateProductionM12 } from "@/lib/toll-engine/m12-production";
import { calculateProductionCkadM4M11 } from "@/lib/toll-engine/ckad-production";
import { composeRouteTolls, detectedFamiliesFromLegacySegments, type RouteTollComponent } from "@/lib/toll-engine/route-toll-composition";
import { compositionValidation, routeDifferenceEvidence, unknownValidation, zeroUnknownTolls, type TollEstimate } from "./free-route-selection";
import type { RouteSummary, RouteWithGeometry } from "@/lib/route-providers";
import { familySegments, mapMatchedTollFallback, routingDifferenceTollFallback } from "./route-leg-pricing-helpers";

type LegTollInput = {
  routeGeometry: Coordinate[];
  routeSeconds: number;
  departureAt?: string;
  selectedFastProvider: string;
  selectedFastRoute: RouteSummary;
  valhallaEvidence: RouteWithGeometry | null;
  confirmedFreeRoute: RouteSummary | null;
  diagnosticFastValidation: TollValidation | null;
};

export async function calculateLegTolls({
  routeGeometry,
  routeSeconds,
  departureAt,
  selectedFastProvider,
  selectedFastRoute,
  valhallaEvidence,
  confirmedFreeRoute,
  diagnosticFastValidation,
}: LegTollInput): Promise<{ tolls: TollEstimate; fastValidation: TollValidation; m4PvpPreview?: ProductionM4Result["m4PvpPreview"]; nationalTollCoverage: ReturnType<typeof inspectNationwideCandidates> }> {
  const confirmedFree = confirmedFreeRoute ? { route: confirmedFreeRoute } : null;
  const differenceEvidence = confirmedFree ? routeDifferenceEvidence(selectedFastRoute, confirmedFree.route) : false;

  const geometricTolls = estimateTolls(routeGeometry, departureAt);
  // National research is a route-scoped shadow diagnostic: zero new charges.
  // Operator fare data alone cannot prove that a physical paid gate was crossed.

  const legacyFamilies = detectedFamiliesFromLegacySegments(geometricTolls.segments);

  const productionM4 = await calculateProductionM4(
    routeGeometry,
    departureAt,
    familySegments(geometricTolls.segments, "m4_a289"),
    routeSeconds,
  );
  const productionM11Geometry = calculateM11MoscowToPetersburg(routeGeometry, routeSeconds, departureAt);
  const productionM11 = selectedFastProvider === "Valhalla" && valhallaEvidence?.m11RoadEvidence
    ? calculateProductionM11(
        valhallaEvidence.coordinates,
        valhallaEvidence.m11RoadEvidence,
        familySegments(geometricTolls.segments, "m11"),
        departureAt,
      )
    : null;
  const productionM12 = selectedFastProvider === "Valhalla" && valhallaEvidence
    ? calculateProductionM12(
        valhallaEvidence.coordinates,
        valhallaEvidence.m12StrictSpan,
        familySegments(geometricTolls.segments, "m12"),
        departureAt,
      )
    : null;
  const m4Detected = productionM4.candidate || legacyFamilies.has("m4_a289");
  const m11Detected = productionM11Geometry.candidate || legacyFamilies.has("m11") || Boolean(valhallaEvidence?.m11RoadEvidence?.strictBlocks.length);
  const m12Detected = legacyFamilies.has("m12") || Boolean(valhallaEvidence?.m12StrictSpan);
  const productionCkad = calculateProductionCkadM4M11(routeGeometry, valhallaEvidence?.m11RoadEvidence);
  // CKAD is a paid component only when legacy evidence names it or the strict
  // route-level CKAD engine proves a candidate/verified east-arc traversal.
  const ckadDetected = legacyFamilies.has("ckad") || productionCkad.candidate;
  const m1m3GateAudit = auditM1M3SelectedRoute(
    m1m3OfficialGates,
    diagnosticFastValidation,
    // The diagnostic match uses *this same selected route geometry*. No
    // evidence is reusable for another route, and nothing here authorizes fares.
    "selected-fast-route",
  );
  const nationalTollCoverage = inspectNationwideCandidates(nationalCatalog, geometricTolls.segments, {
    m4StrictPvpCount: productionM4.m4PvpPreview?.confirmedPvps?.length ?? 0,
    m11Candidate: productionM11Geometry.candidate,
    m12Candidate: Boolean(valhallaEvidence?.m12StrictSpan),
    ckadCandidate: productionCkad.candidate,
    m1m3Candidates: m1m3GateAudit.candidateRoads,
  });

  const components: RouteTollComponent[] = [
    { id: "m4_a289", detected: m4Detected, tolls: productionM4.tolls, reason: productionM4.reason },
    { id: "m11", detected: m11Detected, tolls: productionM11Geometry.tolls ?? productionM11?.tolls ?? null, reason: productionM11Geometry.exact ? productionM11Geometry.reason : productionM11?.reason ?? productionM11Geometry.reason },
    { id: "m12", detected: m12Detected, tolls: productionM12?.tolls ?? null, reason: productionM12?.core.reason ?? "m12_not_priced" },
    { id: "ckad", detected: ckadDetected, tolls: productionCkad.tolls, reason: productionCkad.reason },
    { id: "m1", detected: legacyFamilies.has("m1"), tolls: null, reason: "m1_engine_not_yet_composed" },
    { id: "m3", detected: legacyFamilies.has("m3"), tolls: null, reason: "m3_engine_not_yet_composed" },
    { id: "regional", detected: legacyFamilies.has("regional"), tolls: null, reason: "regional_engine_not_yet_composed" },
  ];
  const composition = composeRouteTolls(components);

  let pricedTolls: TollEstimate;
  let fastValidation: TollValidation;
  let routeCompositionBlocked = false;

  if (composition.status === "priced" && composition.tolls) {
    pricedTolls = composition.tolls;
    fastValidation = compositionValidation(composition.priced, `Полный итог составлен из дорожных систем: ${composition.priced.join(", ")}`);
  } else if (composition.status === "unknown") {
    routeCompositionBlocked = true;
    const missingReasons = components
      .filter((component) => composition.missing.includes(component.id))
      .map((component) => `${component.id}: ${component.reason ?? "причина не указана"}`);
    pricedTolls = zeroUnknownTolls(
      geometricTolls,
      [
        `Обнаружены, но не полностью оценены платные системы: ${composition.missing.join(", ")}`,
        ...missingReasons,
      ],
    );
    fastValidation = unknownValidation(
      `Нельзя показывать частичную сумму как итог маршрута. Не оценены: ${missingReasons.join("; ")}`,
    );
  } else {
    pricedTolls = geometricTolls;
    fastValidation = diagnosticFastValidation
      ?? unknownValidation(pricedTolls.amount > 0
        ? "Стоимость получена из расчёта дорожных систем или геометрии маршрута"
        : "Map matching быстрого маршрута ещё не выполнялся");
  }


  if (!routeCompositionBlocked && pricedTolls.amount <= 0) {
    const conservativeValidation = unknownValidation("Локальный коридорный fallback без доверия к удалённому map matching");
    const localRecovery = recoverCorridorTolls(routeGeometry, conservativeValidation, departureAt, differenceEvidence);
    if (localRecovery) pricedTolls = localRecovery;
  }

  if (!routeCompositionBlocked && pricedTolls.amount <= 0 && routeGeometry.length > 2) {
    if (!diagnosticFastValidation) fastValidation = await validateTollEdges(routeGeometry);
    const matchedTolls = mapMatchedTollFallback(pricedTolls, fastValidation);
    const remoteRecovery = recoverCorridorTolls(routeGeometry, fastValidation, departureAt, differenceEvidence);
    pricedTolls = remoteRecovery ?? matchedTolls;
  }

  const tolls = confirmedFree && !routeCompositionBlocked
    ? routingDifferenceTollFallback(selectedFastRoute, confirmedFree.route, pricedTolls)
    : pricedTolls;
  return { tolls, fastValidation, m4PvpPreview: productionM4.m4PvpPreview, nationalTollCoverage: {...nationalTollCoverage, m1m3GateAudit} };
}
