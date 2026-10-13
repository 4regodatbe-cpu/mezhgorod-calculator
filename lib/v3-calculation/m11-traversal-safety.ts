import type { Coordinate } from '@/lib/tolls';
import type { M11RoadEvidence } from '@/lib/toll-engine/m11-road-evidence';
import spatial from '@/data/tolls/m11/2026-10-01-58-679-spatial-anchors.json';
import { haversineKm } from '@/lib/toll-engine/m11-moscow-geometry';

export function m11TraversalSafety(route: readonly Coordinate[], evidence: M11RoadEvidence | null | undefined): string | null {
  if (evidence?.malformedStrictCount) return 'm11_malformed_strict_traversal';
  const blocks = evidence?.strictBlocks ?? [];
  if (blocks.some((block, index) => index > 0 && (
    block.beginKm === null || blocks[index - 1].endKm === null
    || Math.abs(block.beginKm - blocks[index - 1].endKm!) > 0.002
    || haversineKm(block.beginCoordinate, blocks[index - 1].endCoordinate) > 0.001
  ))) return 'm11_disconnected_strict_traversal';

  const chain = [0];
  for (let index = 1; index < route.length; index++) chain.push(chain[index - 1] + haversineKm(route[index - 1], route[index]));
  for (const facility of spatial.facilities) {
    // One tariff point may contain distinct plazas over a kilometre apart.
    // Repetition must return to the same physical anchor, not just its OD id.
    for (const anchor of facility.anchors) {
      let lastHitKm: number | null = null;
      for (let index = 0; index < route.length; index++) {
        if (haversineKm(route[index], [anchor.lon, anchor.lat]) > 0.12) continue;
        if (lastHitKm !== null && chain[index] - lastHitKm > 0.5) return 'm11_repeated_tariff_boundary';
        lastHitKm = chain[index];
      }
    }
  }
  return null;
}
