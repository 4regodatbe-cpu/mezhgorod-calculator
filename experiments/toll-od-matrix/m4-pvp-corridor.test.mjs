import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
import {validateM4PvpMatrix,quoteM4BySpan} from "./m4-pvp-corridor.mjs";
const actual=JSON.parse(readFileSync(new URL("./matrix/m4-pvp-corridors.json",import.meta.url),"utf8"));
const clone=o=>JSON.parse(JSON.stringify(o));
const source={kind:"synthetic-test-only",url:"https://example.org/test-fixture",effectiveFrom:"2026-10-01",effectiveTo:"2026-10-31"};
const cell=(endpoints,chain,monThu,friSun)=>({endpoints,acceptedChains:[chain],prices:{monThu,friSun},source});
const synthetic={...clone(actual),schemaVersion:2,spanCells:[
 cell(["m4-1184","m4-1223"],["m4-1184","m4-1223"],700,850),
 cell(["m4-1093","m4-1223"],["m4-1093","m4-1184","m4-1223"],850,1000)
]};
function request(sequence,period="monThu",date="2026-10-09"){
 return {routeId:"synthetic-r1",period,tariffDate:date,
  routeProof:{routeId:"synthetic-r1",status:"complete",sameSelectedGeometry:true,mainlineContinuity:"verified",reentryStatus:"not_observed",unknownCandidateCount:0,candidateCount:sequence.length,checkedCandidateCount:sequence.length},
  confirmedPvps:sequence.map((pvpId,i)=>({pvpId,status:"confirmed",routeId:"synthetic-r1",routeIndex:i+1,osmNodeId:"synthetic-node-"+i}))};
}
test("current matrix preserves the two user-accepted dated estimates",()=>{assert.equal(validateM4PvpMatrix(actual),true);assert.equal(actual.spanCells.length,2);assert(actual.spanCells.every(c=>c.source.acceptedByUserRule));});
test("unknown span has no price",()=>assert.equal(quoteM4BySpan(actual,request(["m4-1223","m4-1184"])).amountRub,null));
test("two-PVP span returns its precomputed weekday value",()=>assert.equal(quoteM4BySpan(synthetic,request(["m4-1184","m4-1223"])).amountRub,700));
test("two-PVP span returns its precomputed weekend value",()=>assert.equal(quoteM4BySpan(synthetic,request(["m4-1184","m4-1223"],"friSun")).amountRub,850));
test("three-PVP span returns its precomputed weekday value",()=>assert.equal(quoteM4BySpan(synthetic,request(["m4-1093","m4-1184","m4-1223"])).amountRub,850));
test("three-PVP span returns its precomputed weekend value",()=>assert.equal(quoteM4BySpan(synthetic,request(["m4-1093","m4-1184","m4-1223"],"friSun")).amountRub,1000));
test("reverse travel reuses the same span cell and amount",()=>assert.equal(quoteM4BySpan(synthetic,request(["m4-1223","m4-1184","m4-1093"],"friSun")).amountRub,1000));
test("extra endpoint PVP cannot reuse a shorter span price",()=>assert.equal(quoteM4BySpan(synthetic,request(["m4-1046","m4-1093","m4-1184","m4-1223"])).amountRub,null));
test("skipped intermediate PVP does not match a known span chain",()=>assert.equal(quoteM4BySpan(synthetic,request(["m4-1093","m4-1223"])).amountRub,null));
test("missing date version stays unknown",()=>assert.equal(quoteM4BySpan(synthetic,request(["m4-1093","m4-1184","m4-1223"],"monThu","2026-11-01")).amountRub,null));
test("same span versions cannot overlap",()=>{const m=clone(synthetic);m.spanCells.push({...clone(m.spanCells[1]),prices:{monThu:1,friSun:2}});assert.throws(()=>validateM4PvpMatrix(m),/overlapping_span_version/);});
test("the same span cannot change its proof chain across versions",()=>{const m=clone(synthetic);m.spanCells.push({...clone(m.spanCells[1]),acceptedChains:[["m4-1093","m4-1223"]],source:{...source,effectiveFrom:"2026-11-01",effectiveTo:"2026-12-31"}});assert.throws(()=>validateM4PvpMatrix(m),/span_chain_changed_between_versions/);});
test("unknown or partial geometry remains unknown",()=>{const r=request(["m4-1093","m4-1184","m4-1223"]);r.routeProof.unknownCandidateCount=1;assert.equal(quoteM4BySpan(synthetic,r).amountRub,null);});
test("repeated PVP event is rejected",()=>assert.equal(quoteM4BySpan(synthetic,request(["m4-1093","m4-1184","m4-1184","m4-1223"])).amountRub,null));
test("invalid cell endpoint order is rejected",()=>{const m=clone(synthetic);m.spanCells[0].endpoints.reverse();assert.throws(()=>validateM4PvpMatrix(m),/noncanonical_span_endpoints/);});
test("a price cell must contain exactly the two weekday/weekend values",()=>{const m=clone(synthetic);delete m.spanCells[0].prices.friSun;assert.throws(()=>validateM4PvpMatrix(m),/invalid_span_prices/);});
