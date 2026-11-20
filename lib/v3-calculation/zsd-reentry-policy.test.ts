import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import snapshot from '@/experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-planernaya-no-reentry/geometry.json' with {type: 'json'};
import manifest from '@/experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-planernaya-no-reentry/source-manifest.json' with {type: 'json'};
import {hasReviewedZsdReentry} from './zsd-reentry-policy.ts';
import {isUsableRoute} from './route-candidate.ts';
import {selectFastestRoute} from '@/experiments/nationwide-tolls/fastest-route-policy.mjs';
import type {Coordinate} from '../tolls.ts';

const root = new URL('../../', import.meta.url);
function capture(input: {capture: string; sha256: string}) {
  const bytes = readFileSync(new URL(input.capture, root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), input.sha256);
  return JSON.parse(gunzipSync(bytes).toString());
}
const reference = capture(manifest.referenceCapture).record.route.coordinates as Coordinate[];

for (const input of manifest.negativeControls) {
  test(`${input.caseId}: its own continuous recorded route is not rejected`, () => {
    assert.equal(hasReviewedZsdReentry(capture(input).record.route.coordinates), false);
  });
}

test('physical witnesses retain their exact recorded coordinates and asset hash', () => {
  const bytes = readFileSync(new URL('experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-planernaya-no-reentry/geometry.json', root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest.geometrySha256);
  assert.deepEqual(snapshot.witnesses.map(w => w.coordinate), manifest.referenceRouteIndices.map(i => reference[i]));
});

for (const input of manifest.cases) {
  test(`${input.caseId}: reject its reentry before ETA selection; keep its own ordinary OSRM candidate`, () => {
    const saved = capture(input);
    const record = saved.record;
    const from = {label: record.spec.from.label, position: record.spec.from.position};
    const to = {label: record.spec.to.label, position: record.spec.to.position};
    const old = record.route;
    const response = saved.calls.find((c: {url: string; status: number}) => c.url.includes('router.project-osrm.org') && c.status === 200);
    const raw = JSON.parse(response.text).routes[0];
    const osrm = {meters: Math.round(raw.distance), seconds: Math.round(raw.duration), coordinates: raw.geometry.coordinates as Coordinate[]};
    assert.ok(old.seconds < osrm.seconds, 'this regression previously preferred the inadmissible route');
    assert.equal(hasReviewedZsdReentry(old.coordinates), true);
    assert.equal(isUsableRoute(old, from, to), false);
    assert.equal(hasReviewedZsdReentry(osrm.coordinates), false);
    assert.equal(isUsableRoute(osrm, from, to), true);
    const candidates = [{id: 'Valhalla', route: old}, {id: 'OSRM', route: osrm}]
      .filter(c => isUsableRoute(c.route, from, to))
      .map(c => ({...c, seconds: c.route.seconds, tollStatus: 'unknown'}));
    const winner = selectFastestRoute(candidates);
    assert.equal(winner.route.id, 'OSRM');
    assert.equal(winner.shownRouteCount, 1);
    assert.equal(winner.tollAmountRub, null);
  });
}

test('a northbound exit without reentry and an ordinary southbound entry remain admissible', () => {
  const first = manifest.referenceRouteIndices[0];
  const turn = manifest.referenceRouteIndices[4];
  assert.equal(hasReviewedZsdReentry(reference.slice(0, turn + 1)), false);
  assert.equal(hasReviewedZsdReentry(reference.slice(turn)), false);
  assert.equal(hasReviewedZsdReentry(reference.slice(first, turn + 1)), false);
  assert.equal(hasReviewedZsdReentry(reference.toReversed()), false);
});

test('nearby parallel geometry, a sparse chord and a disconnected local gap do not prove the reviewed turn', () => {
  assert.equal(hasReviewedZsdReentry(reference.map(([x, y]) => [x + 0.002, y])), false);
  assert.equal(hasReviewedZsdReentry(snapshot.witnesses.map(w => w.coordinate as Coordinate)), false);
  const broken = reference.slice();
  broken.splice(179, 0, [30.5, 60.2]);
  assert.equal(hasReviewedZsdReentry(broken), false);
});

test('when all candidates violate the policy no route or zero quote is manufactured', () => {
  const saved = capture(manifest.referenceCapture).record;
  const from = saved.spec.from, to = saved.spec.to;
  assert.throws(() => selectFastestRoute([{id: 'bad', route: saved.route}]
    .filter(c => isUsableRoute(c.route, from, to))
    .map(c => ({...c, seconds: c.route.seconds, tollStatus: 'unknown'}))), /ROUTE_UNAVAILABLE/);
});
