/** Exact topology-based *diagnostic* OD traversal extractor (no runtime linkage). */
function haversineMeters(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
function isCoordinate(value) {
  return Array.isArray(value) && value.length === 2 && value.every(Number.isFinite) && Math.abs(value[0]) <= 180 && Math.abs(value[1]) <= 90;
}
/**
 * Input: an already independently *map-matched and completely enumerated* sequence
 * of road edges, one per geometry segment; NOT a bare route polyline or named road.
 * Each road membership transition must be reconciled with a *verified* OSM
 * topology access node in the same chosen route; mere spatial proximity fails.
 */
function extractODTraversals(route, boundaries, maximumNodeOffsetMeters = 35) {
  const unresolved = (reason, detail = null) => ({ status: 'unknown', reason, detail, traversals: [], diagnosticOnly: true });
  if (!route || typeof route.routeId !== 'string' || !route.routeId || route.mapMatchStatus !== 'complete') return unresolved('map_matching_incomplete');
  const shape = route.geometry;
  const edges = route.edges;
  if (!Array.isArray(shape) || shape.length < 2 || shape.some(p => !isCoordinate(p))) return unresolved('invalid_geometry');
  if (!Array.isArray(edges) || edges.length !== shape.length - 1) return unresolved('incomplete_edge_inventory');
  if (!Array.isArray(boundaries) || !Number.isFinite(maximumNodeOffsetMeters) || maximumNodeOffsetMeters <= 0 || maximumNodeOffsetMeters > 100) return unresolved('invalid_boundary_catalog');
  if (route.terminalPositionsOffToll !== true) return unresolved('terminals_not_proven_outside_paid_network');
  const catalog = new Map();
  for (const b of boundaries) {
    if (!b || typeof b.systemId !== 'string' || !b.systemId || typeof b.pointId !== 'string' || !b.pointId || typeof b.osmNodeId !== 'string' || !b.osmNodeId || !isCoordinate(b.coordinate) || b.status !== 'verified_on_off_ramp' || !['entry', 'exit'].includes(b.role) || !['to_moscow', 'to_krasnodar'].includes(b.direction)) return unresolved('unverified_boundary_catalog_entry');
    const key = [b.systemId, b.role, b.direction, b.osmNodeId].join('|');
    if (catalog.has(key)) return unresolved('ambiguous_boundary_catalog', key);
    catalog.set(key, b);
  }
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    if (!e || e.shapeIndex !== i || typeof e.fromNodeId !== 'string' || !e.fromNodeId || typeof e.toNodeId !== 'string' || !e.toNodeId || (e.systemId !== null && (typeof e.systemId !== 'string' || !e.systemId)) || e.proof?.status !== 'matched' || e.proof?.routeId !== route.routeId || e.proof?.coverage !== 'exact' || typeof e.proof?.osmWayId !== 'string' || !e.proof.osmWayId) return unresolved('edge_unverified_or_out_of_order', i);
    if (e.systemId !== null && !['to_moscow', 'to_krasnodar'].includes(e.direction)) return unresolved('paid_edge_direction_missing', i);
    if (i > 0 && edges[i - 1].toNodeId !== e.fromNodeId) return unresolved('route_graph_discontinuity', i);
  }
  if (edges[0].systemId !== null || edges.at(-1).systemId !== null) return unresolved('paid_network_at_route_terminal');
  function boundaryAt(systemId, role, direction, nodeId, position) {
    const b = catalog.get([systemId, role, direction, nodeId].join('|'));
    if (!b || haversineMeters(b.coordinate, position) > maximumNodeOffsetMeters) return null;
    return b;
  }
  const traversals = [];
  let active = null;
  for (let i = 1; i < edges.length; i++) {
    const previous = edges[i - 1], next = edges[i];
    if (previous.systemId === next.systemId) {
      if (active && previous.direction !== next.direction) return unresolved('direction_changed_inside_paid_span', i);
      continue;
    }
    const position = shape[i];
    const joinedNodeId = previous.toNodeId;
    if (previous.systemId !== null) {
      const exit = boundaryAt(previous.systemId, 'exit', previous.direction, joinedNodeId, position);
      if (!active || active.systemId !== previous.systemId || active.direction !== previous.direction || !exit) return unresolved('paid_exit_not_proven', i);
      if (exit.pointId === active.entry) return unresolved('same_entry_exit_not_proven', i);
      traversals.push({
        id: `${route.routeId}:paid-${traversals.length + 1}`,
        systemId: active.systemId,
        entry: active.entry,
        exit: exit.pointId,
        direction: active.direction,
        entryShapeIndex: active.entryShapeIndex,
        exitShapeIndex: i,
        proof: { status: 'confirmed', routeId: route.routeId, geometryComplete: true, entryExitVerified: true, method: 'strict_osm_edge_topology_and_verified_access_nodes' },
      });
      active = null;
    }
    if (next.systemId !== null) {
      const entry = boundaryAt(next.systemId, 'entry', next.direction, joinedNodeId, position);
      if (!entry || active) return unresolved('paid_entry_not_proven', i);
      active = { entry: entry.pointId, systemId: next.systemId, direction: next.direction, entryShapeIndex: i };
    }
  }
  if (active) return unresolved('unclosed_paid_span');
  if (traversals.length === 0) return {status: 'no_paid_spans', reason: 'additional_independent_toll_free_proof_required', traversals: [], diagnosticOnly: true};
  return {status: 'resolved', reason: null, traversals, diagnosticOnly: true};
}
export { extractODTraversals };
