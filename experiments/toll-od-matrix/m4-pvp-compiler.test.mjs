import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
import {compileVerifiedM4Tariffs} from "./m4-pvp-compiler.mjs";
import {quoteM4BySpan} from "./m4-pvp-corridor.mjs";
const matrix=JSON.parse(readFileSync(new URL("./matrix/m4-pvp-corridors.json",import.meta.url),"utf8"));
const empty=JSON.parse(readFileSync(new URL("./matrix/m4-verified-source-intake.json",import.meta.url),"utf8"));
const clone=x=>JSON.parse(JSON.stringify(x));
const chain=["m4-1093","m4-1184","m4-1223"];
function record(id="span-1093-1223",start="2026-10-01",end="2026-10-31",seq=chain){
 return {id,routeId:"test-route",endpoints:[seq[0],seq.at(-1)],chains:[{sequence:seq,charges:seq.map((pvpId,i)=>({pvpId,parts:[{sourceRowId:"row-"+i,monThu:200,friSun:250}]}))}],
  proof:{routeId:"test-route",sameSelectedGeometry:true,completePvpCoverage:true,continuousMainline:true,reentryStatus:"not_observed",reviewedBy:"manual_checked",reviewedAt:"2026-10-09"},
  source:{category:"I",payment:"no_transponder",effectiveFrom:start,effectiveTo:end,capturedAt:"2026-10-09",documentId:"SYNTHETIC-TEST-NOT-SOURCE",url:"https://avtodor-tr.ru/road/tariffs/"}};
}
const go=records=>compileVerifiedM4Tariffs(matrix,{schemaVersion:2,systemId:"m4-don",records});
const request=(compiled,seq,period="monThu",date="2026-10-15")=>quoteM4BySpan(compiled,{routeId:"test-route",period,tariffDate:date,
 routeProof:{routeId:"test-route",status:"complete",sameSelectedGeometry:true,mainlineContinuity:"verified",reentryStatus:"not_observed",unknownCandidateCount:0,candidateCount:seq.length,checkedCandidateCount:seq.length},
 confirmedPvps:seq.map((pvpId,i)=>({pvpId,routeId:"test-route",status:"confirmed",routeIndex:i+1,osmNodeId:"node-"+i}))});
test("real intake remains empty and creates no unsupported price",()=>{assert.equal(empty.records.length,0);assert.equal(go(empty.records).spanCells.length,0)});
test("offline compiler sums tariff components once into two span prices",()=>{const c=go([record()]);assert.deepEqual(c.spanCells[0].prices,{monThu:600,friSun:750})});
test("same compiled span quote works in either direction",()=>{const c=go([record()]);assert.equal(request(c,chain,"friSun").amountRub,750);assert.equal(request(c,[...chain].reverse(),"friSun").amountRub,750)});
test("an optional route-level control is checked when supplied",()=>{const r=record();r.routeControl={monThu:600,friSun:750};assert.equal(go([r]).spanCells.length,1)});
test("a route-level control is not required to compile verified row sums",()=>assert.equal(go([record()]).spanCells.length,1));
test("a conflicting optional control is rejected",()=>{const r=record();r.routeControl={monThu:601,friSun:750};assert.throws(()=>go([r]),/route_control_mismatch/)});
test("same endpoints may list multiple verified chains only at equal totals",()=>{const r=record();const alt=["m4-1093","m4-1223"];r.chains.push({sequence:alt,charges:alt.map((pvpId,i)=>({pvpId,parts:[{sourceRowId:"alt-"+i,monThu:300,friSun:375}]}))});assert.equal(go([r]).spanCells[0].acceptedChains.length,2)});
test("different totals for same endpoint span rejected",()=>{const r=record();const seq=["m4-1093","m4-1223"];r.chains.push({sequence:seq,charges:seq.map((pvpId,i)=>({pvpId,parts:[{sourceRowId:"different-"+i,monThu:300,friSun:375}]}))});assert.throws(()=>go([r]),/different_chain_cost_for_same_span/)});
test("missing PVP fee row is rejected",()=>{const r=record();r.chains[0].charges.pop();assert.throws(()=>go([r]),/charge_chain_mismatch/)});
test("wrong chain endpoints rejected",()=>{const r=record();r.endpoints=["m4-1184","m4-1223"];assert.throws(()=>go([r]),/chain_order_or_endpoints/)});
test("wrong source payment profile rejected",()=>{const r=record();r.source.payment="transponder";assert.throws(()=>go([r]),/official_tariff_source/)});
test("nonofficial source rejected",()=>{const r=record();r.source.url="https://example.org";assert.throws(()=>go([r]),/official_tariff_source/)});
test("invalid tariff effective date rejected",()=>{const r=record();r.source.effectiveFrom="2026-02-30";assert.throws(()=>go([r]),/official_tariff_source/)});
test("missing continuous route evidence rejected",()=>{const r=record();r.proof.continuousMainline=false;assert.throws(()=>go([r]),/route_proof/)});
test("different nonoverlapping tariff versions are kept separately",()=>{const a=record();const b=record("later","2026-11-01","2026-12-31");b.chains[0].charges.forEach(x=>x.parts[0].monThu+=10);const c=go([a,b]);assert.equal(c.spanCells.length,2);assert.equal(request(c,chain,"monThu","2026-11-15").amountRub,630)});
test("overlapping tariff versions are rejected",()=>{const a=record();const b=record("overlap","2026-10-31","2026-12-31");assert.throws(()=>go([a,b]),/compiled_matrix_conflict/)});
