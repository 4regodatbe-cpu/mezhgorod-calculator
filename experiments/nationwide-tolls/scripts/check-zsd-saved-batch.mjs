// Reproduce: node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/scripts/check-zsd-saved-batch.mjs
// Saved capture component checks only. No provider calls, route replay, or whole-trip totals.
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {matrixZsdCashCardComponent} from '../../../lib/v3-calculation/zsd-cash-card-component.ts';

const directory = 'experiments/nationwide-tolls/checks/2026-10-17-zsd-batch74';
const sourceHead = '3ae7761fc0cebccc72777f487c5af8ca0b926665';
const startedCommit = '7f6e6b8a4488bc3ee0aa4ce760b727b03b57f28b';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const inputsRaw = readFileSync(`${directory}/inputs.json`);
const targets = JSON.parse(inputsRaw);
if (targets.length !== 74 || new Set(targets.map(t => t.caseId)).size !== 74) throw Error('Expected 74 unique inputs');
const scriptSha256 = sha256(readFileSync(new URL(import.meta.url)));
const dates = ['2026-10-15T09:00:00+03:00', '2026-10-17T09:00:00+03:00'];
const namedZsd = names => (names ?? []).some(n => /(?:^|[^а-яa-z0-9])зсд(?=$|[^а-яa-z0-9])|западный скоростной диаметр/iu.test(n));
const sourceFiles = [
  'lib/v3-calculation/zsd-cash-card-component.ts',
  'lib/v3-calculation/zsd-zone1-component.ts',
  'experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-kad-ekateringofka/readiness.json',
  'experiments/nationwide-tolls/source-snapshots/zsd/2026-10-15-zone1/zone1-readiness.json',
];
const sourceHashes = Object.fromEntries(sourceFiles.map(p => [p, sha256(readFileSync(p))]));
const runIdentity = sha256(JSON.stringify({sourceHashes, scriptSha256, inputsSha256: sha256(inputsRaw), dates}));
mkdirSync(`${directory}/cases`, {recursive: true});
const results = [];
for (const target of targets) {
  const output = `${directory}/cases/${target.caseId}.json`;
  if (existsSync(output)) {
    const previous = JSON.parse(readFileSync(output));
    if (previous.runIdentity === runIdentity && previous.expectedCaptureSha256 === target.sha256) {
      results.push(previous);
      continue;
    }
    throw Error(`Existing output belongs to another code/input version: ${output}`);
  }
  const result = {caseId: target.caseId, sourceHead, startedCommit, runIdentity,
    mode: 'saved_capture_current_component_exception_check',
    capture: target.capture, expectedCaptureSha256: target.sha256,
    previousEvidence: target.evidence, previousStatus: target.previousStatus,
    newLiveRouteRequests: 0, newFullRouteReplays: 0, wholeTripResult: 'not_replayed',
    tariffConfirmation: 'not_independently_confirmed', atUtc: new Date().toISOString()};
  try {
    const raw = readFileSync(target.capture);
    result.actualCaptureSha256 = sha256(raw);
    if (result.actualCaptureSha256 !== target.sha256) throw Error('capture_sha256_mismatch');
    const record = JSON.parse(gunzipSync(raw)).record;
    const route = record?.route;
    const validation = record?.validation;
    if (!Array.isArray(route?.coordinates) || !route.coordinates.length || !validation) throw Error('capture_route_or_validation_missing');
    result.provider = record.provider ?? route.provider ?? null;
    result.routeMeters = route.meters;
    result.coordinateCount = route.coordinates.length;
    result.traceComplete = validation.complete === true;
    result.boothEventCoverage = validation.boothEventCoverage ?? null;
    result.zsdWayIds = [...new Set((validation.paidRoadEdges ?? []).filter(e => namedZsd(e.roadNames)).map(e => e.wayId))].sort();
    result.zsdBooths = (validation.tollBooths ?? []).filter(b => namedZsd(b.roadNames) || b.osmNodeId === '1766158781')
      .map(b => ({osmNodeId: b.osmNodeId, wayId: b.wayId, edgeToll: b.edgeToll}));
    result.physicalScopeFingerprint = sha256(JSON.stringify({ways: result.zsdWayIds, booths: result.zsdBooths}));
    result.profiles = dates.map(departureAt => {
      const quote = matrixZsdCashCardComponent(route.coordinates, validation, departureAt, route.seconds);
      return {departureAt, amount: quote.tolls?.amount ?? null, reason: quote.reason,
        componentResult: quote.tolls ? 'priced' : 'unknown', segments: quote.tolls?.segments ?? []};
    });
    result.checked = true;
    result.outcome = result.profiles.every(p => p.amount !== null) ? 'fixed_and_verified_component_only' : 'blocked_by_missing_reliable_scope_or_data';
  } catch (error) {
    result.checked = false;
    result.outcome = 'blocked_by_capture_or_execution_error';
    result.error = error.message;
  }
  writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  results.push(result);
  writeFileSync(`${directory}/progress.json`, JSON.stringify({runIdentity, atUtc: new Date().toISOString(), processed: results.length,
    total: targets.length, actualCasesChecked: results.filter(r => r.checked).length, lastCase: target.caseId}, null, 2) + '\n');
  console.log(JSON.stringify({processed: results.length, total: targets.length, caseId: target.caseId,
    checked: result.checked, reasons: result.profiles?.map(p => p.reason) ?? [result.error]}));
}
const priced = results.filter(r => r.checked && r.profiles.every(p => p.amount !== null));
const reasonGroups = {};
const physicalScopeGroups = {};
for (const r of results) {
  const reason = r.profiles?.map(p => p.reason).join('|') ?? r.error;
  (reasonGroups[reason] ??= []).push(r.caseId);
  if (r.physicalScopeFingerprint) (physicalScopeGroups[r.physicalScopeFingerprint] ??= []).push(r.caseId);
}
const summary = {atUtc: new Date().toISOString(), sourceHead, startedCommit, runIdentity, scriptSha256,
  inputsSha256: sha256(inputsRaw), sourceHashes, total: targets.length, processed: results.length,
  actualCasesChecked: results.filter(r => r.checked).length,
  componentDateChecks: results.filter(r => r.checked).length * dates.length,
  pricedComponentCases: priced.length, unknownComponentCases: results.filter(r => r.checked).length - priced.length,
  executionErrors: results.filter(r => !r.checked).length,
  newLiveRouteRequests: 0, newFullRouteReplays: 0, pricedCases: priced.map(r => r.caseId), reasonGroups, physicalScopeGroups,
  limits: ['component-only; no new whole-trip totals', 'source-derived vector is not an independent operator OD receipt',
    'unknown is not zero', 'previous results and captures are unchanged', 'scope fingerprint groups geometry evidence; it does not authorize a fare'],
  caseResults: results.map(r => ({caseId: r.caseId, path: `${directory}/cases/${r.caseId}.json`, sha256: sha256(readFileSync(`${directory}/cases/${r.caseId}.json`))}))};
writeFileSync(`${directory}/summary.json`, JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({complete: true, actualCasesChecked: summary.actualCasesChecked, pricedComponentCases: priced.length,
  unknownComponentCases: summary.unknownComponentCases, executionErrors: summary.executionErrors, physicalScopes: Object.keys(physicalScopeGroups).length}));
if (summary.executionErrors) process.exitCode = 1;
