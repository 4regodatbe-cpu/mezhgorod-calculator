import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { pricingParity } from './systemic-audit-io.mjs';

export const branch = 'fix/v3-missing-route-prices-2026-10-15';
const experiment = 'experiments/nationwide-tolls';
const root = `${experiment}/source-snapshots/systemic-road-audit-2026-10-15`;
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, data) => fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
const command = (exe, args) => execFileSync(exe, args, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }).trim();

export function verifiedEntry(entry, getBytes = p => fs.readFileSync(p)) {
  if (entry?.status !== 'audited' || !entry.sameDateParity) return false;
  try {
    const parse = p => JSON.parse(getBytes(p).toString('utf8'));
    const live = parse(entry.live);
    const dir = path.dirname(entry.live);
    const same = parse(path.join(dir, entry.sameDateReplay));
    const weekend = parse(path.join(dir, entry.weekendReplay));
    const bytes = getBytes(entry.capture);
    const capture = JSON.parse(gunzipSync(bytes).toString('utf8'));
    return Boolean(capture.record && Array.isArray(capture.calls)
      && live.caseId === entry.caseId
      && (!live.captureSha256 || live.captureSha256 === createHash('sha256').update(bytes).digest('hex'))
      && same.replayIntegrity?.complete && weekend.replayIntegrity?.complete
      && pricingParity(live, same));
  } catch { return false; }
}

export function selectPending(plan, completed) {
  for (const part of plan.parts) for (const spec of part.cases ?? []) {
    if (!completed.has(spec.caseId)) return { part: part.id, spec };
  }
  return null;
}

export function inspectQueue() {
  const latest = new Map();
  for (const file of fs.readdirSync(root).filter(p => /^batch-.*\.json$/.test(p)).sort()) {
    for (const entry of read(`${root}/${file}`).cases) if (entry.status) latest.set(entry.caseId, entry);
  }
  const completed = new Set([...latest].filter(([, entry]) => verifiedEntry(entry)).map(([id]) => id));
  const plan = read(`${experiment}/SMALL_PARTS_PLAN.json`);
  for (const part of plan.parts) if (part.cases) {
    part.completedCases = part.cases.filter(spec => completed.has(spec.caseId)).length;
    part.status = part.completedCases === part.cases.length ? 'done' : 'planned';
  }
  const pending = selectPending(plan, completed);
  if (pending) plan.parts.find(p => p.id === pending.part).status = 'in_progress';
  const stageCounts = read(`${experiment}/TWO_STAGE_AUDIT_PLAN.json`).stages.map(stage => ({ stage: stage.id, done: stage.cases.filter(spec => completed.has(spec.caseId)).length, total: stage.cases.length }));
  return { plan, pending, stageCounts, latest };
}

function remoteHead() {
  return command('git', ['ls-remote', 'origin', `refs/heads/${branch}`]).split(/\s/)[0];
}

function persist(expected) {
  if (remoteHead() !== expected) throw Error('REMOTE_CHANGED: another writer updated this branch; no force/rebase');
  command('git', ['add', 'docs/checkpoints', 'docs/WORK_STATE.md', experiment]);
  command('git', ['diff', '--cached', '--check']);
  command('git', ['commit', '-m', 'audit: automatic single-case durable checkpoint']);
  const head = command('git', ['rev-parse', 'HEAD']);
  command('git', ['push', 'origin', `HEAD:refs/heads/${branch}`]);
  if (remoteHead() !== head) throw Error('REMOTE_READBACK_MISMATCH');
  return head;
}

