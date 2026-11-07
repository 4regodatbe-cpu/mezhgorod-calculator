import core from '@/experiments/nationwide-tolls/engine/quote.cjs';
import validity from '@/experiments/nationwide-tolls/engine/fare-validity.cjs';
import {departureTariffContext} from '@/experiments/nationwide-tolls/engine/tariff-window.mjs';
import {inspectOdintsovoPair} from './odintsovo-pair-boundary';
import type {Coordinate} from '../tolls';
import type {TollValidation} from '../toll-validator';
import type {RouteTollValue} from '../toll-engine/route-toll-composition';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit'});

/** User planning policy (2026-10-18): use the ordinary 650 RUB vector at all
 * hours. Night discounts and peaks are not predicted. Departure date only
 * checks that the chosen base tariff is in force; no new fare sums. */
export function matrixOdintsovoPairComponent(route: readonly Coordinate[], validation: TollValidation | null | undefined,
  departureAt: string, routeSeconds = 0): {reason: string; tolls: RouteTollValue | null} {
  const fail = (reason: string) => ({reason, tolls: null});
  const pair = inspectOdintsovoPair(route, validation);
  if (!pair) return fail('odintsovo_directed_pair_not_proven');
  if (!validity.validInstant(departureAt)) return fail('odintsovo_departure_invalid');
  const localDate = dateFormatter.format(new Date(departureAt));
  const window = departureTariffContext(departureAt, routeSeconds, () => ({status: 'resolved', date: localDate}));
  if (window.status !== 'resolved') return fail('odintsovo_departure_window_invalid');
  const toward = pair.direction === 'towardMoscow';
  const result = core.quote({routeId: 'selected-fast-route', evidenceComplete: true, components: [{
    routeId: 'selected-fast-route', traversalId: 'odintsovo', exactTraversal: true, profileResolved: true,
    road: 'odintsovo', from: toward ? 'Минское шоссе' : 'МКАД', to: toward ? 'Рублевский проезд / МКАД' : 'Минское шоссе',
    profile: `${pair.direction}:weekdayOrdinary|weekdayOrdinary`, localDate,
  }]});
  if (result.rub === null) return fail('odintsovo_' + ('reason' in result ? result.reason : 'quote_unknown'));
  return {reason: 'user planning baseline from the dated ordinary Odintsovo matrix vector', tolls: {
    amount: result.rub, weekdayAmount: result.rub, weekendAmount: result.rub, period: 'базовая оценка',
    segments: [`Северный обход Одинцова: ПВП ${pair.plazas.join(' → ')} км · Стоимость не подтверждена`], confidence: 'matched',
  }};
}
