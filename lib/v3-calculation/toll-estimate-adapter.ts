import {estimateRouteTolls, type EstimateComponent, type StrictSnapshot} from "@/experiments/toll-estimates/estimate";
import {roadBoundariesFromValhalla, roadRouteSignature} from "../toll-engine/road-boundaries";
import type {M11ValhallaLeg} from "../toll-engine/m11-road-evidence-types";
import {matrixCkadComponent} from "@/experiments/nationwide-tolls/engine/ckad-route-adapter.mjs";
import {m11HeadTariffAt} from "@/experiments/nationwide-tolls/engine/m11-head-route-adapter.mjs";
import {m11MainlineTariffAt} from "@/experiments/nationwide-tolls/engine/m11-route-adapter.mjs";
import {m4TariffPeriodAt} from "@/experiments/toll-od-matrix/m4-fare-calendar-2026.mjs";
import type {RouteWithGeometry} from "../route-providers";
import type {TollValidation} from "../toll-validator";
import type {RouteTollComponent} from "../toll-engine/route-toll-composition";
import type {TollEstimateView} from "../toll-estimate-view";
import type {resolveM11ProductBoundaries} from "./m11-product-boundaries";
import {unpricedRoadCoverage} from "./unpriced-road-coverage";
import headExit from "@/experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-ckad47-exit/directed-exit.json" with {type:"json"};
import {tollEstimateEnabled} from "./toll-estimate-switch";
import validity from "@/experiments/nationwide-tolls/engine/fare-validity.cjs";

type Input = {
  route: RouteWithGeometry; departureAt: string; validation: TollValidation | null;
  components: readonly RouteTollComponent[]; strict: StrictSnapshot;
  m11: ReturnType<typeof resolveM11ProductBoundaries>;
  m4Sections?: readonly string[]; m4545Sections?: readonly string[];
};
const REGISTRY = "current_departure_tariff_registry";
const M12_WARNING = "М-12: использована рабочая тарифная модель; регистрационные границы не подтверждены независимо. Оценка не является точным тарифом оператора.";
const working = (c: RouteTollComponent) => ["m4","m4-545","m4_a289","m12"].includes(c.id)
  || c.reason === "zsd_kad_south_ekateringofka_owner_zone_vector"
  || /estimat|approx|unverified|working|inferred|candidate/iu.test(c.reason ?? "");

function completeTrace(v: TollValidation | null) {
  return v?.complete === true && v.boothEventCoverage === "complete" && !!v.chunkCount
    && v.checkedChunkCount === v.chunkCount && v.failedChunkCount === 0;
}

/** Same M11↔M7 product reviewed in E, derived from this provider's sections,
 * not from city names, saved route IDs, coordinates lookup or a fixture sum. */
function ckadEstimate(input: Input, signature: string): RouteTollComponent | null {
  const head = input.m11.parts?.head;
  if (!input.m11.resolved || !head || !completeTrace(input.validation) || !input.route.legs?.length) return null;
  const legs = input.route.legs as M11ValhallaLeg[];
  if (legs.some(l => !Array.isArray(l.maneuvers) || !l.maneuvers.length)) return null;
  const b = roadBoundariesFromValhalla(legs, "А-113");
  if (b.routeSignature !== signature || b.status !== "resolved" || b.entry?.kind !== "road-transition" || b.exit?.kind !== "road-transition") return null;
  const from = b.entry.from?.refs, to = b.exit.to?.refs;
  const forward = from?.includes("М-11") && to?.includes("М-7") && head.to === "tskad";
  const reverse = from?.includes("М-7") && to?.includes("М-11") && head.from === "tskad";
  if (!forward && !reverse) return null;
  const pair = forward ? {from:"М-11 Нева",to:"М-7 Волга"} : {from:"М-7 Волга",to:"М-11 Нева"};
  const q = matrixCkadComponent({exact:true,traversal:pair}, input.departureAt, 0);
  if (!q?.tolls || !Number.isSafeInteger(q.tolls.amount)) return null;
  return {id:"ckad",detected:true,reason:"estimate_selected_provider_m11_m7_direct_pair",tolls:{...q.tolls,confidence:"matched"}};
}

function calendar(id: string, at: string) {
  const c = id === "m4" || id === "m4-545" ? m4TariffPeriodAt(at) : id === "m11-15-58" ? m11HeadTariffAt(at)
    : id === "m11-58-679" ? m11MainlineTariffAt(at) : {status:"resolved",profile:"allDays"};
  return c.status === "resolved" && c.profile ? c.profile : null;
}

/** Pure optional addition after strict composition. No fetch/recovery/route selection.
 * The only added quote is an existing CKAD pair with current provider evidence. */
