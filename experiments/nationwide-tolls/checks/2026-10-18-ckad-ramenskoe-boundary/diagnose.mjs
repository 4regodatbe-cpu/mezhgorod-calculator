import{readFileSync,writeFileSync}from'node:fs';import{gunzipSync}from'node:zlib';import{createHash}from'node:crypto';
import{validateTollEdges}from'@/lib/toll-validator.ts';
import{resolveCkadProductBoundaries}from'@/lib/v3-calculation/ckad-product-boundaries.ts';
import{replayingFetch}from'../../scripts/systemic-audit-io.mjs';
const path='experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m11-ckad-torzhok-to-ramenskoe/2026-10-16T00-05-16-512Z-capture.json.gz';
const bytes=readFileSync(path),capture=JSON.parse(gunzipSync(bytes)),r=capture.record;
const replay=replayingFetch(capture.calls),old=globalThis.fetch;let attempts=0;globalThis.fetch=async(input,init)=>{attempts++;return replay.fetch(input,init);};
try{
 const rebuilt=await validateTollEdges(r.route.coordinates);
 const out={status:'DONE_OFFLINE_DIAGNOSIS_LOCAL_PENDING_SAVE',codeCommit:'ee7d1d4b4887315e9f80263daf3b9aa18bddcb33',capturePath:path,captureSha256:createHash('sha256').update(bytes).digest('hex'),materialVersionDifference:'Original validation predates ckadTraceBlocks; current parser replay is needed to inspect named entry/exit context. Same saved selected geometry and raw responses only.',originalBoundary:resolveCkadProductBoundaries(r.route.coordinates,r.route.m11RoadEvidence,r.validation),originalChunkCount:r.validation.chunkCount,rebuiltValidation:rebuilt,rebuiltBoundary:resolveCkadProductBoundaries(r.route.coordinates,r.route.m11RoadEvidence,rebuilt),mockRequests:attempts,replayMisses:replay.misses,realNetworkRequests:0};
 writeFileSync('experiments/nationwide-tolls/checks/2026-10-18-ckad-ramenskoe-boundary/diagnosis.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({status:out.status,original:out.originalBoundary,rebuilt:out.rebuiltBoundary,complete:rebuilt.complete,chunks:rebuilt.chunkCount,blocks:rebuilt.ckadTraceBlocks,mockRequests:attempts,misses:replay.misses}));
}finally{globalThis.fetch=old;}
