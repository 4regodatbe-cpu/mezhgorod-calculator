const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');const root=path.resolve(__dirname,'..');const d=JSON.parse(fs.readFileSync(path.join(root,'TARIFF_VECTOR_MATRIX_2026-10-12.json')));const keys=new Set();
for(const r of d.rows){const key=JSON.stringify([r.road,r.from,r.to,r.profile]);assert(!keys.has(key),'Duplicate vector '+key);keys.add(key);assert(Number.isFinite(r.rub)&&r.rub>=0);assert(r.source);}
const fare=(road,from,to,profile)=>d.rows.find(r=>r.road===road&&r.from===from&&r.to===to&&r.profile===profile)?.rub;
for(const[road,from,to,profile,rub]of [['m1','33 km','66 km','allDays',250],['m3','65 km','194 km','monThu',480],['m3','194 km','65 km','friSun',520],['m4-south','1093','1223','monThu',850],['m4-south','1223','1093','friSun',1000],['m4-south','1046','1223','monThu',1230],['m4-south','1223','1046','friSun',1450],['m4-south','1184','1223','monThu',700],['m4-south','1223','1184','friSun',850],['mytishchi','Афанасовское ш.','М-8 Холмогоры','allDays',259],['tolyatti','17','97','allDays',320],['heihe','bridge-A','bridge-B','allDays',1320],['msd','charged-mask-511','ordinary','2026-04-10',171],['msd','charged-mask-511','ordinary','2026-10-16',225]])assert.equal(fare(road,from,to,profile),rub);
for(const r of d.rows.filter(r=>['m11-58-679','ckad'].includes(r.road)))assert.equal(r.rub,fare(r.road,r.to,r.from,r.profile));
// Endpoint-only M4 lookup may only use rows with a unique amount for the
// directed outer-boundary pair/profile. Conflicts stay in the audit matrix.
const m4EndpointGroups=new Map();
for(const r of d.rows.filter(r=>r.road==='m4-candidate')){
 const seq=r.sectionVector.flatMap(id=>String(id).split('+'));
 const key=JSON.stringify([seq[0],seq.at(-1),r.profile]);
 const rows=m4EndpointGroups.get(key)||[];rows.push(r);m4EndpointGroups.set(key,rows);
}
const endpointConflicts=[...m4EndpointGroups].filter(([,rows])=>new Set(rows.map(r=>r.rub)).size>1);
assert.equal(endpointConflicts.length,d.m4EndpointConflicts.length,'conflict report must cover every ambiguous endpoint/profile key');
for(const[,rows]of m4EndpointGroups){const unique=new Set(rows.map(r=>r.rub)).size===1;for(const r of rows)assert.equal(r.runtimeEligible,unique,'runtime eligibility must match endpoint fare uniqueness');}
for(const span of d.m4RuntimeEndpointSpans){const key=JSON.stringify([span.from,span.to,span.profile]);assert(m4EndpointGroups.has(key));assert.equal(new Set(m4EndpointGroups.get(key).map(r=>r.rub)).size,1);}
const main=d.rows.filter(r=>r.road==='m4-candidate'&&r.sectionVector.length===17&&r.sectionVector[0]==='m4-71'&&!r.sectionVector.includes('m4-355')&&!r.sectionVector.includes('m4-672'));
assert.equal(main.find(r=>r.profile==='monThu').rub,5040);assert.equal(main.find(r=>r.profile==='friSun').rub,6090);
for(const r of d.rows.filter(r=>r.road==='m4-candidate'))for(const[a,b]of [['m4-62','m4-71'],['m4-339','m4-355'],['m4-636','m4-672']])assert(!(r.sectionVector.includes(a)&&r.sectionVector.includes(b)));
for(const r of d.rows.filter(r=>r.includesSupersededShaliBoundary))assert.equal(r.validUntil,'2026-10-08');
for(const[from,to,rub]of [['Maryanskaya','Slavyansk',415],['Slavyansk','Varenikovskaya',205],['Maryanskaya','Varenikovskaya',620],['Varenikovskaya','Temryuk',180],['Slavyansk','Temryuk',385],['Maryanskaya','Temryuk',800],['Maryanskaya','TamanBridge',800],['Maryanskaya','TemryukCity',620],['Slavyansk','TamanBridge',385],['Varenikovskaya','TamanBridge',180]]){
 assert.equal(fare('a289',from,to,'allDays'),rub);
 assert.equal(fare('a289',to,from,'allDays'),rub);
}
assert.equal(fare('a289','Slavyansk','TamanBridge','allDays'),385);
assert.equal(fare('a289','Maryanskaya','AnapaExit','allDays'),undefined);
const report={executedAt:new Date().toISOString(),status:'passed',fareRows:d.rows.length,counts:d.counts.byRoad,uniqueKeys:keys.size,m4EndpointConflicts:endpointConflicts.length,m4RuntimeEndpointSpans:d.m4RuntimeEndpointSpans.length,checks:['non-negative numeric price and source per row','M11/CKAD reciprocal equality','M4 user two/three/four-PVP prices','M4 mainline 5040/6090 equals saved Yandex controls','overlapping M4 options never double-charged','M4 endpoint-only lookup excludes ambiguous candidate chains','Mytishchi full259; Togliatti direct320; Heihe1320','MSD dated versions19/25 separate','superseded M12 Shali rows expire before Oct8'],limitations:d.scope};fs.writeFileSync(path.join(root,'MATRIX_VALIDATION_2026-10-12.json'),JSON.stringify(report,null,2)+'\n');console.log(`PASS ${d.rows.length} fare rows; ${endpointConflicts.length} M4 endpoint conflicts quarantined; ${d.m4RuntimeEndpointSpans.length} unambiguous endpoint spans; no duplicate keys`);