export function assessV3Tolls(input: Input): TollEstimateView | undefined {
  if (!tollEstimateEnabled()) return undefined;
  const unknown = (reason: string): TollEstimateView => ({version:1,status:"unknown",totalRub:null,knownPartRub:null,confirmedPartRub:null,warnings:[],reasons:[reason]});
  if (input.route.coordinates.length > 100_000 || input.components.length > 64) return unknown("estimate_work_limit");
  try {
    if (!validity.validInstant(input.departureAt)) return unknown("invalid_departure_date");
    const signature = roadRouteSignature(input.route.coordinates);
    let components = input.components.filter(c => c.detected).map(c => ({...c}));
    // Independent complete strict proof retains priority even if trace is absent.
    // Known working source grades (including ZSD600) are not upgraded by a label.
    if (input.strict.pricingStatus === "priced" && input.strict.priceConfirmation === "confirmed"
      && Number.isSafeInteger(input.strict.amount) && input.strict.amount! >= 0 && !components.some(working)
      && new Set(components.map(c => c.id)).size === components.length
      && components.every(c => c.tolls) && components.reduce((sum,c) => sum + c.tolls!.amount,0) === input.strict.amount)
      return {version:1,status:"confirmed",totalRub:input.strict.amount,knownPartRub:input.strict.amount,confirmedPartRub:input.strict.amount,warnings:[],reasons:[]};
    if (components.some(c => c.id === "ckad" && !c.tolls)) {
      const q = ckadEstimate(input, signature);
      if (q) components = components.map(c => c.id === "ckad" ? q : c);
    }
    // A formerly unnamed CKAD47 exit booth belongs to the already-priced M11
    // head. Remove only that exact duplicate residual, never an unknown road.
    const residual = components.find(c => c.id === "unknown-paid-road");
    const gate = input.validation?.tollBooths?.filter(b => b.osmNodeId === headExit.gateNodeId && b.wayId === headExit.gateWayId);
    if (residual?.reason === "unmapped_selected_route_paid_booth" && input.m11.parts?.head?.to === "tskad"
      && components.some(c => c.id === "m11-15-58" && c.tolls) && gate?.length === 1 && input.validation) {
      const rest = {...input.validation,tollBooths:input.validation.tollBooths!.filter(b => b !== gate[0])};
      const remaining = unpricedRoadCoverage({segments:[],validation:rest,candidateNetworks:[],m1m3Candidates:[]});
      if (!remaining.regionalProducts.some(p => p.id === "unknown-paid-road")) components = components.filter(c => c !== residual);
    }
    const parts: EstimateComponent[] = components.map(c => {
      const profile = calendar(c.id,input.departureAt);
      const road = c.id.startsWith("m11") ? "m11" : c.id.startsWith("m4") ? "m4" : c.id;
      const atomic = c.id === "m4" && input.m4Sections?.length ? input.m4Sections : c.id === "m4-545" ? input.m4545Sections : null;
      const coverage = atomic?.length ? atomic.map(key => "m4:" + key) : [c.id];
      const m4SplitUnbound = c.id === "m4" && components.some(p => p.id === "m4-545") && !input.m4Sections?.length;
      const conditions = {road,operator:road === "zsd" ? "NCH" : "current-road-operator",product:c.id,direction:"selected-directed-traversal",category:"I",payment:c.id === "ckad" ? "post-payment" : "cash/card",profile:profile ?? "unresolved"};
      const trusted = !working(c);
      const family = ["m4","m4-545","m4_a289","a289","krasnodar-west-bypass"].includes(c.id) ? "southern" : road;
      return {id:c.id,conditions,entry:"selected-entry",exit:"selected-exit",family,
        aggregate:c.id === "m11" || c.id === "m4_a289",coverageKeys:coverage,
        scope:{proven:!!c.tolls && !m4SplitUnbound,reference:c.reason ?? "strict-component-evidence",routeId:signature,geometrySha256:signature},
        ...(c.tolls && profile ? {quote:{conditions,routeId:signature,geometrySha256:signature,departureAt:input.departureAt,
          rub:c.tolls.amount,profile,validity:"resolved" as const,source:REGISTRY,assurance:trusted ? "confirmed" as const : "working_estimate" as const}} : {stopReason:c.reason ?? "component_unpriced"})};
    });
    const required = parts.flatMap(c => [...c.coverageKeys]);
    const result = estimateRouteTolls({routeId:signature,geometrySha256:signature,departureAt:input.departureAt,
      coverageComplete:completeTrace(input.validation),requiredCoverage:[...new Set(required)],components:parts,strict:input.strict,
      confirmedNoPaidCrossing:input.strict.pricingStatus === "free" && parts.length === 0},{enabled:true});
    return {version:1,status:result.status === "insufficient" || result.status === "disabled" ? "unknown" : result.status,
      totalRub:result.totalRub,knownPartRub:result.assessedSubtotalRub,confirmedPartRub:result.confirmedSubtotalRub,
      warnings:parts.some(c => c.id === "m12" && c.quote) ? [M12_WARNING] : [],reasons:result.reasons.slice(0,64)};
  } catch {
    // Optional evidence failure must not fail or rewrite the strict calculation.
    return unknown("estimate_evidence_unavailable");
  }
}
