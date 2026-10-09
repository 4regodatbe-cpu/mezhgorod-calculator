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
test("M1 physical PVP still lacks independently verified OSM nodes",()=>assert.equal(original.gates.find(g=>g.roadId==="m1").verifiedOsmNodeIds.length,0));
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

test("live M3 OSM IDs independently resolved to named 86,136,168km operator gates",()=>{
 assert.deepEqual(original.gates.filter(g=>g.roadId==="m3").map(g=>g.verifiedOsmNodeIds[0]),["13294157951","4780909558","4780909555"]);
 assert.equal(original.gates.filter(g=>g.roadId==="m3").every(g=>g.osmEvidence?.tagBarrier==="toll_booth"&&g.locationConfidence==="osm_named_exact_operator"),true);
});
test("same-route exactly mapped live M3 paid crossings produce three physical gate identities, but not an approved fare",()=>{
 const b=[booth("13294157951",["М-3 Украина"]),booth("4780909558",["М-3 Украина"]),booth("4780909555",["М-3 Украина"])];
 const y=audit(original,trace(b),"real-route-moscow-kaluga");
 assert.equal(y.status,"physical_gate_nodes_matched");
 assert.deepEqual(y.verifiedGates.map(g=>g.id),["m3-pvp-86","m3-pvp-136","m3-pvp-168"]);
 assert.equal(y.unmappedPaidNodes.length,0);
 assert.equal(y.strictPriceAllowed,false);
});
test("reverse direction synthetic matching still cannot price without other lane proof",()=>{
 const y=audit(original,trace([booth("4780909555",["М-3"]),booth("4780909558",["М-3"]),booth("13294157951",["М-3"])]),"reverse-route");
 assert.deepEqual(y.verifiedGates.map(g=>g.km),[168,136,86]);
 assert.equal(y.strictPriceAllowed,false);
});
test("future editorial placeholder IDs cannot automatically become verified",()=>{
 const copy=clone(original);copy.gates.find(g=>g.roadId==="m3"&&g.km===136).verifiedOsmNodeIds=[];
 const y=audit(copy,trace([booth("4780909558",["М-3 Украина"])]),"route");
 assert.equal(y.verifiedGates.length,0);
 assert.equal(y.unmappedPaidNodes.length,1);
});

test("M3 physical PVPs have each two independent officially named OSM lane nodes",()=>{
 const gateNodes=original.gates.filter(x=>x.roadId==="m3").map(x=>({km:x.km,ids:x.verifiedOsmNodeIds}));
 assert.deepEqual(gateNodes,[{km:86,ids:["13294157951","13310936104"]},{km:136,ids:["4780909558","4780909557"]},{km:168,ids:["4780909555","4780909556"]}]);
 assert.equal(original.gates.filter(x=>x.roadId==="m3").every(x=>x.osmEvidence?.reverseLane?.tagBarrier==="toll_booth"),true);
});
test("independently verified reverse direction real Valhalla nodes match 168→136→86",()=>{
 const reverse=[
   booth("4780909556",["М-3 Украина"]),
   booth("4780909557",["М-3 Украина"]),
   booth("13310936104",["М-3 Украина"])
 ];
 const x=audit(original,trace(reverse),"caluga-to-moscow-selected");
 assert.equal(x.status,"physical_gate_nodes_matched");
 assert.deepEqual(x.verifiedGates.map(g=>g.id),["m3-pvp-168","m3-pvp-136","m3-pvp-86"]);
 assert.equal(x.unmappedPaidNodes.length,0);
 assert.equal(x.strictPriceAllowed,false);
});
test("a repeat crossing of a same plaza in opposite lanes invalidates one continuous M3 fare",()=>{
 const x=audit(original,trace([
 booth("4780909558",["М-3 Украина"]),
 booth("4780909557",["М-3 Украина"])
 ]),"unsafe-u-turn");
 assert.equal(x.status,"unknown");
 assert.equal(x.reason,"duplicate_same_gate_in_selected_route");
});
