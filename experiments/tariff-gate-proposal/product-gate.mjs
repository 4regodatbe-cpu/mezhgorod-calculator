import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {verifySavedOfficialSource} from './gate.mjs';

function day(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) return null;
  const key = value.slice(0, 10), ms = Date.parse(`${key}T00:00:00Z`);
  if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 10) !== key) return null;
  if (value.length > 10 && !Number.isFinite(Date.parse(value))) return null;
  return key;
}

export function verifyProductTableEvidence(table) {
  try {
    if (!table || typeof table.path !== 'string' || path.isAbsolute(table.path) || !/^[a-f0-9]{64}$/.test(table.sha256 ?? '')) return false;
    const root = fs.realpathSync(process.cwd()), file = fs.realpathSync(path.resolve(root, table.path));
    if (!file.startsWith(root + path.sep) || fs.statSync(file).size > 32 * 1024 * 1024) return false;
    return createHash('sha256').update(fs.readFileSync(file)).digest('hex') === table.sha256;
  } catch { return false; }
}

export function verifyProductSource(source) {
  if (source?.sourceKind !== 'official_page_rendered_excerpt') return verifySavedOfficialSource(source);
  if (source.url !== 'https://russianhighways.ru/press/news/141463/' || source.originalPageSha256 !== null || source.originalPageBytesAvailable !== false) return false;
  const capture = {officialDocumentReviewed:true, url:source.url, path:source.capturePath, sha256:source.captureSha256};
  if (!verifySavedOfficialSource(capture)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), source.capturePath), 'utf8'));
    return data.artifactType === 'official_page_rendered_text_extract' &&
      data.source?.url === source.url && data.source?.originalPageSha256 === null &&
      data.tariffRows?.some(row => row.road === 'M-1 Belarus' && row.section === 'km 33–66' && row.pvpKm === 46 && row.vehicleClassAsPrinted === 'passenger cars' && row.baseTariffRub === 230 && row.maxTpassLoyaltyDiscountTariffRub === 195.5 && row.effectiveFrom === '2026-03-02');
  } catch { return false; }
}

function hasFareEvidence(row) {
  if (Number.isFinite(row.fareRub) && row.fareRub >= 0) return true;
  if (row.fareByPeriod && Object.values(row.fareByPeriod).length && Object.values(row.fareByPeriod).every(value => Number.isFinite(value) && value >= 0)) return true;
  if (row.fareTable && verifyProductTableEvidence(row.fareTable) && Number.isInteger(row.fareTable.cellCount) && row.fareTable.cellCount > 0) return true;
  return false;
}

/** Experimental product-level gate. A bad M-1 record blocks that product and
 * its registry payment view, not unrelated M-3/CKAD/A-289 products. */
