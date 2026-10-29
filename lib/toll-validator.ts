import type { Coordinate } from "@/lib/tolls";
import {isOdintsovoLaneWay} from '@/experiments/nationwide-tolls/odintsovo-lane-identity.mjs';
import { roadBoundariesFromTrace } from "@/lib/toll-engine/road-trace-boundaries";
import { normalizeRoadRef, roadRouteSignature, type RoadBoundaryResolution } from "@/lib/toll-engine/road-boundaries";

export type OdintsovoTraceEdge = {
  wayId: string | null;
  endNodeId: string | null;
  roadNames: string[];
  toll: boolean;
  paymentEvent: boolean;
};

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
  paidRoadEdges?: Array<{wayId:string|null;roadNames:string[]}>;
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
  m4RoadBoundaries?: RoadBoundaryResolution;
  odintsovoTraceBlocks?: Array<{
    edges: OdintsovoTraceEdge[];
    before: OdintsovoTraceEdge | null;
    after: OdintsovoTraceEdge | null;
    repeatedWayId: boolean;
  }>;
  // Named CKAD continuity must include non-toll access links. The paid-only
  // list cannot distinguish a complete interchange pair from exit/re-entry.
  ckadTraceBlocks?: Array<{
    firstWayId: string | null;
    lastWayId: string | null;
    before: {wayId: string | null; endNodeId: string | null; roadNames: string[]} | null;
    after: Array<{wayId: string | null; endNodeId: string | null; roadNames: string[]}>;
    repeatedWayId: boolean;
  }>;
};

type TraceEdge = {
  toll?: boolean;
  way_id?: string | number;
  node_id?: string | number;
  end_osm_node_id?: string | number;
  names?: string[];
  begin_shape_index?: number;
  end_shape_index?: number;
  end_node?: {
    type?: string;
    node_id?: string | number;
  };
};

// Keep raw matching edges private and non-enumerable: the public validation
// DTO contains summaries only. A consumer may inspect a witnessed product
// while the exact TollValidation object is still in memory.
const privateTraceChunks = new WeakMap<TollValidation, {routeSignature:string;chunks:TraceEdge[][]}>();
export function getPrivateTollTraceChunks(validation: TollValidation | null | undefined, route: Coordinate[]): readonly (readonly TraceEdge[])[] | null {
  if(!validation||route.length<2)return null;
  const evidence=privateTraceChunks.get(validation);
  return evidence?.routeSignature===roadRouteSignature(route) ? evidence.chunks : null;
}

const MAX_TRACE_POINTS = 320;
const MAX_TRACE_CHUNK_KM = 140;
// The public Valhalla instance rate-limits long multi-chunk traces. Keep the
// per-route fanout modest; transient 429 responses also receive a bounded
// exponential retry below. Incomplete chunks must still fail closed.
const CHUNK_CONCURRENCY = 2;

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
  const value = edge.end_node?.node_id ?? edge.end_osm_node_id ?? edge.node_id;
  return value === undefined || value === null ? null : String(value);
}

function ckadTraceBlocks(edges: TraceEdge[]): NonNullable<TollValidation['ckadTraceBlocks']> {
  const isCkad = (edge: TraceEdge) => (edge.names ?? []).some(n => /^(?:А|A)[-–\s]*113$/iu.test(n));
  const compact = (edge: TraceEdge) => ({wayId: edgeWayId(edge), endNodeId: edgeNodeId(edge), roadNames: edge.names ?? []});
  const blocks: NonNullable<TollValidation['ckadTraceBlocks']> = [];
  for (let index = 0; index < edges.length; index++) {
    if (!isCkad(edges[index])) continue;
    const start = index;
    const wayIds: Array<string | null> = [];
    while (index < edges.length && isCkad(edges[index])) {
      const id = edgeWayId(edges[index]);
      if (wayIds.at(-1) !== id) wayIds.push(id);
      index++;
    }
    blocks.push({firstWayId: edgeWayId(edges[start]), lastWayId: edgeWayId(edges[index - 1]),
      before: start > 0 ? compact(edges[start - 1]) : null,
      after: edges.slice(index, index + 4).map(compact),
      repeatedWayId: wayIds.some((id, i) => id === null || wayIds.indexOf(id) !== i)});
    index--;
  }
  return blocks;
}

function isTollBooth(edge: TraceEdge) {
  return edge.end_node?.type === "toll_booth";
}

function odintsovoTraceBlocks(edges: TraceEdge[]): NonNullable<TollValidation['odintsovoTraceBlocks']> {
  const belongs = (edge: TraceEdge) => (edge.names ?? []).some(n => /^Северный обход Одинцова$/iu.test(n))
    || isOdintsovoLaneWay(edgeWayId(edge));
  const compact = (edge: TraceEdge): OdintsovoTraceEdge => ({wayId: edgeWayId(edge), endNodeId: edgeNodeId(edge),
    roadNames: edge.names ?? [], toll: edge.toll === true,
    paymentEvent: isTollBooth(edge) || edge.end_node?.type === 'toll_gantry'});
  const blocks: NonNullable<TollValidation['odintsovoTraceBlocks']> = [];
  for (let i = 0; i < edges.length; i++) {
    if (!belongs(edges[i])) continue;
    const start = i, ways: Array<string | null> = [];
    while (i < edges.length && belongs(edges[i])) {
      const way = edgeWayId(edges[i]); if (ways.at(-1) !== way) ways.push(way);
      i++;
    }
    blocks.push({edges: edges.slice(start, i).map(compact), before: start ? compact(edges[start - 1]) : null,
      after: i < edges.length ? compact(edges[i]) : null,
      repeatedWayId: ways.some((way, j) => way === null || ways.indexOf(way) !== j)});
    i--;
  }
  return blocks;
}

