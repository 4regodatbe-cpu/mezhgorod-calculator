import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import audit from './scripts/audit-matrix-provenance.cjs';
const read=name=>JSON.parse(readFileSync(new URL(name,import.meta.url)));
test('provenance audit accounts for every saved M4 conflict without selecting a price',()=>{
 const matrix=read('TARIFF_VECTOR_MATRIX_2026-10-12.json');
 const result=audit.auditMatrix(matrix);
 assert.deepEqual(result,read('MATRIX_PROVENANCE_AUDIT_2026-10-14.json'));
 assert.equal(result.conflictCount,matrix.m4EndpointConflicts.length);
 assert.equal(Object.values(result.causeGroups).reduce((a,b)=>a+b,0),result.conflictCount);
 assert.ok(result.conflicts.every(x=>x.allQuarantined));
 assert.deepEqual(new Set(result.conflicts.map(x=>JSON.stringify([x.from,x.to,x.profile]))),new Set(matrix.m4EndpointConflicts.map(x=>JSON.stringify([x.from,x.to,x.profile]))));
});
test('same-section price conflict and missing source/date remain explicit',()=>{
 const row={road:'m4-candidate',sectionVector:['a+b','c'],profile:'monThu',rub:10,runtimeEligible:false};
 const result=audit.auditMatrix({rows:[row,{...row,rub:20}]});
 assert.equal(result.causeGroups['same-sections-different-amounts'],1);
 assert.equal(result.coverageByMatrixRoad['m4-candidate'].missingSource,2);
 assert.equal(result.coverageByMatrixRoad['m4-candidate'].missingStartDate,2);
 assert.equal(result.conflicts[0].from,'a');
 assert.equal(result.conflicts[0].to,'c');
 assert.equal(result.diagnosticOnly,true);
});
test('effective boundaries accept explicit operator instants and reject normalized invalid dates',()=>{
 const rows=['2026-03-02T00:00:00+03:00','2026-03-02','2026-02-30T00:00:00+03:00','2026-03-02T00:00:00'].map(effectiveFrom=>({road:'example',rub:1,source:'saved',effectiveFrom}));
 assert.equal(audit.auditMatrix({rows}).coverageByMatrixRoad.example.invalidStartDate,2);
});
