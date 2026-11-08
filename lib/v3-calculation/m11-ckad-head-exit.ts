import physical from '@/experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-ckad47-exit/directed-exit.json' with {type: 'json'};
import type {Coordinate} from '../tolls';
import type {M11RoadEvidence} from '../toll-engine/m11-road-evidence';
import type {TollValidation} from '../toll-validator';
import {nearestSegment, haversineKm, facilityAnchors} from '../toll-engine/m11-moscow-geometry';

/** Southbound M11 exit to the independently identified CKAD47/PVP18 facility.
 * Non-toll access links are proved by their complete directed physical corridor. */
export function inspectM11CkadHeadExit(route: readonly Coordinate[], evidence: M11RoadEvidence | null | undefined,
  validation: TollValidation | null) {
  if (!evidence || evidence.malformedStrictCount || evidence.strictBlocks.length !== 1
    || validation?.status !== 'toll' || validation.complete !== true || validation.boothEventCoverage !== 'complete'
    || !validation.chunkCount || validation.checkedChunkCount !== validation.chunkCount || validation.failedChunkCount !== 0) return false;
  const gates = validation.tollBooths?.filter(g => g.osmNodeId === physical.gateNodeId);
  if (gates?.length !== 1 || gates[0].wayId !== physical.gateWayId) return false;
  const block = evidence.strictBlocks[0];
  if (haversineKm(block.endCoordinate, physical.strictJunction.coordinate as Coordinate) > 0.025) return false;
  const corridor = physical.sourceCorridor.map(p => p.coordinate as Coordinate);
  const hits = corridor.map(p => nearestSegment(route, [p]));
  if (hits.some((h, i) => !Number.isFinite(h.index) || h.index < 0 || h.distanceKm > 0.025
    || i > 0 && h.index <= hits[i - 1].index)) return false;
  const start = nearestSegment(route, [block.beginCoordinate]);
  const end = nearestSegment(route, [block.endCoordinate]);
  const p58 = nearestSegment(route, facilityAnchors('p58'));
  if (start.distanceKm > 0.025 || end.distanceKm > 0.025 || p58.distanceKm > 0.12
    || start.index >= p58.index || p58.index >= hits[0].index) return false;
  const first = Math.floor(hits[0].index), last = Math.ceil(hits.at(-1)!.index);
  if (last >= route.length) return false;
  for (let i = first; i <= last; i++) {
    if (i >= Math.ceil(hits[0].index) && i <= Math.floor(hits.at(-1)!.index)
      && nearestSegment(corridor, [route[i]]).distanceKm > 0.025
      || i < last && haversineKm(route[i], route[i + 1]) > 0.5) return false;
  }
  return true;
}
