export type CkadCoordinate = [number, number];
export type CkadM11Evidence = {
  malformedStrictCount: number;
  strictBlocks: Array<{ beginCoordinate: CkadCoordinate; endCoordinate: CkadCoordinate }>;
};

export type CkadEastArcEvidence =
  | { status: "verified"; direction: "m4_to_m11" | "m11_to_m4"; arcKm: number }
  | { status: "unresolved"; candidate: boolean; reason: string };

export const CKAD_EAST_ARC_ANCHORS: readonly CkadCoordinate[] = [
  [37.75, 55.32], [37.80, 55.35], [38.05, 55.39], [38.34, 55.53], [38.35, 55.65],
  [38.46, 55.72], [38.50, 55.90], [37.92, 56.13], [37.55, 56.18],
] as const;

const MAX_ANCHOR_DISTANCE_KM = 5;
const MIN_ARC_ROUTE_KM = 135;
const MAX_ARC_ROUTE_KM = 230;

function haversineKm(a: CkadCoordinate, b: CkadCoordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function nearestIndex(route: readonly CkadCoordinate[], anchor: CkadCoordinate) {
  let index = -1;
  let distanceKm = Number.POSITIVE_INFINITY;
  for (let current = 0; current < route.length; current += 1) {
    const distance = haversineKm(route[current], anchor);
    if (distance < distanceKm) { distanceKm = distance; index = current; }
  }
  return { index, distanceKm };
}

function routeDistanceBetween(route: readonly CkadCoordinate[], fromIndex: number, toIndex: number) {
  const from = Math.min(fromIndex, toIndex);
  const to = Math.max(fromIndex, toIndex);
  let total = 0;
  for (let index = from + 1; index <= to; index += 1) total += haversineKm(route[index - 1], route[index]);
  return total;
}

export function resolveCkadEastArcEvidence(route: readonly CkadCoordinate[], m11Evidence: CkadM11Evidence | null | undefined): CkadEastArcEvidence {
  if (route.length < 3) return { status: "unresolved", candidate: false, reason: "route_geometry_missing" };
  const matches = CKAD_EAST_ARC_ANCHORS.map((anchor) => nearestIndex(route, anchor));
  if (matches.some((item) => item.index < 0 || item.distanceKm > MAX_ANCHOR_DISTANCE_KM)) {
    return { status: "unresolved", candidate: false, reason: "ckad_east_arc_not_proven" };
  }
  const indices = matches.map((item) => item.index);
  const forward = indices.every((value, index) => index === 0 || value > indices[index - 1]);
  const reverse = indices.every((value, index) => index === 0 || value < indices[index - 1]);
  if (!forward && !reverse) return { status: "unresolved", candidate: true, reason: "ckad_anchor_order_invalid" };
  const arcKm = routeDistanceBetween(route, indices[0], indices.at(-1)!);
  if (arcKm < MIN_ARC_ROUTE_KM || arcKm > MAX_ARC_ROUTE_KM) return { status: "unresolved", candidate: true, reason: "ckad_arc_length_out_of_range" };

  if (!m11Evidence || m11Evidence.malformedStrictCount > 0 || m11Evidence.strictBlocks.length === 0) {
    return { status: "unresolved", candidate: true, reason: "m11_continuation_after_ckad_not_proven" };
  }
  const direction = forward ? "m4_to_m11" as const : "m11_to_m4" as const;
  const a104Index = indices.at(-1)!;
  const boundaryCoordinates = m11Evidence.strictBlocks.flatMap((block) => [block.beginCoordinate, block.endCoordinate]);
  const m11Indices = boundaryCoordinates
    .map((coordinate) => nearestIndex(route, coordinate))
    .filter((item) => item.distanceKm <= 2)
    .map((item) => item.index);
  const continued = direction === "m4_to_m11"
    ? m11Indices.some((index) => index > a104Index)
    : m11Indices.some((index) => index < a104Index);
  if (!continued) return { status: "unresolved", candidate: true, reason: "m11_continuation_after_ckad_not_proven" };

  return { status: "verified", direction, arcKm };
}
