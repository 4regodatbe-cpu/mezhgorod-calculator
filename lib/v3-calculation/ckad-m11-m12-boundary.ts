import physical from '@/experiments/nationwide-tolls/source-snapshots/ckad/2026-10-17-m11-m12-binding/physical-directed.json' with {type: 'json'};
import type {Coordinate} from '../tolls';
import type {TollValidation} from '../toll-validator';
import type {M11RoadEvidence} from '../toll-engine/m11-road-evidence';
import {nearestSegment, haversineKm} from '../toll-engine/m11-moscow-geometry';

const point = (p: {lon: number; lat: number}): Coordinate => [p.lon, p.lat];
const isCkad = (names: readonly string[]) => names.some(n => /^(?:А|A)[-–\s]*113$/iu.test(n));
const isM11 = (names: readonly string[]) => names.some(n => /^(?:М|M)[-–\s]*11$/iu.test(n));
const isM12 = (names: readonly string[]) => names.some(n => /^(?:М|M)[-–\s]*12$/iu.test(n));
const anchorChainKm = physical.witnesses.slice(1).reduce((sum, p, i) =>
  sum + haversineKm(point(physical.witnesses[i]), point(p)), 0);

/** Forward interchange-to-interchange proof, independent of case IDs and money.
 * A full named trace block retains the unpaid access connections discarded by
 * paidRoadEdges. Another CKAD block, loop or connector cannot borrow this pair. */
export function inspectCkadM11ToM12(route: readonly Coordinate[], evidence: M11RoadEvidence | null | undefined,
  validation: TollValidation | null | undefined) {
  if (route.length < 2 || route.some(p => p.length !== 2 || !p.every(Number.isFinite)
    || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90)
    || !evidence || evidence.malformedStrictCount || evidence.strictBlocks.length !== 1
    || validation?.complete !== true || validation.boothEventCoverage !== 'complete'
    || !validation.chunkCount || validation.checkedChunkCount !== validation.chunkCount || validation.failedChunkCount !== 0
    || !validation.paidRoadEdges || !validation.tollBooths || validation.ckadTraceBlocks?.length !== 1) return false;
  const block = validation.ckadTraceBlocks[0];
  if (block.repeatedWayId !== false || block.firstWayId !== physical.entry.firstWayId
    || block.lastWayId !== physical.exit.lastWayId
    || block.before?.wayId !== physical.entry.beforeWayId
    || block.before.endNodeId !== physical.entry.junction.nodeId || !isM11(block.before.roadNames)
    || !Array.isArray(block.after) || block.after.length !== physical.exit.after.length) return false;
  if (physical.exit.after.some((p, i) => p.wayId !== block.after[i].wayId || p.endNodeId !== block.after[i].endNodeId)) return false;
  if (!isM12(block.after.at(-1)!.roadNames) || block.after.slice(0, -1).some(e => isCkad(e.roadNames))) return false;
  const ckadPaid = validation.paidRoadEdges.filter(e => isCkad(e.roadNames));
  if (!ckadPaid.length || ckadPaid.at(-1)!.wayId !== physical.exit.lastWayId
    || !validation.paidRoadEdges.some(e => e.wayId === physical.exit.after.at(-1)!.wayId && isM12(e.roadNames))) return false;
  const booths = validation.tollBooths.filter(b => isCkad(b.roadNames));
  if (booths.length !== 1 || booths[0].osmNodeId !== physical.entry.booth.nodeId
    || booths[0].wayId !== physical.entry.booth.wayId) return false;
  if (haversineKm(evidence.strictBlocks[0].endCoordinate, point(physical.entry.junction)) > 0.025) return false;
  const matches = physical.witnesses.map(p => nearestSegment(route, [point(p)]));
  if (matches.some((m, i) => m.index < 0 || !Number.isFinite(m.index) || m.distanceKm > 0.025
    || i > 0 && m.index <= matches[i - 1].index)) return false;
  const begin = Math.floor(matches[0].index), end = Math.ceil(matches.at(-1)!.index);
  const entryEnd = Math.floor(matches[physical.entryWitnessCount - 1].index);
  const exitBegin = Math.floor(matches[physical.coreLastWitnessIndex].index);
  let distanceKm = 0, entryKm = 0, exitKm = 0;
  for (let i = begin; i < end; i++) {
    if (!route[i + 1]) return false;
    const gap = haversineKm(route[i], route[i + 1]);
    const local = i < entryEnd || i >= exitBegin;
    if (gap > (local ? 0.5 : 5)) return false;
    distanceKm += gap;
    if (i < entryEnd) entryKm += gap;
    if (i >= exitBegin) exitKm += gap;
  }
  return entryKm <= 4 && exitKm <= 4 && distanceKm <= anchorChainKm * 1.3;
}
