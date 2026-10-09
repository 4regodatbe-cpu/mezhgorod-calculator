import assert from "node:assert/strict";
import {test} from "node:test";
import {inspectM4PvpPreview as inspect} from "./m4-pvp-preview.mjs";
import {readFileSync} from "node:fs";
const matrix=JSON.parse(readFileSync(new URL("./matrix/m4-pvp-corridors.json",import.meta.url),"utf8"));
function v() {
 const kms=[1093,1184,1223];const checks=kms.map((km,i)=>({km,status:"confirmed",evidence:"map_matching",matchedNodeIds:["osm-"+km],expectedNodeIds:["osm-"+km],routeProgressMeters:10_000*i}));
 return {complete:true,candidateCount:3,checkedCandidateCount:3,unknownCount:0,confirmedCount:3,rejectedCount:0,checks,events:kms.map(km=>({osmNodeId:"osm-"+km,edgeToll:true}))};
}
test("empty tariff database never quotes invented price",()=>{const x=inspect(matrix,v());assert.equal(x.priceRub,null);assert.equal(x.reason,"no_verified_complete_m4_pvp_tariffs")});
test("full ordered PVP sequence is reported",()=>assert.deepEqual(inspect(matrix,v()).confirmedPvps,["m4-1093","m4-1184","m4-1223"]));
test("report explicitly remains diagnostic only",()=>assert.equal(inspect(matrix,v()).diagnosticOnly,true));
test("missing validation is unknown",()=>assert.equal(inspect(matrix,null).status,"unknown"));
test("no gates is not a free route assertion",()=>{const a=v();a.candidateCount=0;assert.equal(inspect(matrix,a).reason,"m4_no_toll_gate_candidates")});
test("an unverified gate cannot generate exact PVP signature",()=>{const a=v();a.checks[1].evidence="route_traversal";assert.equal(inspect(matrix,a).reason,"weak_or_unmatched_gate_evidence")});
test("partial validation remains unknown",()=>{const a=v();a.unknownCount=1;a.complete=false;assert.equal(inspect(matrix,a).reason,"incomplete_pvp_validation")});
test("monotonic southbound direction recognized",()=>assert.equal(inspect(matrix,v()).direction,"to_krasnodar"));
test("even if a tariff cell is added, absent independently verified full continuity blocks price",()=>{
 const augmented={...matrix,priceCells:[{direction:"to_krasnodar",sequence:["m4-1093","m4-1184","m4-1223"],context:{mixed401:"not_used",mixed633:"not_used"},prices:{monThu:111,friSun:222},source:{kind:"official_verified_corridor",url:"https://avtodor-tr.ru/",effectiveFrom:"2026-10-01",effectiveTo:"2026-12-31"}}]};
 const q=inspect(augmented,v(),{routeId:"test",profile:"monThu",tariffDate:"2026-10-09",tariffContext:{routeId:"test",verified:true,mixed401:"not_used",mixed633:"not_used"}});
 assert.equal(q.priceRub,null);assert.equal(q.reason,"route_continuity_not_verified");
});
