import fareValidity from '@/experiments/nationwide-tolls/engine/fare-validity.cjs';
import { resolveM12ProductBoundaries } from "./m12-product-boundaries";
import { resolveM11ProductBoundaries } from "./m11-product-boundaries";
import { unpricedRoadCoverage } from "./unpriced-road-coverage";
import { matrixZsdCashCardComponent } from "./zsd-cash-card-component";
import { matrixOdintsovoPairComponent } from "./odintsovo-pair-component";
import { m11TraversalSafety } from "./m11-traversal-safety";
import { matrixM11Component, matrixM11GeometryComponent } from "@/experiments/nationwide-tolls/engine/m11-route-adapter.mjs";
import { matrixCkadComponent } from "@/experiments/nationwide-tolls/engine/ckad-route-adapter.mjs";
import { matrixM12Component } from "@/experiments/nationwide-tolls/engine/m12-route-adapter.mjs";
import { matrixM4Component } from "@/experiments/nationwide-tolls/engine/m4-route-adapter.mjs";
import { composeSelectedM4A289 } from "./m4-a289-composition";
import { estimateTolls, type Coordinate } from "@/lib/tolls";
import nationalCatalog from "@/experiments/nationwide-tolls/national-registry.json";
import { inspectNationwideCandidates } from "@/experiments/nationwide-tolls/national-preview.mjs";
import { auditM1M3SelectedRoute } from "@/experiments/nationwide-tolls/m1-m3-gate-evidence.mjs";
import m1m3OfficialGates from "@/experiments/nationwide-tolls/m1-m3-official-gates.json";
import { quoteM3ThreeGateShadow, quoteM1SingleGateShadow } from "@/experiments/nationwide-tolls/m1-m3-shadow-quote.mjs";
import { recoverCorridorTolls } from "@/lib/toll-recovery";
import { validateTollEdges, type TollValidation } from "@/lib/toll-validator";
import { resolveSelectedM4Endpoints, type ProductionM4Result } from "@/lib/toll-engine/m4-production";
import { calculateProductionM11 } from "@/lib/toll-engine/m11-production";
import { facilityAnchors, haversineKm } from "@/lib/toll-engine/m11-moscow-geometry";
import { calculateM11MoscowToPetersburg } from "@/lib/toll-engine/m11-moscow-production";
import { inspectM11PulkovoAccess } from "@/lib/toll-engine/m11-pulkovo-evidence";
import { matrixM11TailComponent } from "@/lib/toll-engine/m11-tail-component";
import { resolveCkadProductBoundaries } from "./ckad-product-boundaries";
import { composeRouteTolls, detectedFamiliesFromLegacySegments, type RouteTollComponent } from "@/lib/toll-engine/route-toll-composition";
import { compositionValidation, routeDifferenceEvidence, unknownValidation, zeroUnknownTolls, type TollEstimate } from "../v2-calculation/free-route-selection";
import type { RouteSummary, RouteWithGeometry } from "@/lib/route-providers";
import { familySegments } from "../v2-calculation/route-leg-pricing-helpers";

type LegTollInput = {
  routeGeometry: Coordinate[];
  routeSeconds: number;
  departureAt?: string;
  selectedFastProvider: string;
  selectedFastRoute: RouteWithGeometry;
  valhallaEvidence: RouteWithGeometry | null;
  confirmedFreeRoute: RouteSummary | null;
  diagnosticFastValidation: TollValidation | null;
};

