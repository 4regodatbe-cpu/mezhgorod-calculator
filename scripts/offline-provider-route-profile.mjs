import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {valhalla} from '../lib/route-providers.ts';

const sources={
 eisk:'experiments/nationwide-tolls/source-snapshots/issue2-yeysk-maykop/2026-10-19/yeisk-to-moscow.json.gz',
 maykop:'experiments/nationwide-tolls/source-snapshots/issue2-yeysk-maykop/2026-10-19/maykop-to-moscow.json.gz',
};
const savedProfiles={
 eisk:'docs/codebase-audit/computation-baseline.json',
 maykop:'docs/codebase-audit/computation-maykop-profile.json',
};
const report={schemaVersion:1,node:process.version,warmup:2,repeats:10,networkRequests:0,stage:'Valhalla saved response → bounded JSON parse, polyline decode, geometry validation and route evidence derivation',fixtures:[]};
const originalFetch=globalThis.fetch;
try {
 for(const [routeId,path] of Object.entries(sources)){
  const bytes=fs.readFileSync(path);
  const capture=JSON.parse(zlib.gunzipSync(bytes));
  const call=capture.calls.find(item=>new URL(item.url).pathname==='/route'&&item.status===200);
  if(!call?.text)throw Error(`saved Valhalla response missing: ${routeId}`);
  const profile=JSON.parse(fs.readFileSync(savedProfiles[routeId],'utf8'));
  const expected=profile.fixtures.find(item=>item.id===`saved-long-${routeId}`);
  if(!expected)throw Error(`geometry baseline missing: ${routeId}`);
  let calls=0;
  globalThis.fetch=async url=>{
   if(new URL(url).hostname!=='valhalla1.openstreetmap.de')throw Error('unexpected non-Valhalla request in offline profile');
   calls++;
   return new Response(call.text,{status:200,headers:{'content-type':'application/json'}});
  };
  const from={label:'saved fixture origin',position:{lat:46.711524,lng:38.276451}};
  const to={label:'saved fixture destination',position:{lat:55.755819,lng:37.617644}};
  const decode=async()=>valhalla(from,to,1);
  for(let i=0;i<report.warmup;i++)await decode();
  const samples=[];let geometrySha256='';let coordinateCount=0;
  for(let i=0;i<report.repeats;i++){
   const started=performance.now();
   const route=await decode();
   samples.push(performance.now()-started);
   const signature=JSON.stringify(route.coordinates);
   const sha=crypto.createHash('sha256').update(signature).digest('hex');
   if(i>0&&sha!==geometrySha256)throw Error(`non-deterministic provider route decode: ${routeId}`);
   geometrySha256=sha;coordinateCount=route.coordinates.length;
  }
  if(coordinateCount!==expected.coordinateCount||geometrySha256!==expected.geometrySha256)throw Error(`saved route decode differs from geometry fixture: ${routeId}`);
  if(calls!==report.warmup+report.repeats)throw Error(`unexpected mock fetch count: ${routeId} ${calls}`);
  samples.sort((a,b)=>a-b);
  report.fixtures.push({routeId,source:path,sourceSha256:crypto.createHash('sha256').update(bytes).digest('hex'),providerResponseSha256:crypto.createHash('sha256').update(call.text).digest('hex'),coordinateCount,geometrySha256,mockFetches:calls,medianMs:(samples[4]+samples[5])/2,p95Ms:samples[9],resultParity:'MATCH'});
 }
} finally {globalThis.fetch=originalFetch;}
if(report.fixtures.length!==2)throw Error('expected two saved provider fixtures');
report.networkRequests=0;
fs.writeFileSync('docs/codebase-audit/provider-route-decode-profile.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({output:'docs/codebase-audit/provider-route-decode-profile.json',fixtures:report.fixtures.map(({routeId,coordinateCount,medianMs,p95Ms,resultParity})=>({routeId,coordinateCount,medianMs,p95Ms,resultParity})),networkRequests:0},null,2));
