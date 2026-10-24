// Exact primary object reads for one directed CKAD pair. No routing or search.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const directory = process.argv[2];
assert.ok(directory && process.env.CKAD_DURABLE_STARTED_COMMIT,
  'Supply output directory and verified CKAD_DURABLE_STARTED_COMMIT');
const plan = JSON.parse(fs.readFileSync('experiments/nationwide-tolls/checks/2026-10-17-ckad-m11-m12/inputs.json'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
for (const [p, expected] of Object.entries(plan.sourceHashes)) assert.equal(sha(fs.readFileSync(p)), expected, p);
fs.mkdirSync(directory, {recursive: true});
const save = (name, value) => {
  const file = path.join(directory, name);
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(`${file}.tmp`, file);
};
const completed = fs.readdirSync(directory).filter(p => p.endsWith('.metadata.json'))
  .map(p => JSON.parse(fs.readFileSync(path.join(directory, p))));
assert.ok(plan.primaryUrls.length <= 12);
let terminal = completed.some(c => c.error || c.status !== 200);
for (const url of plan.primaryUrls) {
  const u = new URL(url);
  assert.equal(u.protocol, 'https:'); assert.equal(u.hostname, 'api.openstreetmap.org');
  assert.ok(/^\/api\/0\.6\/(?:node\/\d+|way\/\d+\/full)$/.test(u.pathname));
  const previous = completed.find(c => c.url === url);
  if (previous) {
    if (previous.bodyFile) assert.equal(sha(fs.readFileSync(path.join(directory, previous.bodyFile))), previous.sha256);
    continue;
  }
  if (terminal) break;
  assert.ok(completed.length < 12);
  const spent = completed.reduce((sum, c) => sum + c.elapsedMs, 0);
  if (spent >= 120000) break;
  const key = sha(url).slice(0, 20);
  const record = {url, startedAt: new Date().toISOString(), durableStartedCommit: process.env.CKAD_DURABLE_STARTED_COMMIT};
  save('progress.json', {status: 'IN_PROGRESS', completed: completed.length, current: record});
  const started = Date.now();
  try {
    const response = await fetch(url, {headers: {'User-Agent': 'MezhgorodCalc/2.0', Accept: 'application/xml'},
      signal: AbortSignal.timeout(Math.min(15000, 120000 - spent))});
    const bytes = Buffer.from(await response.arrayBuffer());
    record.bodyFile = `${key}.osm`;
    fs.writeFileSync(path.join(directory, record.bodyFile), bytes);
    Object.assign(record, {status: response.status, finalUrl: response.url, contentType: response.headers.get('content-type'),
      bytes: bytes.length, sha256: sha(bytes)});
  } catch (error) {record.error = String(error);}
  record.elapsedMs = Date.now() - started;
  save(`${key}.metadata.json`, record); completed.push(record);
  terminal = Boolean(record.error || record.status !== 200);
  save('progress.json', {status: terminal ? 'BLOCKED' : 'IN_PROGRESS', completed: completed.length,
    elapsedMs: completed.reduce((sum, c) => sum + c.elapsedMs, 0), terminal});
  console.log(JSON.stringify({url, status: record.status, error: record.error, bytes: record.bytes, sha256: record.sha256}));
}
save('progress.json', {status: terminal ? 'BLOCKED' : completed.length === plan.primaryUrls.length ? 'DONE' : 'BUDGET_EXHAUSTED',
  completed: completed.length, planned: plan.primaryUrls.length,
  elapsedMs: completed.reduce((sum, c) => sum + c.elapsedMs, 0), terminal});
