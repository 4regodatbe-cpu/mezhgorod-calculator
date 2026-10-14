const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const m4Verified = read('source-snapshots/m4-order58-2026-03-02-category1-verified.json');
const entries = read('TARIFF_MATRIX_CANDIDATES_2026-10-12.json').entries;
const dateProof=read('source-snapshots/regional-date-proof-2026-10-14.json').sources;
const dateEvidence=road=>({effectiveFrom:dateProof[road].effectiveFrom,sourceSnapshot:'source-snapshots/regional-date-proof-2026-10-14.json',sourceDateStatus:'verified-primary-source'});
const vectors=[];
function add(road,from,to,profile,rub,source,extra={}) {
 if (!Number.isFinite(rub)||rub<0) throw Error(`Invalid fare ${road} ${from} ${to}`);
 vectors.push({road,from,to,profile,rub,source,...extra});
}
function both(road,from,to,profile,rub,source,extra={}) {
 add(road,from,to,profile,rub,source,extra); add(road,to,from,profile,rub,source,{...extra,reverseBasis:'user direction-invariant model unless operator publishes a different rate'});
}
const m11=read('source-snapshots/m11/2026-10-12-58-679-category1-a1-current.json').currentOrder274Matrix;
for(const [profile,p] of Object.entries(m11.dayProfiles)) for(const [from,row] of Object.entries(p.directRowsByOrigin)) row.forEach((rub,j)=>{if(rub!==null)add('m11-58-679',from,m11.pointOrder[j],profile,rub,m11.pdfPath,{basis:'published direct matrix',effectiveFrom:'2026-09-04'});});
const head=read('source-snapshots/2026-04-24-15-58-category1.json');
for(const[from,row]of Object.entries(head.tariffs))for(const[to,prices]of Object.entries(row))for(const[profile,rub]of Object.entries(prices))add('m11-15-58',from,to,profile,rub,head.source.url,{basis:'published direct directional matrix',effectiveFrom:head.effectiveFrom,announcedSeasonalWindow:head.announcedSeasonalWindow});
const other=read('source-snapshots/2026-10-01-avtodor-other-roads-category1.json');
for(const e of other.roads['m1-33-66'])both('m1',e.from,e.to,'allDays',e.allDays.noTransponder,other.source,{basis:'category-I no-transponder rate from explicit operator payment columns',...dateEvidence('m1')});
const m3=other.roads.m3;for(let i=0;i<m3.length;i++)for(let j=i;j<m3.length;j++)for(const profile of ['monThu','friSun'])both('m3',m3[i].from,m3[j].to,profile,m3.slice(i,j+1).reduce((sum,row)=>sum+row[profile].noTransponder,0),other.source,{basis:'offline contiguous vector from visually verified category-I operator rows',effectiveFrom:other.m3EffectiveFrom,sourceFareStatus:'verified-operator-category1-rows',sourceSnapshot:'source-snapshots/m3-tolyatti-uploaded-pdf-verified-2026-10-14.json'});
const ckad=read('source-snapshots/ckad-2026-03-02-category1-direct-pair-matrix.json');
for(const [from,row]of Object.entries(ckad.directFareRub))for(const[to,rub]of Object.entries(row))if(rub!==null){
 const m12Partial=(from==='М-12 Восток'&&ckad.nodes.indexOf(to)>ckad.nodes.indexOf('М-12 Восток'))||(to==='М-12 Восток'&&ckad.nodes.indexOf(from)>ckad.nodes.indexOf('М-12 Восток'));
 add('ckad',from,to,'allDays',rub,ckad.sourceFile,{basis:'visually verified category-I direct matrix',effectiveFrom:ckad.effectiveFrom,vehicleCategory:1,sourceFareStatus:ckad.sourceFareStatus,sourceSnapshot:'source-snapshots/ckad-2026-03-02-category1-direct-pair-matrix.json',...(m12Partial?{requiresTariffContext:true,tariffContextRule:'CKAD appendix1 footnote2; resolve120-minute payment context for initial/final M12–Nosovikhinskoe section'}:{})});
}
both('ckad-small-vyazemy',ckad.separateProduct.from,ckad.separateProduct.to,'allDays',ckad.separateProduct.rub,ckad.sourceFile,{basis:'published separate-product direct fare; physical binding pending',effectiveFrom:ckad.effectiveFrom,vehicleCategory:1,sourceFareStatus:'verified-operator-category1-direct-cell'});
// Explicitly authorized offline construction from verified per-PVP charges.
const m4=read('source-snapshots/m4-2026-10-12-avtodor-and-yandex-checks.json');
const cells=Object.assign({},...m4.officialSources.map(s=>s.pvpFareCells));const pvp=['1046','1093','1184','1223'];
for(let i=0;i<pvp.length;i++)for(let j=i;j<pvp.length;j++)for(const profile of ['monThu','friSun']){
 const sequence=pvp.slice(i,j+1),rub=sequence.reduce((s,id)=>s+cells[id][profile+'Rub'],0);
 add('m4-south',sequence[0],sequence.at(-1),profile,rub,m4Verified.sourceFile,{pvpVector:sequence,basis:'offline sum of verified PVP charges; persisted finished vector',effectiveFrom:m4Verified.effectiveFrom,sourceFareStatus:'verified-operator-rows',sourceSnapshot:'source-snapshots/m4-order58-2026-03-02-category1-verified.json'});
 if(i!==j)add('m4-south',sequence.at(-1),sequence[0],profile,rub,m4Verified.sourceFile,{pvpVector:[...sequence].reverse(),basis:'same vector reversed under user rule',effectiveFrom:m4Verified.effectiveFrom,sourceFareStatus:'verified-operator-rows',sourceSnapshot:'source-snapshots/m4-order58-2026-03-02-category1-verified.json'});
}
const chord=read('source-snapshots/mytishchi-2026-02-01-category1.json');
for(let i=0;i<chord.nodes.length;i++)for(let j=i+1;j<chord.nodes.length;j++)both('mytishchi',chord.nodes[i],chord.nodes[j],'allDays',chord.sections.slice(i,j).reduce((s,x)=>s+x.rub,0),chord.source,{basis:'offline contiguous vector from selected official segment tariffs',effectiveFrom:chord.effectiveFrom});
const od=entries.find(e=>e.id==='odintsovo-bypass-category1-base');
const index={'6.9':0,'13.4':1,'17.7':2,'4.6 A':3,'4.6 B':3};
for(const [direction,routes]of Object.entries(od.tariffs.operatorConfirmedTraversalExamples)){
 if(!Array.isArray(routes))continue;
 const profiles=direction==='fromMoscow'?{weekdayOrdinary:od.tariffs.weekdayAwayFromMoscow['05:00-16:00_and_22:00-01:00'],weekdayPeak:od.tariffs.weekdayAwayFromMoscow['16:00-22:00'],weekendDay:od.tariffs.weekendHolidayDayAwayFromMoscow_05_00_01_00||od.tariffs['weekendHolidayDayAwayFromMoscow_05:00-01:00'],night:od.tariffs['nightAllDirections_01:00-05:00']}:{weekdayOrdinary:od.tariffs.weekdayTowardMoscow['05:00-07:00_and_13:00-01:00'],weekdayPeak:od.tariffs.weekdayTowardMoscow['07:00-13:00'],weekendDay:od.tariffs['weekendHolidayDayTowardMoscow_05:00-01:00'],night:od.tariffs['nightAllDirections_01:00-05:00']};
 for(const r of routes){const seq=r.pvpVector;function combos(k,selection,rub){if(k===seq.length){add('odintsovo',r.from||'МКАД',r.to||'МКАД',direction+':'+selection.join('|'),rub,od.source,{pvpVector:seq,crossingProfiles:selection,basis:'offline prices for independently classified plaza crossing times',effectiveFrom:od.effectiveFrom});return;}for(const [profile,prices]of Object.entries(profiles))combos(k+1,[...selection,profile],rub+prices[index[seq[k]]]);}combos(0,[],0);}
}
function fixed(id,road,span,priceField,profiles=['allDays']){const e=entries.find(x=>x.id===id);for(const p of profiles)both(road,span+'-A',span+'-B',p,e.tariffs[priceField],e.source,{effectiveFrom:e.effectiveFrom});}
fixed('bagration-category1-base','bagration','gantry-km6.6','allDirectionsAllDayRub');
fixed('ufa-eastern-exit-category1','ufa','full-road','baseRub');
fixed('blagoveshchensk-heihe-bridge-passenger-car','heihe','bridge','passengerCarOneWayRub');
const ud=entries.find(e=>e.id==='udmurtia-kama-buy-bridges-category1');for(const k of ['kamaBridgeRub','buyBridgeRub','bothBridgesRub'])both('udmurtia',k+'-A',k+'-B','allDays',ud.tariffs[k],ud.source,{basis:'operator direct zone price',...dateEvidence('udmurtia')});
const to=entries.find(e=>e.id==='tolyatti-bypass-category1');for(const s of Object.values(to.tariffs))if(s&&typeof s==='object')both('tolyatti',String(s.fromKm),String(s.toKm),'allDays',s.noTransponderRub,'source-documents/tolyatti-order85-effective-2026-03-01.pdf',{basis:'visually verified category-I direct vector; full span320, not sum350',effectiveFrom:to.effectiveFrom,vehicleCategory:1,sourceFareStatus:'verified-operator-category1-direct-cell',sourceSnapshot:'source-snapshots/m3-tolyatti-uploaded-pdf-verified-2026-10-14.json'});
const ps=entries.find(e=>e.id==='pskov-regional-paid-roads-category1');for(const [k,rub]of Object.entries(ps.tariffs))if(typeof rub==='number')both('pskov',k+'-A',k+'-B','allDays',rub,ps.sourceLegalBasis||ps.source,{basis:'retained by user; 2025 published schedule, amendment check not newly completed'});
const a289=read('A289_OD_MATRIX_2026-10-13.json');
for(const row of a289.pricedUndirectedPairs)both('a289',row.from,row.to,'allDays',row.rub,row.source,{basis:row.basis,verification:row.verification,requiresExactExitBinding:true,effectiveFrom:row.effectiveFrom,vehicleCategory:1});
const ry=entries.find(e=>e.id==='ryazan-m5-overpass-category1');both('ryazan','before-overpass','after-overpass','standard',45,ry.source,dateEvidence('ryazan'));for(const w of ry.tariffs.freeWindows)add('ryazan',w.direction==='from city'?'city':'outside',w.direction==='from city'?'outside':'city',`night:${w.fromLocal}-${w.toLocal}:lane${w.lane}`,0,ry.source,{requiresLane:w.lane,...dateEvidence('ryazan')});
const ka=entries.find(e=>e.id==='kazan-voznesensky-tract-category1');both('kazan','before-gantry','after-gantry','weekdayPeak',150,ka.source,dateEvidence('kazan'));both('kazan','before-gantry','after-gantry','otherTimes',90,ka.source,dateEvidence('kazan'));
// Prepared mask table: runtime classifies each section by entry+exit timestamps,
// then looks up one persisted total; it does not add per-section charges.
for(const[version,rate]of Object.entries({'2026-04-10':19,'2026-10-16':25}))for(let mask=0;mask<512;mask++){let count=0;for(let i=0;i<9;i++)if(mask&(1<<i))count++;add('msd',`charged-mask-${mask}`,'ordinary',version,count*rate,'https://msd.mos.ru/info',{chargedMask:mask,validFrom:version,validUntil:version==='2026-04-10'?'2026-10-16':null,basis:'offline table for all charged-section masks; section entry AND exit must be inside paid windows'});}add('msd','ЦКАД','ЦКАД via МСД','transit',950,'https://msd.mos.ru/faq',{basis:'operator transit predicate must be satisfied',requiresTariffContext:true,...dateEvidence('msd-transit')});
const m12=read('source-snapshots/m12-2026-03-02-category1.json');
const m12Current=read('source-snapshots/m12-order302-2026-10-08-category1-direct-pair-matrix.json');
for(const[from,row]of Object.entries(m12Current.directRowsByOrigin))row.forEach((rub,i)=>{if(rub!==null)add('m12',from,m12Current.pointOrder[i],'allDays',rub,m12Current.sourceFile,{basis:'visually verified category-I direct matrix; current paid boundary requires physical binding',effectiveFrom:m12Current.effectiveFrom,vehicleCategory:1,sourceFareStatus:m12Current.sourceFareStatus,sourceSnapshot:'source-snapshots/m12-order302-2026-10-08-category1-direct-pair-matrix.json'});});
for(const a of m12.laterOperatorTariffAddenda)both('m12',a.from,a.to,'allDays',a.rub,a.source,{basis:'published direct dated addendum; Sokury endpoint alias not inferred',effectiveFrom:'2026-10-08'});
// Recover the full prior intake instead of losing already collected north-road fares.
const original=read('source-snapshots/original-branch-candidates-2026-10-12.json');
const groups=[];
for(const row of original.rows){
 const confirmed=m4Verified.cells[row.pvpOrId];
 if(!confirmed||row.rawDisplayedAmounts[0]!==confirmed.monThu||row.rawDisplayedAmounts[1]!==confirmed.friSun)throw Error('M4 source differs from visually verified category-I PDF: '+row.pvpOrId);
 if(row.pvpOrId==='m4-dzok-46'){for(const p of ['monThu','friSun'])both('m4-dzok','0','51',p,confirmed[p],m4Verified.sourceFile,{verification:'visually verified operator category-I PDF row',effectiveFrom:m4Verified.effectiveFrom,sourceFareStatus:'verified-operator-rows'});continue;}
 const key=row.kmRange==='21-62'?'21-93':row.kmRange;
 let g=groups.find(g=>g.key===key);if(!g){g={key,alternatives:[]};groups.push(g);}g.alternatives.push(row);
}
for(let i=0;i<groups.length;i++)for(let j=i;j<groups.length;j++){
 function expand(at,chain){if(at>j){for(const[pi,profile]of ['monThu','friSun'].entries()){
 const rub=chain.reduce((a,r)=>a+r.rawDisplayedAmounts[pi],0);const forward=chain.map(r=>r.pvpOrId),reverse=[...forward].reverse();
 const extra={sectionVector:forward,verification:'operator category-I rows visually verified; completed endpoint fare binding remains candidate',basis:'offline tariff normalization; historical chain alternatives retained for audit',effectiveFrom:m4Verified.effectiveFrom,sourceFareStatus:'verified-operator-rows',sourceSnapshot:'source-snapshots/m4-order58-2026-03-02-category1-verified.json'};
 add('m4-candidate',forward.join('>'),forward.join('>'),profile,rub,m4Verified.sourceFile,extra);
 if(chain.length>1)add('m4-candidate',reverse.join('>'),reverse.join('>'),profile,rub,m4Verified.sourceFile,{...extra,sectionVector:reverse});
 }return;}for(const r of groups[at].alternatives)expand(at+1,[...chain,r]);}expand(i,[]);
}
// Keep pre-extension M12 cells versioned; the post-Oct8 Shali boundary is a separate direct vector.
const raw12=original.rawPublishedSchedules.find(x=>x.network==='m12').rows;
for(let i=0;i<raw12.length;i++)for(let j=i;j<raw12.length;j++){
 const seq=raw12.slice(i,j+1),key=seq.map(x=>'rvp'+x.km),rub=seq.reduce((s,x)=>s+x.amountsAsDisplayed[0],0);
 const includesOldShali=seq.some(x=>x.km===832);
 const extra={sectionVector:key,verification:'candidate original operator adjacent section charges',validFrom:'2026-03-02',validUntil:includesOldShali?'2026-10-08':null,includesSupersededShaliBoundary:includesOldShali,basis:'offline vector; old km83262-RUB data is historical after Oct8, never current',requiresConnectedMainlineTraversal:true};
 add('m12-candidate',key.join('>'),key.join('>'),'allDays',rub,original.source.url,extra);
 if(seq.length>1){const rev=[...key].reverse();add('m12-candidate',rev.join('>'),rev.join('>'),'allDays',rub,original.source.url,{...extra,sectionVector:rev});}
}
const out={schemaVersion:1,generatedAt:'2026-10-13',vehicle:'passenger car',payment:'base without transponder',routeSelection:'single fastest route only',runtimeOperation:'lookup finished vector; no component sum',rows:vectors,scope:{excludedByUser:['SHMSD','ZSD','Khabarovsk'],incompleteRoads:['M4 outside four south PVPs','M12 current direct matrix physical endpoint bindings after extension','A289 Anapa/Taman partial OD pairs and exact exit bindings'],yandexChecksNotCompletedForEveryRow:true,unknownPriceIsNotZero:true}};
const spanMap=new Map();
for(const r of vectors.filter(r=>r.road==='m4-candidate')){
 const seq=r.sectionVector,rev=[...seq].reverse(),key=[seq.join('>'),rev.join('>')].sort()[0];
 let span=spanMap.get(key);if(!span){span={key,pvpOrSectionVector:key.split('>'),monThuRub:null,friSunRub:null,source:r.source,verification:r.verification};spanMap.set(key,span);}span[r.profile+'Rub']=r.rub;
}
out.m4CanonicalSpans=[...spanMap.values()];
// The V3 endpoint algorithm prices by the first and last physical tariff
// sections. Several alternative internal chains can share those boundaries;
// only expose a cell when every stored candidate for that directed pair and
// profile has the same amount. Keep conflicting source rows for audit.
const endpointGroups=new Map();
for(const r of vectors.filter(r=>r.road==='m4-candidate')){
 const endpointVector=r.sectionVector.flatMap(id=>String(id).split('+'));
 const from=endpointVector[0],to=endpointVector.at(-1);
 const key=JSON.stringify([from,to,r.profile]);
 const rows=endpointGroups.get(key)||[];rows.push({row:r,from,to});endpointGroups.set(key,rows);
}
out.m4EndpointConflicts=[];
out.m4RuntimeEndpointSpans=[];
for(const[key,entries]of endpointGroups){
 const fares=[...new Set(entries.map(x=>x.row.rub))];
 const [from,to,profile]=JSON.parse(key);
 const runtimeEligible=fares.length===1;
 for(const entry of entries){
  entry.row.runtimeEligible=runtimeEligible;
  entry.row.disposition=runtimeEligible?'unique-outer-endpoint-fare':'audit-only-ambiguous-endpoint-cell';
  if(!runtimeEligible)entry.row.ambiguityReason='alternative stored chains yield different amounts for the same directed outer-boundary pair/profile';
 }
 if(runtimeEligible){
  const first=entries[0].row;
  out.m4RuntimeEndpointSpans.push({from,to,profile,rub:fares[0],source:first.source,sourceRows:entries.length,verification:first.verification});
 }else out.m4EndpointConflicts.push({from,to,profile,fareAlternatives:fares,sourceRows:entries.length,disposition:'audit-only-ambiguous-endpoint-cell'});
}
out.counts={fareRows:vectors.length,m4CanonicalSpans:out.m4CanonicalSpans.length,byRoad:Object.fromEntries([...new Set(vectors.map(v=>v.road))].map(r=>[r,vectors.filter(v=>v.road===r).length]))};fs.writeFileSync(path.join(root,'TARIFF_VECTOR_MATRIX_2026-10-12.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out.counts,null,2));
