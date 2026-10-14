import type { Coordinate } from "@/lib/tolls";
import type { TollBoothEvent, TollValidation } from "@/lib/toll-validator";
import type { M4PlazaNodeGroup } from "@/lib/toll-engine/m4-plaza-nodes";
import { localTrace } from "@/lib/toll-engine/m4-local-trace";
import { candidatesForRoute, CANDIDATE_RADIUS_KM, WINDOW_HALF_KM, type Candidate } from "@/lib/toll-engine/m4-route-candidates";
import { classifyM4TraversalWithoutTollEdge, matchM4TollBoothEdges, type M4TraceEdge } from "@/lib/toll-engine/m4-toll-booth-evidence";

const VALIDATION_BUDGET_MS = 55_000;
const CONCURRENCY = 2;

export type M4LocalPlazaCheck = {
  km: number;
  routeProgressMeters?: number;
  model: M4PlazaNodeGroup["model"];
  status: "confirmed" | "rejected" | "unknown";
  evidence: "map_matching" | "route_traversal" | "none";
  nearestDistanceKm: number;
  matchedNodeIds: string[];
  expectedNodeIds: string[];
  windowPointCount: number;
  message: string;
};

export type M4RoutePlazaValidation = {
  source: "Valhalla local PVP map matching + strict route traversal fallback";
  candidateRadiusKm: number;
  windowHalfKm: number;
  candidateCount: number;
  routeDistanceMeters: number;
  routeDurationSeconds?: number;
  checkedCandidateCount: number;
  confirmedCount: number;
  rejectedCount: number;
  unknownCount: number;
  complete: boolean;
  events: TollBoothEvent[];
  checks: M4LocalPlazaCheck[];
  elapsedMs: number;
  message: string;
};



function unavailableResult(candidate: Candidate, remoteMessage: string): { check: M4LocalPlazaCheck; events: TollBoothEvent[] } {
  const nearestDistanceKm = Math.round(candidate.nearestDistanceKm * 1000) / 1000;
  const traversalFallbackStatus = classifyM4TraversalWithoutTollEdge(candidate.traversal.reason);
  if (candidate.traversal.confirmed) {
    return {
      check: {
        km: candidate.plaza.km,
        model: candidate.plaza.model,
        status: "unknown",
        evidence: "route_traversal",
        nearestDistanceKm,
        matchedNodeIds: [],
        expectedNodeIds: [...candidate.plaza.nodeIds],
        windowPointCount: candidate.window.length,
        message: `Удалённый map matching недоступен (${remoteMessage}); маршрут проходит рядом с OSM-якорем ПВП на ${Math.round(candidate.traversal.nearestDistanceKm * 1000)} м, но геометрия не доказывает пересечение платного ребра (возможен бесплатный съезд/объезд). Тариф не начислен.`,
      },
      events: [],
    };
  }

  // The 1.5-km candidate radius is deliberately wider than the strict
  // physical crossing radius. If remote map matching is unavailable and the
  // route itself stays outside the strict 200-metre radius of every saved
  // toll-booth anchor, this is positive evidence of a near miss, not an
  // unresolved traversal. Keeping these as unknown makes long M-4 routes fail
  // closed merely because they pass near an alternative plaza or ramp.
  if (traversalFallbackStatus === "rejected") {
    return {
      check: {
        km: candidate.plaza.km,
        model: candidate.plaza.model,
        status: "rejected",
        evidence: "route_traversal",
        nearestDistanceKm,
        matchedNodeIds: [],
        expectedNodeIds: [...candidate.plaza.nodeIds],
        windowPointCount: candidate.window.length,
        message: `Удалённый map matching недоступен (${remoteMessage}); кандидат отклонён геометрией: маршрут проходит в ${Math.round(candidate.traversal.nearestDistanceKm * 1000)} м от ближайшего сохранённого OSM-якоря ПВП, то есть вне строгого радиуса пересечения.`,
      },
      events: [],
    };
  }

  return {
    check: {
      km: candidate.plaza.km,
      model: candidate.plaza.model,
      status: "unknown",
      evidence: "none",
      nearestDistanceKm,
      matchedNodeIds: [],
      expectedNodeIds: [...candidate.plaza.nodeIds],
      windowPointCount: candidate.window.length,
      message: `${remoteMessage}; строгий route-traversal fallback не подтверждён (${candidate.traversal.reason}).`,
    },
    events: [],
  };
}

