import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

export const branch = 'fix/v3-missing-route-prices-2026-10-15';
export const dates = ['2026-10-15T09:00:00+03:00', '2026-10-17T09:00:00+03:00'];
const experiment = 'experiments/nationwide-tolls';
const root = experiment + '/source-snapshots/systemic-road-audit-2026-10-15';
const queuePath = experiment + '/PART19_FINDINGS_QUEUE.json';
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, value) => fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n');
const sha = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', timeout: 60_000, maxBuffer: 2 * 1024 * 1024 }).trim();

export function nextPolicyCase(finding) {
  if (!finding || finding.code !== 'm4_crossing_profile_changes') throw Error('WRONG_FINDING_SCOPE');
  const evaluations = finding.currentEvaluations ?? [];
  const completed = new Set(evaluations.map(e => e.caseId));
  if (completed.size !== evaluations.length || evaluations.length !== (finding.currentCasesChecked ?? 0)
    || evaluations.some(e => !finding.caseIds.includes(e.caseId))) throw Error('INVALID_PROGRESS');
  return finding.caseIds.find(id => !completed.has(id)) ?? null;
}

export function verifyPolicyPair(outputs, { caseId, captureSha256, provider }) {
  if (outputs.length !== 2) throw Error('TWO_PROFILES_REQUIRED');
  for (let i = 0; i < dates.length; i++) {
    const output = outputs[i];
    if (output.caseId !== caseId || output.captureSha256 !== captureSha256 || output.provider !== provider) throw Error('SELECTED_CAPTURE_MISMATCH');
    if (output.mode !== 'offline-recorded-response-replay' || output.departureAt !== dates[i]
      || output.tariffPolicy?.id !== 'trip-departure-v1' || output.tariffPolicy.basisAt !== dates[i]) throw Error('DEPARTURE_POLICY_MISMATCH');
    if (!output.replayIntegrity?.complete || output.replayIntegrity.missingResponses?.length !== 0) throw Error('INCOMPLETE_REPLAY');
    const m4 = output.detectedRoadComponents?.filter(c => c.id === 'm4') ?? [];
    if (m4.length !== 1 || !Number.isFinite(m4[0].amount) || m4[0].amount <= 0
      || /m4_crossing_profile_changes/.test(m4[0].reason ?? '') || output.audit?.missing?.includes('m4')) throw Error('CURRENT_M4_FINDING_REPRODUCED');
    const missing = output.audit?.missing;
    if (!Array.isArray(missing) || (missing.length && (output.tolls?.amount != null || output.audit.status !== 'unknown'))
      || (!missing.length && (!Number.isFinite(output.tolls?.amount) || output.audit.status !== 'priced'))) throw Error('INCONSISTENT_TOTAL_COMPLETENESS');
  }
  return {
    caseId, result: 'not_reproduced_current_engine',
    weekdayAmount: outputs[0].tolls.amount, weekendAmount: outputs[1].tolls.amount,
    m4WeekdayAmount: outputs[0].detectedRoadComponents.find(c => c.id === 'm4').amount,
    m4WeekendAmount: outputs[1].detectedRoadComponents.find(c => c.id === 'm4').amount,
    remainingMissing: [...new Set(outputs.flatMap(o => o.audit.missing))],
  };
}

function remoteHead() { return git('ls-remote', 'origin', 'refs/heads/' + branch).split(/\s/)[0]; }
function persist(expected) {
  if (remoteHead() !== expected) throw Error('REMOTE_CHANGED_NO_FORCE');
  git('add', 'docs/checkpoints', 'docs/WORK_STATE.md', experiment);
  git('diff', '--cached', '--check');
  git('commit', '-m', 'audit: durable single-case current-policy replay checkpoint');
  const head = git('rev-parse', 'HEAD'), tree = git('rev-parse', 'HEAD^{tree}');
  git('push', 'origin', 'HEAD:refs/heads/' + branch);
  if (remoteHead() !== head) throw Error('REMOTE_HEAD_READBACK_MISMATCH');
  git('fetch', '--depth=1', 'origin', branch);
  if (git('rev-parse', 'FETCH_HEAD') !== head || git('rev-parse', 'FETCH_HEAD^{tree}') !== tree) throw Error('REMOTE_TREE_READBACK_MISMATCH');
  return head;
}

