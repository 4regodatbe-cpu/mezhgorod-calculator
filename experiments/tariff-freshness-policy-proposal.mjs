// Isolated proposal only. Not imported by CI or tariff runtime.
export function proposedTariffReleaseAssessment({ observationStale, sourceIntegrity, matchingProduct, applicablePeriod, conflictingEdition }) {
  const blockers = [];
  if (sourceIntegrity !== true) blockers.push('source_integrity_unproven');
  if (matchingProduct !== true) blockers.push('product_unproven');
  if (applicablePeriod !== true) blockers.push('period_unproven');
  if (conflictingEdition !== false) blockers.push('edition_conflict_unresolved');
  return { release: blockers.length ? 'BLOCKED' : 'ELIGIBLE_WITH_SOURCE_LIMITATIONS', blockers,
    warnings: observationStale ? ['observation_recheck_due'] : [] };
}
