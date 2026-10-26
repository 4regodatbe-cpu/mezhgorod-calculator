import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateTariffFreshness, freshnessExitCode, resolveTariffAsOf } from './check-tariff-freshness.mjs';

const registryText = fs.readFileSync(new URL('../lib/toll-engine/tariff-registry.ts', import.meta.url), 'utf8');

test('freshness defaults to the actual run date and supports a deterministic clock seam', () => {
  assert.equal(resolveTariffAsOf(null, new Date('2026-10-26T23:59:00Z')), '2026-10-26');
  assert.equal(resolveTariffAsOf('2026-10-02', new Date('2030-01-01T00:00:00Z')), '2026-10-02');
  assert.throws(() => resolveTariffAsOf('2026-02-30', new Date('2026-10-26T00:00:00Z')), /Invalid TARIFF_AS_OF/);
});

test('unknown effective dates remain UNKNOWN and are not synthesized from observedAt', () => {
  const report = evaluateTariffFreshness(registryText, '2026-10-26');
  const unknownRows = report.rows.filter((row) => row.effectiveFrom === null);

  assert.equal(unknownRows.length, 3);
  assert.ok(unknownRows.every((row) => row.effectiveDateStatus === 'UNKNOWN'));
  assert.ok(report.rows.filter((row) => row.effectiveFrom !== null).every((row) => row.effectiveDateStatus === 'KNOWN'));
  assert.equal(report.effectiveDateUnknown, 3);
});

test('strict freshness still fails stale or malformed snapshots', () => {
  const stale = evaluateTariffFreshness(registryText, '2026-11-20');
  const invalidObservation = evaluateTariffFreshness(registryText.replace('observedAt: "2026-10-02"', 'observedAt: "2026-02-30"'), '2026-10-26');
  const invalidEffectiveDate = evaluateTariffFreshness(registryText.replace('effectiveFrom: "2026-03-02"', 'effectiveFrom: "2026-02-30"'), '2026-10-26');

  assert.equal(stale.stale, 4);
  assert.equal(freshnessExitCode(stale, true), 2);
  assert.equal(invalidObservation.invalid, 1);
  assert.equal(freshnessExitCode(invalidObservation, true), 2);
  assert.equal(invalidEffectiveDate.invalid, 1);
  assert.equal(invalidEffectiveDate.rows[0].effectiveDateStatus, 'INVALID');
  assert.equal(freshnessExitCode(invalidEffectiveDate, true), 2);
  assert.equal(freshnessExitCode(stale, false), 0);
});
