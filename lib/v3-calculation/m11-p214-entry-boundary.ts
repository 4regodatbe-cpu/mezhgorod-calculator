import physical from '@/experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-entry5286168661/directed-entry.json' with {type: 'json'};
import type {Coordinate} from '../tolls';
import type {M11RoadEvidence} from '../toll-engine/m11-road-evidence';
import type {TollValidation} from '../toll-validator';
import {nearestSegment, haversineKm, facilityAnchors} from '../toll-engine/m11-moscow-geometry';

/** Source-derived southbound p214 access only. This proves no head fare south of p58. */
export function inspectM11P214Entry(route: readonly Coordinate[], evidence: M11RoadEvidence | null | undefined,
  validation: TollValidation | null) {
  if (!evidence || evidence.malformedStrictCount || evidence.strictBlocks.length !== 1
    || validation?.status !== 'toll' || validation.complete !== true || validation.boothEventCoverage !== 'complete'
    || !validation.chunkCount || validation.checkedChunkCount !== validation.chunkCount || validation.failedChunkCount !== 0
    || !validation.paidRoadEdges || !validation.tollBooths) return false;
  const gates = validation.tollBooths.filter(g => g.osmNodeId === physical.gate.osmNodeId);
  if (gates.length !== 1 || gates[0].wayId !== physical.gate.wayId) return false;
  const paidWays = new Set(validation.paidRoadEdges.map(e => e.wayId));
  if (['766468433', '1205158257'].some(w => !paidWays.has(w))) return false;
  const block = evidence.strictBlocks[0];
  if (haversineKm(block.beginCoordinate, physical.strictJunction.coordinate as Coordinate) > 0.025) return false;
  const corridor = physical.sourceCorridor.map(p => p.coordinate as Coordinate);
  const hits = corridor.map(p => nearestSegment(route, [p]));
  if (hits.some((h, i) => !Number.isFinite(h.index) || h.index < 0 || h.distanceKm > 0.025
    || i > 0 && h.index <= hits[i - 1].index)) return false;
  const first = Math.floor(hits[0].index), last = Math.ceil(hits.at(-1)!.index);
  if (last >= route.length) return false;
  for (let i = first; i <= last; i++) {
    if (i >= Math.ceil(hits[0].index) && i <= Math.floor(hits.at(-1)!.index)
      && nearestSegment(corridor, [route[i]]).distanceKm > 0.025
      || i < last && haversineKm(route[i], route[i + 1]) > 0.5) return false;
  }
  const start = nearestSegment(route, [block.beginCoordinate]);
  const end = nearestSegment(route, [block.endCoordinate]);
  const p58 = nearestSegment(route, facilityAnchors('p58'));
  if (start.distanceKm > 0.025 || end.distanceKm > 0.025 || p58.distanceKm > 0.12
    || start.index <= hits[1].index || p58.index <= hits.at(-1)!.index || end.index <= p58.index) return false;
  // A sparse chord cannot establish selected mainline coverage to the head.
  for (let i = last; i < Math.ceil(end.index); i++) {
    if (!route[i + 1] || haversineKm(route[i], route[i + 1]) > 5) return false;
  }
  return true;
}
