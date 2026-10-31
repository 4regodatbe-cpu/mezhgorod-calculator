import type { Coordinate } from "@/lib/tolls";
import { createHash } from "node:crypto";
import { normalizeRoadRef, roadIdentity, roadRouteSignature, type RoadBoundary, type RoadBoundaryResolution } from "./road-boundaries";

export type RoadTraceEdge = {
  names?: string[];
  way_id?: string | number;
  end_osm_node_id?: string | number;
  node_id?: string | number;
  begin_shape_index?: number;
  end_shape_index?: number;
  end_node?: { node_id?: string | number };
};
type Item = { edge: RoadTraceEdge; chunkIndex: number; sourceIndex: number };

function id(value: string | number | undefined) {
  if (typeof value === "number") return Number.isSafeInteger(value) && value > 0 ? String(value) : null;
  return typeof value === "string" && /^[1-9]\d*$/u.test(value) ? value : null;
}
const way = (edge: RoadTraceEdge) => id(edge.way_id);
const node = (edge: RoadTraceEdge) => id(edge.end_node?.node_id ?? edge.end_osm_node_id ?? edge.node_id);
function edgeKey(item: Item) {
  const w = way(item.edge), n = node(item.edge);
  return w && n ? `${w}:${n}` : null;
}
function adjacent(a: Item, b: Item) {
  const valid = (item: Item) => Number.isInteger(item.edge.begin_shape_index)
    && Number.isInteger(item.edge.end_shape_index) && item.edge.begin_shape_index! >= 0
    && item.edge.end_shape_index! >= item.edge.begin_shape_index!;
  if (!valid(a) || !valid(b)) return false;
  // Different chunks are adjacent only after stitching by a common directed
  // graph edge. Per-response shape indices must never be compared across them.
  if (a.chunkIndex !== b.chunkIndex) return true;
  return a.edge.end_shape_index === b.edge.begin_shape_index;
}

/** Input chunks must be the complete map matching of this exact selected
 * route, in request order. No additional network/OSM lookup is performed. */
export function roadBoundariesFromTrace(chunks: Array<RoadTraceEdge[] | null>, route: Coordinate[], target = "М-4"): RoadBoundaryResolution {
  const targetRef = normalizeRoadRef(target) ?? target;
  const result: RoadBoundaryResolution = { provider: "valhalla-trace", targetRef,
    routeSignature: roadRouteSignature(route), precision: "matched-road-edge",
    status: "unknown", reason: "road_trace_incomplete", entry: null, exit: null };
  if (route.length < 2 || route.some(p => !Array.isArray(p) || p.length !== 2
    || !Number.isFinite(p[0]) || Math.abs(p[0]) > 180 || !Number.isFinite(p[1]) || Math.abs(p[1]) > 90)
    || !chunks.length || chunks.some(chunk => !chunk?.length)) return result;
  const items: Array<Item | null> = [];
  for (const [chunkIndex, chunk] of chunks.entries()) {
    const next = chunk!.map((edge, sourceIndex) => ({ edge, chunkIndex, sourceIndex }));
    if (!items.length) { items.push(...next); continue; }
    // Adjacent requests share a boundary point. Confirm their graph join by
    // one unambiguous common suffix/prefix of directed OSM way+end-node pairs.
    const overlaps: number[] = [];
    for (let size = 1; size <= Math.min(8, items.length, next.length); size++) {
      const tail = items.slice(-size);
      if (tail.every((item, i) => item !== null && edgeKey(item) !== null && edgeKey(item) === edgeKey(next[i]))) overlaps.push(size);
    }
    if (overlaps.length === 1) items.push(...next.slice(overlaps[0]));
    else items.push(null, ...next); // An unproven join cannot authorize a boundary.
  }
  const isTarget = (item: Item | null) => item !== null && roadIdentity(item.edge.names ?? []).refs.includes(targetRef);
  const positions = items.flatMap((item, i) => isTarget(item) ? [i] : []);
  if (!positions.length) {
    result.status = "not-detected"; result.reason = "road_ref_not_detected"; return result;
  }
  const first = positions[0], last = positions.at(-1)!;
  if (items.slice(first, last + 1).some(item => !isTarget(item))) {
    result.reason = "road_trace_multiple_or_discontinuous_traversals"; return result;
  }
  for (let i = first + 1; i <= last; i++) {
    if (!adjacent(items[i - 1]!, items[i]!)) {
      result.reason = "road_trace_geometry_discontinuous"; return result;
    }
  }

  function boundary(side: "entry" | "exit"): RoadBoundary | null {
    const current = items[side === "entry" ? first : last]!;
    const neighborIndex = (side === "entry" ? first : last) + (side === "entry" ? -1 : 1);
    if (neighborIndex < 0 || neighborIndex >= items.length) {
      const coordinate = side === "entry" ? route[0] : route.at(-1)!;
      return { id: `route-endpoint:${createHash("sha256").update(JSON.stringify([side, coordinate])).digest("hex").slice(0, 24)}`,
        kind: "route-endpoint", coordinate, from: side === "entry" ? null : roadIdentity(current.edge.names ?? []),
        to: side === "entry" ? roadIdentity(current.edge.names ?? []) : null,
        chunkIndex: current.chunkIndex, sourceIndex: current.sourceIndex, connectorCount: 0 };
    }
    const neighbor = items[neighborIndex];
    if (!neighbor) return null;
    const before = side === "entry" ? neighbor : current, after = side === "entry" ? current : neighbor;
    const n = node(before.edge), fromWayId = way(before.edge), toWayId = way(after.edge);
    if (!adjacent(before, after) || !n || !fromWayId || !toWayId || fromWayId === toWayId) return null;
    return { id: `osm-transition:${n}:${fromWayId}>${toWayId}`, kind: "road-transition",
      from: roadIdentity(before.edge.names ?? []), to: roadIdentity(after.edge.names ?? []),
      // The existing response does not contain its decoded output shape.
      // An exact node ID is available; do not invent coordinates from the
      // request shape or confuse per-response indices with route indices.
      coordinate: null, osmNodeId: n, fromWayId, toWayId,
      chunkIndex: current.chunkIndex, sourceIndex: current.sourceIndex, connectorCount: 0 };
  }
  result.entry = boundary("entry"); result.exit = boundary("exit");
  result.status = result.entry?.kind === "road-transition" && result.exit?.kind === "road-transition" ? "resolved" : "partial";
  result.reason = result.status === "resolved" ? "directed_graph_transitions_resolved"
    : !result.entry || !result.exit ? "road_trace_boundary_unbound" : "journey_endpoint_on_target_road";
  return result;
}
