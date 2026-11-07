// Bounded primary-source GET capture for one physical binding, never routing.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const [directory, ...urls] = process.argv.slice(2);
assert.ok(directory && urls.length && process.env.M11_DURABLE_STARTED_COMMIT,
  'Supply output directory, primary URLs and verified M11_DURABLE_STARTED_COMMIT');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
fs.mkdirSync(directory, {recursive: true});
const completed = fs.readdirSync(directory).filter(p => p.endsWith('.metadata.json'))
  .map(p => JSON.parse(fs.readFileSync(path.join(directory, p))));
const save = (name, object) => {
  const file = path.join(directory, name);
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(object, null, 2) + '\n');
  fs.renameSync(`${file}.tmp`, file);
};
for (const url of urls) {
  const u = new URL(url);
  assert.equal(u.protocol, 'https:');
  const isOsm = u.hostname === 'api.openstreetmap.org';
  const isOwner = ['avtodor-tr.ru', 'www.avtodor-tr.ru', 'www.russianhighways.ru'].includes(u.hostname);
  assert.ok(isOsm || isOwner, 'Primary owner/OSM hosts only');
  if (isOsm) {
    assert.ok(/^\/api\/0\.6\/(?:node|way|relation)\/\d+(?:\/(?:full|ways|relations))?$/.test(u.pathname)
      || u.pathname === '/api/0.6/map', 'Exact OSM object or small local map only');
    if (u.pathname.endsWith('/map')) {
      const b = (u.searchParams.get('bbox') ?? '').split(',').map(Number);
      assert.ok(b.length === 4 && b.every(Number.isFinite) && b[2] > b[0] && b[3] > b[1]
        && b[2] - b[0] <= 0.02 && b[3] - b[1] <= 0.02, 'Bound the local map');
    }
  }
  const previous = completed.find(c => c.url === url);
  if (previous) {
    if (previous.bodyFile) assert.equal(sha(fs.readFileSync(path.join(directory, previous.bodyFile))), previous.sha256);
    console.log(JSON.stringify({url, status: previous.status, reusedSavedResponse: true}));
    continue;
  }
  if (isOsm) assert.ok(completed.filter(c => c.sourceKind === 'osm').length < 6, 'OSM request cap exhausted');
  else assert.ok(completed.filter(c => c.sourceKind === 'owner').length < 2, 'Owner request cap exhausted');
  const spent = completed.reduce((n, c) => n + c.elapsedMs, 0);
  assert.ok(spent < 120000, 'Primary source network budget exhausted');
  const key = sha(url).slice(0, 20);
  const record = {url, sourceKind: isOsm ? 'osm' : 'owner', startedAt: new Date().toISOString(),
    durableStartedCommit: process.env.M11_DURABLE_STARTED_COMMIT, state: 'STARTED'};
  save('progress.json', {completed: completed.length, current: record});
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {headers: {'User-Agent': 'MezhgorodCalc/2.0', Accept: '*/*'},
      signal: AbortSignal.timeout(Math.max(1, Math.min(15000, 120000 - spent)))});
    const body = Buffer.from(await response.arrayBuffer());
    record.bodyFile = `${key}${isOsm ? '.osm' : u.pathname.endsWith('.pdf') ? '.pdf' : '.html'}`;
    fs.writeFileSync(path.join(directory, record.bodyFile), body);
    Object.assign(record, {status: response.status, finalUrl: response.url, contentType: response.headers.get('content-type'),
      bytes: body.length, sha256: sha(body)});
  } catch (error) {
    record.error = String(error);
  } finally {
    record.elapsedMs = Date.now() - startedAt;
    record.state = 'DONE';
    save(`${key}.metadata.json`, record);
    completed.push(record);
    save('progress.json', {state: 'DONE_REQUESTS', completed: completed.length,
      networkElapsedMs: completed.reduce((n, c) => n + c.elapsedMs, 0)});
  }
  console.log(JSON.stringify({url, status: record.status, error: record.error, bytes: record.bytes,
    bodyFile: record.bodyFile, sha256: record.sha256}));
}
