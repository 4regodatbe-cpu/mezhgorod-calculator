// Verify persisted exits/evidence only; do not repeat tests/build/provider requests.
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const folder=new URL('./checks/2026-10-30-recovery/',import.meta.url);
const raw=name=>readFileSync(new URL(name,folder));
const str=name=>raw(name).toString('utf8');
const sha=b=>createHash('sha256').update(b).digest('hex');
const labels=['all-focused-final','final-scoped-typecheck','final-scoped-lint','project-typecheck','required-offline-gate',
 'presentation-fixture-repair','presentation-fixture-typecheck','presentation-fixture-lint','all-focused-provenance-final','provenance-final-lint','production-build','protected-source-unchanged'];
const exits=Object.fromEntries(labels.map(label=>{const text=str(label+'.exit').trim();assert.equal(text,'0',label);return [label,Number(text)];}));
assert.equal(str('all-focused.exit').trim(),'1','retain initial fixture failure');
assert.match(str('all-focused.log'),/pass 36/u);assert.match(str('all-focused.log'),/fail 3/u);
const focused=str('all-focused-provenance-final.log'),gate=str('required-offline-gate.log'),build=str('production-build.log');
assert.match(focused,/pass 40/u);assert.match(focused,/fail 0/u);
for(const s of ['pass 1047','fail 0','skipped 1','PASS quote:','PASS API adapter:'])assert.ok(gate.includes(s),s);
for(const s of ['Next.js 16.3.4','Compiled successfully','Finished TypeScript','(16/16)','Collecting build traces','Route (app)','/v3'])assert.ok(build.includes(s),s);
const a=JSON.parse(str('arzamas-recovery.json')),t=JSON.parse(str('torzhok-recovery.json'));
assert.deepEqual(a.rows.map(r=>r.result.assessedSubtotalRub),[6928,7268]);assert.ok(a.rows.every(r=>r.result.totalRub===null));assert.equal(a.newFullEstimatedRoutes,0);
assert.deepEqual(t.rows.map(r=>r.result.totalRub),[5904,6084]);assert.ok(t.rows.every(r=>r.result.status==='estimated'&&r.result.strict.amount===null));assert.equal(t.newFullEstimatedRoutes,1);
const root=new URL('../../',import.meta.url);
const originalSources=[
 ['experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-kad-ekateringofka/owner-base-32-1.pdf','a8041b8a0b44189fd9f3e8dcd9bf155ec9b1b86c2023445fa2805367f0586413'],
 ['experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-kad-ekateringofka/owner-zones-96.pdf','3651cf7c42ec6530f2d994cd03c2929c94bd45c86b8479ebce98b6688b23975e'],
 ['experiments/nationwide-tolls/source-snapshots/zsd/2026-10-18-rvp64-current-rules/current-rules-Pravila0926.pdf','659346fb36a6cccb022d5fb61ee5396b82d62b6bbacdac023fe20447192d3bd2']
].map(([path,expected])=>{const actual=sha(readFileSync(new URL(path,root)));assert.equal(actual,expected,path);return {path,sha256:actual};});
const selected=JSON.parse(readFileSync(new URL('experiments/nationwide-tolls/TARIFF_SELECTION_REGISTER.json',root))).selected;
for(const [from,to] of [['М-7 Волга','М-11 Нева'],['М-11 Нева','М-7 Волга']]){
 const rows=selected.filter(row=>row.road==='ckad'&&row.from===from&&row.to===to&&row.profile==='allDays');
 assert.equal(rows.length,1);assert.equal(rows[0].rub,941);assert.equal(rows[0].effectiveFrom,'2026-03-02T00:00:00+03:00');
}
const offlineCode=['estimate.ts','saved-samples.ts','saved-samples.test.ts','presentation.test.ts','practical-recovery.mjs','practical-recovery.test.mjs','torzhok-recovery.mjs','torzhok-recovery.test.mjs','finalize-recovery.mjs']
 .map(name=>({path:'experiments/toll-estimates/'+name,sha256:sha(readFileSync(new URL(name,import.meta.url)))}));
for(const c of [a.evidence.capture,t.capture])assert.equal(sha(readFileSync(new URL(c.path,root))),c.sha256,c.path);
for(const s of t.sourceEvidence)assert.equal(sha(readFileSync(new URL(s.path,root))),s.sha256,s.path);
const artifacts=readdirSync(folder).filter(name=>name!=='verification.json'&&name!=='metadata.exit').sort().map(name=>({path:name,bytes:raw(name).length,sha256:sha(raw(name))}));
console.log(JSON.stringify({date:'2026-10-30',node:str('production-build-node.version').trim(),
 source:{unitGateSha:str('verified-source.sha').trim(),productionBuildSha:str('production-build-source.sha').trim(),productionBuildTree:str('production-build-source.tree').trim(),
  protectedApplicationUnchangedComparedWith:'128807fb34f7b73a52cf999155489c40b739f9bd',evidence:'protected-source-unchanged.exit',currentOfflineProjectionCode:offlineCode},
 commands:{exits,focused:{pass:40,fail:0},offlineGate:{command:'npm run test:audit',pass:1047,fail:0,skip:1,skipReason:'Existing admitted real GeoNames GET integration requires GEONAMES_TEST_DIR; not executed, unrelated to toll experiment',quoteAndApiContracts:'PASS'},
  productionBuild:{command:'NEXT_TELEMETRY_DISABLED=1 node node_modules/next/dist/bin/next build --webpack',exit:exits['production-build'],nextVersion:'16.3.4',started:str('production-build.started').trim(),finished:str('production-build.finished').trim(),staticPages:'16/16',warnings:['existing preferredRegion deprecation']}},
 sourceStatus:{zsd600:{shadow:'estimated',rub:600,originalStrict:'priced/confirmed/600 unchanged',reason:'derived zone sum, no exact independent OD tariff'},
  arzamas:{destination:'Saint Petersburg Primorsky avenue, NOT Primorsk town',assessed:[6928,7268],full:[null,null],missing:'ZSD exact cash/card collection bundle'},
  torzhok:{destination:'Kazan',fullEstimated:[5904,6084],strictFull:[null,null],m12:'retained working pair, not new independent registration proof'}},
 originalSources,newFullEstimatedRoutes:1,newConfirmedFullTariffs:0,defaultEnabled:false,liveIntegration:false,push:false,productionChanged:false,
 providerCaptures:0,newFullRouteReplays:0,initialFailure:{file:'all-focused.log',exit:1,pass:36,fail:3,cause:'old presentation tests selected nonexistent confirmed real sample after honest ZSD assurance downgrade; repaired with explicit controlled UI fixture, not a fake real fare'},
 limitations:['No exact ZSD extended cash/card collection bundle; conditional900 is not an admitted fare/upper bound.',
  'No route to Primorsk town was captured or priced; saved case ends in Saint Petersburg.',
  'Torzhok full total is experimental estimate, not strict priced response or operator receipt.',
  'No UI, live adapter, Preview, CI or Production acceptance/publication performed. Prior build exit metadata remains unknown; this is a separately measured build.'],artifacts},null,2));
