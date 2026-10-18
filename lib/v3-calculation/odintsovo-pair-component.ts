import calendar from '@/experiments/nationwide-tolls/source-snapshots/odintsovo/2026-calendar/calendar-2026.json' with {type: 'json'};
import core from '@/experiments/nationwide-tolls/engine/quote.cjs';
import validity from '@/experiments/nationwide-tolls/engine/fare-validity.cjs';
import {departureTariffContext} from '@/experiments/nationwide-tolls/engine/tariff-window.mjs';
import {inspectOdintsovoPair} from './odintsovo-pair-boundary';
import type {Coordinate} from '../tolls';
import type {TollValidation} from '../toll-validator';
import type {RouteTollValue} from '../toll-engine/route-toll-composition';

type Direction = 'towardMoscow' | 'fromMoscow';
type Profile = 'night' | 'weekendDay' | 'weekdayPeak' | 'weekdayOrdinary';
type Context = {status: 'resolved'; date: string; profile: Profile} | {status: 'unknown'; reason: string};
const formatter = new Intl.DateTimeFormat('en-CA', {timeZone: calendar.timeZone, year: 'numeric', month: '2-digit',
  day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'});
const nonWorking: readonly string[] = calendar.additionalNonWorkingDates;
const working: readonly string[] = calendar.transferredWorkingDates;

/** The operator road calendar applies at departure, including its time bands.
 * Unknown calendar years and the undocumented midnight day transition fail closed. */
export function odintsovoDepartureProfile(at: string, direction: Direction): Context {
  if (!validity.validInstant(at)) return {status: 'unknown', reason: 'odintsovo_departure_invalid'};
  const parts = Object.fromEntries(formatter.formatToParts(new Date(at)).map(p => [p.type, p.value]));
  const date = `${parts.year}-${parts.month}-${parts.day}`, minute = Number(parts.hour) * 60 + Number(parts.minute);
  if (Number(parts.year) !== calendar.year) return {status: 'unknown', reason: 'odintsovo_calendar_year_unverified'};
  if (minute < 60) return {status: 'unknown', reason: 'odintsovo_midnight_day_transition_unverified'};
  if (minute < 300) return {status: 'resolved', date, profile: 'night'};
  const day = new Date(date + 'T12:00:00Z').getUTCDay();
  const weekend = !working.includes(date) && (day === 0 || day === 6 || nonWorking.includes(date));
  if (weekend) return {status: 'resolved', date, profile: 'weekendDay'};
  const peak = direction === 'towardMoscow' ? minute >= 420 && minute < 780 : minute >= 960 && minute < 1320;
  return {status: 'resolved', date, profile: peak ? 'weekdayPeak' : 'weekdayOrdinary'};
}

/** One existing matrix vector for a fully proved directed pair; no new fare sums. */
export function matrixOdintsovoPairComponent(route: readonly Coordinate[], validation: TollValidation | null | undefined,
  departureAt: string, routeSeconds = 0): {reason: string; tolls: RouteTollValue | null} {
  const fail = (reason: string) => ({reason, tolls: null});
  const pair = inspectOdintsovoPair(route, validation);
  if (!pair) return fail('odintsovo_directed_pair_not_proven');
  const context = odintsovoDepartureProfile(departureAt, pair.direction);
  if (context.status !== 'resolved') return fail(context.reason);
  const window = departureTariffContext(departureAt, routeSeconds, () => context);
  if (window.status !== 'resolved') return fail('odintsovo_departure_window_invalid');
  const toward = pair.direction === 'towardMoscow';
  const result = core.quote({routeId: 'selected-fast-route', evidenceComplete: true, components: [{
    routeId: 'selected-fast-route', traversalId: 'odintsovo', exactTraversal: true, profileResolved: true,
    road: 'odintsovo', from: toward ? 'Минское шоссе' : 'МКАД', to: toward ? 'Рублевский проезд / МКАД' : 'Минское шоссе',
    profile: `${pair.direction}:${context.profile}|${context.profile}`, localDate: context.date,
  }]});
  if (result.rub === null) return fail('odintsovo_' + ('reason' in result ? result.reason : 'quote_unknown'));
  return {reason: 'matrix dated selected-route Odintsovo directed pair at departure', tolls: {
    amount: result.rub, weekdayAmount: result.rub, weekendAmount: result.rub, period: 'по времени отправления',
    segments: [`Северный обход Одинцова: ПВП ${pair.plazas.join(' → ')} км · Стоимость не подтверждена`], confidence: 'matched',
  }};
}
