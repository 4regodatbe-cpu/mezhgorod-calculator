import {readFileSync,writeFileSync} from 'node:fs';import{gunzipSync}from'node:zlib';import{createHash}from'node:crypto';
import{nearestSegment,facilityAnchors,MOSCOW_M11_ENTRY,haversineKm}from'@/lib/toll-engine/m11-moscow-geometry.ts';
const base='experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-moscow-head7171624764/';const physical=JSON.parse(readFileSync(base+'directed-gate.json'));
const path='experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/single-m11-torzhok-to-moscow/2026-10-16T01-56-26-781Z-capture.json.gz',bytes=readFileSync(path),r=JSON.parse(gunzipSync(bytes)).record,route=r.route.coordinates,block=r.route.m11RoadEvidence.strictBlocks[0];
const p58=nearestSegment(route,facilityAnchors('p58')),end=nearestSegment(route,[block.endCoordinate]),moscow=nearestSegment(route,[MOSCOW_M11_ENTRY]);
const hits=physical.orderedAnchors.map(a=>({...a,...nearestSegment(route,[a.coordinate])}));
const proof={status:'DONE_SOURCE_ONLY',capturePath:path,captureSha256:createHash('sha256').update(bytes).digest('hex'),hits,ordered:hits.every((h,i)=>!i||h.index>hits[i-1].index),p58,end,moscow,strictEndToMoscowKm:haversineKm(block.endCoordinate,MOSCOW_M11_ENTRY),gateEvent:r.validation.tollBooths.filter(g=>g.osmNodeId===physical.gateNodeId),newPricedComponents:0,networkRequestsInVerifier:0};
writeFileSync(base+'own-proof.json',JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));
