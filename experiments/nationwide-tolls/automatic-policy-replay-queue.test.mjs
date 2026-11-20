import test from 'node:test';
import assert from 'node:assert/strict';
import { nextPolicyCase, verifyPolicyPair, dates } from './scripts/automatic-policy-replay-queue.mjs';
const pair = () => dates.map(departureAt => ({
  caseId: 'route1', captureSha256: 'rawhash', provider: 'Valhalla',
  mode: 'offline-recorded-response-replay', departureAt,
  tariffPolicy: { id: 'trip-departure-v1', basisAt: departureAt },
  replayIntegrity: { complete: true, missingResponses: [] },
  detectedRoadComponents: [{ id: 'm4', amount: 3810 }],
  audit: { status: 'unknown', missing: ['zsd'] }, tolls: { amount: null },
}));
const identity = { caseId: 'route1', captureSha256: 'rawhash', provider: 'Valhalla' };
test('policy queue resumes in order from unique durable evaluations', () => {
  const f = { code: 'm4_crossing_profile_changes', caseIds: ['a', 'b'], currentCasesChecked: 1, currentEvaluations: [{ caseId: 'a' }] };
  assert.equal(nextPolicyCase(f), 'b');
  assert.equal(nextPolicyCase({ ...f, currentCasesChecked: 2, currentEvaluations: [{ caseId: 'a' }, { caseId: 'b' }] }), null);
  for (const bad of [{ ...f, currentCasesChecked: 2 }, { ...f, currentEvaluations: [{ caseId: 'outside' }] },
    { ...f, currentCasesChecked: 2, currentEvaluations: [{ caseId: 'a' }, { caseId: 'a' }] }]) assert.throws(() => nextPolicyCase(bad), /INVALID_PROGRESS/);
});
test('M4 recovery never upgrades an unknown ZSD subtotal to a full total', () => {
  const result = verifyPolicyPair(pair(), identity);
  assert.equal(result.weekdayAmount, null);
  assert.deepEqual(result.remainingMissing, ['zsd']);
  const bad = pair(); bad[0].tolls.amount = 3810;
  assert.throws(() => verifyPolicyPair(bad, identity), /TOTAL_COMPLETENESS/);
});
test('complete whole-route output must be consistently priced', () => {
  const outputs = pair();
  for (const o of outputs) { o.audit = { status: 'priced', missing: [] }; o.tolls.amount = 3810; }
  assert.equal(verifyPolicyPair(outputs, identity).weekdayAmount, 3810);
  outputs[0].tolls.amount = null;
  assert.throws(() => verifyPolicyPair(outputs, identity), /TOTAL_COMPLETENESS/);
});
test('wrong route, raw hash, provider or departure basis cannot pass replay validation', () => {
  for (const mutate of [
    o => { o.caseId = 'other'; }, o => { o.captureSha256 = 'other'; }, o => { o.provider = 'OSRM'; },
    o => { o.departureAt = dates[1]; }, o => { o.tariffPolicy.basisAt = dates[1]; },
    o => { o.mode = 'live'; }, o => { o.tariffPolicy.id = 'crossing-time'; },
  ]) { const outputs = pair(); mutate(outputs[0]); assert.throws(() => verifyPolicyPair(outputs, identity)); }
});
test('missing recorded response or still-unpriced M4 stops the queue', () => {
  for (const mutate of [
    o => { o.replayIntegrity.missingResponses = ['missing']; },
    o => { o.replayIntegrity.complete = false; },
    o => { o.detectedRoadComponents[0].amount = null; },
    o => { o.detectedRoadComponents[0].reason = 'm4_crossing_profile_changes'; },
    o => { o.audit.missing.push('m4'); },
    o => { o.detectedRoadComponents.push({ id: 'm4', amount: 10 }); },
  ]) { const outputs = pair(); mutate(outputs[0]); assert.throws(() => verifyPolicyPair(outputs, identity)); }
  assert.throws(() => verifyPolicyPair(pair().slice(0, 1), identity), /TWO_PROFILES/);
});
