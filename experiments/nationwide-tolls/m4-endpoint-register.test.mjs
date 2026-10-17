import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import compiler from './scripts/build-m4-endpoint-register.cjs';
const read=name=>JSON.parse(readFileSync(new URL(name,import.meta.url)));
const matrix=read('TARIFF_VECTOR_MATRIX_2026-10-12.json'),reviewed=read('M4_REVIEWED_ENDPOINT_CELLS_2026-10-13.json'),active=read('M4_ACTIVE_ENDPOINT_REGISTER.json');
const operator=read('M4_OPERATOR_ENDPOINT_CELLS.json');
test('active endpoint matrix is reproducible, unique and accounts for every original conflict',()=>{
 assert.deepEqual(compiler.compileEndpoints(matrix,reviewed,operator),active);
 const keys=active.rows.map(r=>JSON.stringify([r.from,r.to,r.profile]));
 assert.equal(new Set(keys).size,keys.length);
 assert.equal(active.counts.resolvedConflictEstimates+active.counts.unknownConflictKeys+active.counts.excludedConflictKeys,matrix.m4EndpointConflicts.length);
 assert.equal(active.counts.resolvedConflictEstimates,404);
 assert.equal(active.counts.unknownConflictKeys,0);
 assert.equal(active.counts.excludedConflictKeys,24);
 assert.equal(active.counts.excludedChains,668);
 for(const r of active.rows){assert.equal(r.priceConfirmation,'unconfirmed');assert.ok(!r.sectionVector?.slice(1,-1).some(id=>['m4-355','m4-672'].includes(id)));}
});
test('canonical through price differs from a ramp tariff; exact reviewed controls take precedence',()=>{
 const fare=(a,b,p)=>active.rows.find(r=>r.from===a&&r.to===b&&r.profile===p);
 assert.equal(fare('m4-62','m4-460','monThu').rub,1740);
 assert.equal(fare('m4-62','m4-460','friSun').rub,2120);
 for(const r of reviewed.rows){const cell=fare(r.from,r.to,r.profile);assert.equal(cell.rub,r.rub);assert.equal(cell.observationId,r.observationId);}
 assert.equal(fare('m4-355','m4-803','monThu'),undefined);
 assert.equal(fare('m4-803','m4-355','monThu'),undefined);
});
test('new unexplained same-endpoint conflict remains unknown instead of min/max selection',()=>{
 const a={road:'m4-candidate',sectionVector:['m4-71','m4-133'],profile:'monThu',rub:10};
 const out=compiler.compileEndpoints({rows:[a,{...a,rub:20}],m4EndpointConflicts:[]},{rows:[]});
 assert.equal(out.rows.length,0);assert.equal(out.unknown[0].reason,'remaining-fare-conflict');
});
test('northbound combined section has directed atomic boundaries, never a new fare',()=>{
 const row={road:'m4-candidate',sectionVector:['m4-416+m4-460','m4-339','m4-71'],profile:'monThu',rub:1830};
 const out=compiler.compileEndpoints({rows:[row],m4EndpointConflicts:[{from:'m4-416',to:'m4-71',profile:'monThu'}]},{rows:[]});
 assert.equal(out.rows[0].from,'m4-460');
 assert.equal(out.rows[0].to,'m4-71');
 assert.deepEqual(out.rows[0].sectionVector,['m4-460','m4-416','m4-339','m4-71']);
 assert.equal(out.rows[0].rub,row.rub);
 assert.equal(out.counts.resolvedConflictEstimates,1);
 assert.deepEqual(row.sectionVector,['m4-416+m4-460','m4-339','m4-71']);
});
test('southbound and undirected standalone combined sections preserve boundaries',()=>{
 const rows=[['m4-71','m4-416+m4-460'],['m4-416+m4-460']].map(sectionVector=>({road:'m4-candidate',sectionVector,profile:'monThu',rub:230}));
 const out=compiler.compileEndpoints({rows,m4EndpointConflicts:[]},{rows:[]});
 assert.ok(out.rows.some(r=>r.from==='m4-71'&&r.to==='m4-460'));
 assert.ok(out.rows.some(r=>r.from==='m4-416'&&r.to==='m4-460'));
 assert.ok(!out.rows.some(r=>r.from==='m4-460'&&r.to==='m4-416'));
});
test('saved northbound460 to71 profiles reuse existing verified-row totals',()=>{
 for(const [profile,rub]of [['monThu',1830],['friSun',2300]]){
  const row=active.rows.find(r=>r.from==='m4-460'&&r.to==='m4-71'&&r.profile===profile);
  assert.equal(row.rub,rub);assert.equal(row.priceConfirmation,'unconfirmed');
  assert.equal(active.rows.find(r=>r.from==='m4-416'&&r.to==='m4-71'&&r.profile===profile),undefined);
 }
});
