import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
import {validateM1M3Inventory, auditM1M3SelectedRoute as audit} from "./m1-m3-gate-evidence.mjs";
const original=JSON.parse(readFileSync(new URL("./m1-m3-official-gates.json",import.meta.url),"utf8"));
const clone=x=>structuredClone(x);
function trace(booths=[],overrides={}) { return {source:"Valhalla map matching",status:"toll",complete:true,
 boothEventCoverage:"complete",chunkCount:1,checkedChunkCount:1,failedChunkCount:0,
 tollBooths:booths,...overrides};}
const booth=(osmNodeId,roadNames,edgeToll=true)=>({osmNodeId,roadNames,edgeToll});
test("physical operator inventory contains exact four M1/M3 kilometre gates",()=>assert.deepEqual(original.gates.map(g=>g.id),["m1-pvp-46","m3-pvp-86","m3-pvp-136","m3-pvp-168"]));
test("no unverified OSM ID published as known",()=>assert.equal(original.gates.every(g=>g.verifiedOsmNodeIds.length===0),true));
test("inventory validator accepts complete four gates",()=>assert.equal(validateM1M3Inventory(original),true));
test("missing inventory gate is rejected",()=>{const x=clone(original);x.gates.pop();assert.throws(()=>validateM1M3Inventory(x))});
test("duplicate OSM node across plazas is rejected",()=>{const x=clone(original);x.gates[0].verifiedOsmNodeIds=["100"];x.gates[1].verifiedOsmNodeIds=["100"];assert.throws(()=>validateM1M3Inventory(x),/duplicate_osm_node/)});
test("M11 label does not count as M1",()=>assert.deepEqual(audit(original,trace([booth("111",["М-11: Москва"])]),"route").candidateRoads,[]));
test("M12 label does not count as M1",()=>assert.deepEqual(audit(original,trace([booth("111",["М-12"])]),"route").candidateRoads,[]));
test("true M1 booth name is candidate, not chargeable",()=>{const r=audit(original,trace([booth("101",["М-1 «Беларусь»"])]),"route");assert.deepEqual(r.candidateRoads,["m1"]);assert.equal(r.verifiedGates.length,0);assert.equal(r.strictPriceAllowed,false)});
test("true M3 booth name is candidate, not chargeable",()=>{const r=audit(original,trace([booth("101",["М-3 Украина"])]),"route");assert.deepEqual(r.candidateRoads,["m3"]);assert.equal(r.unmappedPaidNodes.length,1)});
test("a passing free edge is not a chargeable PVP event",()=>assert.deepEqual(audit(original,trace([booth("101",["М-3 Украина"],false)]),"route").candidateRoads,[]));
test("no route identity means unknown, never free",()=>assert.equal(audit(original,trace(),"").status,"unknown"));
test("missing map matching means no paid event proof",()=>assert.equal(audit(original,null,"r").status,"unknown"));
test("incomplete Valhalla chunks fail closed",()=>assert.equal(audit(original,trace([booth("123",["М-1"])],{complete:false}),"r").strictPriceAllowed,false));
test("partial event coverage fails closed",()=>assert.equal(audit(original,trace([booth("123",["М-1"])],{boothEventCoverage:"partial"}),"r").status,"unknown"));
test("unknown matched node cannot be treated as approved plaza",()=>assert.equal(audit(original,trace([booth("123",["М-3"]) ]),"r").verifiedGates.length,0));
test("pinned OSM node maps to corresponding physical gate in test-only approved fixture",()=>{const x=clone(original);x.gates[2].verifiedOsmNodeIds=["123"];const y=audit(x,trace([booth("123",["М-3 Украина"])]),"r");assert.equal(y.verifiedGates[0].id,"m3-pvp-136");assert.equal(y.strictPriceAllowed,false)});
test("wrong non-M1 road name can't claim pinned M3 if still no road continuity for pricing",()=>{const x=clone(original);x.gates[2].verifiedOsmNodeIds=["123"];const y=audit(x,trace([booth("123",["М-12 Восток"])]),"r");assert.equal(y.strictPriceAllowed,false)});
test("unknown M1 and M3 booths are both surfaced without false pricing",()=>{const y=audit(original,trace([booth("12",["М-1"]),booth("34",["М-3"])]),"r");assert.deepEqual(y.candidateRoads,["m1","m3"]);assert.equal(y.unmappedPaidNodes.length,2)});
test("duplicate same physical gate is rejected in pinned test fixture",()=>{const x=clone(original);x.gates[0].verifiedOsmNodeIds=["123","124"];const y=audit(x,trace([booth("123",["М-1"]),booth("124",["М-1"])]),"r");assert.equal(y.status,"unknown");assert.equal(y.reason,"duplicate_same_gate_in_selected_route")});
test("a complete trace with no M1/M3 gate is not certified free",()=>{const y=audit(original,trace(),"r");assert.equal(y.strictPriceAllowed,false);assert.equal(y.reason,"no_verifiable_m1_m3_booths")});
