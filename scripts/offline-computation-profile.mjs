import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {estimateTolls} from '../lib/tolls.ts';
import {recoverCorridorTolls} from '../lib/toll-recovery.ts';
import {composeRouteTolls} from '../lib/toll-engine/route-toll-composition.ts';
import {tollsForApi} from '../lib/v2-calculation/free-route-selection.ts';
import {valhalla} from '../lib/route-providers.ts';

const path='experiments/nationwide-tolls/source-snapshots/issue2-yeysk-maykop/2026-10-19/yeisk-to-moscow.json.gz';
const bytes=fs.readFileSync(path);
const captured=JSON.parse(zlib.gunzipSync(bytes));
const recorded=captured.calls.find(call=>new URL(call.url).pathname==='/route');
if(!recorded||recorded.status!==200)throw Error('saved provider response missing');
globalThis.fetch=async()=>new Response(recorded.text,{status:200});
const geometry=(await valhalla({label:'fixture origin',position:{lat:46.711524,lng:38.276451}},{label:'fixture destination',position:{lat:55.755819,lng:37.617644}},1)).coordinates;
if(!Array.isArray(geometry)||geometry.length<10)throw Error('saved geometry missing');
globalThis.fetch=async()=>{throw Error('network forbidden by offline profiler');};
const fixtures=[
 {id:'saved-long-eisk',kind:'real saved first Valhalla provider geometry; selection not asserted',coordinates:geometry},
 {id:'synthetic-short-prefix',kind:'synthetic workload slice; not a captured OD',coordinates:geometry.slice(0,50)},
 {id:'synthetic-medium-prefix',kind:'synthetic workload slice; not a captured OD',coordinates:geometry.slice(0,Math.ceil(geometry.length/3))},
 {id:'synthetic-complex-reverse',kind:'synthetic reversed workload; not a real route',coordinates:[...geometry].reverse()},
];
const validation={status:'toll',source:'Valhalla map matching',tollEdgeCount:1,checkedEdgeCount:1,wayIds:[],roadNames:[],message:'profiling only',complete:false,boothEventCoverage:'partial'};
const report={schemaVersion:1,node:process.version,source:path,sourceSha256:crypto.createHash('sha256').update(bytes).digest('hex'),warmup:2,repeats:10,networkRequests:0,limitations:['heap delta is noisy retained heap, not allocation peak','synthetic slices/reversal are workloads, not observed routes','provider decoding/direction matcher/full API pipeline not instrumented','multi-road and missing-tariff real fixture coverage pending'],fixtures:[]};
for(const fixture of fixtures){
 const tolls=estimateTolls(fixture.coordinates,'2026-10-22');
 const operations={geometryAndLegacyRecognition:()=>estimateTolls(fixture.coordinates,'2026-10-22'),corridorRecovery:()=>recoverCorridorTolls(fixture.coordinates,validation,'2026-10-22'),composition:()=>composeRouteTolls([{id:'m4',detected:true,tolls}]),apiSerialization:()=>JSON.stringify(tollsForApi(tolls,validation))};
 const results=[];
 for(const [name,fn]of Object.entries(operations)){
  for(let i=0;i<report.warmup;i++)fn();
  const samples=[];const before=process.memoryUsage().heapUsed;let expected;
  for(let i=0;i<report.repeats;i++){const started=performance.now();const result=fn();samples.push(performance.now()-started);const signature=JSON.stringify(result);if(i===0)expected=signature;else if(signature!==expected)throw Error('non-deterministic '+name);}
  samples.sort((a,b)=>a-b);results.push({name,calls:report.warmup+report.repeats,medianMs:samples[5],p95Ms:samples[9],heapDeltaBytes:process.memoryUsage().heapUsed-before,resultSha256:crypto.createHash('sha256').update(expected).digest('hex')});
 }
 report.fixtures.push({id:fixture.id,kind:fixture.kind,coordinateCount:fixture.coordinates.length,geometrySha256:crypto.createHash('sha256').update(JSON.stringify(fixture.coordinates)).digest('hex'),operations:results});
}
console.log(JSON.stringify(report,null,2));
