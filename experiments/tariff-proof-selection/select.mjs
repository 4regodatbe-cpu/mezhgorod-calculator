// Experimental only. No imports from or integration into application pricing.
export function selectProof(obligations, witnesses) {
  const unknown = (reason) => ({ pricingStatus: 'unknown', amount: null, reason });
  if (!Array.isArray(obligations) || !obligations.length || obligations.some(id=>typeof id!=='string'||!id) || new Set(obligations).size !== obligations.length || !Array.isArray(witnesses))
    return unknown('invalid-obligations');
  const usable = witnesses.filter(w => w && w.reviewed === true && typeof w.source === 'string' && w.source &&
    w.contextVerified === true && Number.isSafeInteger(w.amount) && w.amount >= 0 &&
    Array.isArray(w.covers) && w.covers.length && new Set(w.covers).size === w.covers.length &&
    w.covers.every(id => obligations.includes(id)) &&
    (w.method === 'operator-pair' || (w.method === 'additive-chain' && w.additivityReviewed === true)));
  const complete = usable.filter(w => w.covers.length === obligations.length);
  if (!complete.length) return unknown('no-complete-reviewed-proof');
  if (new Set(complete.map(w => w.amount)).size !== 1) return unknown('conflicting-complete-proofs');
  return { pricingStatus: 'priced', amount: complete[0].amount,
    proofIds: complete.map(w => w.id), experimental: true };
}
