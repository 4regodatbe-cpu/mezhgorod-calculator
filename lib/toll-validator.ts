import type { Coordinate } from "@/lib/tolls";

export type TollBoothEvent = {
  osmNodeId: string | null;
  wayId: string | null;
  roadNames: string[];
  edgeIndex: number;
  edgeToll: boolean;
  beginShapeIndex?: number;
  endShapeIndex?: number;
};

export type TollValidation = {
  status: "toll" | "free" | "unknown";
  source: "Valhalla map matching" | "M-12 local RVP core";
  tollEdgeCount: number;
  checkedEdgeCount: number;
  wayIds: string[];
  roadNames: string[];
  message: string;
  tollBoothCount?: number;
  tollBooths?: TollBoothEvent[];
  // New validators always fill these fields. They remain optional at the type
  // boundary so older fallback constructors can coexist during the staged
  // migration. Missing coverage metadata must never be treated as complete.
  chunkCount?: number;
  checkedChunkCount?: number;
  failedChunkCount?: number;
  complete?: boolean;
  boothEventCoverage?: "complete" | "partial" | "none";
};

type TraceEdge = {
  toll?: boolean;
  way_id?: string | number;
  node_id?: string | number;
  names?: string[];
  begin_shape_index?: number;
  end_shape_index?: number;
  end_node?: {
    type?: string;
    node_id?: string | number;
  };
};

const MAX_TRACE_POINTS = 320;
const MAX_TRACE_CHUNK_KM = 140;
const CHUNK_CONCURRENCY = 3;

function distanceKm(a: Coordinate, b: Coordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = (b[0] - a[0]) * rad;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function sampleRoute(route: Coordinate[]) {
  if (route.length <= MAX_TRACE_POINTS) return route;
  const step = (route.length - 1) / (MAX_TRACE_POINTS - 1);
  const sampled: Coordinate[] = [];
  for (let index = 0; index < MAX_TRACE_POINTS; index += 1) {
    sampled.push(route[Math.min(route.length - 1, Math.round(index * step))]);
  }
  sampled[sampled.length - 1] = route[route.length - 1];
  return sampled;
}

function splitRoute(route: Coordinate[]) {
  if (route.length < 2) return [route];
  const chunks: Coordinate[][] = [];
  let current: Coordinate[] = [route[0]];
  let accumulated = 0;

  for (let index = 1; index < route.length; index += 1) {
    const previous = route[index - 1];
    const point = route[index];
    const gap = distanceKm(previous, point);

    if (accumulated + gap > MAX_TRACE_CHUNK_KM && current.length >= 2) {
      if (current[current.length - 1] !== previous) current.push(previous);
      chunks.push(current);
      current = [previous, point];
      accumulated = gap;
    } else {
      current.push(point);
      accumulated += gap;
    }
  }

  if (current.length >= 2) chunks.push(current);
  return chunks;
}

function dedupe<T>(values: T[]) {
  return [...new Set(values)];
}

function edgeWayId(edge: TraceEdge) {
  return edge.way_id === undefined || edge.way_id === null ? null : String(edge.way_id);
}

function edgeNodeId(edge: TraceEdge) {
  const value = edge.end_node?.node_id ?? edge.node_id;
  return value === undefined || value === null ? null : String(value);
}

function isTollBooth(edge: TraceEdge) {
  return edge.end_node?.type === "toll_booth";
}

async function traceChunk(route: Coordinate[]) {
  const url = new URL("https://valhalla1.openstreetmap.de/trace_attributes");
  url.searchParams.set("json", JSON.stringify({
    shape: route.map(([lon, lat]) => ({ lat, lon })),
    costing: "auto",
    shape_match: "walk_or_snap",
    filters: {
      action: "include",
      attributes: [
        "edge.toll",
        "edge.way_id",
        "edge.names",
        "edge.begin_shape_index",
        "edge.end_shape_index",
        "node.type",
        "node.osm_id",
      ],
    },
  }));
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "MezhgorodCalc/2.0" },
    cache: "no-store",
    signal: AbortSignal.timeout(18_000),
  });
  if (!response.ok) throw new Error(`TRACE_${response.status}`);
  return (await response.json()) as { edges?: TraceEdge[] };
}

