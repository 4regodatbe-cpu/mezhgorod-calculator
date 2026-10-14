const fs = require('node:fs');
const path = require('node:path');
const {validDate} = require('../engine/fare-validity.cjs');

// Diagnostics only: never promotes a candidate to a confirmed tariff.
function auditMatrix(matrix) {
  const groups = new Map(), coverage = new Map();
  for (const row of matrix.rows) {
    const stats = coverage.get(row.road) || {rows:0, missingSource:0, missingStartDate:0, invalidStartDate:0, quarantined:0};
    stats.rows++;
    if(typeof row.source !== 'string' || !row.source.trim()) stats.missingSource++;
    const start = row.validFrom ?? row.effectiveFrom;
    if(start == null) stats.missingStartDate++;
    else if(!validDate(start) && !(typeof start==='string' && /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(start) && validDate(start.slice(0,10)) && Number.isFinite(new Date(start).getTime()))) stats.invalidStartDate++;
    if(row.runtimeEligible === false) stats.quarantined++;
    coverage.set(row.road,stats);
    if(row.road !== 'm4-candidate') continue;
    const sections = row.sectionVector.flatMap(id => String(id).split('+'));
    const key = JSON.stringify([sections[0],sections.at(-1),row.profile]);
    const entries = groups.get(key) || [];
    entries.push({row,sections}); groups.set(key,entries);
  }
  const conflicts = [], causes = new Map();
  for(const [key,entries] of groups) {
    const fares = [...new Set(entries.map(x=>x.row.rub))].sort((a,b)=>a-b);
    if(fares.length < 2) continue;
    const [from,to,profile] = JSON.parse(key);
    let common = new Set(entries[0].sections);
    const union = new Set();
    for(const {sections} of entries) {
      common = new Set([...common].filter(id=>sections.includes(id)));
      for(const id of sections) union.add(id);
    }
    const differingSections = [...union].filter(id=>!common.has(id)).sort();
    const causeKey = differingSections.join('|') || 'same-sections-different-amounts';
    causes.set(causeKey,(causes.get(causeKey)||0)+1);
    conflicts.push({from,to,profile,fares,differingSections,
      allQuarantined:entries.every(x=>x.row.runtimeEligible===false),
      sourceRows:entries.length,
      disposition:'unknown-pending-exact-boundary-and-source-evidence'});
  }
  conflicts.sort((a,b)=>JSON.stringify([a.from,a.to,a.profile]).localeCompare(JSON.stringify([b.from,b.to,b.profile])));
  return {schemaVersion:1,diagnosticOnly:true,scope:'Saved matrix snapshot; not a fresh operator or Yandex verification',
    fareRows:matrix.rows.length,conflictCount:conflicts.length,
    causeGroups:Object.fromEntries([...causes].sort()),
    coverageByMatrixRoad:Object.fromEntries([...coverage].sort()),conflicts};
}
module.exports = {auditMatrix};
if(require.main === module) {
  const root=path.resolve(__dirname,'..');
  const result=auditMatrix(JSON.parse(fs.readFileSync(path.join(root,'TARIFF_VECTOR_MATRIX_2026-10-12.json'),'utf8')));
  fs.writeFileSync(path.join(root,'MATRIX_PROVENANCE_AUDIT_2026-10-14.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({fareRows:result.fareRows,conflictCount:result.conflictCount,causeGroups:result.causeGroups}));
}
