import assert from "node:assert/strict";

const DAY_MS = 86400000;
const day = (s) => Date.parse(`${s.slice(0,10)}T00:00:00Z`);
const fresh = (m, asOf) => {
  const age = Math.floor((day(asOf)-day(m.observedAt))/DAY_MS);
  return age < 0 ? "future_observation" : age > m.staleAfterDays ? "stale" : "fresh";
};
const select = (items, asOf) => {
  const t = day(asOf);
  const eligible = items.filter(x => day(x.effectiveFrom) <= t && (!x.effectiveTo || t <= day(x.effectiveTo)))
    .sort((a,b)=>day(b.effectiveFrom)-day(a.effectiveFrom));
  if (!eligible.length) return "none";
  const latest = eligible.filter(x=>x.effectiveFrom===eligible[0].effectiveFrom);
  return latest.length === 1 ? latest[0].id : "ambiguous";
};

const historical = {id:"m12-old", observedAt:"2026-03-02", effectiveFrom:"2026-03-02", effectiveTo:"2026-09-30", staleAfterDays:45};
const current = {id:"m12-current", observedAt:"2026-10-01", effectiveFrom:"2026-10-01", staleAfterDays:45};
assert.equal(select([historical,current], "2026-09-15"), "m12-old");
assert.equal(select([historical,current], "2026-10-01"), "m12-current");
assert.equal(select([current], "2026-09-30"), "none");
assert.equal(fresh(current, "2026-10-01"), "fresh");
assert.equal(fresh(current, "2026-12-01"), "stale");
assert.equal(fresh(current, "2026-09-30"), "future_observation");
assert.equal(select([{...current,id:"a"},{...current,id:"b"}], "2026-10-01"), "ambiguous");
console.log("Segment 7 versioning fixtures: GREEN");
