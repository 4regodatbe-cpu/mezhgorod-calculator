import type { Coordinate } from "@/lib/tolls";
import type { TollBoothEvent } from "@/lib/toll-validator";
import { M4_PLAZA_NODES, type M4PlazaNodeGroup } from "@/lib/toll-engine/m4-plaza-nodes";
import { evaluateM4RouteTraversal, type M4RouteTraversalEvidence } from "@/lib/toll-engine/m4-route-traversal";

const CANDIDATE_RADIUS_KM = 1.5;
const WINDOW_HALF_KM = 4;
const MAX_WINDOW_POINTS = 120;
const REQUEST_TIMEOUT_MS = 4_500;
const RETRY_DELAY_MS = 300;
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

type Candidate = {
  plaza: M4PlazaNodeGroup;
  nearestDistanceKm: number;
  segmentIndex: number;
  window: Coordinate[];
  traversal: M4RouteTraversalEvidence;
};

type TraceEdge = {
  toll?: boolean;
  way_id?: string | number;
  names?: string[];
  begin_shape_index?: number;
  end_shape_index?: number;
  end_node?: {
    type?: string;
    node_id?: string | number;
  };
};

type LocalTraceResult =
  | { ok: true; edges: TraceEdge[] }
  | { ok: false; message: string };

function distanceKm(a: Coordinate, b: Coordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = (b[0] - a[0]) * rad;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function pointToSegmentKm(anchor: { lat: number; lon: number }, a: Coordinate, b: Coordinate) {
  const latScale = 110.574;
  const lonScale = 111.320 * Math.cos(anchor.lat * Math.PI / 180);
  const ax = (a[0] - anchor.lon) * lonScale;
  const ay = (a[1] - anchor.lat) * latScale;
  const bx = (b[0] - anchor.lon) * lonScale;
  const by = (b[1] - anchor.lat) * latScale;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared <= 1e-12) return Math.hypot(ax, ay);
  const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
  return Math.hypot(ax + t * dx, ay + t * dy);
}

function nearestSegment(route: Coordinate[], plaza: M4PlazaNodeGroup) {
  let nearestDistanceKm = Number.POSITIVE_INFINITY;
  let segmentIndex = -1;

  for (const anchor of plaza.anchors) {
    for (let index = 0; index < route.length - 1; index += 1) {
      const candidateDistance = pointToSegmentKm(anchor, route[index], route[index + 1]);
      if (candidateDistance < nearestDistanceKm) {
        nearestDistanceKm = candidateDistance;
        segmentIndex = index;
      }
    }
  }

  return { nearestDistanceKm, segmentIndex };
}

function sampleWindow(points: Coordinate[]) {
  if (points.length <= MAX_WINDOW_POINTS) return points;
  const step = (points.length - 1) / (MAX_WINDOW_POINTS - 1);
  const sampled: Coordinate[] = [];
  for (let index = 0; index < MAX_WINDOW_POINTS; index += 1) {
    sampled.push(points[Math.min(points.length - 1, Math.round(index * step))]);
  }
  sampled[sampled.length - 1] = points[points.length - 1];
  return sampled;
}

function localWindow(route: Coordinate[], segmentIndex: number) {
  let start = Math.max(0, segmentIndex);
  let end = Math.min(route.length - 1, segmentIndex + 1);
  let backwardKm = 0;
  let forwardKm = 0;

  while (start > 0 && backwardKm < WINDOW_HALF_KM) {
    backwardKm += distanceKm(route[start], route[start - 1]);
    start -= 1;
  }
  while (end < route.length - 1 && forwardKm < WINDOW_HALF_KM) {
    forwardKm += distanceKm(route[end], route[end + 1]);
    end += 1;
  }

  return sampleWindow(route.slice(start, end + 1));
}

function candidatesForRoute(route: Coordinate[]): Candidate[] {
  if (route.length < 2) return [];
  const candidates: Candidate[] = [];

  for (const plaza of M4_PLAZA_NODES) {
    const nearest = nearestSegment(route, plaza);
    if (nearest.segmentIndex < 0 || nearest.nearestDistanceKm > CANDIDATE_RADIUS_KM) continue;
    candidates.push({
      plaza,
      nearestDistanceKm: nearest.nearestDistanceKm,
      segmentIndex: nearest.segmentIndex,
      window: localWindow(route, nearest.segmentIndex),
      traversal: evaluateM4RouteTraversal(route, plaza),
    });
  }

  candidates.sort((a, b) => a.segmentIndex - b.segmentIndex || a.plaza.km - b.plaza.km);
  return candidates;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryableStatus(status: number) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function localTrace(window: Coordinate[], deadlineAt: number): Promise<LocalTraceResult> {
  if (window.length < 2) return { ok: false, message: "Недостаточно точек в локальном окне" };
  const shape = window.map(([lon, lat]) => ({ lat, lon }));
  let lastMessage = "Локальный map matching не выполнен";

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const remainingMs = deadlineAt - Date.now();
    if (remainingMs < 800) return { ok: false, message: "Исчерпан общий бюджет локальной проверки" };
    const timeoutMs = Math.max(700, Math.min(REQUEST_TIMEOUT_MS, remainingMs - 100));

    try {
      const response = await fetch("https://valhalla1.openstreetmap.de/trace_attributes", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "MezhgorodCalc/2.0",
        },
        body: JSON.stringify({
          shape,
          costing: "auto",
          shape_match: "walk_or_snap",
          trace_options: {
            search_radius: 45,
            gps_accuracy: 8,
            breakage_distance: 1500,
            interpolation_distance: 50,
          },
          filters: {
            action: "include",
            attributes: [
              "edge.toll",
              "edge.way_id",
              "edge.names",
              "edge.begin_shape_index",
              "edge.end_shape_index",
              "edge.end_osm_node_id",
              "node.type",
            ],
          },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (response.ok) {
        const data = (await response.json()) as { edges?: TraceEdge[] };
        const edges = data.edges ?? [];
        return edges.length > 0
          ? { ok: true, edges }
          : { ok: false, message: "Valhalla не вернула дорожные рёбра локального окна" };
      }

      const details = await response.text().catch(() => "");
      lastMessage = `HTTP ${response.status}${details ? ` — ${details.slice(0, 100)}` : ""}`;
      if (!retryableStatus(response.status)) return { ok: false, message: lastMessage };
    } catch (error) {
      lastMessage = error instanceof Error ? error.message : "неизвестная ошибка map matching";
    }

    if (attempt < 2) {
      const remainingAfterAttempt = deadlineAt - Date.now();
      if (remainingAfterAttempt <= RETRY_DELAY_MS + 800) break;
      await delay(RETRY_DELAY_MS);
    }
  }

  return { ok: false, message: lastMessage };
}

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
