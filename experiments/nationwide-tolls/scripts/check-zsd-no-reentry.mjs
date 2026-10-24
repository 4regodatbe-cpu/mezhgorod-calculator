// Saved-candidate admission checks only; no routing, tracing or fare requests.
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import manifest from '../source-snapshots/zsd/2026-10-17-planernaya-no-reentry/source-manifest.json' with {type: 'json'};
import {isUsableRoute} from '../../../lib/v3-calculation/route-candidate.ts';
import {hasReviewedZsdReentry} from '../../../lib/v3-calculation/zsd-reentry-policy.ts';
import {selectFastestRoute} from '../fastest-route-policy.mjs';

const directory = process.argv[2] ?? 'experiments/nationwide-tolls/checks/2026-10-17-zsd-no-reentry/candidate-batch';
if (existsSync(`${directory}/summary.json`)) throw Error('Historical output exists; supply a new directory');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const save = (name, value) => writeFileSync(`${directory}/${name}`, JSON.stringify(value, null, 2) + '\n');
const sourceFiles = ['lib/v3-calculation/route-candidate.ts', 'lib/v3-calculation/zsd-reentry-policy.ts',
  'experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-planernaya-no-reentry/geometry.json',
  'experiments/nationwide-tolls/fastest-route-policy.mjs'];
const sourceHashes = Object.fromEntries(sourceFiles.map(p => [p, sha(readFileSync(p))]));
mkdirSync(`${directory}/cases`, {recursive: true});
save('STARTED.json', {sourceHashes, sourceHead: manifest.sourceHead, inputs: manifest.cases,
  newLiveRequests: 0, newFullTripReplays: 0, newFareCalculations: 0});
const results = [];
for (const input of manifest.cases) {
  const bytes = readFileSync(input.capture);
  assert.equal(sha(bytes), input.sha256);
  const saved = JSON.parse(gunzipSync(bytes));
  const {record} = saved;
  assert.equal(record.provider, 'Valhalla');
  const raw = JSON.parse(saved.calls.find(c => c.url.includes('router.project-osrm.org') && c.status === 200).text).routes[0];
  const ordinaryOsrm = {meters: Math.round(raw.distance), seconds: Math.round(raw.duration), coordinates: raw.geometry.coordinates};
  const candidates = [{id: 'Valhalla', route: record.route}, {id: 'OSRM', route: ordinaryOsrm}];
  const assessed = candidates.map(c => ({...c, admitted: isUsableRoute(c.route, record.spec.from, record.spec.to),
    reviewedReentry: hasReviewedZsdReentry(c.route.coordinates)}));
  assert.equal(assessed[0].admitted, false);
  assert.equal(assessed[0].reviewedReentry, true);
  assert.equal(assessed[1].admitted, true);
  assert.ok(assessed[0].route.seconds < assessed[1].route.seconds);
  const choice = selectFastestRoute(assessed.filter(c => c.admitted).map(c => ({...c,
    seconds: c.route.seconds, tollStatus: 'unknown'})));
  assert.equal(choice.route.id, 'OSRM');
  assert.equal(choice.tollAmountRub, null);
  const result = {caseId: input.caseId, capture: input.capture, captureSha256: input.sha256,
    sourceHashes, mode: 'saved_ordinary_candidate_admission_exception_check',
    candidates: assessed.map(c => ({provider: c.id, admitted: c.admitted, reviewedReentry: c.reviewedReentry,
      meters: c.route.meters, seconds: c.route.seconds})),
    selectedProvider: choice.route.id, shownRouteCount: choice.shownRouteCount,
    priceUsedToSelectRoute: false, fullTripFare: 'not_recomputed_unconfirmed',
    newLiveRequests: 0, newFullTripReplays: 0, newFareCalculations: 0,
    outcome: 'fixed_and_verified_scoped_candidate_admission'};
  save(`cases/${input.caseId}.json`, result);
  results.push(result);
  save('progress.json', {processed: results.length, total: manifest.cases.length, lastCase: input.caseId});
}
assert.equal(results.length, 6);
const controls = manifest.negativeControls.map(input => {
  const bytes = readFileSync(input.capture);
  assert.equal(sha(bytes), input.sha256);
  const route = JSON.parse(gunzipSync(bytes)).record.route.coordinates;
  assert.equal(hasReviewedZsdReentry(route), false);
  return {...input, rejected: false};
});
save('controls.json', controls);
save('summary.json', {sourceHashes, sourceHead: manifest.sourceHead, checkedCases: results.length,
  rejectedReentryGeometries: 6, admittedOrdinaryOsrmGeometries: 6, distinctNegativeControls: controls.length,
  newPricedComponents: 0, confirmedFullTripFares: 0, newLiveRequests: 0, newFullTripReplays: 0,
  caseResults: results.map(r => ({caseId: r.caseId, sha256: sha(readFileSync(`${directory}/cases/${r.caseId}.json`))})),
  scope: 'Only the reviewed Planernaya urban-turn motif. Baseline tariff coverage is not recomputed.'});
console.log(JSON.stringify({checkedCases: results.length, rejectedReentries: 6, admittedOsrm: 6, controls: controls.length}));
