// Approval candidate only: not imported by the current mandatory gate or runtime.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

function evidenceDateDay(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4}-\d{2}-\d{2})(?:T(.+))?$/.exec(value);
  if (!match) return null;
  const day = match[1];
  const parsedDay = Date.parse(`${day}T00:00:00Z`);
  if (!Number.isFinite(parsedDay) || new Date(parsedDay).toISOString().slice(0, 10) !== day) return null;
  if (match[2] && !Number.isFinite(Date.parse(value))) return null;
  return day;
}

export function verifySavedOfficialSource(source) {
  try {
    if (!source || source.officialDocumentReviewed !== true || !/^https:\/\//.test(source.url ?? '') || !/^[a-f0-9]{64}$/.test(source.sha256 ?? '')) return false;
    if (typeof source.path !== 'string' || path.isAbsolute(source.path)) return false;
    const root = fs.realpathSync(process.cwd());
    const file = fs.realpathSync(path.resolve(root, source.path));
    if (!file.startsWith(root + path.sep) || fs.statSync(file).size > 32 * 1024 * 1024) return false;
    return createHash('sha256').update(fs.readFileSync(file)).digest('hex') === source.sha256;
  } catch { return false; }
}

export function assessTariffGate(report, evidence, verifySource = verifySavedOfficialSource) {
  const errors = [], warnings = [];
  const error = (id, code) => errors.push({id, code});
  if (!Array.isArray(report?.rows) || !report.rows.length) error(null, 'registry_empty');
  if (evidence?.schemaVersion !== 1 || !Array.isArray(evidence.rows)) error(null, 'evidence_missing_or_invalid');
  const rawRecords = Array.isArray(evidence?.rows) ? evidence.rows : [];
  const records = rawRecords.filter(entry => entry && typeof entry === 'object' && typeof entry.id === 'string');
  if (records.length !== rawRecords.length) error(null, 'malformed_evidence_row');
  const ids = new Set((report?.rows ?? []).map(row => row.id));
  for (const entry of records) if (!ids.has(entry.id)) error(entry.id, 'unexpected_evidence_row');
  for (const row of report?.rows ?? []) {
    const matches = records.filter(entry => entry.id === row.id);
    if (row.status === 'STALE') warnings.push({id:row.id, code:'observation_recheck_due'});
    if (!['FRESH','STALE'].includes(row.status)) error(row.id, 'observation_invalid_or_future');
    if (row.effectiveDateStatus === 'INVALID') error(row.id, 'invalid_effective_date');
    if (row.effectiveDateStatus === 'UNKNOWN') warnings.push({id:row.id,code:'effective_date_not_established'});
    if (row.effectiveFrom && row.effectiveFrom > report.asOf) error(row.id, 'tariff_not_yet_effective');
    if (matches.length !== 1) { error(row.id, 'evidence_missing_or_duplicate'); continue; }
    const entry = matches[0];
    if (!verifySource(entry.source)) error(row.id, 'official_source_missing_or_unverified');
    if (entry.fareKnown !== true || entry.versionBasis !== 'latest_available_official_document') error(row.id, 'official_fare_unproven');
    // Aggregated snapshots must account for every road/system in their declared scope.
    if (entry.coverageComplete !== true) error(row.id, 'official_source_coverage_incomplete');
    // Unknown legal effectiveFrom is not an automatic refusal of an accepted working model.
    const applicationStatus = entry.applicability?.status;
    const evidenceEffectiveFrom = entry.applicability?.effectiveFrom;
    if (!['verified','accepted_working_calculation'].includes(applicationStatus) || !entry.applicability?.basis?.trim()) error(row.id, 'application_date_unproven_or_wrong');
    if (evidenceEffectiveFrom != null) {
      const effectiveDay = evidenceDateDay(evidenceEffectiveFrom);
      if (effectiveDay == null) error(row.id, 'invalid_evidence_effective_date');
      else if (report.asOf && effectiveDay > report.asOf) error(row.id, 'tariff_not_yet_effective');
    } else if (applicationStatus === 'verified') {
      error(row.id, 'application_date_unproven_or_wrong');
    }
    if (entry.contradiction !== 'none') error(row.id, 'material_or_unresolved_contradiction');
    if (!['verified','accepted_working_calculation'].includes(entry.productBinding)) error(row.id, 'product_binding_unproven');
    if (entry.doubleChargeRisk !== false) error(row.id, 'double_charge_risk_unresolved');
  }
  return {status:errors.length ? 'BLOCKED' : 'PASS_WITH_SOURCE_LIMITATIONS', errors, warnings, exitCode:errors.length ? 2 : 0};
}