function checkpoint(phase, queue, extra = {}) {
  const at = new Date().toISOString(), stamp = at.replace(/[:.]/g, '-');
  const finding = queue.findings.find(f => f.code === 'm4_crossing_profile_changes');
  const next = nextPolicyCase(finding);
  const checkpointPath = 'docs/checkpoints/policy-' + stamp + '-' + phase.toLowerCase() + '.json';
  const record = {
    at, phase, branch, workflowRun: process.env.GITHUB_RUN_ID ?? null,
    scope: 'Historical M4 profile finding only; current-engine offline, not live or tariff confirmation',
    checked: finding.currentCasesChecked, total: finding.caseIds.length,
    next: next ?? 'Part19: diagnose next finding class; do not mark part19/20 complete',
    validation: 'Preceding workflow pnpm build is required; runtime fare logic unchanged',
    ...extra, checkpointPath,
  };
  write(checkpointPath, record);
  write(experiment + '/AUTO_QUEUE_STATE.json', record);
  write(queuePath, queue);
  const plan = read(experiment + '/SMALL_PARTS_PLAN.json');
  const part = plan.parts.find(p => p.id === 19);
  part.status = 'in_progress';
  part.nextSubstep = next ? 'Current M4 policy ' + finding.currentCasesChecked + '/' + finding.caseIds.length + '; next ' + next
    : 'M4 policy class complete; review other current findings one cause at a time';
  write(experiment + '/SMALL_PARTS_PLAN.json', plan);
  const note = at + ': ' + phase + ' M4 policy ' + finding.currentCasesChecked + '/' + finding.caseIds.length + '; ' + (extra.caseId ?? '') +
    '. [Checkpoint](../../' + checkpointPath + '). ' + (extra.error ?? '') + ' Offline reproducibility only; unknown is not0, subtotal is not total.';
  for (const file of ['WORK_LOG.md', 'NEXT_STEPS.md']) fs.appendFileSync(experiment + '/' + file, '\n' + note.trimEnd() + '\n');
  fs.writeFileSync('docs/WORK_STATE.md', '# Калькулятор: часть19, последовательная проверка М-4\n\n' +
    at + '. Ветка ' + branch + ', PR14 draft. Фаза **' + phase + '**; current-policy **' + finding.currentCasesChecked + '/' + finding.caseIds.length + '**.\n\n' +
    '**NEXT:** ' + record.next + '. При active/queued workflow не писать в ветку и не запускать второго writer. После завершения читать actual job/checkpoint, затем продолжать часть19, часть20 ещё не начата.\n\n' +
    'Части1–18 DONE:155/155+154/154, frozenREPORT340/340. 19A/19B A289 binding fixes сохранены,57helper-only+2whole-route cases; это не59полных тарифов. Runtime fare source79df66d8; новый workflow build проверяет актуальные scripts/tests перед очередью.\n\n' +
    'Каждый case: STARTED→два saved-capture профиля→verify→DONE/FAILED→commit/push/exacthead/tree readback→сразу следующий. TIME_LIMIT возобновляем; не повторять завершённую309livequeue.\n\n' +
    'Полные тарифы могут оставаться unknown из-за ЗСД/других компонентов; не подставлять0 и не выдавать subtotal за итог. Whole trip uses departure instant. Corrected offline replay не является fresh live, parity с историческим buggy live или независимой проверкой цены. Исходные raw/live/replay/REPORT и append-only история сохранены.\n\n' +
    '[Состояние](../' + experiment + '/AUTO_QUEUE_STATE.json) · [Checkpoint](' + checkpointPath.slice(5) + ') · [Findings](../' + queuePath + ') · [Журнал](../' + experiment + '/WORK_LOG.md) · [Протокол](CHECKPOINT_PROTOCOL.md).\n\n' +
    'No main/merge/Production/Android/messages. После всех25 cases проверить остальные категории находок; не считать часть19 законченной. Автоматическое продолжение всех20частей подтверждено пользователем16.10.2026 10:27МСК.\n');
  return checkpointPath;
}

