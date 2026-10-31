import { createHash } from 'node:crypto';
export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const policies = new WeakSet();
const registries = new WeakSet();
const freeze = value => { if(value && typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);} return value; };
export function admitPolicy(value, bytes, review) {
  if(!review?.reviewer || !review.reviewRef || review.recordHash!==digest(JSON.stringify(value)) ||
      value.documentHash!==digest(bytes) || !value.source ||
      !Array.isArray(value.additiveDomains) || !Array.isArray(value.independentPairs))throw new Error('policy-admission-failed');
  const policy=freeze(structuredClone(value));
  policies.add(policy);
  return policy;
}
const date = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s;

// Admission is a separate trusted review boundary. Hashes establish integrity,
// never the legal truth of a tariff. Keep this registry outside caller input.
export function admitRegistry(records, documents, reviewedManifest) {
  const admitted = new Map();
  for (const r of records) {
    const review = reviewedManifest.find(m => m.id === r.id && m.recordHash === digest(JSON.stringify(r)));
    const bytes = documents[r.document];
    if (!review || !review.reviewer || !review.reviewRef || !bytes || digest(bytes) !== r.documentHash ||
        !r.operator || !r.url || !r.entry || !r.exit || !r.direction || !r.vehicle || !r.payment || !r.domain ||
        !date(r.validFrom) || !date(r.validTo) || r.validFrom > r.validTo ||
        !Number.isSafeInteger(r.amount) || r.amount < 0 || !r.covers?.length ||
        r.covers.some(x=>typeof x!=='string'||!x) || new Set(r.covers).size !== r.covers.length || admitted.has(r.id))
      throw new Error('registry-admission-failed');
    admitted.set(r.id, Object.freeze(structuredClone(r)));
  }
  const registry=Object.freeze({ get: id => admitted.has(id) ? structuredClone(admitted.get(id)) : null });
  registries.add(registry);
  return registry;
}

export function compose(obligations, ids, registry, context, policy) {
  const unknown = reason => ({ pricingStatus:'unknown', amount:null, reason });
  if(!policies.has(policy))return unknown('unadmitted-composition-policy');
  if(!registries.has(registry))return unknown('unadmitted-registry');
  if (!obligations.length || obligations.length>32 || new Set(obligations).size!==obligations.length || ids.length>20 || !date(context.date)) return unknown('invalid-or-unbounded-input');
  const quotes = [...new Set(ids)].map(id=>registry.get(id)).filter(r=>r &&
    context.date>=r.validFrom && context.date<=r.validTo &&
    r.vehicle===context.vehicle && r.payment===context.payment &&
    context.traversals.some(t=>t.domain===r.domain && t.operator===r.operator && t.entry===r.entry && t.exit===r.exit && t.direction===r.direction) &&
    r.covers.every(x=>obligations.includes(x)));
  let work=0, exhausted=false;
  const totals=new Set(), proofs=[];
  function walk(covered, chosen, amount) {
    if (++work>10000) { exhausted=true; return; }
    if (covered.size===obligations.length) { totals.add(amount); proofs.push(chosen.map(q=>q.id)); return; }
    const missing=obligations.find(x=>!covered.has(x));
    for(const q of quotes) {
      if(!q.covers.includes(missing)||q.covers.some(x=>covered.has(x)))continue;
      if(chosen.some(p=>p.domain===q.domain
        ? !policy.additiveDomains.includes(q.domain)
        : !policy.independentPairs.some(([a,b])=>(a===p.domain&&b===q.domain)||(b===p.domain&&a===q.domain))))continue;
      const next=amount+q.amount;
      if(!Number.isSafeInteger(next))continue;
      walk(new Set([...covered,...q.covers]),[...chosen,q],next);
    }
  }
  walk(new Set(),[],0);
  if(exhausted)return unknown('search-budget-exceeded');
  if(!totals.size)return unknown('no-complete-independent-cover');
  if(totals.size>1)return unknown('conflicting-complete-covers');
  return { pricingStatus:'priced', amount:[...totals][0], proofs, experimental:true };
}
