import test from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { verifiedEntry, selectPending } from './scripts/automatic-audit-queue.mjs';
import { recordingFetch } from './scripts/systemic-audit-io.mjs';

function fixture() {
  const output = { caseId: 'case', traceComplete: true, tolls: { amount: null, pricingStatus: 'unknown' }, audit: { missing: ['a289'] }, replayIntegrity: { complete: true } };
  const files = new Map([['runs/live.json', Buffer.from(JSON.stringify(output))], ['runs/same.json', Buffer.from(JSON.stringify(output))], ['runs/weekend.json', Buffer.from(JSON.stringify(output))], ['runs/capture.json.gz', gzipSync(JSON.stringify({ record: {}, calls: [] }))]]);
  return { files, entry: { caseId: 'case', status: 'audited', sameDateParity: true, live: 'runs/live.json', capture: 'runs/capture.json.gz', sameDateReplay: 'same.json', weekendReplay: 'weekend.json' }, get: p => { if (!files.has(p)) throw Error('missing'); return files.get(p); } };
}
test('unknown numeric price is compatible with complete execution evidence', () => {
  const f = fixture(); assert.equal(verifiedEntry(f.entry, f.get), true);
});
test('missing raw and incomplete replay do not count as completed', () => {
  const f = fixture(); f.files.delete(f.entry.capture); assert.equal(verifiedEntry(f.entry, f.get), false);
  const g = fixture(); const replay = JSON.parse(g.files.get('runs/weekend.json')); replay.replayIntegrity.complete = false; g.files.set('runs/weekend.json', Buffer.from(JSON.stringify(replay))); assert.equal(verifiedEntry(g.entry, g.get), false);
});
test('rejects crossed case IDs, replay money mismatch and damaged raw checksum', () => {
  for (const mutate of [o => { o.caseId = 'other'; }, o => { o.captureSha256 = 'bad'; }]) {
    const f = fixture(); const live = JSON.parse(f.files.get('runs/live.json')); mutate(live); f.files.set('runs/live.json', Buffer.from(JSON.stringify(live))); assert.equal(verifiedEntry(f.entry, f.get), false);
  }
  const f = fixture(); const same = JSON.parse(f.files.get('runs/same.json')); same.tolls.amount = 50; f.files.set('runs/same.json', Buffer.from(JSON.stringify(same))); assert.equal(verifiedEntry(f.entry, f.get), false);
});
test('queue preserves part/case order and skips only verified cases', () => {
  const plan = { parts: [{ id: 4, cases: [{ caseId: 'a' }, { caseId: 'b' }] }, { id: 5, cases: [{ caseId: 'c' }] }] };
  assert.equal(selectPending(plan, new Set(['a'])).spec.caseId, 'b');
  assert.equal(selectPending(plan, new Set(['a', 'b'])).part, 5);
  assert.equal(selectPending(plan, new Set(['a', 'b', 'c'])), null);
});
test('completed provider replies and failures invoke durable progress hook', async () => {
  const calls = []; const saved = [];
  await recordingFetch(async () => new Response('route'), calls, values => saved.push(JSON.parse(JSON.stringify(values))))('https://provider.test');
  await assert.rejects(recordingFetch(async () => { throw Error('offline'); }, calls, values => saved.push(JSON.parse(JSON.stringify(values))))('https://provider.test/fail'));
  assert.equal(saved.length, 2); assert.equal(saved[0][0].text, 'route'); assert.match(saved[1][1].error, /offline/);
});