async function mapConcurrent<T, R>(values: T[], limit: number, fn: (value: T, index: number) => Promise<R>) {
  const result = new Array<R>(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      result[index] = await fn(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, () => worker()));
  return result;
}

export async function validateTollEdges(route: Coordinate[]): Promise<TollValidation> {
  if (route.length < 2) {
    return {
      status: "unknown",
      source: "Valhalla map matching",
      tollEdgeCount: 0,
      checkedEdgeCount: 0,
      wayIds: [],
      roadNames: [],
      message: "Недостаточно точек маршрута для независимой проверки платных дорог",
      chunkCount: 0,
      checkedChunkCount: 0,
      failedChunkCount: 0,
      complete: false,
      boothEventCoverage: "none",
    };
  }

  const chunks = splitRoute(route).map(sampleRoute);
  const chunkResults = await mapConcurrent(chunks, CHUNK_CONCURRENCY, async (chunk) => {
    try {
      const response = await traceChunk(chunk);
      return { ok: true as const, edges: response.edges ?? [] };
    } catch (error) {
      return { ok: false as const, error: error instanceof Error ? error.message : "TRACE_ERROR" };
    }
  });

  const successful = chunkResults.filter((item): item is Extract<typeof item, { ok: true }> => item.ok);
  const failed = chunkResults.filter((item): item is Extract<typeof item, { ok: false }> => !item.ok);
  const tollEdges = successful.flatMap((item) => item.edges).filter((edge) => edge.toll === true);
  const boothEdges = successful.flatMap((item) => item.edges).filter(isTollBooth);
  const complete = failed.length === 0 && successful.length === chunks.length;
  const checkedEdgeCount = successful.reduce((sum, item) => sum + item.edges.length, 0);
  const roadNames = dedupe(tollEdges.flatMap((edge) => edge.names ?? []).filter(Boolean));
  const wayIds = dedupe(tollEdges.map(edgeWayId).filter((value): value is string => Boolean(value)));
  const tollBooths: TollBoothEvent[] = boothEdges.map((edge, edgeIndex) => ({
    osmNodeId: edgeNodeId(edge),
    wayId: edgeWayId(edge),
    roadNames: edge.names ?? [],
    edgeIndex,
    edgeToll: edge.toll === true,
    beginShapeIndex: edge.begin_shape_index,
    endShapeIndex: edge.end_shape_index,
  }));

  if (!complete) {
    return {
      status: tollEdges.length > 0 ? "toll" : "unknown",
      source: "Valhalla map matching",
      tollEdgeCount: tollEdges.length,
      checkedEdgeCount,
      wayIds,
      roadNames,
      message: tollEdges.length > 0
        ? `Платные дорожные рёбра подтверждены, но проверка маршрута неполная: ${failed.length}/${chunks.length} частей не проверены`
        : `Проверка маршрута неполная: ${failed.length}/${chunks.length} частей не проверены`,
      tollBoothCount: tollBooths.length,
      tollBooths,
      chunkCount: chunks.length,
      checkedChunkCount: successful.length,
      failedChunkCount: failed.length,
      complete: false,
      boothEventCoverage: successful.length > 0 ? "partial" : "none",
    };
  }

  return {
    status: tollEdges.length > 0 ? "toll" : "free",
    source: "Valhalla map matching",
    tollEdgeCount: tollEdges.length,
    checkedEdgeCount,
    wayIds,
    roadNames,
    message: tollEdges.length > 0
      ? `Подтверждены платные дорожные рёбра: ${tollEdges.length}`
      : "Платные дорожные рёбра не обнаружены во всём проверенном маршруте",
    tollBoothCount: tollBooths.length,
    tollBooths,
    chunkCount: chunks.length,
    checkedChunkCount: successful.length,
    failedChunkCount: 0,
    complete: true,
    boothEventCoverage: "complete",
  };
}
