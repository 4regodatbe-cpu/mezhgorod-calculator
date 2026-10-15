import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./scripts/build-systemic-audit-report.mjs', import.meta.url));
test('report survives lost evidence and excludes historic audited claims without raw/replays', t => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'toll-report-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const root = 'experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15';
  const dir = path.join(cwd, root);
  fs.mkdirSync(dir, { recursive: true });
  const write = (name, data) => fs.writeFileSync(path.join(dir, name), JSON.stringify(data));
  write('corpus.json', { routes: ['good', 'lost-live', 'lost-raw', 'bad-replay'].map(id => ({ id, region: 'dnr' })) });
  write('road-cases.json', { groups: [], routes: [] });
  const live = { region: 'dnr', traceComplete: true, tolls: { amount: null, pricingStatus: 'unknown' }, audit: { components: [] } };
  write('live.json', live); write('same.json', live); write('weekend.json', live);
  fs.writeFileSync(path.join(dir, 'capture.json.gz'), gzipSync(JSON.stringify({ calls: [] })));
  write('bad.json', {});
  fs.writeFileSync(path.join(dir, 'bad.json'), '{broken');
  const good = { status: 'audited', live: `${root}/live.json`, capture: `${root}/capture.json.gz`, sameDateReplay: 'same.json', weekendReplay: 'weekend.json', sameDateParity: true };
  write('batch-test.json', { cases: [
    { ...good, caseId: 'good' },
    { ...good, caseId: 'lost-live', live: `${root}/absent-live.json` },
    { ...good, caseId: 'lost-raw', capture: `${root}/absent-capture.json.gz` },
    { ...good, caseId: 'bad-replay', weekendReplay: 'bad.json' },
  ] });
  execFileSync(process.execPath, [script], { cwd, encoding: 'utf8' });
  const report = JSON.parse(fs.readFileSync(path.join(dir, 'REPORT.json'), 'utf8'));
  assert.equal(report.totals.distinctCaseAttempts, 4);
  assert.equal(report.totals.audited, 1);
  assert.equal(report.totals.liveCaptured, 2);
  assert.equal(report.totals.missingOrInvalidReferences, 3);
  assert.equal(report.regionCounts.dnr.audited, 1);
  assert.equal(report.results.find(r => r.caseId === 'lost-raw').sameDateParity, false);
  assert.equal(report.results.find(r => r.caseId === 'bad-replay').status, 'evidence-incomplete');
  assert.ok(report.evidenceProblems.some(r => r.kind === 'weekendReplay' && r.reason === 'invalid-json-or-gzip'));
  assert.match(fs.readFileSync(path.join(dir, 'REPORT.md'), 'utf8'), /Отсутствующих\/нечитаемых evidence-ссылок: 3/);
});
