import physical from './source-snapshots/odintsovo/2026-10-18-directed-lanes.json' with {type: 'json'};

/** Names the product only. A matching lane never authorizes a tariff or scope. */
export function isOdintsovoLane(booth) {
  return physical.lanes.some(lane => lane.osmNodeId === booth?.osmNodeId && lane.wayId === booth?.wayId);
}

/** Short unnamed plaza edges still belong to the independently sourced lane.
 * A way identity alone establishes neither a passed booth nor a fare. */
export function isOdintsovoLaneWay(wayId) {
  return physical.lanes.some(lane => lane.wayId === wayId);
}
