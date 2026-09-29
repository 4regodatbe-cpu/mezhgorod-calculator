import type { Coordinate } from "@/lib/tolls";

export type TollValidation = {
  status: "toll" | "free" | "unknown";
  source: "Valhalla map matching";
  tollEdgeCount: number;
  checkedEdgeCount: number;
  wayIds: string[];
  roadNames: string[];
  message: string;
};

type TraceEdge = {
  toll?: boolean;
  way_id?: string | number;
  names?: string[];
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

function unknown(message: string): TollValidation {
  return {
    status: "unknown",
    source: "Valhalla map matching",
    tollEdgeCount: 0,
    checkedEdgeCount: 0,
    wayIds: [],
    roadNames: [],
    message,
  };
}

async function validateChunk(route: Coordinate[], chunkNumber: number): Promise<TollValidation> {
  const shape = sampleRoute(route).map(([lon, lat]) => ({ lat, lon }));
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
          search_radius: 60,
          gps_accuracy: 10,
          breakage_distance: 5000,
          interpolation_distance: 250,
        },
        filters: {
          action: "include",
          attributes: ["edge.toll", "edge.way_id", "edge.names", "edge.length"],
        },
      }),
      signal: AbortSignal.timeout(18_000),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      return unknown(`Часть ${chunkNumber}: HTTP ${response.status}${details ? ` — ${details.slice(0, 120)}` : ""}`);
    }

    const data = (await response.json()) as { edges?: TraceEdge[] };
    const edges = data.edges ?? [];
    if (edges.length === 0) return unknown(`Часть ${chunkNumber}: дорожные рёбра не возвращены`);

    const tollEdges = edges.filter((edge) => edge.toll === true);
    const wayIds = [...new Set(tollEdges.map((edge) => edge.way_id).filter((value): value is string | number => value !== undefined).map(String))];
    const roadNames = [...new Set(tollEdges.flatMap((edge) => edge.names ?? []).filter(Boolean))].slice(0, 20);

    return {
      status: tollEdges.length > 0 ? "toll" : "free",
      source: "Valhalla map matching",
      tollEdgeCount: tollEdges.length,
      checkedEdgeCount: edges.length,
      wayIds,
      roadNames,
      message: tollEdges.length > 0
        ? `Часть ${chunkNumber}: найдено платных рёбер ${tollEdges.length}`
        : `Часть ${chunkNumber}: платных рёбер нет`,
    };
  } catch (error) {
    const details = error instanceof Error ? error.message : "неизвестная ошибка";
    return unknown(`Часть ${chunkNumber}: ${details}`);
  }
}

async function validateChunks(chunks: Coordinate[][]) {
  const results: TollValidation[] = [];
  for (let index = 0; index < chunks.length; index += CHUNK_CONCURRENCY) {
    const batch = chunks.slice(index, index + CHUNK_CONCURRENCY);
    const batchResults = await Promise.all(batch.map((chunk, offset) => validateChunk(chunk, index + offset + 1)));
    results.push(...batchResults);
  }
  return results;
}

export async function validateTollEdges(route: Coordinate[]): Promise<TollValidation> {
  if (route.length < 3) return unknown("Недостаточно геометрии для проверки платных дорог");

  const chunks = splitRoute(route);
  const results = await validateChunks(chunks);
  const tollResults = results.filter((item) => item.status === "toll");
  const unknownResults = results.filter((item) => item.status === "unknown");
  const checkedEdgeCount = results.reduce((sum, item) => sum + item.checkedEdgeCount, 0);
  const tollEdgeCount = results.reduce((sum, item) => sum + item.tollEdgeCount, 0);
  const wayIds = [...new Set(results.flatMap((item) => item.wayIds))];
  const roadNames = [...new Set(results.flatMap((item) => item.roadNames))].slice(0, 20);

  if (tollResults.length > 0) {
    return {
      status: "toll",
      source: "Valhalla map matching",
      tollEdgeCount,
      checkedEdgeCount,
      wayIds,
      roadNames,
      message: `Платность подтверждена: ${tollEdgeCount} рёбер, проверено частей ${results.length}${unknownResults.length ? `, не проверено ${unknownResults.length}` : ""}`,
    };
  }

  if (unknownResults.length > 0) {
    return {
      status: "unknown",
      source: "Valhalla map matching",
      tollEdgeCount: 0,
      checkedEdgeCount,
      wayIds: [],
      roadNames: [],
      message: `Не удалось полностью проверить ${unknownResults.length} из ${results.length} частей: ${unknownResults[0].message}`,
    };
  }

  return {
    status: "free",
    source: "Valhalla map matching",
    tollEdgeCount: 0,
    checkedEdgeCount,
    wayIds: [],
    roadNames: [],
    message: `Платные рёбра не обнаружены, проверено частей ${results.length}`,
  };
}