async function waitForTraceRetry(delay: number, signal?: AbortSignal) {
  signal?.throwIfAborted();
  await new Promise<void>((resolve,reject)=>{
    const finish=()=>{signal?.removeEventListener("abort",cancel);resolve();};
    const timer=setTimeout(finish,delay);
    const cancel=()=>{clearTimeout(timer);signal?.removeEventListener("abort",cancel);reject(signal?.reason??new Error("Cancelled"));};
    signal?.addEventListener("abort",cancel,{once:true});
  });
}

async function traceChunk(route: Coordinate[], callerSignal?: AbortSignal) {
  callerSignal?.throwIfAborted();
  const url = new URL("https://valhalla1.openstreetmap.de/trace_attributes");
  const request = {
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
        "edge.end_osm_node_id",
      ],
    },
  };
  const deadlineAt = Date.now() + 18_000;
  const send = () => {
    callerSignal?.throwIfAborted();
    const deadline=AbortSignal.timeout(Math.max(1, deadlineAt - Date.now()));
    return fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "MezhgorodCalc/2.0",
    },
    body: JSON.stringify(request),
    cache: "no-store",
    signal: callerSignal?AbortSignal.any([callerSignal,deadline]):deadline,
  });};
  let response = await send();
  // A long route sends several chunks. Retry transient rate limits twice with
  // bounded backoff. Respect Retry-After when supplied; if it is too long for
  // this request budget, leave the chunk unresolved instead of retrying early.
  for (let retry = 0; response.status === 429 && retry < 2; retry += 1) {
    const retryAfter = response.headers.get("retry-after");
    const seconds = retryAfter === null || retryAfter.trim() === "" ? NaN : Number(retryAfter);
    const date = retryAfter ? Date.parse(retryAfter) : NaN;
    const delay = Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000
      : Number.isFinite(date) ? Math.max(0, date - Date.now()) : 1_000 * (2 ** retry);
    if (delay <= 5_000 && delay + 1_000 < deadlineAt - Date.now()) {
      await response.body?.cancel();
      if (delay > 0) await waitForTraceRetry(delay,callerSignal);
      response = await send();
    } else {
      break;
    }
  }
  if (!response.ok) throw new Error(`TRACE_${response.status}`);
  const data = (await response.json()) as { edges?: TraceEdge[] };
  // HTTP200 with missing/empty trace is not proof that a route has no tolls.
  if (!Array.isArray(data.edges) || data.edges.length === 0
    || data.edges.some(edge => !edge || typeof edge !== "object"
      || (edge.toll !== undefined && typeof edge.toll !== "boolean")
      || (edge.names !== undefined && (!Array.isArray(edge.names) || edge.names.some(name => typeof name !== "string"))))) throw new Error("TRACE_EDGES_MISSING_OR_INVALID");
  return data;
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

export async function validateTollEdges(route: Coordinate[], signal?: AbortSignal): Promise<TollValidation> {
  signal?.throwIfAborted();
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
    signal?.throwIfAborted();
    try {
      const response = await traceChunk(chunk,signal);
      signal?.throwIfAborted();
      return { ok: true as const, edges: response.edges ?? [] };
    } catch (error) {
      if(signal?.aborted)throw error;
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
  const paidRoadEdges = tollEdges.map(edge => ({wayId:edgeWayId(edge),roadNames:edge.names??[]}));
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
  const ckadBlocks = ckadTraceBlocks(successful.flatMap(item => item.edges));
  const ckadContinuity = ckadBlocks.length ? {ckadTraceBlocks: ckadBlocks} : {};
  const odintsovoBlocks = odintsovoTraceBlocks(successful.flatMap(item => item.edges));
  const odintsovoContinuity = odintsovoBlocks.length ? {odintsovoTraceBlocks: odintsovoBlocks} : {};
  // Do not change unrelated roads' archived validation contracts with an
  // empty M4 diagnostic. Absence of this optional field never proves free.
  const m4Observed = successful.some(item => item.edges.some(edge => (edge.names ?? [])
    .some(name => name.split(";").some(ref => normalizeRoadRef(ref) === "М-4"))));
  const m4RoadContext = m4Observed ? { m4RoadBoundaries: roadBoundariesFromTrace(
    chunkResults.map(item => item.ok ? item.edges : null), route) } : {};

  if (!complete) {
    return {
      status: tollEdges.length > 0 ? "toll" : "unknown",
      source: "Valhalla map matching",
      tollEdgeCount: tollEdges.length,
      checkedEdgeCount,
      wayIds,
      roadNames,
      paidRoadEdges,
      ...ckadContinuity,
      ...odintsovoContinuity,
      ...m4RoadContext,
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

  const result: TollValidation = {
    status: tollEdges.length > 0 ? "toll" : tollBooths.length > 0 ? "unknown" : "free",
    source: "Valhalla map matching",
    tollEdgeCount: tollEdges.length,
    checkedEdgeCount,
    wayIds,
    roadNames,
    paidRoadEdges,
    ...ckadContinuity,
    ...odintsovoContinuity,
    ...m4RoadContext,
    message: tollEdges.length > 0
      ? `Подтверждены платные дорожные рёбра: ${tollEdges.length}`
      : tollBooths.length > 0
        ? "Пункты оплаты обнаружены без однозначной маркировки платного ребра; стоимость неизвестна"
        : "Платные дорожные рёбра не обнаружены во всём проверенном маршруте",
    tollBoothCount: tollBooths.length,
    tollBooths,
    chunkCount: chunks.length,
    checkedChunkCount: successful.length,
    failedChunkCount: 0,
    complete: true,
    boothEventCoverage: "complete",
  };
  privateTraceChunks.set(result, {routeSignature:roadRouteSignature(route),chunks:successful.map(item => item.edges)});
  return result;
}
