import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {assessTariffProducts, verifyProductSource, verifyProductTableEvidence} from '../experiments/tariff-gate-proposal/product-gate.mjs';
import {evaluateTariffFreshness} from './check-tariff-freshness.mjs';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const registry = fs.readFileSync('lib/toll-engine/tariff-registry.ts', 'utf8');
const report = evaluateTariffFreshness(registry, '2026-11-07');
const evidence = readJson('experiments/tariff-gate-proposal/stage-ah-product-evidence-2026-11-07.json');
const m1 = id => evidence.products.find(row => row.id === id);
const clone = value => structuredClone(value);

test('product evidence records exact source and matrix hashes where bytes are retained', () => {
  assert.equal(evidence.schemaVersion, 1);
  assert.equal(evidence.products.length, 14);
  for (const row of evidence.products) {
    if (row.source?.path) {
      const bytes = fs.readFileSync(row.source.path);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), row.source.sha256, row.id);
    }
    if (row.source?.sourceKind === 'official_page_rendered_excerpt') {
      const bytes = fs.readFileSync(row.source.capturePath);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), row.source.captureSha256, row.id);
      assert.equal(row.source.originalPageSha256, null);
      assert.equal(verifyProductSource(row.source), true, row.id);
    }
    if (row.fareTable?.path) assert.equal(verifyProductTableEvidence(row.fareTable), true, row.id);
  }
  assert.equal(evidence.m1OwnerVisualReading.status, 'OWNER_REPORTED_VISUAL_READ_ORIGINAL_PDF_BYTES_UNAVAILABLE');
  assert.equal(evidence.m1OwnerVisualReading.sha256, null);
});

test('official release closes M-1 Cat-I base fare; all listed products pass independently', () => {
  const result = assessTariffProducts(report, evidence);
  assert.equal(result.status, 'PASS_WITH_WARNINGS');
  assert.equal(result.exitCode, 0);
  assert(result.products.filter(row => row.id.startsWith('m1-')).every(row => row.status === 'PASS'));
  for (const prefix of ['m1-', 'm3-', 'ckad-', 'a289-', 'm11-', 'm12-']) {
    assert(result.products.filter(row => row.id.startsWith(prefix)).every(row => row.status === 'PASS'), prefix);
  }
  assert(result.registryAssessments.find(row => row.id.endsWith('category1-transponder')).status === 'PASS');
  assert(result.registryAssessments.find(row => row.id.endsWith('category1-no-transponder')).status === 'PASS');
  assert(result.registryAssessments.find(row => row.id.startsWith('m11-')).status === 'PASS');
  assert(result.registryAssessments.find(row => row.id.startsWith('m12-')).status === 'PASS');
  assert(result.warnings.some(row => row.code === 'observation_recheck_due'));
  assert(!result.errors.some(row => row.code === 'observation_recheck_due'));
  assert.equal(evidence.m1OfficialNewsEvidence.status, 'OFFICIAL_PRIMARY_PAGE_CONFIRMS_CATEGORY_I_BASE_FARE');
  const capture = readJson(evidence.m1OfficialNewsEvidence.extractPath);
  assert.equal(capture.tariffRows[0].baseTariffRub, 230);
  assert.equal(capture.tariffRows[0].maxTpassLoyaltyDiscountTariffRub, 195.5);
  assert.equal(capture.source.originalPageSha256, null);
});

test('a stale observation is a warning, not a blocker, when product evidence is otherwise complete', () => {
  const complete = clone(evidence);
  for (const row of complete.products) {
    if (!row.id.startsWith('m1-')) continue;
    row.source = {officialDocumentReviewed:true, url:evidence.m1OwnerVisualReading.officialUrl, testSource:true};
    row.fareKnown = true;
    row.coverageComplete = true;
    row.paymentBinding = {status:'verified', basis:'Synthetic evaluator control only; not retained-source evidence.'};
    row.contradiction = 'none';
    row.doubleChargeRisk = false;
  }
  const result = assessTariffProducts(report, complete, source => source?.testSource === true || Boolean(source?.path));
  assert.equal(result.status, 'PASS_WITH_WARNINGS');
  assert.equal(result.exitCode, 0);
  assert(result.warnings.some(row => row.code === 'observation_recheck_due'));
  assert.equal(result.errors.length, 0);
});

test('invalid/future effective date, missing official source, unresolved fare conflict and double-charge risk block the affected product', () => {
  const base = m1('m1-33-66|order54|I|noTransponder');
  const evaluate = changes => {
    const fixture = {schemaVersion:1, products:[{...clone(base), ...changes}]};
    const syntheticReport = {asOf:'2026-11-07', rows:[{id:base.registryId, status:'FRESH', effectiveDateStatus:'KNOWN'}]};
    return assessTariffProducts(syntheticReport, fixture, source => source?.testSource === true);
  };
  for (const [changes, expected] of [
    [{effectiveFrom:'not-a-date'}, 'effective_date_unproven_or_invalid'],
    [{effectiveFrom:'2026-12-01'}, 'tariff_not_yet_effective'],
    [{source:null}, 'official_source_missing_or_unverified'],
    [{contradiction:'material'}, 'material_or_unresolved_contradiction'],
    [{doubleChargeRisk:true}, 'double_charge_risk_unresolved'],
    [{fareKnown:false}, 'official_fare_unproven'],
  ]) {
    const result = evaluate(changes);
    assert.equal(result.status, 'BLOCKED');
    assert(result.errors.some(row => row.code === expected), expected);
  }
});

test('malformed null product evidence is reported rather than crashing the assessor', () => {
  const result = assessTariffProducts({asOf:'2026-11-07', rows:[]}, {schemaVersion:1, products:[null]});
  assert.equal(result.status, 'BLOCKED');
  assert(result.errors.some(row => row.code === 'malformed_product_record'));
});