function checkpoint(phase, state, extra = {}) {
  const at = new Date().toISOString();
  const stamp = at.replace(/[:.]/g, '-');
  const record = { at, phase, branch, workflowRun: process.env.GITHUB_RUN_ID ?? null, stageCounts: state.stageCounts, next: state.pending, ...extra };
  const checkpointPath = `docs/checkpoints/auto-${stamp}-${phase.toLowerCase()}.json`;
  write(checkpointPath, record);
  write(`${experiment}/SMALL_PARTS_PLAN.json`, state.plan);
  write(`${experiment}/AUTO_QUEUE_STATE.json`, { ...record, checkpointPath });
  fs.writeFileSync('docs/WORK_STATE.md', `# Калькулятор: автоматическая очередь\n\n${at}. Ветка \`${branch}\`, PR14 draft. Фаза **${phase}**. ${state.stageCounts.map(s => `Stage${s.stage} **${s.done}/${s.total}**`).join('; ')}.\n\nСледующий подшаг: **${state.pending ? `часть${state.pending.part}, ${state.pending.spec.caseId}` : 'часть19 — разбор находок и исправления по одной причине'}**.\n\n[Состояние и точные входы](../${experiment}/AUTO_QUEUE_STATE.json), [checkpoint](${checkpointPath.slice(5)}), [план](../${experiment}/SMALL_PARTS_PLAN.json).\n\nКаждый маршрут: durable STARTED → live/same-date/weekend → report/inventory → DONE/FAILED → commit/push/head readback. Не запускать второго writer, пока workflow активен. GitHub Actions пишет только рабочую ветку. При конфликте/ошибке сохранения остановка безforce. Raw и progress в source-snapshots и artifact.\n\nAudited — воспроизводимость, не независимая проверка цены; unknown не ноль, subtotal не итог. Часть19 не выполнена автоматически одним прогоном, часть20 требует итоговых проверок после исправлений. Fullbuild661PASS — прежняя локальная проверка до автоматического runner; свежий gate см.workflow/checkpoint. No main/merge/Production/Android. Междорожныевекторы отложены, тарификация всей поездки по отправлению. Пользователь16.10 02:12 разрешил автоматическое последовательное продолжение всехчастей.\n\n[Протокол](CHECKPOINT_PROTOCOL.md), [журнал](../${experiment}/WORK_LOG.md), [решения](../${experiment}/DECISIONS.md).\n`);
  for (const file of ['WORK_LOG.md', 'NEXT_STEPS.md']) fs.appendFileSync(`${experiment}/${file}`, `\n${at}: automatic queue ${phase}; ${state.stageCounts.map(s => `${s.done}/${s.total}`).join(',')}. [Checkpoint](../../${checkpointPath}). ${extra.caseId ?? ''} ${extra.error ?? ''}\n`);
}

function runLogged(exe, args, logPath, timeout = 950_000) {
  return new Promise(resolve => {
    const out = fs.createWriteStream(logPath);
    const child = spawn(exe, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', bytes => { out.write(bytes); process.stdout.write(bytes); });
    child.stderr.on('data', bytes => { out.write(bytes); process.stderr.write(bytes); });
    const timer = setTimeout(() => child.kill('SIGTERM'), timeout);
    child.on('error', error => { out.write(String(error)); });
    child.on('close', (code, signal) => { clearTimeout(timer); out.end(() => resolve({ code, signal })); });
  });
}

export async function main() {
  if (process.env.GITHUB_REF_NAME !== branch) throw Error('AUTHORIZED_BRANCH_REQUIRED');
  if (command('git', ['branch', '--show-current']) !== branch) throw Error('WRONG_CHECKOUT');
  if (command('git', ['status', '--porcelain'])) throw Error('DIRTY_CHECKOUT');
  let expected = command('git', ['rev-parse', 'HEAD']);
  if (remoteHead() !== expected) throw Error('STALE_CHECKOUT');
  const deadline = Date.now() + 320 * 60_000;
  let failures = 0;
  while (Date.now() < deadline) {
    const state = inspectQueue();
    if (!state.pending) {
      checkpoint('AUDIT_QUEUE_DONE', state, { next: 'Part19: review findings; do not claim fares fixed or release ready' });
      persist(expected);
      return;
    }
    const { part, spec } = state.pending;
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logPrefix = `docs/checkpoints/evidence/auto-${stamp}-part${part}`;
    checkpoint('STARTED', state, { caseId: spec.caseId, departureAt: '2026-10-15T09:00:00+03:00', weekendAt: '2026-10-17T09:00:00+03:00', logPrefix, parent: expected });
    expected = persist(expected);
    const args = [`${experiment}/scripts/run-systemic-route-batch.mjs`, '--case', spec.caseId, '--limit', '1'];
    if (spec.kind === 'road') {
      const row = read(`${root}/road-cases.json`).routes.find(row => row.id === spec.caseId);
      if (!row?.groups?.[0]) throw Error('ROAD_GROUP_MISSING');
      args.push('--group', row.groups[0]);
    }
    const batch = await runLogged(process.execPath, args, `${logPrefix}-batch.log`);
    const report = await runLogged(process.execPath, [`${experiment}/scripts/build-systemic-audit-report.mjs`], `${logPrefix}-report.log`);
    const inventory = await runLogged('python3', [`${experiment}/scripts/audit-evidence-availability.py`], `${logPrefix}-inventory.log`);
    const after = inspectQueue();
    const entry = after.latest.get(spec.caseId);
    const success = batch.code === 0 && report.code === 0 && inventory.code === 0 && verifiedEntry(entry);
    checkpoint(success ? 'DONE' : 'FAILED', after, { caseId: spec.caseId, batch, report, inventory, evidence: entry ?? null, logPrefix, parent: expected });
    expected = persist(expected);
    failures = success ? 0 : failures + 1;
    if (failures >= 3 || report.code !== 0 || inventory.code !== 0) throw Error('REPEATED_FAILURE_OR_REPORT_FAILURE: inspect saved checkpoint before retry');
  }
  checkpoint('TIME_LIMIT', inspectQueue(), { note: 'Saved boundary; resume same branch via workflow_dispatch after verifying no active writer' });
  persist(expected);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error); process.exitCode = 1; });
