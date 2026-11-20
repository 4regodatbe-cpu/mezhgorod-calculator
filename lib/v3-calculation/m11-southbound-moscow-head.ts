import physical from '@/experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-moscow-head7171624764/physical-head-gate.json' with {type: 'json'};
import type {Coordinate} from '../tolls';
import type {M11RoadEvidence} from '../toll-engine/m11-road-evidence';
import type {TollValidation} from '../toll-validator';
import {nearestSegment, haversineKm, facilityAnchors, MOSCOW_M11_ENTRY, ENTRY_MAX_DISTANCE_KM} from '../toll-engine/m11-moscow-geometry';

/** Exact southbound paid lane plus continuous selected M11 coverage to Moscow.
 * Called only after the independent p214 mainline entry has been proved. */
export function inspectM11SouthboundMoscowHead(route: readonly Coordinate[], evidence: M11RoadEvidence | null | undefined,
  validation: TollValidation | null) {
  if (!evidence || evidence.malformedStrictCount || evidence.strictBlocks.length !== 1
    || validation?.status !== 'toll' || validation.complete !== true || validation.boothEventCoverage !== 'complete'
    || !validation.chunkCount || validation.checkedChunkCount !== validation.chunkCount || validation.failedChunkCount !== 0) return false;
  const gates = validation.tollBooths?.filter(g => g.osmNodeId === physical.gateNodeId);
  if (gates?.length !== 1 || gates[0].wayId !== physical.gateWayId || gates[0].edgeToll !== true
    || !validation.paidRoadEdges?.some(e => e.wayId === physical.gateWayId)) return false;
  const anchors = physical.orderedAnchors.map(a => a.coordinate as Coordinate);
  const hits = anchors.map(a => nearestSegment(route, [a]));
  if (hits.some((h, i) => !Number.isFinite(h.index) || h.index < 0 || h.distanceKm > 0.025
    || i > 0 && h.index <= hits[i - 1].index)) return false;
  const block = evidence.strictBlocks[0];
  const start = nearestSegment(route, [block.beginCoordinate]);
  const end = nearestSegment(route, [block.endCoordinate]);
  const p58 = nearestSegment(route, facilityAnchors('p58'));
  if (start.distanceKm > 0.025 || end.distanceKm > 0.025 || p58.distanceKm > 0.12
    || start.index >= p58.index || p58.index >= hits[0].index || end.index <= hits.at(-1)!.index
    || haversineKm(block.endCoordinate, MOSCOW_M11_ENTRY) > ENTRY_MAX_DISTANCE_KM) return false;
  for (let i = Math.floor(p58.index); i < Math.ceil(end.index); i++) {
    if (!route[i + 1] || haversineKm(route[i], route[i + 1]) > 5) return false;
    if (i >= Math.ceil(hits[0].index) && i <= Math.floor(hits.at(-1)!.index)
      && nearestSegment(anchors, [route[i]]).distanceKm > 0.025) return false;
  }
  return true;
}
