import type { Coordinate } from "@/lib/tolls";
import type { TollBoothEvent } from "@/lib/toll-validator";
import type { M4PlazaNodeGroup } from "@/lib/toll-engine/m4-plaza-nodes";
import { localTrace } from "@/lib/toll-engine/m4-local-trace";
import { candidatesForRoute, CANDIDATE_RADIUS_KM, WINDOW_HALF_KM, type Candidate } from "@/lib/toll-engine/m4-route-candidates";
import { classifyM4TraversalWithoutTollEdge, matchM4TollBoothEdges, type M4TraceEdge } from "@/lib/toll-engine/m4-toll-booth-evidence";

const VALIDATION_BUDGET_MS = 24_000;
const CONCURRENCY = 4;

export type M4LocalPlazaCheck = {
  km: number;
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

async function validateCandidate(candidate: Candidate, deadlineAt: number): Promise<{ check: M4LocalPlazaCheck; events: TollBoothEvent[] }> {
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
        : match.status === "rejected"
          ? `OSM toll-booth node найден (${matchedNodeIds.join(", ")}), но Valhalla подтверждает бесплатное ребро; проезд по съезду/объезду не тарифицируется.`
          : "Маршрут приблизился к зоне ПВП, но map matching не подтвердил платное ребро ожидаемого OSM node",
    },
    events,
  };
}

export async function validateKnownM4Plazas(route: Coordinate[]): Promise<M4RoutePlazaValidation> {
  const startedAt = Date.now();
  const deadlineAt = startedAt + VALIDATION_BUDGET_MS;
  const candidates = candidatesForRoute(route);
  const results: Array<{ check: M4LocalPlazaCheck; events: TollBoothEvent[] }> = [];

  for (let index = 0; index < candidates.length; index += CONCURRENCY) {
    const batch = candidates.slice(index, index + CONCURRENCY);
    if (Date.now() >= deadlineAt) {
      for (const candidate of batch) {
        results.push(unavailableResult(candidate, "Исчерпан общий бюджет локальной проверки"));
      }
      continue;
    }
    results.push(...await Promise.all(batch.map((candidate) => validateCandidate(candidate, deadlineAt))));
  }

  if (results.length < candidates.length) {
    for (const candidate of candidates.slice(results.length)) {
      results.push(unavailableResult(candidate, "Кандидат не проверен из-за общего лимита времени"));
    }
  }

  const checks = results.map((item) => item.check);
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
