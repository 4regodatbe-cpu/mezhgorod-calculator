// One changed selected geometry only. Never requests a new provider route.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gzipSync, gunzipSync} from 'node:zlib';
import {osrmRoute, brouterFast} from '../../../lib/route-providers.ts';
import {isUsableRoute} from '../../../lib/v3-calculation/route-candidate.ts';
import {validateTollEdges} from '../../../lib/toll-validator.ts';
import {calculateLegTolls} from '../../../lib/v3-calculation/route-leg-pricing.ts';
import {tollsForApi} from '../../../lib/v2-calculation/free-route-selection.ts';
import {matrixZsdCashCardComponent} from '../../../lib/v3-calculation/zsd-cash-card-component.ts';
import {requestKey, replayingFetch} from './systemic-audit-io.mjs';

const [mode, directory] = process.argv.slice(2);
assert.ok(['--live-one', '--replay-one'].includes(mode) && directory,
  'Usage: --live-one <new-directory> | --replay-one <saved-directory>');
const source = 'experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m11-zsd-prim-to-moscow/2026-10-16T00-06-25-425Z-capture.json.gz';
const sourceSha256 = '24a24fda86b252ba77c3765a24b8ee58f05c742b84af6ed7445540368fd0eb61';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const save = (name, data, compressed = false) => {
  const target = path.join(directory, name);
  const bytes = JSON.stringify(data, null, compressed ? 0 : 2) + '\n';
  fs.writeFileSync(`${target}.tmp`, compressed ? gzipSync(bytes, {mtime: 0}) : bytes);
  fs.renameSync(`${target}.tmp`, target);
};
const originalFetch = globalThis.fetch;
const bytes = fs.readFileSync(source);
assert.equal(sha(bytes), sourceSha256);
const saved = JSON.parse(gunzipSync(bytes));
const {record: old} = saved;
const controls = old.routePlan[0].positions;
const providerReplay = replayingFetch(saved.calls.filter(c => !c.url.includes('trace_attributes')));
globalThis.fetch = providerReplay.fetch;
const selected = await osrmRoute(old.spec.from, old.spec.to, controls);
const brouter = await brouterFast(old.spec.from, old.spec.to, controls);
assert.deepEqual(providerReplay.misses, []);
const candidates = [
  {provider: 'Valhalla', route: old.route},
  {provider: 'OSRM', route: selected},
  {provider: 'BRouter', route: brouter},
].map(c => ({...c, admitted: isUsableRoute(c.route, old.spec.from, old.spec.to)}));
const fastest = candidates.filter(c => c.admitted).sort((a, b) => a.route.seconds - b.route.seconds)[0];
assert.equal(fastest.provider, 'OSRM');
assert.equal(selected.meters, 715622);
assert.equal(selected.seconds, 30963);
const routeSha256 = sha(JSON.stringify(selected));
const geometrySha256 = sha(JSON.stringify(selected.coordinates));
const candidateSummary = candidates.map(c => ({provider: c.provider, admitted: c.admitted,
  meters: c.route.meters, seconds: c.route.seconds, dimensions: [...new Set(c.route.coordinates.map(p => p.length))]}));
