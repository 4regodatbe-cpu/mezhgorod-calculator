import test from 'node:test';
import assert from 'node:assert/strict';
import { recordingFetch, replayingFetch, pricingParity, assessRoadCoverage, summarizePassageEvidence } from './scripts/systemic-audit-io.mjs';

test('recording reserves request order even when repeated requests finish out of order', async () => {
  const calls = [];
  let finishFirst;
  let index = 0;
  const capture = recordingFetch(async () => ++index === 1 ? new Promise(resolve => { finishFirst = resolve; }) : new Response('second'), calls);
  const first = capture('https://provider.test/trace');
  await capture('https://provider.test/trace');
  finishFirst(new Response('first'));
  await first;
  const replay = replayingFetch(calls);
  assert.equal(await (await replay.fetch('https://provider.test/trace')).text(), 'first');
  assert.equal(await (await replay.fetch('https://provider.test/trace')).text(), 'second');
});

test('offline replay preserves retry-after and has no fallback for missing responses', async () => {
  const calls = [];
  await recordingFetch(async () => new Response('limited', { status: 429, headers: { 'retry-after': '3' } }), calls)('https://provider.test/trace');
  const replay = replayingFetch(calls);
  assert.equal((await replay.fetch('https://provider.test/trace')).headers.get('retry-after'), '3');
  await assert.rejects(replay.fetch('https://provider.test/not-recorded'), /REPLAY_RESPONSE_MISSING/);
  assert.equal(replay.misses.length, 1);
});

test('capture includes requests made during pricing, after routing', async () => {
  const calls = [];
  const fetch = recordingFetch(async () => new Response('{}'), calls);
  await fetch('https://provider.test/route');
  await fetch('https://provider.test/plaza-pricing', { method: 'POST', body: '{"shape":[]}' });
  const replay = replayingFetch(JSON.parse(JSON.stringify(calls)));
  assert.equal((await replay.fetch('https://provider.test/plaza-pricing', { method: 'POST', body: '{"shape":[]}' })).status, 200);
  assert.equal(replay.misses.length, 0);
});

test('parity compares the complete toll audit, not just the numeric total', () => {
  const live = { traceComplete: true, tolls: { amount: null }, audit: { missing: ['m4'] } };
  assert.equal(pricingParity(live, { ...live, mode: 'replay' }), true);
  assert.equal(pricingParity(live, { ...live, audit: { missing: ['ckad'] } }), false);
});

test('planned roads, incomplete traces and partially traversed pairs never count as proven coverage', () => {
  assert.equal(assessRoadCoverage(['m4'], [], true).status, 'expected-road-not-proven');
  assert.equal(assessRoadCoverage(['m4'], [{ road: 'm4' }], false).status, 'trace-incomplete');
  assert.deepEqual(assessRoadCoverage(['m4', 'a289'], [{ road: 'm4' }], true).missingExpectedRoads, ['a289']);
  assert.equal(assessRoadCoverage(['m4', 'a289'], [{ road: 'm4' }, { road: 'a289' }], true).status, 'traversal-proven');
});

// Reconstructed from the documented invariant; not claimed byte-identical to the lost blob.
test('compaction preserves every exact gate and road family while bounding duplicate paid-edge samples', () => {
  const gates = [
    { road: 'm4', kind: 'selected-toll-booth', nodeId: 123 },
    { road: 'm11', kind: 'selected-toll-frame', nodeId: 456 },
    { road: 'unknown', kind: 'unmapped-toll-booth', nodeId: 789 },
  ];
  const edges = Array.from({ length: 3000 }, (_, i) => ({
    road: i % 2 ? 'm4' : 'm11', kind: 'selected-paid-edge', wayId: i + 1,
  }));
  const input = [...edges.slice(0, 10), ...gates, ...edges.slice(10), edges[0]];
  const before = structuredClone(input);
  const summary = summarizePassageEvidence(input);
  assert.deepEqual(input, before, 'raw evidence must remain intact');
  assert.deepEqual(summary.evidence.filter(item => item.kind !== 'selected-paid-edge'), gates);
  assert.deepEqual(summary.counts, {
    m11: { occurrences: 1501, uniqueWays: 1500 },
    m4: { occurrences: 1500, uniqueWays: 1500 },
  });
  assert.deepEqual(assessRoadCoverage(['m4', 'm11', 'unknown'], summary.evidence, true),
    assessRoadCoverage(['m4', 'm11', 'unknown'], input, true));
  for (const road of ['m4', 'm11']) {
    const samples = summary.evidence.filter(item => item.kind === 'selected-paid-edge' && item.road === road);
    assert.equal(samples.length, 3);
    assert.equal(new Set(samples.map(item => item.wayId)).size, 3);
    assert.ok(samples.every(item => input.includes(item)));
  }
  assert.equal(summary.evidence.length, 9);
  assert.deepEqual(summarizePassageEvidence([]), { evidence: [], counts: {} });
});