export async function calculateLegTolls({
  routeGeometry,
  routeSeconds,
  departureAt = new Date().toISOString(),
  selectedFastRoute,
  confirmedFreeRoute,
  diagnosticFastValidation,
}: LegTollInput): Promise<{ tolls: TollEstimate & {priceConfirmation:string;displayLabel:string | null}; fastValidation: TollValidation; componentAudit: {status:string;priced:string[];missing:string[];components:RouteTollComponent[]}; m4PvpPreview?: ProductionM4Result["m4PvpPreview"]; nationalTollCoverage: ReturnType<typeof inspectNationwideCandidates> & { m1m3GateAudit: ReturnType<typeof auditM1M3SelectedRoute>; m3Shadow: ReturnType<typeof quoteM3ThreeGateShadow>; m1Shadow: ReturnType<typeof quoteM1SingleGateShadow> } }> {
  const confirmedFree = confirmedFreeRoute ? { route: confirmedFreeRoute } : null;
  const differenceEvidence = confirmedFree ? routeDifferenceEvidence(selectedFastRoute, confirmedFree.route) : false;

  const geometricTolls = estimateTolls(routeGeometry, departureAt);
  // National research is a route-scoped shadow diagnostic: zero new charges.
  // Operator fare data alone cannot prove that a physical paid gate was crossed.

  const legacyFamilies = detectedFamiliesFromLegacySegments(geometricTolls.segments);

  const productionM4 = await resolveSelectedM4Endpoints(routeGeometry, routeSeconds, diagnosticFastValidation, selectedFastRoute.m4RoadBoundaries);
  const matrixM4 = matrixM4Component(productionM4, departureAt, routeSeconds);
  if (productionM4.m4PvpPreview && matrixM4?.tariffVector) {
    productionM4.m4PvpPreview.tariffVector = matrixM4.tariffVector;
  }
  const m4A289 = composeSelectedM4A289(routeGeometry, productionM4, matrixM4 ? {...matrixM4, tolls: matrixM4.tolls as ProductionM4Result["tolls"]} : null, geometricTolls.segments, departureAt, routeSeconds);
  const productionM11Geometry = calculateM11MoscowToPetersburg(routeGeometry, routeSeconds, departureAt);
  const m11Airport = inspectM11PulkovoAccess(routeGeometry);
  const m11Boundaries = resolveM11ProductBoundaries(routeGeometry,routeSeconds,departureAt,selectedFastRoute.m11RoadEvidence,diagnosticFastValidation);
  const matrixM11Geometry = matrixM11GeometryComponent({exact:m11Boundaries.resolved,parts:m11Boundaries.parts},departureAt);
  const productionM11 = selectedFastRoute.m11RoadEvidence
    ? calculateProductionM11(
        routeGeometry,
        selectedFastRoute.m11RoadEvidence,
        familySegments(geometricTolls.segments, "m11"),
        departureAt,
      )
    : null;
  const m11SafetyReason = m11TraversalSafety(routeGeometry, selectedFastRoute.m11RoadEvidence);
  const blocks = selectedFastRoute.m11RoadEvidence?.strictBlocks ?? [];
  const lastM11Block = blocks.at(-1);
  // The separate 679–684 product is not included in the 58–679 matrix.
  // A route continuing beyond p679 must remain unknown until that product's
  // physical exit is independently bound; do not publish a known subset.
  const firstM11Block = blocks[0];
  const m11OuterTo = m11Boundaries.parts?.to ?? productionM11?.traversal?.exitPointId;
  const m11OuterFrom = m11Boundaries.parts?.from ?? productionM11?.traversal?.entryPointId;
  const m11TailUnresolved = (m11OuterTo === "p679" && (
    !lastM11Block || !facilityAnchors("p679").some(anchor =>
      haversineKm(anchor, lastM11Block.endCoordinate) <= 0.5)
  )) || (m11OuterFrom === "p679" && (
    !firstM11Block || !facilityAnchors("p679").some(anchor =>
      haversineKm(anchor, firstM11Block.beginCoordinate) <= 0.5)
  ));
  const matrixM11Tail = matrixM11TailComponent(m11TailUnresolved, departureAt);
  const matrixM11 = m11SafetyReason ? {tolls:null,reason:m11SafetyReason}
    : matrixM11Component(productionM11, departureAt, routeSeconds);
  const m12Span = selectedFastRoute.m12EndpointSpan ?? selectedFastRoute.m12StrictSpan;
  const m12Boundaries = resolveM12ProductBoundaries(routeGeometry,m12Span);
  const matrixM12 = matrixM12Component(m12Boundaries,departureAt,routeSeconds);
  const m4Detected = productionM4.candidate || legacyFamilies.has("m4_a289") || Boolean(m4A289);
  const m11Detected = m11Boundaries.candidate || productionM11Geometry.candidate || legacyFamilies.has("m11") || Boolean(selectedFastRoute.m11RoadEvidence?.strictBlocks.length);
  const m12Detected = legacyFamilies.has("m12") || Boolean(m12Span) || selectedFastRoute.m12Candidate === true;
  const productionCkad = resolveCkadProductBoundaries(routeGeometry, selectedFastRoute.m11RoadEvidence, diagnosticFastValidation);
  const matrixCkad = matrixCkadComponent(productionCkad, departureAt, routeSeconds);
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
  const m3Shadow = quoteM3ThreeGateShadow(nationalCatalog, m1m3GateAudit, departureAt, routeSeconds);
  const m1Shadow = quoteM1SingleGateShadow(nationalCatalog, m1m3GateAudit, departureAt, routeSeconds);
  const nationalTollCoverage = inspectNationwideCandidates(nationalCatalog, geometricTolls.segments, {
    m4StrictPvpCount: productionM4.m4PvpPreview?.confirmedPvps?.length ?? 0,
    m11Candidate: productionM11Geometry.candidate,
    m12Candidate: Boolean(m12Span) || selectedFastRoute.m12Candidate === true,
    ckadCandidate: productionCkad.candidate,
    m1m3Candidates: m1m3GateAudit.candidateRoads,
  });

  const unpricedCoverage = unpricedRoadCoverage({
    segments: geometricTolls.segments,
    validation: diagnosticFastValidation,
    candidateNetworks: nationalTollCoverage.candidateNetworks,
    m1m3Candidates: m1m3GateAudit.candidateRoads,
  });
  const m11HeadDetected = m11Boundaries.headDetected;
  // Independent products: known head/mainline values remain diagnostics when
  // a tail is unresolved. The upper composer blocks the complete total.
  const m11TimeMissing = m11HeadDetected && !fareValidity.validInstant(departureAt);
  const m11BlockReason = m11TimeMissing ? "m11_head_payment_time_missing" : m11SafetyReason;
  const m11Products: RouteTollComponent[] = matrixM11Geometry?.components ?? [
    {id:"m11-15-58",detected:m11HeadDetected,tolls:null,
      reason:productionM11Geometry.reason},
    {id:"m11-58-679",detected:m11Detected,
      tolls:matrixM11?.tolls ?? null,
      reason:matrixM11?.reason ?? productionM11?.reason ?? productionM11Geometry.reason},
  ];
  if (m11BlockReason) for (const component of m11Products) {
    component.tolls = null;
    component.reason = m11BlockReason;
  }
  m11Products.push({id:"m11-679-684",detected:m11Airport.candidate || m11TailUnresolved,
    tolls:matrixM11Tail?.tolls ?? null,
    reason:matrixM11Tail?.reason ?? (m11Airport.candidate ? m11Airport.reason : "m11_679_684_continuation_not_priced")});

  const southernProducts: RouteTollComponent[] = m4A289?.components ?? [{id:"m4",detected:m4Detected,
    tolls:matrixM4?.tolls as ProductionM4Result["tolls"] ?? null,reason:matrixM4?.reason ?? productionM4.reason}];
  for (const id of unpricedCoverage.matchedCoreProducts) {
    if (id === "m11") {
      const mainline = m11Products.find(c=>c.id === "m11-58-679")!;
      mainline.detected = true;
    } else if (["m4","a289","krasnodar-west-bypass"].includes(id)) {
      const existing = southernProducts.find(c=>c.id === id);
      if (existing) existing.detected = true;
      else southernProducts.push({id,detected:true,tolls:null,reason:"matched_paid_product_boundary_not_priced"});
    }
  }
  const components: RouteTollComponent[] = [
    ...southernProducts,
    ...m11Products,
    { id: "m12", detected: m12Detected || unpricedCoverage.matchedCoreProducts.includes("m12"), tolls: matrixM12?.tolls ?? null, reason: matrixM12?.reason ?? m12Boundaries.reason ?? selectedFastRoute.m12SpanReason ?? "m12_not_priced" },
    { id: "ckad", detected: ckadDetected || unpricedCoverage.matchedCoreProducts.includes("ckad"), tolls: matrixCkad?.tolls ?? null, reason: matrixCkad?.reason ?? productionCkad.reason },
    { id: "m1", detected: unpricedCoverage.m1, tolls: null, reason: "m1_engine_not_yet_composed" },
    { id: "m3", detected: unpricedCoverage.m3, tolls: null, reason: "m3_engine_not_yet_composed" },
    {id:"ckad-small-vyazemy",detected:unpricedCoverage.smallVyazemy,tolls:null,reason:"small_vyazemy_physical_boundaries_not_priced"},
    ...unpricedCoverage.regionalProducts.map(product=>product.id==='zsd'
      ?{id:product.id,detected:true,...matrixZsdCashCardComponent(routeGeometry,diagnosticFastValidation,departureAt,routeSeconds)}
      :product.id==='odintsovo'
      ?{id:product.id,detected:true,...matrixOdintsovoPairComponent(routeGeometry,diagnosticFastValidation,departureAt,routeSeconds)}
      :{id:product.id,detected:true,tolls:null,reason:product.reason}),
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
    // Geometry is detection evidence, never a substitute tariff. A free
    // alternative also says nothing about the price of this selected route.
    pricedTolls = zeroUnknownTolls(geometricTolls, geometricTolls.segments);
    fastValidation = diagnosticFastValidation && (diagnosticFastValidation.status !== "free" || diagnosticFastValidation.complete === true)
      ? diagnosticFastValidation
      : unknownValidation("Готовая цена выбранного маршрута не найдена; геометрическая оценка не является тарифом");
  }


  if (!routeCompositionBlocked && pricedTolls.amount <= 0) {
    const conservativeValidation = unknownValidation("Локальный коридорный fallback без доверия к удалённому map matching");
    const localRecovery = recoverCorridorTolls(routeGeometry, conservativeValidation, departureAt, differenceEvidence);
    // Legacy recovery finds a subset of approximate segments. It cannot
    // certify a complete selected-route charge, even when the subset has money.
    if (localRecovery) {
      pricedTolls = zeroUnknownTolls(localRecovery,
          ["Полная стоимость коридора неизвестна; найденные отрезки — только диагностика", ...localRecovery.segments]);
      fastValidation = unknownValidation("Найдены приблизительные платные отрезки; полного тарифа маршрута нет");
    }
  }

  if (!routeCompositionBlocked && pricedTolls.amount <= 0 && routeGeometry.length > 2) {
    if (!diagnosticFastValidation) fastValidation = await validateTollEdges(routeGeometry);
    const lateCoverage = unpricedRoadCoverage({segments: geometricTolls.segments,
      validation: fastValidation, candidateNetworks: nationalTollCoverage.candidateNetworks,
      m1m3Candidates: auditM1M3SelectedRoute(m1m3OfficialGates, fastValidation, "selected-fast-route").candidateRoads});
    const lateMissing = [...new Set([
      ...(lateCoverage.m1 ? ["m1"] : []), ...(lateCoverage.m3 ? ["m3"] : []),
      ...lateCoverage.regionalProducts.map(p=>p.id),
      ...lateCoverage.matchedCoreProducts,
      ...(lateCoverage.smallVyazemy ? ["ckad-small-vyazemy"] : []),
    ])];
    if (lateMissing.length > 0) {
      routeCompositionBlocked = true;
      const missing = lateMissing.join(", ");
      pricedTolls = zeroUnknownTolls(geometricTolls, [`Обнаружены, но не полностью оценены платные системы: ${missing}`]);
      fastValidation = unknownValidation(`Поздняя проверка выбранного маршрута обнаружила неоценённые системы: ${missing}`);
    } else {
      const remoteRecovery = recoverCorridorTolls(routeGeometry, fastValidation, departureAt, differenceEvidence);
      if (remoteRecovery) {
        pricedTolls = zeroUnknownTolls(remoteRecovery,
          ["Полная стоимость коридора неизвестна; найденные отрезки — только диагностика", ...remoteRecovery.segments]);
        fastValidation = unknownValidation("Резервный расчёт нашёл только часть отрезков; полный тариф выбранного маршрута неизвестен");
      } else if (fastValidation.status !== "free" || fastValidation.complete !== true) {
        fastValidation = unknownValidation("Проверка дорожных рёбер не дала готового тарифа или полного подтверждения бесплатного маршрута");
      }
    }
  }

  const tolls = pricedTolls;
  // Read-only audit of the composition that was actually priced. It never
  // changes eligibility or the total, and is not added to the public API DTO.
  const componentAudit = {status:composition.status,priced:[...composition.priced],missing:[...composition.missing],
    components:components.filter(component=>component.detected).map(component=>({...component,
      tolls:component.tolls?{...component.tolls,segments:[...component.tolls.segments]}:null}))};
  return { componentAudit, tolls: { ...tolls, priceConfirmation: matrixM4?.tolls && composition.status === "priced" ? matrixM4.priceConfirmation : "unconfirmed", displayLabel: null }, fastValidation, m4PvpPreview: productionM4.m4PvpPreview, nationalTollCoverage: {...nationalTollCoverage, m1m3GateAudit, m3Shadow, m1Shadow} };
}
