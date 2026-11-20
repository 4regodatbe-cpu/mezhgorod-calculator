// Evidence-only finalizer: no tests/builds/routing/network or environment mutation.
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {tollEstimateEnabled} from '../../lib/v3-calculation/toll-estimate-switch.ts';
const root=new URL('../../',import.meta.url),folder=new URL('./checks/2026-10-30-integration/',import.meta.url);
const raw=name=>readFileSync(new URL(name,folder)),str=name=>raw(name).toString('utf8');
const hash=b=>createHash('sha256').update(b).digest('hex');
const labels=['f5-typecheck','f5-lint-final','f5-focused','f5-offline-gate-final','f5-build','f5-loader-targeted-final','f5-loader-lint','f5-build-app-equivalence','f5-pure-core-equivalence'];
const exits=Object.fromEntries(labels.map(name=>{const value=str(name+'.exit').trim();assert.equal(value,'0',name);return [name,Number(value)];}));
assert.equal(str('f5-offline-gate.exit').trim(),'1','initial failed gate must remain preserved');
assert.equal(str('f4-tests.exit').trim(),'1','initial whole/component test mistake retained');
const statistic=(log,key)=>{const m=log.match(new RegExp('^ℹ '+key+' (\\d+)','mu'));assert.ok(m,key);return Number(m[1]);};
const target=str('f5-focused.stdout.log'),gate=str('f5-offline-gate-final.stdout.log'),oldGate=str('f5-offline-gate.stdout.log'),loader=str('f5-loader-targeted-final.stdout.log');
assert.equal(statistic(target,'pass'),53);assert.equal(statistic(target,'fail'),0);
assert.equal(statistic(gate,'pass'),1057);assert.equal(statistic(gate,'fail'),0);assert.equal(statistic(gate,'skipped'),1);
assert.equal(statistic(oldGate,'pass'),1043);assert.equal(statistic(oldGate,'fail'),10);
assert.equal(statistic(loader,'pass'),14);assert.equal(statistic(loader,'fail'),0);
for(const s of ['PASS quote:','PASS API adapter:'])assert.ok(gate.includes(s),s);
const build=str('f5-build.stdout.log');
for(const s of ['Next.js 16.3.4','Compiled successfully','Finished TypeScript','(16/16)','Collecting build traces','Route (app)','/v3'])assert.ok(build.includes(s),s);
assert.match(str('f5-lint-final.stdout.log'),/0 errors, 7 warnings/u);
assert.equal(tollEstimateEnabled({}),false);assert.equal(tollEstimateEnabled({VERCEL_ENV:'production',NODE_ENV:'test',V3_TOLL_ESTIMATE:'1'}),false);
const controls=JSON.parse(str('f4-cases.json'));assert.equal(controls.results.length,4);assert.equal(controls.externalRequests,0);assert.equal(controls.guards.status,'PASS');
const expected=[[5904,6084],[10464,12334],[9534,11184],[null,null]],known=[[5904,6084],[10464,12334],[9534,11184],[6928,7268]];
for(const [i,c] of controls.results.entries()){
 assert.equal(c.status,'PASS');assert.equal(c.geometryUnchanged,true);assert.equal(c.strictUnchanged,true);
 assert.deepEqual(c.rows.map(r=>r.totalRub),expected[i]);assert.deepEqual(c.rows.map(r=>r.knownPartRub),known[i]);
 assert.equal(hash(readFileSync(new URL(c.capture.path,root))),c.capture.sha256);
 if(i===2)for(const row of c.rows){assert.equal(row.components.find(p=>p.id==='zsd').rub,600);assert.ok(row.warnings.some(w=>w.includes('ЗСД: 600 ₽')));}
}
const nftPath='.next/server/app/api/v3/calculate/route.js.nft.json',nftRaw=readFileSync(new URL(nftPath,root)),nft=JSON.parse(nftRaw);
const forbidden=nft.files.filter(p=>/toll-estimates\/(?:saved-samples|practical-recovery|torzhok-recovery|integration-cases|checks)|systemic-road-audit|junction-atlas/u.test(p));assert.deepEqual(forbidden,[]);
const code=['experiments/toll-estimates/estimate.ts','lib/toll-estimate-view.ts','lib/v3-calculation/toll-estimate-switch.ts','lib/v3-calculation/toll-estimate-adapter.ts',
 'lib/v3-calculation/route-leg-pricing.ts','lib/v3-calculation/route-leg.ts','lib/v3-calculation/special-options.ts','app/api/v3/calculate/route.ts',
 'app/v2/components/types.ts','app/v2/components/route-card.tsx','app/v3/components/response-validation.ts','app/v3/components/use-v3-calculation.ts',
 'scripts/v3-api-audit.test.ts','scripts/v2-unknown-result-render.test.mjs','scripts/v3-result-render-audit.test.mjs','scripts/v3-hook-race-audit.test.mjs',
 'lib/v3-calculation/toll-estimate-adapter.test.ts','lib/v3-calculation/toll-estimate-ui.test.ts','experiments/toll-estimates/integration-cases.test.ts'];
