import physical from '@/experiments/nationwide-tolls/source-snapshots/m11/2026-10-17-p258-binding/directed-exit.json' with {type: 'json'};
import type {Coordinate} from '../tolls';
import type {M11RoadEvidence} from '../toll-engine/m11-road-evidence';
import type {TollValidation} from '../toll-validator';
import {nearestSegment, haversineKm} from '../toll-engine/m11-moscow-geometry';

export const M11_P258_EXIT_NODE = physical.gate.id;
const point = (p: {lon: number; lat: number}): Coordinate => [p.lon, p.lat];

/** The unnamed paid access link is a proved continuation of the M11 exit,
 * not a larger tolerance around the end of the provider's named mainline. */
export function inspectM11P258Exit(route: readonly Coordinate[], evidence: M11RoadEvidence | null | undefined,
  validation: TollValidation | null) {
  if (!evidence || evidence.malformedStrictCount || evidence.strictBlocks.length !== 1
    || validation?.complete !== true || validation.boothEventCoverage !== 'complete'
    || !validation.paidRoadEdges || !validation.tollBooths) return false;
  const block = evidence.strictBlocks[0];
  if (haversineKm(block.endCoordinate, point(physical.junction)) > 0.025) return false;
  const booths = validation.tollBooths;
  for (const gate of [physical.entryGate, physical.gate]) {
    const hits = booths.filter(b => b.osmNodeId === gate.id);
    if (hits.length !== 1 || hits[0].wayId !== gate.wayId || hits[0].edgeToll !== true) return false;
  }
  if (booths.some(b => b.roadNames.some(n => /(?:^|[^0-9])(?:М|M)[-–\s]*11(?:$|[^0-9])/iu.test(n))
    && b.osmNodeId !== physical.entryGate.id && b.osmNodeId !== physical.gate.id)) return false;
  const paidWays = new Set(validation.paidRoadEdges.map(e => e.wayId));
  if (physical.accessWayIds.some(id => !paidWays.has(id))) return false;
  const matches = [physical.entryGate, ...physical.witnesses].map(p => nearestSegment(route, [point(p)]));
  if (matches.some((m, i) => !Number.isFinite(m.index) || m.index < 0 || m.distanceKm > 0.025
    || i > 0 && matches[i - 1].index >= m.index)) return false;
  const begin = nearestSegment(route, [block.beginCoordinate]);
  if (begin.distanceKm > 0.025 || begin.index > matches[0].index) return false;
  const junctionIndex = matches[1].index;
  let accessLength = 0;
  for (let i = Math.floor(matches[0].index); i < Math.ceil(matches.at(-1)!.index); i++) {
    if (!route[i + 1]) return false;
    const gap = haversineKm(route[i], route[i + 1]);
    if (gap > (i >= Math.floor(junctionIndex) ? 0.5 : 5)) return false;
    if (i >= Math.floor(junctionIndex)) accessLength += gap;
  }
  if (accessLength > 2) return false;
  return true;
}
