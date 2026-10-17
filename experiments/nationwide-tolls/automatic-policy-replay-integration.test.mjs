import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';

// Isolated subprocess fixtures: no real GitHub/network and no mocked runtime fares.
// They verify the writer protocol and stop boundaries, not tariff correctness.
async function mockGit() {
  const fs = await import('node:fs');
  const state = JSON.parse(fs.readFileSync('.mock-git.json'));
  const [cmd, arg] = process.argv.slice(2);
  let result = '';
  if (cmd === 'branch') result = 'fix/v3-missing-route-prices-2026-10-15';
  if (cmd === 'ls-remote') result = state.remote + '\trefs/heads/fix/v3-missing-route-prices-2026-10-15';
  if (cmd === 'rev-parse') result = ({ HEAD: state.head, 'HEAD^{tree}': state.tree, FETCH_HEAD: state.remote, 'FETCH_HEAD^{tree}': state.remoteTree })[arg];
  if (cmd === 'commit') {
    state.commits++;
    state.head = 'head' + state.commits; state.tree = 'tree' + state.commits;
    const checkpoint = JSON.parse(fs.readFileSync('experiments/nationwide-tolls/AUTO_QUEUE_STATE.json'));
    fs.appendFileSync('.mock-commits.jsonl', JSON.stringify({ phase: checkpoint.phase, caseId: checkpoint.caseId }) + '\n');
  }
  if (cmd === 'push') {
    if (String(state.commits) === process.env.FAIL_PUSH_COMMIT) process.exit(1);
    state.remote = state.head; state.remoteTree = state.tree;
  }
  fs.writeFileSync('.mock-git.json', JSON.stringify(state));
  if (result) process.stdout.write(result + '\n');
}
async function mockReplay() {
  const [fs, path, { gunzipSync }, { createHash }] = await Promise.all([
    import('node:fs'), import('node:path'), import('node:zlib'), import('node:crypto'),
  ]);
  const [capture, date] = process.argv.slice(-2), bytes = fs.readFileSync(capture);
  const { record } = JSON.parse(gunzipSync(bytes));
  const failed = process.env.FAIL_REPLAY_CASE === record.spec.id;
  const value = {
    caseId: record.spec.id, captureSha256: createHash('sha256').update(bytes).digest('hex'),
    provider: record.provider, departureAt: date, mode: 'offline-recorded-response-replay',
    tariffPolicy: { id: 'trip-departure-v1', basisAt: date },
    replayIntegrity: { complete: !failed, missingResponses: failed ? ['missing'] : [] },
    detectedRoadComponents: [{ id: 'm4', amount: 123 }],
    audit: { status: 'unknown', missing: ['zsd'] }, tolls: { amount: null },
  };
  fs.writeFileSync(path.join(path.dirname(capture), 'replay-' + date.replace(/[:+]/g, '-') + '.json'), JSON.stringify(value));
}
function fixture(t, overrides = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'policy-writer-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const write = (p, value) => {
    const target = path.join(dir, p); fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value));
  };
  const experiment = 'experiments/nationwide-tolls', root = experiment + '/source-snapshots/systemic-road-audit-2026-10-15';
  const runner = experiment + '/scripts/automatic-policy-replay-queue.mjs';
  write(runner, fs.readFileSync(new URL('./scripts/automatic-policy-replay-queue.mjs', import.meta.url)));
  write(experiment + '/scripts/run-systemic-route-case.mjs', 'await (' + mockReplay.toString() + ')();');
  write('scripts/register-ts-paths.mjs', 'export {};');
  write('bin/git', '#!/usr/bin/env node\n(' + mockGit.toString() + ')().catch(e=>{console.error(e);process.exitCode=1;});\n');
  fs.chmodSync(path.join(dir, 'bin/git'), 0o755);
  write('.mock-git.json', { head: 'head0', remote: 'head0', tree: 'tree0', remoteTree: 'tree0', commits: 0 });
  write(root + '/REPORT.json', '{}');
  const reportHash = createHash('sha256').update('{}').digest('hex');
  const routes = ['a', 'b'].map(id => {
    const capture = root + '/runs/' + id + '/capture.json.gz';
    write(capture, gzipSync(JSON.stringify({ record: { spec: { id }, provider: 'Valhalla' }, calls: [] })));
    return { id, auditEvidence: { capture } };
  });
  write(root + '/corpus.json', { routes });
  write(experiment + '/PART19_FINDINGS_QUEUE.json', {
    baselineReport: 'source-snapshots/systemic-road-audit-2026-10-15/REPORT.json', baselineReportSha256: reportHash,
    findings: [{ code: 'm4_crossing_profile_changes', caseIds: ['a', 'b'], currentCasesChecked: 0, currentEvaluations: [] },
      { code: 'm4:unpriced', caseIds: ['later'] }],
  });
  write(experiment + '/SMALL_PARTS_PLAN.json', { parts: [...Array.from({ length: 18 }, (_, i) => ({ id: i + 1, status: 'done' })), { id: 19, status: 'in_progress' }] });
  fs.mkdirSync(path.join(dir, 'docs/checkpoints/evidence'), { recursive: true });
  const result = spawnSync(process.execPath, [runner], {
    cwd: dir, encoding: 'utf8', timeout: 30_000,
    env: { ...process.env, GITHUB_REF_NAME: 'fix/v3-missing-route-prices-2026-10-15', GITHUB_RUN_ID: 'fixture', PATH: path.join(dir, 'bin') + path.delimiter + process.env.PATH, ...overrides },
  });
  const commits = fs.readFileSync(path.join(dir, '.mock-commits.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  const queue = JSON.parse(fs.readFileSync(path.join(dir, experiment, 'PART19_FINDINGS_QUEUE.json')));
  return { result, commits, queue, dir, root };
}
test('writer persists STARTED and DONE separately before each next case and class completion', t => {
  const { result, commits, queue } = fixture(t);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(commits.map(c => [c.phase, c.caseId ?? null]), [
    ['PART19_M4_POLICY_STARTED', 'a'], ['PART19_M4_POLICY_DONE', 'a'],
    ['PART19_M4_POLICY_STARTED', 'b'], ['PART19_M4_POLICY_DONE', 'b'], ['PART19_M4_POLICY_CLASS_DONE', null],
  ]);
  assert.equal(queue.findings[0].currentCasesChecked, 2);
  assert.equal(queue.findings[0].status, 'not_reproduced_current_engine');
  assert.equal(queue.nextCase, 'later');
});
test('incomplete second-case replay persists FAILED without advancing it or starting another case', t => {
  const { result, commits, queue } = fixture(t, { FAIL_REPLAY_CASE: 'b' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /INCOMPLETE_REPLAY/);
  assert.deepEqual(commits.map(c => c.phase), ['PART19_M4_POLICY_STARTED', 'PART19_M4_POLICY_DONE', 'PART19_M4_POLICY_STARTED', 'PART19_M4_POLICY_FAILED']);
  assert.equal(queue.findings[0].currentCasesChecked, 1);
});
test('failed push stops before the next route without force or progress expansion', t => {
  const { result, commits } = fixture(t, { FAIL_PUSH_COMMIT: '2' });
  assert.equal(result.status, 1);
  assert.deepEqual(commits.map(c => c.caseId), ['a', 'a']);
});