function runProfile(capture, date, log) {
  const args = ['--import', './scripts/register-ts-paths.mjs', experiment + '/scripts/run-systemic-route-case.mjs', '--replay', capture, date];
  try {
    const output = execFileSync(process.execPath, args, { encoding: 'utf8', timeout: 60_000, maxBuffer: 2 * 1024 * 1024 });
    fs.writeFileSync(log, output);
    process.stdout.write(output);
  } catch (error) {
    fs.writeFileSync(log, String(error.stdout ?? '') + String(error.stderr ?? '') + String(error));
    throw Error('REPLAY_COMMAND_FAILED:' + date + ':' + error.message);
  }
}

export function main() {
  if (process.env.GITHUB_REF_NAME !== branch || git('branch', '--show-current') !== branch) throw Error('AUTHORIZED_BRANCH_REQUIRED');
  if (git('status', '--porcelain')) throw Error('DIRTY_CHECKOUT');
  let expected = git('rev-parse', 'HEAD');
  if (remoteHead() !== expected) throw Error('STALE_CHECKOUT');
  const plan = read(experiment + '/SMALL_PARTS_PLAN.json');
  if (plan.parts.some(p => p.id < 19 && p.status !== 'done') || plan.parts.find(p => p.id === 19)?.status !== 'in_progress') throw Error('WRONG_PHASE');
  const deadline = Date.now() + 25 * 60_000;
  while (Date.now() < deadline) {
    const queue = read(queuePath), finding = queue.findings.find(f => f.code === 'm4_crossing_profile_changes');
    const caseId = nextPolicyCase(finding);
    if (!caseId) {
      finding.status = 'not_reproduced_current_engine';
      queue.nextCase = queue.findings.find(f => f.code === 'm4:unpriced')?.caseIds[0] ?? null;
      checkpoint('PART19_M4_POLICY_CLASS_DONE', queue, { parent: expected, nextFinding: 'm4:unpriced' });
      persist(expected);
      return;
    }
    const spec = read(root + '/corpus.json').routes.find(r => r.id === caseId);
    const capture = spec?.auditEvidence?.capture;
    if (!capture || !capture.startsWith(root + '/runs/' + caseId + '/')) throw Error('CAPTURE_REQUIRED_FOR_EXACT_CASE');
    const captureSha256 = sha(capture), dir = path.dirname(capture);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const prefix = 'docs/checkpoints/evidence/policy-' + stamp;
    checkpoint('PART19_M4_POLICY_STARTED', queue, { caseId, capture, captureSha256, dates, parent: expected, logPrefix: prefix });
    expected = persist(expected);
    try {
      const before = new Set(fs.readdirSync(dir));
      dates.forEach((date, i) => runProfile(capture, date, prefix + '-' + i + '.log'));
      const files = fs.readdirSync(dir).filter(f => !before.has(f) && f.startsWith('replay-') && f.endsWith('.json')).map(f => path.join(dir, f));
      const outputs = dates.map(date => {
        const matches = files.map(p => ({ p, value: read(p) })).filter(o => o.value.departureAt === date);
        if (matches.length !== 1) throw Error('EXACTLY_ONE_NEW_OUTPUT_PER_PROFILE_REQUIRED');
        return matches[0];
      });
      const provider = read(spec.auditEvidence.live).provider;
      const evaluation = verifyPolicyPair(outputs.map(o => o.value), { caseId, captureSha256, provider });
      if (sha(capture) !== captureSha256) throw Error('RAW_CHANGED');
      evaluation.outputs = outputs.map(o => ({ path: o.p, sha256: sha(o.p) }));
      evaluation.capture = capture;
      evaluation.captureSha256 = captureSha256;
      evaluation.components = outputs.map(o => ({ departureAt: o.value.departureAt, components: o.value.detectedRoadComponents }));
      finding.currentEvaluations.push(evaluation);
      finding.currentCasesChecked = finding.currentEvaluations.length;
      queue.nextCase = nextPolicyCase(finding);
      evaluation.checkpoint = '../../' + checkpoint('PART19_M4_POLICY_DONE', queue, { parent: expected, caseId, evaluation });
      write(queuePath, queue);
    } catch (error) {
      checkpoint('PART19_M4_POLICY_FAILED', queue, { parent: expected, caseId, capture, captureSha256, error: String(error), logPrefix: prefix });
      persist(expected);
      throw error;
    }
    expected = persist(expected);
  }
  checkpoint('TIME_LIMIT', read(queuePath), { parent: expected, note: 'Saved boundary; resume policy runner only after no active writer' });
  persist(expected);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error); process.exitCode = 1; }
}
