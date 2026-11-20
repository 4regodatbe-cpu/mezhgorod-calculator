import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import snapshot from '../experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-kad-ekateringofka/readiness.json' with {type: 'json'};
import manifest from '../experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-kad-ekateringofka/source-manifest.json' with {type: 'json'};
import {matrixZsdCashCardComponent} from '../lib/v3-calculation/zsd-cash-card-component.ts';
import {composeRouteTolls} from '../lib/toll-engine/route-toll-composition.ts';
import {nearestSegment} from '../lib/toll-engine/m11-moscow-geometry.ts';
import type {Coordinate} from '../lib/tolls.ts';
import type {TollValidation} from '../lib/toll-validator.ts';

const raw = readFileSync(new URL('../' + snapshot.fixture.capture, import.meta.url));
const captured = JSON.parse(gunzipSync(raw).toString()).record;
const route: Coordinate[] = captured.route.coordinates;
const validation: TollValidation = captured.validation;
const quote = (geometry = route, trace = validation, date = '2026-10-15T09:00:00+03:00') => matrixZsdCashCardComponent(geometry, trace, date, captured.route.seconds);
const p = (n: {lon: number; lat: number}): Coordinate => [n.lon, n.lat];

test('finished-vector sources and selected capture retain their exact hashes', () => {
  assert.equal(createHash('sha256').update(raw).digest('hex'), snapshot.fixture.sha256);
  const base = new URL('../experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-kad-ekateringofka/', import.meta.url);
  for (const source of manifest.documents) assert.equal(createHash('sha256').update(readFileSync(new URL(source.path, base))).digest('hex'), source.sha256);
});

test('recorded directed KAD-south to Ekateringofka trace selects its ready two-zone cash/card vector', () => {
  for (const date of ['2026-10-15T09:00:00+03:00', '2026-10-17T09:00:00+03:00', '2026-10-17T02:00:00+03:00']) {
    const result = quote(route, validation, date);
    assert.equal(result.reason, 'zsd_kad_south_ekateringofka_owner_zone_vector');
    assert.equal(result.tolls?.amount, 600);
    assert.equal(result.tolls?.weekdayAmount, 600);
    assert.equal(result.tolls?.weekendAmount, 600);
  }
});

test('a ready fare cannot revive a future tariff at a later gate crossing', () => {
  assert.equal(quote(route, validation, '2025-04-30T23:59:59+03:00').tolls, null);
  assert.equal(quote(route, validation, '2025-05-01T00:00:00+03:00').tolls?.amount, 600);
  for (const invalid of ['', 'bad-date']) assert.equal(quote(route, validation, invalid).tolls, null);
});

test('incomplete or materially different paid scope stays unknown', () => {
  const edges = validation.paidRoadEdges!;
  for (const trace of [
    {...validation, complete: false},
    {...validation, boothEventCoverage: 'partial' as const},
    {...validation, paidRoadEdges: undefined},
    {...validation, paidRoadEdges: edges.filter(edge => edge.wayId !== snapshot.exit.wayId)},
    {...validation, paidRoadEdges: edges.filter(edge => edge.wayId !== snapshot.entry.wayId)},
    {...validation, paidRoadEdges: [...edges, {wayId: 'unreviewed', roadNames: ['ЗСД']}]},
    {...validation, paidRoadEdges: [...edges, {wayId: null, roadNames: ['ЗСД']}]},
  ]) assert.equal(quote(route, trace).tolls, null);
});

test('extra, repeated or unpaid plazas do not receive the finished vector', () => {
  const booths = validation.tollBooths!;
  const main = booths.find(b => b.osmNodeId === snapshot.gate.gate.id)!;
  for (const replacement of [
    [...booths, main],
    booths.map(b => b === main ? {...b, edgeToll: false} : b),
    booths.map(b => b === main ? {...b, wayId: 'other'} : b),
    [...booths, {...main, osmNodeId: '933974949', roadNames: []}],
    [...booths, {...main, osmNodeId: 'another-zsd', roadNames: ['ЗСД']}],
  ]) assert.equal(quote(route, {...validation, tollBooths: replacement}).tolls, null);
});

test('the direction, actual entry and complete exit are required', () => {
  const gate = Math.floor(nearestSegment(route, [p(snapshot.gate.gate)]).index);
  const exit = Math.floor(nearestSegment(route, [p(snapshot.exit.witnesses[0])]).index);
  for (const geometry of [route.toReversed(), route.slice(gate - 3), route.slice(0, exit), [...route, ...route.toReversed(), ...route]]) assert.equal(quote(geometry).tolls, null);
  const chord = [...snapshot.entry.witnesses.map(p), p(snapshot.gate.before), p(snapshot.gate.gate), p(snapshot.gate.after), ...snapshot.exit.witnesses.map(p)];
  assert.equal(quote(chord).tolls, null);
});

test('known ZSD price does not become a full trip total while another product is unknown', () => {
  const result = quote();
  const composed = composeRouteTolls([
    {id: 'zsd', detected: true, ...result},
    {id: 'ckad', detected: true, tolls: null, reason: 'unresolved'},
  ]);
  assert.equal(composed.status, 'unknown');
  assert.deepEqual(composed.missing, ['ckad']);
});

test('another recorded mainline/plaza journey cannot borrow the Ekateringofka finished price', () => {
  const bytes = readFileSync(new URL('../' + snapshot.exclusionFixture.capture, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), snapshot.exclusionFixture.sha256);
  const other = JSON.parse(gunzipSync(bytes).toString()).record;
  assert.equal(matrixZsdCashCardComponent(other.route.coordinates, other.validation, '2026-10-15T09:00:00+03:00', other.route.seconds).tolls, null);
});
