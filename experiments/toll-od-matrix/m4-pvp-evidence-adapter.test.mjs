import assert from "node:assert/strict";
import {test} from "node:test";
import {adaptM4PlazaValidation} from "./m4-pvp-evidence-adapter.mjs";
function sample(){
 const checks=[
  {km:1184,status:"confirmed",evidence:"map_matching",routeProgressMeters:1000,matchedNodeIds:["n1184"],expectedNodeIds:["n1184"]},
  {km:1093,status:"confirmed",evidence:"map_matching",routeProgressMeters:2000,matchedNodeIds:["n1093"],expectedNodeIds:["n1093"]},
  {km:1046,status:"rejected",evidence:"map_matching",routeProgressMeters:3000,matchedNodeIds:[],expectedNodeIds:["n1046"]}
 ];
 return {routeId:"synthetic-r1",direction:"to_moscow",
  continuityEvidence:{routeId:"synthetic-r1",sameSelectedGeometry:true,mainlineContinuity:"verified",reentryStatus:"not_observed"},
  validation:{complete:true,candidateCount:3,checkedCandidateCount:3,unknownCount:0,confirmedCount:2,rejectedCount:1,checks,
    events:[{osmNodeId:"n1184",edgeToll:true},{osmNodeId:"n1093",edgeToll:true}]}};
}
test("maps matched booth events into ordered PVP IDs",()=>assert.deepEqual(adaptM4PlazaValidation(sample()).confirmedPvps.map(p=>p.pvpId),["m4-1184","m4-1093"]));
test("the adapter excludes rejected booth candidates",()=>assert.equal(adaptM4PlazaValidation(sample()).confirmedPvps.length,2));
test("proof route ID always retained",()=>assert.equal(adaptM4PlazaValidation(sample()).routeProof.routeId,"synthetic-r1"));
test("missing continuity proof rejected",()=>{const r=sample();r.continuityEvidence.mainlineContinuity="unknown";assert.equal(adaptM4PlazaValidation(r).status,"unknown")});
test("incomplete local validation rejected",()=>{const r=sample();r.validation.complete=false;assert.equal(adaptM4PlazaValidation(r).status,"unknown")});
test("unknown candidate rejected",()=>{const r=sample();r.validation.unknownCount=1;assert.equal(adaptM4PlazaValidation(r).status,"unknown")});
test("spatial fallback is not accepted as a charged PVP",()=>{const r=sample();r.validation.checks[0].evidence="route_traversal";assert.equal(adaptM4PlazaValidation(r).status,"unknown")});
test("event must match actual exact OSM node",()=>{const r=sample();r.validation.events[0].osmNodeId="other";assert.equal(adaptM4PlazaValidation(r).status,"unknown")});
test("matched edge must be toll",()=>{const r=sample();r.validation.events[0].edgeToll=false;assert.equal(adaptM4PlazaValidation(r).status,"unknown")});
test("duplicated PVP rejected",()=>{const r=sample();r.validation.checks[1].km=1184;assert.equal(adaptM4PlazaValidation(r).status,"unknown")});
test("same progress point rejected",()=>{const r=sample();r.validation.checks[1].routeProgressMeters=1000;assert.equal(adaptM4PlazaValidation(r).status,"unknown")});
test("wrong direction rejected",()=>{const r=sample();r.direction="to_krasnodar";assert.equal(adaptM4PlazaValidation(r).status,"unknown")});