export function assessTariffProducts(report, evidence, verifySource = verifyProductSource) {
  const errors = [], warnings = [], products = [], registryIds = new Set((report?.rows ?? []).map(row => row.id));
  const error = (id, code) => errors.push({id, code});
  if (!Array.isArray(report?.rows) || report.rows.length === 0) error(null, 'registry_empty');
  if (evidence?.schemaVersion !== 1 || !Array.isArray(evidence.products)) error(null, 'product_evidence_missing_or_invalid');
  const rows = Array.isArray(evidence?.products) ? evidence.products : [];
  const reviewedEditions = new Map((Array.isArray(evidence?.reviewedEditions) ? evidence.reviewedEditions : []).map(item => [item.edition, item]));
  const productKeys = new Set(), seenRegistry = new Set();
  for (const row of report?.rows ?? []) {
    if (row.status === 'STALE') warnings.push({id:row.id, code:'observation_recheck_due'});
    if (!['FRESH','STALE'].includes(row.status)) error(row.id, 'observation_invalid_or_future');
    if (row.effectiveDateStatus === 'INVALID') error(row.id, 'invalid_effective_date');
    if (row.effectiveDateStatus === 'UNKNOWN') warnings.push({id:row.id, code:'effective_date_not_established'});
    if (row.effectiveFrom && row.effectiveFrom > report.asOf) error(row.id, 'tariff_not_yet_effective');
  }
  for (const row of rows) {
    const productErrors = [];
    const fail = code => { productErrors.push(code); error(row?.id ?? null, code); };
    if (!row || typeof row !== 'object') { error(null, 'malformed_product_record'); continue; }
    const key = [row.id,row.edition,row.category,row.paymentMode].join('|');
    if (!row.id || !row.edition || !row.category || !row.paymentMode || productKeys.has(key)) fail('product_identity_missing_or_duplicate');
    productKeys.add(key);
    const identityParts = typeof row.id === 'string' ? row.id.split('|') : [];
    if (identityParts.length !== 4 || identityParts[2] !== row.category || identityParts[3] !== row.paymentMode) fail('product_identity_source_mismatch');
    if (!registryIds.has(row.registryId)) fail('product_registry_binding_unknown');
    else seenRegistry.add(row.registryId);
    const observed = day(row.observedAt);
    if (observed == null || observed > report.asOf) fail('observation_invalid_or_future');
    else if (Number.isInteger(row.staleAfterDays) && Date.parse(`${report.asOf}T00:00:00Z`) - Date.parse(`${observed}T00:00:00Z`) > row.staleAfterDays * 86_400_000) warnings.push({id:row.id, code:'observation_recheck_due'});
    const effective = day(row.effectiveFrom);
    if (effective == null) fail('effective_date_unproven_or_invalid');
    else if (effective > report.asOf) fail('tariff_not_yet_effective');
    if (!verifySource(row.source)) fail('official_source_missing_or_unverified');
    const reviewedEdition = reviewedEditions.get(row.edition);
    if (!reviewedEdition) fail('reviewed_edition_binding_missing');
    else {
      const sourceHash = row.source?.sha256 ?? row.source?.captureSha256;
      if (!Array.isArray(reviewedEdition.categories) || !reviewedEdition.categories.includes(row.category)) fail('vehicle_category_source_mismatch');
      if (day(reviewedEdition.effectiveFrom) == null || day(row.effectiveFrom) !== day(reviewedEdition.effectiveFrom)) fail('effective_date_source_mismatch');
      if (!Array.isArray(reviewedEdition.sourceSha256s) || !reviewedEdition.sourceSha256s.includes(sourceHash)) fail('reviewed_edition_source_mismatch');
      if (row.source?.sourceKind === 'official_page_rendered_excerpt' && Number.isFinite(reviewedEdition.categoryIFareRub) && row.category === 'I' && row.fareRub !== reviewedEdition.categoryIFareRub) fail('official_fare_source_mismatch');
    }
    if (row.source?.sourceKind === 'official_page_rendered_excerpt' && row.source.originalPageBytesAvailable === false) warnings.push({id:row.id, code:'original_source_bytes_unavailable'});
    if (row.fareKnown !== true || !hasFareEvidence(row)) fail('official_fare_unproven');
    if (row.coverageComplete !== true) fail('product_coverage_incomplete');
    if (!['verified','accepted_working_calculation'].includes(row.paymentBinding?.status) || !row.paymentBinding?.basis?.trim()) fail('payment_mode_unproven');
    if (row.paymentBinding?.status === 'accepted_working_calculation' || row.productBinding?.status === 'accepted_working_calculation') warnings.push({id:row.id, code:'owner_attested_working_mapping'});
    if (row.contradiction !== 'none') fail('material_or_unresolved_contradiction');
    if (!['verified','accepted_working_calculation'].includes(row.productBinding?.status) || !row.productBinding?.basis?.trim()) fail('product_binding_unproven');
    if (row.doubleChargeRisk !== false) fail('double_charge_risk_unresolved');
    products.push({id:row.id, registryId:row.registryId, status:productErrors.length ? 'BLOCKED' : 'PASS', errors:productErrors});
  }
  for (const id of registryIds) if (!seenRegistry.has(id)) error(id, 'product_evidence_missing');
  const registryAssessments = [...registryIds].map(id => {
    const linked = products.filter(row => row.registryId === id);
    return {id, productCount:linked.length, status:linked.length && linked.every(row => row.status === 'PASS') ? 'PASS' : 'BLOCKED'};
  });
  return {status:errors.length ? 'BLOCKED' : 'PASS_WITH_WARNINGS', exitCode:errors.length ? 2 : 0, errors, warnings, products, registryAssessments};
}
