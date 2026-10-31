// H4 document/data comparison only. No pricing engine, fetch, browser or Git execution.
import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const dir='experiments/toll-estimates/stage-h4-2026-10-31/';
const imported=dir+'imported/stage_g_reconstruction_2026-10-31/';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

export function compare(){
 const input=read(dir+'input-validation.json');
 for(const f of input.files)assert.equal(sha(f.localPath),f.sha256);
 assert.equal(sha(dir+'stage_g_reconstruction_2026-10-31.zip'),input.archiveSha256);
 const a=read(imported+'component-analysis.reconstructed.json');
 const source=fs.readFileSync(imported+'source/YANDEX_PAID_ROADS_REPORT_2026-10-31.md','utf8');
 const f=read('experiments/toll-estimates/checks/2026-10-30-integration/f4-cases.json');
 const h=read('experiments/toll-estimates/stage-h2-2026-10-31/reconciliation.json');
 const miles=[660,1280,1240,730],durations=[40560,91680,85860,41760];
 const records=a.routes.map((r,i)=>{
  const prior=f.results.find(v=>v.caseId===r.case_id);assert.ok(prior);
  assert.equal(sha(prior.capture.path),prior.capture.sha256);
  const capture=JSON.parse(zlib.gunzipSync(fs.readFileSync(prior.capture.path)));
  const {spec,route}=capture.record;
  const from=[spec.from.position.lat,spec.from.position.lng],to=[spec.to.position.lat,spec.to.position.lng];
  assert.deepEqual(r.from_lat_lon,from);assert.deepEqual(r.to_lat_lon,to);
  assert.equal(r.project_distance_km,route.meters/1000);
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(route.coordinates)).digest('hex'),prior.geometrySha256);
  const query=new URL(r.yandex_url).searchParams.get('rtext').split('~').map(s=>s.split(',').map(Number));
  const urlRoundingErrorDegrees=Math.max(...query.flatMap((point,j)=>point.map((n,k)=>Math.abs(n-[from,to][j][k]))));
  assert.ok(urlRoundingErrorDegrees<1.01e-7,'Only source URL rounding, never different destination');
  const partial=!!r.project_estimated_partial_rub;
  const amounts=partial?r.project_estimated_partial_rub:r.project_estimate_rub;
  assert.deepEqual([amounts.weekday,amounts.saturday],prior.rows.map(v=>partial?v.knownPartRub:v.totalRub));
  return {caseId:r.case_id,fromLatLon:from,toLatLon:to,yandexUrl:r.yandex_url,urlRoundingErrorDegrees,
   endpointsMatchSavedEF:true,savedGeometrySha256:prior.geometrySha256,projectDistanceKm:route.meters/1000,
   reportedYandexDistanceMiles:miles[i],reportedYandexDistanceKmApprox:r.yandex_distance_km_approx,
   milesToKm:miles[i]*1.609344,reportedYandexDurationSeconds:durations[i],
   observationDate:a.observation.date,departureMode:a.observation.departure_mode,reportedObservationWindowMoscow:'~10:25–10:27, as source report; not individual route timestamps',
   vehicle:a.observation.vehicle,transponder:a.observation.transponder,chargeTimeBasis:'Reported Yandex price at departure from toll section',
   reportedYandexTotal:r.yandex_whole_route_rub_approx,ourHistoricDates:a.observation.comparison_tariff_dates,
   ourHistoricAmounts:amounts,ourAmountIsPartial:partial,
   diagnosticYandexMinusHistoric:r.yandex_whole_route_rub_approx===null?null:{weekday:r.yandex_whole_route_rub_approx-amounts.weekday,saturday:r.yandex_whole_route_rub_approx-amounts.saturday},
   exactPolylineMatch:false,entryExitPaymentMatch:false,sameTariffDate:false,screenshotFilesAvailable:false,
   reportedGeometryGrade:r.geometry_status,externalDataGrade:'reported_external_whole_route_estimate_not_operator_tariff',
   currentCalculatorStatus:prior.rows.map(v=>({departureAt:v.departureAt,strict:v.strict.pricingStatus,estimate:v.status,total:v.totalRub,assessed:v.knownPartRub})),
   runtimeAdmission:false,tollDifferenceAssignedToRoad:false,ferryReported:i===0};
 });
 const findings=[
  {id:'H4-DATA-01',kind:'historical_source_version',source:'Source report Granitnoe paragraph describes an older strict unknown due to M4/ZSD.',current:'F has strict numeric9534/11184 and estimated overlay; M4/ZSD600 remain working-grade. Preserve report, use F/H2 for current status.',blocksDocumentaryImport:false},
  {id:'H4-DATA-02',kind:'stale_missing_components_and_subtotal_label',source:'Source report calls Arzamas6928/7268 known and lists head/CKAD/unmapped booth as unresolved; reconstruction keeps a generic unmapped component caveat.',current:'H2 assessed part contains recovered head280/320 plus estimated CKAD941; only ZSD missing in this saved assessed composition. No new unknown booth demonstrated. Do not reopen old findings or label all6928/7268 confirmed.',blocksDocumentaryImport:false},
  {id:'H4-LIMIT-01',kind:'geometric_and_temporal_limit',source:'Visual corridor and rounded length only; exact polyline0, dates differ, payment gates unverified; Torzhok ferry/no price.',current:'Endpoints now match saved EF, but that does not establish toll-path equality. No difference assigned to a road or runtime quote.',blocksRuntimeAdmission:true},
  {id:'H4-LIMIT-02',kind:'provenance_limit',source:'No independent screenshot binaries, original G tree/parents/tests or original JSON hashes in archive.',current:'New RECONSTRUCTED documentary lineage only; archive-reported7 assertions are not H4 test results.',blocksOriginalGHistoryClaim:true}
 ];
 assert.ok(source.includes('Известная часть 6 928')&&source.includes('0 полилиний'));
 const arz=records.find(r=>r.caseId===h.caseId);
 assert.equal(arz.ourHistoricAmounts.saturday,h.rows[1].assessedSubtotal);
 return {identity:'H4_RECONSTRUCTED_NOT_ORIGINAL_G',status:'DOCUMENTARY_COMPARISON_COMPLETE_WITH_RECORDED_LIMITS',records,findings,
  arzamasCurrent:{label:'оценённая часть 6 928/7 268 ₽',assessed:h.rows.map(r=>r.assessedSubtotal),confirmedGrade:h.rows.map(r=>r.confirmedGradeSubtotal),estimatedM12:1713,estimatedCkad:941,estimatedSubtotal:2654,priceSourceKnown:true,routeApplicationGrade:'working_estimate',missing:['zsd'],zsd:null,full:null,conditionalSaturdayDifference:2085,conditionalDifferenceIsZsdTariff:false},
  inputBlockerClosed:true,originalGRecovered:false,originalGAncestryEstablished:false,newYandexRequests:0,newRouteAudits:0,h2TestsRepeated:false,
  publication:{documentarySequenceReadyForSeparateReview:true,originalFGHHistoryRestored:false,externalEstimatesRuntimeReady:false,pushAuthorized:false,previewOrProductionAcceptanceClaim:false},
  note:'Read supplied report/archive and saved E/F/H2 only; source files preserved. Conditional arithmetic is not proof of a toll product.'};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const result=compare();fs.writeFileSync(dir+'comparison.json',JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({status:result.status,records:result.records.length,findings:result.findings.length,documentaryReady:result.publication.documentarySequenceReadyForSeparateReview,runtimeAdmission:false}));
}
