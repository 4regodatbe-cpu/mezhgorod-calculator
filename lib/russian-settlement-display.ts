/** Screen only names already backed by a Russian-language source field.
 * This is a conservative orthography quarantine, not language detection or a
 * translation. Upstream language tags can themselves be wrong. */
export function selectRussianSettlementDisplay(candidates: readonly string[]): string | null {
  return candidates.find(name => /[А-Яа-яЁё]/u.test(name) &&
    !/\p{L}/u.test(name.replace(/[А-Яа-яЁё]/gu, '')) &&
    !/[сц]ьк/iu.test(name)) ?? null;
}
