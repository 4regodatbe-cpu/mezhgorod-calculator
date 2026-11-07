import{readFileSync,writeFileSync}from'node:fs';import{gunzipSync}from'node:zlib';
import{nearestSegment}from'@/lib/toll-engine/m11-moscow-geometry.ts';
const base=new URL('./',import.meta.url),exit=JSON.parse(readFileSync(new URL('physical-exit.json',base))),prefix=JSON.parse(readFileSync('experiments/nationwide-tolls/source-snapshots/ckad/2026-10-17-m11-m12-binding/physical-directed.json'));
const r=JSON.parse(gunzipSync(readFileSync('experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m11-ckad-torzhok-to-ramenskoe/2026-10-16T00-05-16-512Z-capture.json.gz'))).record;
const points=[...prefix.witnesses.slice(0,prefix.coreLastWitnessIndex+1),...exit.witnesses];const matches=points.map(p=>({...p,...nearestSegment(r.route.coordinates,[[p.lon,p.lat]])}));
const out={status:'DONE_SOURCE_ONLY',scope:'Own directed CKAD prefix plus independently sourced selected A107 exit, not tariff-point proof',prefixWitnesses:prefix.coreLastWitnessIndex+1,exitWitnesses:exit.witnesses.length,matches,ordered:matches.every((m,i)=>!i||m.index>matches[i-1].index),maxDistanceKm:Math.max(...matches.map(m=>m.distanceKm)),networkRequests:0,newPricedComponents:0};
writeFileSync(new URL('own-proof.json',base),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({status:out.status,prefix:out.prefixWitnesses,exit:out.exitWitnesses,ordered:out.ordered,maxDistanceKm:out.maxDistanceKm}));
if(!out.ordered||out.maxDistanceKm>.025)throw Error('Own geometry differs from source scope');
