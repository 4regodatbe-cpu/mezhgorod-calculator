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
  source: "Valhalla map matching" | "M-12 local RVP core" | "M-11 current boundary + tariff core" | "Route toll composition";
  tollEdgeCount: number;
  checkedEdgeCount: number;
  wayIds: string[];
  roadNames: string[];
  message: string;
  tollBoothCount?: number;
  tollBooths?: TollBoothEvent[];
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
      chunks.push(sampleRoute(current));
      current = [previous, point];
      accumulated = gap;
    } else {
      current.push(point);
      accumulated += gap;
    }
  }

  if (current.length >= 2) chunks.push(sampleRoute(current));
  return chunks;
}

async function validateChunk(route: Coordinate[], chunkIndex: number) {
  try {
    const response = await fetch("https://valhalla1.openstreetmap.de/trace_attributes", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "MezhgorodCalc/2.0",
      },
      body: JSON.stringify({
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
            "edge.end_osm_node_id",
            "node.type",
          ],
        },
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return { ok: false as const, chunkIndex, edges: [] as TraceEdge[] };
    const data = (await response.json()) as { edges?: TraceEdge[] };
    return { ok: true as const, chunkIndex, edges: data.edges ?? [] };
  } catch {
    return { ok: false as const, chunkIndex, edges: [] as TraceEdge[] };
  }
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
      message: "Недостаточно геометрии маршрута для независимой проверки платности",
      chunkCount: 0,
      checkedChunkCount: 0,
      failedChunkCount: 0,
      complete: false,
      boothEventCoverage: "none",
    };
  }

  const chunks = splitRoute(route);
  const results: Awaited<ReturnType<typeof validateChunk>>[] = [];
  for (let index = 0; index < chunks.length; index += CHUNK_CONCURRENCY) {
    results.push(...await Promise.all(chunks.slice(index, index + CHUNK_CONCURRENCY).map((chunk, offset) => validateChunk(chunk, index + offset))));
  }

  const successful = results.filter((result) => result.ok);
  const complete = successful.length === chunks.length;
  const tollEdges: TraceEdge[] = [];
  const checkedEdges: TraceEdge[] = [];
  const wayIds = new Set<string>();
  const roadNames = new Set<string>();
  const tollBooths: TollBoothEvent[] = [];

  for (const result of successful) {
    for (const [edgeIndex, edge] of result.edges.entries()) {
      checkedEdges.push(edge);
      if (edge.toll === true) {
        tollEdges.push(edge);
        if (edge.way_id !== undefined) wayIds.add(String(edge.way_id));
        for (const name of edge.names ?? []) if (name.trim()) roadNames.add(name.trim());
      }
      if (edge.end_node?.type === "toll_booth") {
        tollBooths.push({
          osmNodeId: edge.end_node.node_id === undefined ? null : String(edge.end_node.node_id),
          wayId: edge.way_id === undefined ? null : String(edge.way_id),
          roadNames: edge.names ?? [],
          edgeIndex,
          edgeToll: edge.toll === true,
          beginShapeIndex: edge.begin_shape_index,
          endShapeIndex: edge.end_shape_index,
        });
      }
    }
  }

  const status: TollValidation["status"] = tollEdges.length > 0
    ? "toll"
    : complete && checkedEdges.length > 0
      ? "free"
      : "unknown";

  return {
    status,
    source: "Valhalla map matching",
    tollEdgeCount: tollEdges.length,
    checkedEdgeCount: checkedEdges.length,
    wayIds: [...wayIds],
    roadNames: [...roadNames],
    message: tollEdges.length > 0
      ? `Подтверждены платные дорожные рёбра: ${tollEdges.length}`
      : complete
        ? "Независимая проверка не обнаружила платных дорожных рёбер"
        : `Проверка выполнена частично: ${successful.length} из ${chunks.length} фрагментов`,
    tollBoothCount: tollBooths.length,
    tollBooths,
    chunkCount: chunks.length,
    checkedChunkCount: successful.length,
    failedChunkCount: chunks.length - successful.length,
    complete,
    boothEventCoverage: complete ? "complete" : successful.length > 0 ? "partial" : "none",
  };
}
