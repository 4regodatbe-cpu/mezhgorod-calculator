import type { Coordinate } from "@/lib/tolls";
import type { TollBoothEvent } from "@/lib/toll-validator";
import type { M4PlazaNodeGroup } from "@/lib/toll-engine/m4-plaza-nodes";
import { localTrace } from "@/lib/toll-engine/m4-local-trace";
import { candidatesForRoute, CANDIDATE_RADIUS_KM, WINDOW_HALF_KM, type Candidate } from "@/lib/toll-engine/m4-route-candidates";

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
  if (candidate.traversal.confirmed) {
    return {
      check: {
        km: candidate.plaza.km,
        model: candidate.plaza.model,
        status: "confirmed",
        evidence: "route_traversal",
        nearestDistanceKm,
        matchedNodeIds: [],
        expectedNodeIds: [...candidate.plaza.nodeIds],
        windowPointCount: candidate.window.length,
        message: `Удалённый map matching недоступен (${remoteMessage}); ПВП подтверждён строгим пересечением сохранённого OSM-якоря маршрутом на ${Math.round(candidate.traversal.nearestDistanceKm * 1000)} м с продолжением трассы по обе стороны.`,
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
  if (candidate.traversal.reason === "outside_strict_traversal_radius") {
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

  const events: TollBoothEvent[] = [];
  const seen = new Set<string>();
  traced.edges.forEach((edge, edgeIndex) => {
    if (edge.end_node?.type !== "toll_booth") return;
    const rawNodeId = edge.end_node.node_id;
    if (rawNodeId === undefined) return;
    const osmNodeId = String(rawNodeId);
    if (!expectedNodeIds.has(osmNodeId) || seen.has(osmNodeId)) return;
    seen.add(osmNodeId);
    events.push({
      osmNodeId,
      wayId: edge.way_id === undefined ? null : String(edge.way_id),
      roadNames: edge.names ?? [],
      edgeIndex,
      edgeToll: edge.toll === true,
      beginShapeIndex: edge.begin_shape_index,
      endShapeIndex: edge.end_shape_index,
    });
  });

  const matchedNodeIds = events.map((event) => event.osmNodeId).filter((value): value is string => Boolean(value));
  const confirmed = matchedNodeIds.length > 0;
  return {
    check: {
      km: candidate.plaza.km,
      model: candidate.plaza.model,
      status: confirmed ? "confirmed" : "rejected",
      evidence: "map_matching",
      nearestDistanceKm: Math.round(candidate.nearestDistanceKm * 1000) / 1000,
      matchedNodeIds,
      expectedNodeIds: [...expectedNodeIds],
      windowPointCount: candidate.window.length,
      message: confirmed
        ? `Подтверждён конкретный OSM toll-booth node: ${matchedNodeIds.join(", ")}`
        : "Маршрут приблизился к зоне ПВП, но успешный локальный map matching не подтвердил ни один ожидаемый OSM node",
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