async function validateCandidate(candidate: Candidate, deadlineAt: number, selectedTrace?: TollValidation | null): Promise<{ check: M4LocalPlazaCheck; events: TollBoothEvent[] }> {
  // Reuse positive evidence from the complete trace of this same selected
  // geometry. Missing nodes and non-toll edges never authorize a crossing.
  const observed = selectedTrace?.complete === true && selectedTrace.boothEventCoverage === "complete"
    ? (selectedTrace.tollBooths ?? []).filter(event => event.edgeToll === true
      && event.osmNodeId !== null && candidate.plaza.nodeIds.includes(event.osmNodeId)) : [];
  if (observed.length) return {
    check: {km:candidate.plaza.km,model:candidate.plaza.model,status:"confirmed",evidence:"map_matching",
      nearestDistanceKm:Math.round(candidate.nearestDistanceKm*1000)/1000,
      matchedNodeIds:[...new Set(observed.map(event=>event.osmNodeId!))],
      expectedNodeIds:[...candidate.plaza.nodeIds],windowPointCount:candidate.window.length,
      message:"Конкретный платный OSM node подтверждён полной trace выбранного маршрута"},
    events:observed,
  };
  // The same strict near-miss proof already used after network failure can
  // reject off-route alternative booths before spending a remote request.
  if (!candidate.traversal.confirmed && classifyM4TraversalWithoutTollEdge(candidate.traversal.reason) === "rejected") {
    const result = unavailableResult(candidate, "Запрос не требуется: строгая геометрия исключает сохранённые якоря");
    result.check.message = `Кандидат отклонён строгой геометрией: вне радиуса всех сохранённых OSM-якорей (${Math.round(candidate.traversal.nearestDistanceKm * 1000)} м).`;
    return result;
  }
  const expectedNodeIds = new Set(candidate.plaza.nodeIds);
  const traced = await localTrace(candidate.window, deadlineAt);

  if (!traced.ok) return unavailableResult(candidate, traced.message);

  const match = matchM4TollBoothEdges(expectedNodeIds, traced.edges as M4TraceEdge[]);
  const { events, matchedNodeIds } = match;
  const confirmed = match.status === "confirmed";
  return {
    check: {
      km: candidate.plaza.km,
      model: candidate.plaza.model,
      status: match.status,
      evidence: "map_matching",
      nearestDistanceKm: Math.round(candidate.nearestDistanceKm * 1000) / 1000,
      matchedNodeIds,
      expectedNodeIds: [...expectedNodeIds],
      windowPointCount: candidate.window.length,
      message: confirmed
        ? `Подтверждён конкретный OSM toll-booth node: ${matchedNodeIds.join(", ")}`
        : match.status === "rejected" && matchedNodeIds.length > 0
          ? `OSM toll-booth node найден (${matchedNodeIds.join(", ")}), но Valhalla подтверждает бесплатное ребро; проезд по съезду/объезду не тарифицируется.`
          : match.status === "rejected"
            ? "Успешный map matching не обнаружил ожидаемый OSM toll-booth node; тариф не начислен."
          : "Маршрут приблизился к зоне ПВП, но map matching не подтвердил платное ребро ожидаемого OSM node",
    },
    events,
  };
}

