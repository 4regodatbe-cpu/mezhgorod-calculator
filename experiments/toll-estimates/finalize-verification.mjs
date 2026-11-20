// Repair/verify metadata only. No test, build, route or network execution.
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const folder=new URL('./checks/2026-10-30/',import.meta.url);
const raw=name=>readFileSync(new URL(name,folder));
const str=name=>raw(name).toString('utf8');
const digest=b=>createHash('sha256').update(b).digest('hex');
const audit=str('e5-offline-gate.log'),build=str('e5-build.log'),prototype=str('e5-prototype-tests-final.log');
for(const s of ['pass 1047','fail 0','skipped 1','PASS quote:','PASS API adapter:'])assert.ok(audit.includes(s),s);
for(const s of ['Next.js 16.3.4','Compiled successfully','Finished TypeScript','(16/16)','Finalizing page optimization','Collecting build traces','Route (app)','/v3'])assert.ok(build.includes(s),s);
assert.match(prototype,/pass 28/u);assert.match(prototype,/fail 0/u);
const projectTscExit=Number(process.argv[2]);assert.equal(projectTscExit,0,'independently captured project TypeScript exit');
const samples=JSON.parse(str('e3-samples.json'));assert.deepEqual(samples.countsAtSavedDeparture,{confirmed:1,estimated:1,unknown:1});
const projectRoot=new URL('../../',import.meta.url);
for(const s of samples.sources)assert.equal(digest(readFileSync(new URL(s.path,projectRoot))),s.sha256,s.path);
for(const sample of samples.samples){assert.equal(sample.geometryUnchanged,true);assert.equal(sample.result.strict.amount,sample.strictTotalRub);}
const e1=JSON.parse(str('e1-map-controls.json'));assert.ok(e1.cases.every(c=>c.newObservedUi===null&&c.status==='BLOCKED_MAP_ALIGNMENT'));
const artifacts=readdirSync(folder).filter(name=>name!=='e5-gate-status.json').sort().map(name=>({path:name,bytes:raw(name).length,sha256:digest(raw(name))}));
console.log(JSON.stringify({date:'2026-10-30',sourceSha:'86185310a3bd2ef9d3028fe8666b1756233a0ba6',node:process.version,
 commands:{prototypeTests:{distinctTests:28,pass:28,fail:0,recordedCombinedCommandExit:0},
  offlineGate:{command:'npm run test:audit',tests:1048,pass:1047,fail:0,skip:1,status:'complete_pass_log_evidence',originalExitCode:null},
  projectTypeScript:{command:'node node_modules/typescript/bin/tsc --noEmit',reverifiedExitCode:projectTscExit,originalExitCode:null},
  productionBuild:{command:'NEXT_TELEMETRY_DISABLED=1 node node_modules/next/dist/bin/next build --webpack',status:'complete_success_log_evidence',nextVersion:'16.3.4',staticPages:'16/16',originalExitCode:null,
   warnings:['existing preferredRegion deprecation']}},
 metadataFailure:{overallOriginalShellExit:1,cause:'post-check inline JSON writer syntax error; original per-command exits not persisted',detail:'e5-status-writer-failure.md',heavyAuditOrBuildRerun:false},
 sampleCounts:samples.countsAtSavedDeparture,distinctSavedRoutes:3,multiRoadRoutes:2,previouslyUnknownRoutesNewlyGivenNumericTotal:0,
 defaultEnabled:false,liveIntegration:false,networkRouteReplays:0,
 limitations:['E1fresh browser controls timed out; no exact detour cause established.',
  'Original gate/build exit codes are unknown; success claimed only on complete retained logs, not fabricated exit0.',
  'Local HTML/viewmodel is not real browser, Preview or Production acceptance.',
  'No functional claim about all B01–B12 or all unknown tariff products.'],artifacts},null,2));
