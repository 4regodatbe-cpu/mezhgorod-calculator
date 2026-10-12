const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const matrix=JSON.parse(fs.readFileSync(path.join(root,'TARIFF_VECTOR_MATRIX_2026-10-12.json')));
const asOf='2026-10-13';
const history=[],excluded=[],selected=[],provisional=[];
for(const row of matrix.rows){
 const end=row.validUntil||row.effectiveUntil;
 const start=row.validFrom||row.effectiveFrom;
 if(end&&end<=asOf){history.push({...row,selectionReason:'expired version; exclusive end date'});continue;}
 if(start&&start>asOf){history.push({...row,selectionReason:'future version; preserve for dated lookup'});continue;}
 if(row.road.endsWith('-candidate')||row.verification?.includes('candidate')){provisional.push({...row,disposition:'usable-with-unconfirmed-label',priceConfirmation:'unconfirmed',displayLabel:'Стоимость не подтверждена',requiresVisibleWarning:true,runtimeApproved:false,authorizedForEstimate:true,selectionReason:'user decision 2026-10-13: permit current candidate prices with explicit label'});continue;}
 selected.push({...row,selectionReason:'published or user-confirmed price; route binding still required',runtimeApproved:false});
}
assert.equal(selected.length+history.length+excluded.length+provisional.length,matrix.rows.length);
assert(!selected.some(r=>r.road.endsWith('-candidate')));
assert(!selected.some(r=>r.validUntil&&r.validUntil<=asOf));
assert(!selected.some(r=>r.validFrom&&r.validFrom>asOf));
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.road))].map(road=>[road,rows.filter(r=>r.road===road).length]));
const report={asOf,generatedAt:new Date().toISOString(),status:'current candidates authorized for visibly unconfirmed estimates; integration pending',runtimeApproved:false,counts:{input:matrix.rows.length,selected:selected.length,history:history.length,excluded:excluded.length,provisional:provisional.length,pendingCandidates:0},selectedByRoad:counts(selected),excludedByRoad:counts(excluded),excludedRoads:matrix.scope.excludedByUser,unknownIsNotZero:true,unresolved:[{road:'m12',scope:'post-2026-10-08 vectors crossing extended Shali boundary except Sokury–Shali direct99',action:'no current candidate price for changed boundary: unknown unless a dated direct price exists'},{road:'m4',scope:'candidate and mixed/alternative sections',action:'current candidates permitted as estimates with visible unconfirmed label; exact vector binding required'},{scope:'all roads',action:'selected fares are not geometry-validated route mappings'}]};
fs.writeFileSync(path.join(root,'TARIFF_SELECTION_REGISTER.json'),JSON.stringify({...report,selected,provisional,history,excluded},null,2)+'\n');
fs.writeFileSync(path.join(root,'TARIFF_SELECTION_REPORT.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.counts));
