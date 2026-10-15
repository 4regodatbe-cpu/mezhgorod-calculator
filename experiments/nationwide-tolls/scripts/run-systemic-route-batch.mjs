import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pricingParity } from './systemic-audit-io.mjs';

const run = promisify(execFile);
const root = 'experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15';
const args = process.argv.slice(2);
function option(name, fallback) { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; }
const limit = Number(option('--limit', 8));
if (!Number.isSafeInteger(limit) || limit < 1) throw Error('--limit must be a positive integer');
const region = option('--region', null);
const group = option('--group', null);
const corpusPath = path.join(root, group ? 'road-cases.json' : 'corpus.json');
const departureAt = option('--departure', '2026-10-15T09:00:00+03:00');
const weekendAt = '2026-10-17T09:00:00+03:00';
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');
const batchPath = path.join(root, `batch-${stamp()}.json`);
const batch = { startedAt: new Date().toISOString(), scope: { region, group, limit, departureAt, weekendAt }, cases: [] };
const save = () => fs.writeFileSync(batchPath, `${JSON.stringify(batch, null, 2)}\n`);
const initial = JSON.parse(fs.readFileSync(corpusPath));
// Interleave regions so an interrupted campaign still covers all four.
const candidates = initial.routes.filter(row => (!region || row.region === region) && (!group || row.groups?.includes(group)) && row.status !== 'audited');
const regions = [...new Set(candidates.map(row => row.region ?? 'corridor'))];
const buckets = regions.map(key => candidates.filter(row => (row.region ?? 'corridor') === key));
const planned = [];
for (let i = 0; buckets.some(bucket => bucket[i]); i++) for (const bucket of buckets) if (bucket[i]) planned.push(bucket[i]);
save();
let consecutiveFailures = 0;

async function invoke(args) {
  try {
    await run(process.execPath, ['--import', './scripts/register-ts-paths.mjs', 'experiments/nationwide-tolls/scripts/run-systemic-route-case.mjs', ...args], { timeout: 300_000, maxBuffer: 2 * 1024 * 1024 });
    return { ok: true };
  } catch (error) { return { ok: false, code: error.code, error: error.stderr?.trim() || error.message }; }
}
function newest(dir, prefix) {
  return fs.readdirSync(dir).filter(name => name.startsWith(prefix) && name.endsWith('.json')).sort().at(-1);
}

for (const spec of planned.slice(0, limit)) {
  const entry = { caseId: spec.id, startedAt: new Date().toISOString() };
  batch.cases.push(entry);
  save();
  console.log(`START ${batch.cases.length}/${Math.min(limit, planned.length)} ${spec.id}`);
  const result = await invoke(['--live', spec.id, departureAt]);
  if (!result.ok) {
    Object.assign(entry, { status: 'live-failed', ...result, finishedAt: new Date().toISOString() });
    consecutiveFailures++;
  } else {
    consecutiveFailures = 0;
    const corpus = JSON.parse(fs.readFileSync(corpusPath));
    const row = corpus.routes.find(item => item.id === spec.id);
    const capture = path.join('experiments/nationwide-tolls', row.liveEvidence.capture);
    const livePath = path.join('experiments/nationwide-tolls', row.liveEvidence.result);
    const live = JSON.parse(fs.readFileSync(livePath));
    const dir = path.dirname(capture);
    const same = await invoke(['--replay', capture, departureAt]);
    const sameName = newest(dir, `replay-${departureAt.replace(/[:+]/g, '-')}`);
    const sameOutput = sameName ? JSON.parse(fs.readFileSync(path.join(dir, sameName))) : null;
    const parity = same.ok && sameOutput && pricingParity(live, sameOutput);
    const weekend = await invoke(['--replay', capture, weekendAt]);
    const weekendName = newest(dir, `replay-${weekendAt.replace(/[:+]/g, '-')}`);
    const weekendOutput = weekendName ? JSON.parse(fs.readFileSync(path.join(dir, weekendName))) : null;
    const complete = parity && weekend.ok && weekendOutput?.replayIntegrity?.complete;
    Object.assign(entry, { status: complete ? 'audited' : 'replay-failed', live: livePath, capture, sameDateReplay: sameName, sameDateParity: Boolean(parity), weekendReplay: weekendName, replayErrors: [same, weekend].filter(item => !item.ok), traceComplete: live.traceComplete, roadCoverage: live.roadCoverage, weekday: live.tolls, weekend: weekendOutput?.tolls ?? null, components: live.detectedRoadComponents, finishedAt: new Date().toISOString() });
    // Unknown price is an audit finding, not a failed execution or a free route.
    row.status = entry.status;
    row.auditEvidence = { batch: batchPath, live: livePath, capture, sameDateReplay: sameName, weekendReplay: weekendName, sameDateParity: Boolean(parity) };
    fs.writeFileSync(corpusPath, `${JSON.stringify(corpus, null, 2)}\n`);
  }
  save();
  console.log(`DONE ${spec.id} ${entry.status} parity=${entry.sameDateParity ?? false}`);
  if (consecutiveFailures >= 3) { batch.stoppedReason = 'three_consecutive_live_failures'; break; }
}
batch.finishedAt = new Date().toISOString();
save();
console.log(JSON.stringify({ batchPath, attempted: batch.cases.length, audited: batch.cases.filter(row => row.status === 'audited').length, stoppedReason: batch.stoppedReason ?? null }));