let replay;
let calls = [];
let terminalBlock = null;
let attemptedNetworkRequests = 0;
const deadline = Date.now() + 120000;
if (mode === '--live-one') {
  assert.ok(!fs.existsSync(path.join(directory, 'STARTED.json')), 'Historical output exists; supply a new directory');
  fs.mkdirSync(path.join(directory, 'requests'), {recursive: true});
  save('selected-route.json.gz', selected, true);
  save('STARTED.json', {at: new Date().toISOString(), source, sourceSha256, routeSha256, geometrySha256,
    caseId: old.spec.id, provider: 'OSRM', candidates: candidateSummary, newRoutingRequests: 0,
    maxNetworkRequests: 12, totalBudgetMs: 120000, durableStartedCommit: 'dbb5a1ef669e3ce5179d35b59f22378602b766c8'});
  globalThis.fetch = async (url, init) => {
    const u = new URL(String(url));
    assert.equal(u.origin + u.pathname, 'https://valhalla1.openstreetmap.de/trace_attributes');
    assert.equal(init?.method, 'POST');
    const item = {key: requestKey(url, init), url: String(url), method: init.method, body: init.body,
      startedAt: new Date().toISOString(), networkAttempted: false};
    const index = calls.push(item) - 1;
    const started = Date.now();
    const progress = () => save('progress.json', {at: new Date().toISOString(), phase: 'selected_geometry_trace_or_pricing',
      calls: calls.length, completed: calls.filter(c => c.elapsedMs !== undefined).length,
      attemptedNetworkRequests, terminalBlock, routeSha256, geometrySha256});
    progress();
    try {
      if (terminalBlock) throw Error(`CIRCUIT_OPEN:${terminalBlock}`);
      if (attemptedNetworkRequests >= 12 || Date.now() >= deadline) throw Error('BOUNDED_TRACE_BUDGET_EXHAUSTED');
      item.networkAttempted = true;
      attemptedNetworkRequests++;
      const signal = AbortSignal.any([init.signal, AbortSignal.timeout(Math.max(1, deadline - Date.now()))].filter(Boolean));
      const response = await originalFetch(url, {...init, signal});
      Object.assign(item, {status: response.status, text: await response.clone().text(),
        contentType: response.headers.get('content-type'), retryAfter: response.headers.get('retry-after')});
      if ([401, 403, 451].includes(response.status)) terminalBlock = `HTTP_${response.status}`;
      return response;
    } catch (error) {
      item.error = String(error);
      if (item.networkAttempted) terminalBlock = item.error;
      throw error;
    } finally {
      item.elapsedMs = Date.now() - started;
      save(`requests/${String(index + 1).padStart(3, '0')}.json.gz`, item, true);
      progress();
    }
  };
} else {
  const capture = JSON.parse(gunzipSync(fs.readFileSync(path.join(directory, 'capture.json.gz'))));
  assert.equal(capture.sourceSha256, sourceSha256);
  assert.equal(capture.routeSha256, routeSha256);
  assert.equal(capture.geometrySha256, geometrySha256);
  calls = capture.calls;
  attemptedNetworkRequests = calls.filter(c => c.networkAttempted).length;
  replay = replayingFetch(calls);
  globalThis.fetch = replay.fetch;
}
try {
  const validation = await validateTollEdges(selected.coordinates);
  const result = await calculateLegTolls({routeGeometry: selected.coordinates, routeSeconds: selected.seconds,
    departureAt: saved.departureAt, selectedFastProvider: 'OSRM', selectedFastRoute: selected,
    valhallaEvidence: null, confirmedFreeRoute: null, diagnosticFastValidation: validation});
  const zsd = matrixZsdCashCardComponent(selected.coordinates, validation, saved.departureAt, selected.seconds);
  const output = {caseId: old.spec.id, departureAt: saved.departureAt, source, sourceSha256,
    routeSha256, geometrySha256, selectedProvider: 'OSRM', candidates: candidateSummary,
    routeMeters: selected.meters, routeSeconds: selected.seconds, coordinateCount: selected.coordinates.length,
    trace: {complete: validation.complete, status: validation.status, boothEventCoverage: validation.boothEventCoverage,
      chunks: validation.chunkCount, checked: validation.checkedChunkCount, failed: validation.failedChunkCount,
      boothCount: validation.tollBoothCount},
    zsdComponent: zsd, apiTolls: tollsForApi(result.tolls, result.fastValidation),
    priceConfirmation: result.tolls.priceConfirmation, componentAudit: result.componentAudit,
    counts: {checkedCases: 1, newRoutingRequests: 0, selectedGeometryTraceRuns: 1,
      attemptedNetworkRequests, pricedComponents: result.componentAudit.components.filter(c => c.detected && c.tolls).length,
      pricedZsdComponents: zsd.tolls ? 1 : 0,
      confirmedFullTripFares: result.tolls.priceConfirmation === 'confirmed' ? 1 : 0},
    scope: 'One recorded changed OSRM route. No borrowed Valhalla metadata/trace; no other sibling replays.'};
  if (mode === '--live-one') {
    save('capture.json.gz', {source, sourceSha256, routeSha256, geometrySha256,
      record: {spec: old.spec, routePlan: old.routePlan, provider: 'OSRM', route: selected, validation},
      calls, result}, true);
    save('result.json', output);
    save('progress.json', {phase: 'DONE', at: new Date().toISOString(), counts: output.counts,
      completedCalls: calls.length, terminalBlock, resultSha256: sha(fs.readFileSync(path.join(directory, 'result.json')))});
  } else {
    assert.deepEqual(replay.misses, []);
    assert.deepEqual(output, JSON.parse(fs.readFileSync(path.join(directory, 'result.json'))));
  }
  console.log(JSON.stringify({mode, liveRequestsThisExecution: mode === '--live-one' ? attemptedNetworkRequests : 0, ...output.counts, trace: output.trace, zsdReason: zsd.reason,
    missing: result.componentAudit.missing, offlineReplayMisses: replay?.misses.length}));
} catch (error) {
  if (mode === '--live-one') save('FAILED.json.gz', {at: new Date().toISOString(), error: String(error), calls}, true);
  throw error;
} finally {
  globalThis.fetch = originalFetch;
}
