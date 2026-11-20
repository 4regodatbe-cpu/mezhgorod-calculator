import physical from '@/experiments/nationwide-tolls/source-snapshots/odintsovo/2026-10-18-directed-lanes.json' with {type: 'json'};
import {isOdintsovoLane, isOdintsovoLaneWay} from '@/experiments/nationwide-tolls/odintsovo-lane-identity.mjs';
import type {Coordinate} from '../tolls';
import type {TollValidation, OdintsovoTraceEdge} from '../toll-validator';
import {haversineKm, nearestSegment} from '../toll-engine/m11-moscow-geometry';

const named = (e: OdintsovoTraceEdge) => e.roadNames.some(n => /^Северный обход Одинцова$/iu.test(n));
const belongs = (e: OdintsovoTraceEdge) => named(e) || isOdintsovoLaneWay(e.wayId);
const directions = [
  {direction: 'towardMoscow', nodes: ['3109177688', '3783549013'], plazas: ['17.7', '6.9']},
  {direction: 'fromMoscow', nodes: ['3783549015', '3109177690'], plazas: ['6.9', '17.7']},
] as const;

/** Proves only the continuous, directed two-plaza product traversal.
 * No fare, departure date or historical case identity participates in proof. */
export function inspectOdintsovoPair(route: readonly Coordinate[], validation: TollValidation | null | undefined) {
  if (route.length < 2 || route.some(p => p.length !== 2 || !p.every(Number.isFinite)
    || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90)
    || validation?.status !== 'toll' || validation.complete !== true || validation.boothEventCoverage !== 'complete'
    || !Number.isSafeInteger(validation.chunkCount) || !validation.chunkCount || validation.chunkCount < 0
    || validation.checkedChunkCount !== validation.chunkCount || validation.failedChunkCount !== 0
    || !validation.tollBooths || validation.tollBoothCount !== validation.tollBooths.length
    || !validation.paidRoadEdges || validation.odintsovoTraceBlocks?.length !== 1) return null;
  const block = validation.odintsovoTraceBlocks[0];
  if (block.repeatedWayId !== false || block.edges.length < 2 || !block.before || !block.after
    || belongs(block.before) || belongs(block.after) || !named(block.edges[0]) || !named(block.edges.at(-1)!)
    || block.edges.some(e => !e.wayId || !e.endNodeId || !belongs(e))) return null;
  const ways: string[] = [];
  for (const e of block.edges) if (ways.at(-1) !== e.wayId) ways.push(e.wayId!);
  if (new Set(ways).size !== ways.length || new Set(block.edges.map(e => e.endNodeId)).size !== block.edges.length) return null;
  const events = block.edges.filter(e => e.paymentEvent);
  if (events.length !== 2 || events.some(e => !isOdintsovoLane({osmNodeId: e.endNodeId, wayId: e.wayId}))) return null;
  const direction = directions.find(d => d.nodes.every((node, i) => events[i].endNodeId === node));
  if (!direction) return null;
  const booths = validation.tollBooths.filter(isOdintsovoLane);
  if (booths.length !== 2 || booths.some((b, i) => b.osmNodeId !== events[i].endNodeId || b.wayId !== events[i].wayId)) return null;
  if (!validation.paidRoadEdges.some(e => isOdintsovoLaneWay(e.wayId))) return null;
  const witnesses = direction.nodes.flatMap(node => physical.lanes.find(lane => lane.osmNodeId === node)!.witnesses);
  const points = witnesses.map(w => w.coordinate as Coordinate);
  const hits = points.map(p => nearestSegment(route, [p]));
  if (hits.some((hit, i) => hit.index < 0 || !Number.isFinite(hit.index) || hit.distanceKm > 0.025
    || i > 0 && hit.index <= hits[i - 1].index)) return null;
  const first = Math.floor(hits[0].index), last = Math.ceil(hits.at(-1)!.index);
  let lengthKm = 0;
  for (let i = first; i < last; i++) {
    if (!route[i + 1]) return null;
    const gap = haversineKm(route[i], route[i + 1]);
    if (gap > 1) return null;
    lengthKm += gap;
  }
  if (lengthKm > haversineKm(points[0], points.at(-1)!) * 1.8) return null;
  return {direction: direction.direction, plazas: [...direction.plazas]};
}
