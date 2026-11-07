import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {assessTariffGate, verifySavedOfficialSource} from '../experiments/tariff-gate-proposal/gate.mjs';
import {evaluateTariffFreshness} from './check-tariff-freshness.mjs';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const sha256 = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

test('Stage AG records M1 owner claim without certifying unavailable Order 54 bytes', () => {
  const af = readJson('experiments/tariff-gate-proposal/avtodor-other-roads-evidence-2026-11-07.json');
  const ag = readJson('experiments/tariff-gate-proposal/stage-ag-evidence-2026-11-07.json');
  assert.deepEqual(ag.m1UserProvidedClaim.userReportedCategoryIToIVRub, [230, 250, 320, 500]);
  assert.equal(ag.m1UserProvidedClaim.userReportedEffectiveFrom, '2026-03-02T00:00:00+03:00');
  assert.equal(ag.m1UserProvidedClaim.status, 'NOT_INDEPENDENTLY_VERIFIED');
  assert.equal(ag.m1UserProvidedClaim.retrievalAttempt.httpStatus, 403);
  assert.match(ag.m1UserProvidedClaim.conflict, /category-I 250 RUB as no-transponder/);
  for (const row of af.rows) {
    assert.equal(row.observedAt, '2026-10-01');
    assert.equal(row.coverageComplete, false);
    assert.equal(row.roadCoverage.find((road) => road.road === 'm1-33-66').status, 'MISSING_PRIMARY_ARTIFACT');
  }
});

test('M11 source and current matrix metadata provide complete direct-pair coverage for Cat I', () => {
  const ag = readJson('experiments/tariff-gate-proposal/stage-ag-evidence-2026-11-07.json');
  const row = ag.rows.find((entry) => entry.id.startsWith('m11-'));
  const matrix = readJson('experiments/nationwide-tolls/source-snapshots/m11/2026-10-12-58-679-category1-a1-current.json');
  assert.equal(verifySavedOfficialSource(row.source), true);
  assert.equal(sha256(row.matrixEvidencePath), row.matrixSha256);
  assert.equal(matrix.vehicleCategory.id, 'I');
  assert.equal(matrix.tariffEffectiveFrom, '2026-09-04T00:00:00+03:00');
  assert.match(matrix.currentOrder274Matrix.paymentBasisAsPrinted, /наличными/);
  assert.equal(matrix.extraction.completeMatrix, true);
  for (const profile of ['monThu', 'friSun']) {
    const rows = matrix.currentOrder274Matrix.dayProfiles[profile].directRowsByOrigin;
    assert.equal(Object.keys(rows).length, 22);
    assert.equal(Object.values(rows).reduce((count, values) => count + values.filter((value) => value !== null).length, 0), 462);
  }
  assert.match(row.metadataCaveat, /older nested extractionStatus/);
});

test('M12 Order 302 evidence is scoped to its direct mainline matrix and not regional products', () => {
  const ag = readJson('experiments/tariff-gate-proposal/stage-ag-evidence-2026-11-07.json');
  const row = ag.rows.find((entry) => entry.id.startsWith('m12-'));
  const matrix = readJson('experiments/nationwide-tolls/source-snapshots/m12-order302-2026-10-08-category1-direct-pair-matrix.json');
  assert.equal(verifySavedOfficialSource(row.source), true);
  assert.equal(sha256(row.matrixEvidencePath), row.matrixSha256);
  assert.equal(matrix.vehicleCategory, 1);
  assert.equal(matrix.effectiveFrom, '2026-10-08T00:00:00+03:00');
  assert.equal(matrix.coverage.nodes, 20);
  assert.equal(matrix.coverage.directedNonSelfCells, 380);
  assert.match(row.productScope, /Regional toll products.*outside this registry row/);
});

test('combined proposed-gate evidence stays BLOCKED only where actual proof is incomplete', () => {
  const af = readJson('experiments/tariff-gate-proposal/avtodor-other-roads-evidence-2026-11-07.json');
  const ag = readJson('experiments/tariff-gate-proposal/stage-ag-evidence-2026-11-07.json');
  const evidence = {schemaVersion: 1, rows: [...af.rows, ...ag.rows]};
  const registryText = fs.readFileSync('lib/toll-engine/tariff-registry.ts', 'utf8');
  const report = evaluateTariffFreshness(registryText, '2026-11-07');
  const result = assessTariffGate(report, evidence);
  assert.equal(report.rows.length, 4);
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.warnings.filter((warning) => warning.code === 'observation_recheck_due').length, 2);
  assert.equal(result.warnings.filter((warning) => warning.code === 'effective_date_not_established').length, 3);
  assert(result.errors.some((error) => error.id === 'avtodor-other-roads-2026-10-01-category1-transponder' && error.code === 'official_source_missing_or_unverified'));
  assert(result.errors.some((error) => error.id === 'avtodor-other-roads-2026-10-01-category1-no-transponder' && error.code === 'official_source_coverage_incomplete'));
  assert(!result.errors.some((error) => error.id?.startsWith('m11-') || error.id?.startsWith('m12-')));
});

test('proposed gate rejects invalid/future evidence dates, missing source, tariff conflict and double charge', () => {
  const ag = readJson('experiments/tariff-gate-proposal/stage-ag-evidence-2026-11-07.json');
  const base = ag.rows.find((entry) => entry.id.startsWith('m12-'));
  const report = {asOf: '2026-11-07', rows: [{id: base.id, status: 'FRESH', effectiveFrom: '2026-03-02', effectiveDateStatus: 'KNOWN'}]};
  const assess = (changes) => assessTariffGate(report, {schemaVersion: 1, rows: [{...base, ...changes}]});
  assert(assess({applicability: {...base.applicability, effectiveFrom: 'not-a-date'}}).errors.some((error) => error.code === 'invalid_evidence_effective_date'));
  assert(assess({applicability: {...base.applicability, effectiveFrom: '2026-12-01T00:00:00+03:00'}}).errors.some((error) => error.code === 'tariff_not_yet_effective'));
  assert(assess({source: null}).errors.some((error) => error.code === 'official_source_missing_or_unverified'));
  assert(assess({contradiction: 'material'}).errors.some((error) => error.code === 'material_or_unresolved_contradiction'));
  assert(assess({doubleChargeRisk: true}).errors.some((error) => error.code === 'double_charge_risk_unresolved'));
});

