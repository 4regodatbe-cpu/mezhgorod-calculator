import reviewed from '@/experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-planernaya-no-reentry/geometry.json' with {type: 'json'};
import {haversineKm, nearestSegment} from '../toll-engine/m11-moscow-geometry';
import type {Coordinate} from '../tolls';

/** Detect only the proven Planernaya exit / urban turn / southbound reentry. */
export function hasReviewedZsdReentry(route: readonly Coordinate[]): boolean {
  if (route.length < 2) return false;
  const matches = reviewed.witnesses.map(witness => nearestSegment(route, [witness.coordinate as Coordinate]));
  if (matches.some((match, i) => {
    const index = Math.min(Math.floor(match.index), route.length - 2);
    return !Number.isFinite(match.distanceKm) || match.distanceKm > reviewed.maxDistanceKm
      || index < 0 || index >= route.length - 1
      || haversineKm(route[index], route[index + 1]) > reviewed.maxSegmentKm
      || (i > 0 && matches[i - 1].index >= match.index);
  })) return false;
  let spanKm = 0;
  for (let i = Math.floor(matches[0].index); i < Math.ceil(matches.at(-1)!.index); i++) {
    const length = haversineKm(route[i], route[i + 1]);
    // A long chord or unrelated later visit is not proof of the local turn.
    if (length > reviewed.maxSegmentKm) return false;
    spanKm += length;
    if (spanKm > reviewed.maxLocalSpanKm) return false;
  }
  return true;
}
