import snapshot from '@/experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-kad-ekateringofka/readiness.json' with {type: 'json'};
import zone1Snapshot from '@/experiments/nationwide-tolls/source-snapshots/zsd/2026-10-15-zone1/zone1-readiness.json' with {type: 'json'};
import quoteCore from '@/experiments/nationwide-tolls/engine/quote.cjs';
import validity from '@/experiments/nationwide-tolls/engine/fare-validity.cjs';
import {haversineKm, nearestSegment} from '../toll-engine/m11-moscow-geometry';
import type {Coordinate} from '../tolls';
import type {TollValidation} from '../toll-validator';
import {matrixZsdZone1Component} from './zsd-zone1-component';

const engine = quoteCore.createQuoteEngine({selected: snapshot.rows, history: [], provisional: []});
const reviewedWays = new Set(snapshot.wayIds);
const namedZsd = (names: readonly string[]) => names.some(name => /(?:^|[^а-яa-z0-9])зсд(?=$|[^а-яa-z0-9])|западный скоростной диаметр/iu.test(name));
const point = (n: {lon: number; lat: number}): Coordinate => [n.lon, n.lat];

/** A physical witness must occur in order on the dense selected trace, not on a long chord. */
function orderedWitnesses(route: readonly Coordinate[], witnesses: readonly {lon: number; lat: number}[]) {
  const matches = witnesses.map(n => nearestSegment(route, [point(n)]));
  if (matches.some((match, i) => {
    const index = Math.floor(match.index);
    return !Number.isFinite(match.distanceKm) || match.distanceKm > 0.025
      || index < 0 || index >= route.length - 1
      || haversineKm(route[index], route[index + 1]) > 0.5
      || (i > 0 && matches[i - 1].index >= match.index);
  })) return null;
  return matches;
}

/** Two passages near the same plaza cannot authorize one continuous finished vector. */
function plazaPassages(route: readonly Coordinate[]) {
  let count = 0;
  let inside = false;
  for (const coordinate of route) {
    const near = haversineKm(coordinate, point(snapshot.gate.gate)) <= 0.025;
    if (near && !inside) count++;
    inside = near;
  }
  return count;
}

/** Ready cash/card vectors for the selected route; no per-plaza tariff arithmetic. */
export function matrixZsdCashCardComponent(route: readonly Coordinate[], validation: TollValidation | null, date: string, seconds: number) {
  const zone1 = matrixZsdZone1Component(route, validation, date, seconds);
  if (zone1.tolls) return zone1;
  const fail = (reason: string) => ({tolls: null, reason});
  const booths = validation?.tollBooths ?? [];
  if (!booths.some(b => b.osmNodeId === snapshot.gate.gate.id)) return zone1;
  if (validation?.complete !== true || validation.boothEventCoverage !== 'complete') return fail('zsd_finished_vector_complete_trace_missing');
  if (!validation.paidRoadEdges) return fail('zsd_finished_vector_paid_way_scope_missing');
  const zsdEdges = validation.paidRoadEdges.filter(edge => namedZsd(edge.roadNames));
  const ways = new Set(zsdEdges.map(edge => edge.wayId));
  if (ways.size !== reviewedWays.size || zsdEdges.some(edge => !edge.wayId || !reviewedWays.has(edge.wayId))) return fail('zsd_finished_vector_scope_not_reviewed');
  if (!validation.paidRoadEdges.some(edge => edge.wayId === snapshot.exit.wayId)) return fail('zsd_ekateringofka_directed_exit_missing');
  const main = booths.filter(b => b.osmNodeId === snapshot.gate.gate.id);
  if (main.length !== 1 || main[0].edgeToll !== true || main[0].wayId !== snapshot.gate.wayId
    || booths.some(b => (namedZsd(b.roadNames) || zone1Snapshot.boothNodeIds.includes(b.osmNodeId ?? ''))
      && b.osmNodeId !== snapshot.gate.gate.id)) return fail('zsd_finished_vector_additional_or_unbound_plaza');
  const entry = orderedWitnesses(route, snapshot.entry.witnesses);
  const gate = orderedWitnesses(route, [snapshot.gate.before, snapshot.gate.gate, snapshot.gate.after]);
  const exit = orderedWitnesses(route, snapshot.exit.witnesses);
  if (!entry || !gate || !exit || entry.at(-1)!.index >= gate[0].index
    || gate.at(-1)!.index >= exit[0].index || plazaPassages(route) !== 1) return fail('zsd_finished_vector_direction_or_boundary_unresolved');
  for (let i = Math.floor(entry[0].index); i < Math.ceil(exit.at(-1)!.index); i++) {
    if (haversineKm(route[i], route[i + 1]) > 0.5) return fail('zsd_finished_vector_sparse_geometry');
  }
  if (!validity.validInstant(date) || !Number.isFinite(seconds) || seconds <= 0) return fail('zsd_finished_vector_departure_missing');
  const localDate = new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date(date));
  const result = engine.quote({routeId: 'selected-fast-route', evidenceComplete: true, components: [{
    routeId: 'selected-fast-route', traversalId: 'zsd-kad-south-ekateringofka', road: 'zsd', productId: 'zsd',
    from: snapshot.from, to: snapshot.to, profile: 'allDays', localDate, exactTraversal: true, profileResolved: true,
  }]});
  if (result.rub === null) return fail('zsd_finished_vector_current_base_fare_missing');
  return {reason: 'zsd_kad_south_ekateringofka_owner_zone_vector', tolls: {
    amount: result.rub, weekdayAmount: result.rub, weekendAmount: result.rub, period: 'все дни, без транспондера',
    confidence: 'matched' as const, segments: [`ЗСД: КАД (юг) → наб. р. Екатерингофки · ${result.rub} ₽ (зоны 1–2)`],
  }};
}