function distanceMeters(a: Coordinate, b: Coordinate) {
  const toRad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * toRad;
  const dLon = (b[0] - a[0]) * toRad;
  const lat1 = a[1] * toRad;
  const lat2 = b[1] * toRad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6_371_008.8 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export async function validateKnownM4Plazas(route: Coordinate[], routeDurationSeconds?: number, endpointsOnly = false, selectedTrace?: TollValidation | null): Promise<M4RoutePlazaValidation> {
  const startedAt = Date.now();
  const deadlineAt = startedAt + VALIDATION_BUDGET_MS;
  const nearby = candidatesForRoute(route);
  const eligible = endpointsOnly ? nearby.filter(candidate =>
    classifyM4TraversalWithoutTollEdge(candidate.traversal.reason) !== "rejected") : nearby;
  // User policy: the selected journey has no intermediate exits/re-entry.
  // Only its two outer tariff boundaries require remote crossing checks.
  const candidates: Candidate[] = [];
  const results: Array<{ check: M4LocalPlazaCheck; events: TollBoothEvent[] }> = [];
  if (endpointsOnly) {
    // A nearby free ramp is not a tariff boundary. Search inward only until
    // the actual first/last paid boundary is found; never inspect the interior.
    const evaluated = new Map<number, { check: M4LocalPlazaCheck; events: TollBoothEvent[] }>();
    async function boundary(indices: number[]) {
      for (const index of indices) {
        const candidate = eligible[index];
        let result = evaluated.get(index);
        if (!result) {
          result = Date.now() >= deadlineAt ? unavailableResult(candidate, "Исчерпан бюджет определения границы")
            : await validateCandidate(candidate, deadlineAt, selectedTrace);
          evaluated.set(index, result);
        }
        if (result.check.status !== "rejected") break;
      }
    }
    // Sequential searches avoid duplicate requests for a one-section route.
    await boundary(eligible.map((_, index) => index));
    await boundary(eligible.map((_, index) => index).reverse());
    for (const index of [...evaluated.keys()].sort((a,b)=>a-b)) {
      candidates.push(eligible[index]);results.push(evaluated.get(index)!);
    }
  } else {
    candidates.push(...eligible);
    let nextIndex = 0;
    async function worker() {
      while (nextIndex < candidates.length) {
        const index = nextIndex++;
        const candidate = candidates[index];
        results[index] = Date.now() >= deadlineAt
          ? unavailableResult(candidate, "Исчерпан общий бюджет локальной проверки")
          : await validateCandidate(candidate, deadlineAt, selectedTrace);
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, candidates.length) }, worker));
  }

  const routeProgressMeters = new Array<number>(route.length).fill(0);
  for (let index = 1; index < route.length; index += 1) {
    routeProgressMeters[index] = routeProgressMeters[index - 1] + distanceMeters(route[index - 1], route[index]);
  }
  const routeDistanceMeters = routeProgressMeters.at(-1) ?? 0;
  const checks = results.map((item, index) => ({
    ...item.check,
    routeProgressMeters: routeProgressMeters[candidates[index]?.segmentIndex ?? 0],
  }));
  const eventsByNode = new Map<string, TollBoothEvent>();
  for (const item of results) {
    for (const event of item.events) {
      if (event.osmNodeId && !eventsByNode.has(event.osmNodeId)) eventsByNode.set(event.osmNodeId, event);
    }
  }
  const events = [...eventsByNode.values()];
  const confirmedCount = checks.filter((item) => item.status === "confirmed").length;
  const rejectedCount = checks.filter((item) => item.status === "rejected").length;
  const unknownCount = checks.filter((item) => item.status === "unknown").length;
  const traversalCount = checks.filter((item) => item.status === "confirmed" && item.evidence === "route_traversal").length;
  const checkedCandidateCount = confirmedCount + rejectedCount;
  const complete = route.length >= 2 && unknownCount === 0 && checks.length === candidates.length;
  const elapsedMs = Date.now() - startedAt;

  return {
    source: "Valhalla local PVP map matching + strict route traversal fallback",
    candidateRadiusKm: CANDIDATE_RADIUS_KM,
    windowHalfKm: WINDOW_HALF_KM,
    candidateCount: candidates.length,
    routeDistanceMeters,
    ...(Number.isFinite(routeDurationSeconds) && routeDurationSeconds! > 0 ? { routeDurationSeconds } : {}),
    checkedCandidateCount,
    confirmedCount,
    rejectedCount,
    unknownCount,
    complete,
    events,
    checks,
    elapsedMs,
    message: candidates.length === 0
      ? "Геометрия маршрута не входит в 1,5-км зоны известных ПВП М-4."
      : complete
        ? `Проверено ${checkedCandidateCount} локальных кандидатов М-4: подтверждено ${confirmedCount} (из них route-traversal fallback ${traversalCount}), отклонено ${rejectedCount}.`
        : `Локальная проверка неполна: подтверждено ${confirmedCount} (route-traversal fallback ${traversalCount}), отклонено ${rejectedCount}, не проверено ${unknownCount} из ${candidates.length}.`,
  };
}
