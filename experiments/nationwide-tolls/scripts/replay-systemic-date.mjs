import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = 'experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15';
const departureAt = process.argv[2] ?? '2026-10-13T09:00:00+03:00';
if (!Number.isFinite(new Date(departureAt).getTime())) throw Error('Invalid departure date');
const prefix = `replay-${departureAt.replace(/[:+]/g, '-')}`;
const indexPath = path.join(root, `supplemental-${departureAt.slice(0, 10)}.json`);
const prior = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath)) : { departureAt, scope: 'Offline replay of recorded live routes; not new live routing', cases: [] };
const index = new Map(prior.cases.map(row => [row.caseId, row]));
const cases = ['corpus.json', 'road-cases.json'].flatMap(file => JSON.parse(fs.readFileSync(path.join(root, file))).routes).filter(row => row.status === 'audited');
let completed = 0;
for (const spec of cases) {
  const capture = spec.auditEvidence?.capture;
  if (!capture) continue;
  const previous = index.get(spec.id);
  if (previous?.capture === capture && previous.complete === true && fs.existsSync(previous.output)) continue;
  try {
    await run(process.execPath, ['--import', './scripts/register-ts-paths.mjs', 'experiments/nationwide-tolls/scripts/run-systemic-route-case.mjs', '--replay', capture, departureAt], { timeout: 60_000, maxBuffer: 2 * 1024 * 1024 });
    const dir = path.dirname(capture);
    const output = path.join(dir, fs.readdirSync(dir).filter(name => name.startsWith(prefix) && name.endsWith('.json')).sort().at(-1));
    const result = JSON.parse(fs.readFileSync(output));
    index.set(spec.id, { caseId: spec.id, capture, output, complete: result.replayIntegrity.complete, amount: result.tolls.amount, auditStatus: result.audit.status, missing: result.audit.missing });
  } catch (error) { index.set(spec.id, { caseId: spec.id, capture, complete: false, error: error.stderr?.trim() || error.message }); }
  completed++;
  fs.writeFileSync(indexPath, `${JSON.stringify({ ...prior, updatedAt: new Date().toISOString(), cases: [...index.values()] }, null, 2)}\n`);
}
console.log(JSON.stringify({ indexPath, newlyReplayed: completed, total: index.size, complete: [...index.values()].filter(row => row.complete).length, numericResults: [...index.values()].filter(row => row.amount != null).length }));
