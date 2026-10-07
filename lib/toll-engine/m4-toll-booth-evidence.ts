import type { TollBoothEvent } from "@/lib/toll-validator";

export type M4TraceEdge = {
  toll?: boolean;
  way_id?: string | number;
  names?: string[];
  begin_shape_index?: number;
  end_shape_index?: number;
  end_node?: { type?: string; node_id?: string | number };
};

export type M4BoothMatch = {
  status: "confirmed" | "rejected" | "unknown";
  events: TollBoothEvent[];
  matchedNodeIds: string[];
};

/** Geometry can establish that a route passed near a booth, but only edge
 * attributes can establish that it crossed the paid lane. */
export function classifyM4TraversalWithoutTollEdge(reason: string) {
  return reason === "outside_strict_traversal_radius" ? "rejected" as const : "unknown" as const;
}

/** Only a toll-tagged traversed edge is chargeable. A nearby booth on a free
 * slip road or bypass must not turn a free passage into a paid plaza event. */
export function matchM4TollBoothEdges(expectedNodeIds: ReadonlySet<string>, edges: readonly M4TraceEdge[]): M4BoothMatch {
  const matching = edges.flatMap((edge, edgeIndex) => {
    if (edge.end_node?.type !== "toll_booth" || edge.end_node.node_id === undefined) return [];
    const osmNodeId = String(edge.end_node.node_id);
    return expectedNodeIds.has(osmNodeId) ? [{ edge, edgeIndex, osmNodeId }] : [];
  });

  const matchedNodeIds = [...new Set(matching.map((item) => item.osmNodeId))];
  const chargeable = matching.filter((item) => item.edge.toll === true);
  const events: TollBoothEvent[] = chargeable.map(({ edge, edgeIndex, osmNodeId }) => ({
    osmNodeId,
    wayId: edge.way_id === undefined ? null : String(edge.way_id),
    roadNames: edge.names ?? [],
    edgeIndex,
    edgeToll: true,
    beginShapeIndex: edge.begin_shape_index,
    endShapeIndex: edge.end_shape_index,
  }));

  if (events.length > 0) return { status: "confirmed", events, matchedNodeIds };
  if (matching.length > 0 && matching.every(({ edge }) => edge.toll === false)) {
    return { status: "rejected", events: [], matchedNodeIds };
  }
  return { status: "unknown", events: [], matchedNodeIds };
}