const sources=code.map(path=>({path,sha256:hash(readFileSync(new URL(path,root)))}));
const artifacts=readdirSync(folder).filter(n=>n!=='verification.json'&&n!=='metadata.exit').sort().map(path=>({path,bytes:raw(path).length,sha256:hash(raw(path))}));
console.log(JSON.stringify({dateMsk:'2026-10-30',status:'LOCAL_READY_FOR_SEPARATE_PREVIEW_PERMISSION',blocks:{F1:'DONE_LOCAL',F2:'DONE_LOCAL',F3:'DONE_LOCAL',F4:'DONE_LOCAL',F5:'DONE_LOCAL'},
 node:str('f5-node.version').trim(),sources:{initialVerifiedSha:str('f5-source.sha').trim(),initialTree:str('f5-source.tree').trim(),finalGateSha:str('f5-retry-source.sha').trim(),finalGateTree:str('f5-retry-source.tree').trim(),files:sources},
 checks:{exits,focused:{pass:53,fail:0},fullOfflineGate:{pass:1057,fail:0,skip:1,contracts:'PASS',skipReason:'Existing real admitted-GeoNames GET requires GEONAMES_TEST_DIR; not executed, not PASS'},
  loaderRegression:{pass:14,fail:0,assertionsWeakened:false},eslint:{errors:0,warnings:7},
  build:{exit:0,next:'16.3.4',source:str('f5-source.sha').trim(),started:str('f5-build.started').trim(),finished:str('f5-build.finished').trim(),staticPages:'16/16',
   reusedAfterTestOnlyRepair:true,appSourceEquivalenceExit:exits['f5-build-app-equivalence'],warning:'preferredRegion deprecated',note:'Whole Git trees differ; only identical application/config/data/dependency source is claimed built. stdout/stderr separate.'},
  runtimeTrace:{manifest:nftPath,sha256:hash(nftRaw),files:nft.files.length,offlineFixtureDependencies:forbidden}},
 controlCases:controls.results.map(c=>({caseId:c.caseId,capture:c.capture,geometrySha256:c.geometrySha256,legacyStrictUnchanged:c.strictUnchanged,rows:c.rows.map(r=>({departureAt:r.departureAt,status:r.status,totalRub:r.totalRub,knownPartRub:r.knownPartRub,warnings:r.warnings}))})),
 guards:controls.guards,defaultEnabled:false,productionHardDenied:true,previewFlag:'V3_TOLL_ESTIMATE=1, VERCEL_ENV=preview, exact permitted VERCEL_GIT_COMMIT_REF',
 strictAlgorithmChanged:false,tariffMatrixChanged:false,routeGeometryChanged:false,kilometrePricingChanged:false,fastestSelectionChanged:false,
 push:false,deployment:false,ciRunStarted:false,browserPreviewAcceptance:false,
 preservedFailures:[{exit:2,file:'f3-typecheck.log',cause:'JS coverageKeys union, fixed by property narrowing'},
  {exit:1,file:'f4-tests.log',cause:'Test incorrectly expected wholeGran600;600 is only ZSD component, full strict9534/11184 preserved'},
  {exit:1,file:'f5-offline-gate.stdout.log',pass:1043,fail:10,cause:'Three old VM loaders lacked real @/ TS alias support; fixed tests only, no assertion weakening'}],
 limitations:['No push/Preview/Production or real browser/cloud acceptance performed.',
  'Extra CKAD M11/M7 working binding needs selected provider decoded sections and complete trace; unsupported metadata stays unknown, no slower route substitution.',
  'M12 registration-boundary and ZSD source-derived component warnings remain; exact extended ZSD bundle is unresolved.',
  'Named saved samples/captures are tests only; Gran600 is a component, never the complete trip.',
  'Independent address live street/Photon/mobile/hosted D1 acceptance tasks are not closed by F.'],artifacts},null,2));
