import assert from "node:assert/strict";
import {test} from "node:test";
import {inspectM4PvpPreview as inspect} from "./m4-pvp-preview.mjs";
import {readFileSync} from "node:fs";
const matrix=JSON.parse(readFileSync(new URL("./matrix/m4-pvp-corridors.json",import.meta.url),"utf8"));
matrix.spanCells=[]; // Empty-catalog regression fixture is separate from the seeded source snapshot.
const clone=o=>JSON.parse(JSON.stringify(o));
function validation(kms=[1093,1184,1223]){
 const checks=kms.map((km,i)=>({km,status:"confirmed",evidence:"map_matching",matchedNodeIds:["osm-"+km],expectedNodeIds:["osm-"+km],routeProgressMeters:10000*i}));
 return {complete:true,candidateCount:kms.length,checkedCandidateCount:kms.length,unknownCount:0,confirmedCount:kms.length,rejectedCount:0,checks,events:kms.map(km=>({osmNodeId:"osm-"+km,edgeToll:true}))};
}
const continuityEvidence={routeId:"test",sameSelectedGeometry:true,mainlineContinuity:"verified",reentryStatus:"not_observed"};
const options={routeId:"test",continuityEvidence,period:"friSun",tariffDate:"2026-10-09"};
test("empty span catalog never invents a fare",()=>{const x=inspect(matrix,validation(),options);assert.equal(x.priceRub,null);assert.equal(x.reason,"no_exact_verified_span_price");});
test("full ordered PVP evidence is reported",()=>assert.deepEqual(inspect(matrix,validation(),options).confirmedPvps,["m4-1093","m4-1184","m4-1223"]));
test("preview remains diagnostic only",()=>assert.equal(inspect(matrix,validation(),options).diagnosticOnly,true));
test("missing validation is unknown",()=>assert.equal(inspect(matrix,null,options).status,"unknown"));
test("zero gates cannot be labelled free",()=>{const v=validation();v.candidateCount=0;assert.equal(inspect(matrix,v,options).reason,"m4_no_toll_gate_candidates")});
test("unmatched gate cannot create a span",()=>{const v=validation();v.checks[1].evidence="route_traversal";assert.equal(inspect(matrix,v,options).reason,"weak_or_unmatched_gate_evidence")});
test("partial validation stays unknown",()=>{const v=validation();v.unknownCount=1;v.complete=false;assert.equal(inspect(matrix,v,options).reason,"incomplete_pvp_validation")});
test("reverse route direction is derived from the same gate evidence",()=>assert.equal(inspect(matrix,validation([1223,1184,1093]),options).direction,"to_moscow"));
test("both directions resolve the same span amount",()=>{
 const m=clone(matrix);m.spanCells=[{endpoints:["m4-1093","m4-1223"],acceptedChains:[["m4-1093","m4-1184","m4-1223"]],prices:{monThu:850,friSun:1000},source:{kind:"synthetic",url:"https://example.org",effectiveFrom:"2026-01-01",effectiveTo:null}}];
 const a=inspect(m,validation(),options),b=inspect(m,validation([1223,1184,1093]),options);
 assert.equal(a.priceRub,1000);assert.equal(b.priceRub,1000);
});
test("continuity proof is still required for a span quote",()=>{const v=validation();const x=inspect(matrix,v,{...options,continuityEvidence:null});assert.equal(x.priceRub,null);assert.equal(x.reason,"route_continuity_not_verified")});
