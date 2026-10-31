import{readFileSync,writeFileSync}from'node:fs';import{gunzipSync}from'node:zlib';import{createHash}from'node:crypto';
import{nearestSegment,haversineKm,facilityAnchors}from'@/lib/toll-engine/m11-moscow-geometry.ts';
const base=new URL('./',import.meta.url),physical=JSON.parse(readFileSync(new URL('directed-exit.json',base)));
const path='experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m11-ckad-torzhok-to-ramenskoe/2026-10-16T00-05-16-512Z-capture.json.gz';
const bytes=readFileSync(path),r=JSON.parse(gunzipSync(bytes)).record,route=r.route.coordinates,block=r.route.m11RoadEvidence.strictBlocks[0];
const matches=physical.sourceCorridor.map(p=>({...p,...nearestSegment(route,[p.coordinate])}));
const proof={status:'DONE_SOURCE_ONLY',capturePath:path,captureSha256:createHash('sha256').update(bytes).digest('hex'),complete:r.validation.complete,boothEventCoverage:r.validation.boothEventCoverage,
 ordered:matches.every((m,i)=>!i||m.index>matches[i-1].index),maxDistanceKm:Math.max(...matches.map(m=>m.distanceKm)),matches,
 strictEndToSourceFirstKm:haversineKm(block.endCoordinate,physical.strictJunction.coordinate),p58:nearestSegment(route,facilityAnchors('p58')),
 gate:r.validation.tollBooths.filter(g=>g.osmNodeId===physical.gateNodeId),newPricedComponents:0,networkRequestsInVerifier:0};
writeFileSync(new URL('own-proof.json',base),JSON.stringify(proof,null,2)+'\n');
if(!proof.ordered||proof.maxDistanceKm>.025||proof.strictEndToSourceFirstKm>.025||proof.gate.length!==1||proof.gate[0].wayId!==physical.gateWayId)throw Error('own source proof failed');
console.log(JSON.stringify({status:proof.status,ordered:proof.ordered,points:matches.length,maxDistanceKm:proof.maxDistanceKm,strictEndToSourceFirstKm:proof.strictEndToSourceFirstKm,p58:proof.p58,firstIndex:matches[0].index,gate:proof.gate}));
