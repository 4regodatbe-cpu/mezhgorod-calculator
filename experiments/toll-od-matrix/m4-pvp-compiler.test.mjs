import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
import {compileVerifiedM4Tariffs} from "./m4-pvp-compiler.mjs";
import {quoteM4ByPvp} from "./m4-pvp-corridor.mjs";
const matrix=JSON.parse(readFileSync(new URL("./matrix/m4-pvp-corridors.json",import.meta.url),"utf8"));
const empty=JSON.parse(readFileSync(new URL("./matrix/m4-verified-source-intake.json",import.meta.url),"utf8"));
const clone=x=>JSON.parse(JSON.stringify(x));
function fixture(id="synthetic-a",start="2026-10-01",end="2026-10-31"){
 return {id,routeId:"test-route",direction:"to_moscow",sequence:["m4-1223","m4-1184","m4-1093"],
 context:{mixed401:"not_used",mixed633:"not_used"},
 proof:{routeId:"test-route",sameSelectedGeometry:true,completePvpCoverage:true,continuousMainline:true,officialTotalIndependentlyVerified:true,reviewedBy:"manual_checked",reviewedAt:"2026-10-09"},
 source:{kind:"official_verified_corridor",category:"I",payment:"no_transponder",effectiveFrom:start,effectiveTo:end,capturedAt:"2026-10-09",documentId:"SYNTHETIC-UNIT-TEST-NOT-SOURCE",url:"https://avtodor-tr.ru/road/tariffs/"},
 events:[["m4-1223",100,150],["m4-1184",200,250],["m4-1093",300,350]].map(([pvpId,monThu,friSun],i)=>({pvpId,disposition:"paid",parts:[{officialRowId:"synthetic-"+i,monThu,friSun}]})),
 operatorTotal:{monThu:600,friSun:750}};
}
const go=records=>compileVerifiedM4Tariffs(matrix,{schemaVersion:1,systemId:"m4-don",records});
const quote=(m,date="2026-10-15")=>quoteM4ByPvp(m,{routeId:"test-route",direction:"to_moscow",profile:"monThu",tariffDate:date,routeProof:{routeId:"test-route",status:"complete",sameSelectedGeometry:true,mainlineContinuity:"verified",reentryStatus:"not_observed",unknownCandidateCount:0,candidateCount:3,checkedCandidateCount:3},confirmedPvps:["m4-1223","m4-1184","m4-1093"].map((pvpId,i)=>({pvpId,routeId:"test-route",direction:"to_moscow",status:"confirmed",routeIndex:i+1,osmNodeId:"test-node-"+i})),mixedContext:{routeId:"test-route",verified:true,mixed401:"not_used",mixed633:"not_used"}});
test("actual operator intake is empty: no invented M4 fares",()=>{assert.equal(empty.records.length,0);assert.equal(go(empty.records).priceCells.length,0)});
test("synthetic fully documented fixture compiles",()=>assert.equal(go([fixture()]).priceCells[0].prices.monThu,600));
test("synthetic compiled price resolves from identical sequence",()=>assert.equal(quote(go([fixture()])).amountRub,600));
test("different date has no active tariff",()=>assert.equal(quote(go([fixture()]),"2026-11-07").amountRub,null));
test("two nonoverlapping tariffs for same signature compile",()=>{const a=fixture(),b=fixture("synthetic-b","2026-11-01","2026-11-30");b.operatorTotal.monThu=610;b.events[0].parts[0].monThu=110;const c=go([a,b]);assert.equal(quote(c,"2026-11-15").amountRub,610)});
test("overlapping tariff windows are rejected in compiler",()=>{const a=fixture(),b=fixture("synthetic-b","2026-10-31","2026-11-30");assert.throws(()=>go([a,b]),/compiled_matrix_conflict/)});
test("operator control must equal charged event ledger",()=>{const a=fixture();a.operatorTotal.monThu=601;assert.throws(()=>go([a]),/independent_total_mismatch/)});
test("missing charged event rejected",()=>{const a=fixture();a.events.pop();assert.throws(()=>go([a]),/event_sequence_mismatch/)});
test("nonofficial domain rejected",()=>{const a=fixture();a.source.url="https://example.org";assert.throws(()=>go([a]),/unverified_operator_document/)});
test("invalid effective date rejected",()=>{const a=fixture();a.source.effectiveFrom="2026-02-30";assert.throws(()=>go([a]),/unverified_operator_document/)});
test("no independent route continuity rejected",()=>{const a=fixture();a.proof.continuousMainline=false;assert.throws(()=>go([a]),/unverified_geometry_or_total/)});
test("wrong direction ordering rejected",()=>{const a=fixture();a.sequence.reverse();assert.throws(()=>go([a]),/direction_order/)});
test("zero charge cannot be declared without zero-valued components",()=>{const a=fixture();a.events[0].disposition="receipt_covered";assert.throws(()=>go([a]),/zero_charge_not_proven/)});
test("339 and 355 charge exactly once under verified receipt rule",()=>{const a=fixture();a.sequence=["m4-355","m4-339"];a.events=[{pvpId:"m4-355",disposition:"paid",parts:[{officialRowId:"355",monThu:120,friSun:140}]},{pvpId:"m4-339",disposition:"receipt_covered",parts:[{officialRowId:"339-zero",monThu:0,friSun:0}]}];a.operatorTotal={monThu:120,friSun:140};assert.equal(go([a]).priceCells[0].prices.friSun,140)});
test("339 plus 355 double charge rejected",()=>{const a=fixture();a.sequence=["m4-355","m4-339"];a.events=[{pvpId:"m4-355",disposition:"paid",parts:[{officialRowId:"355",monThu:120,friSun:140}]},{pvpId:"m4-339",disposition:"paid",parts:[{officialRowId:"339",monThu:200,friSun:250}]}];a.operatorTotal={monThu:320,friSun:390};assert.throws(()=>go([a]),/339_355_double_charge/)});
test("545 may have two rows belonging to the same physical crossing",()=>{const a=fixture();a.sequence=["m4-545"];a.events=[{pvpId:"m4-545",disposition:"paid",parts:[{officialRowId:"545-first",monThu:160,friSun:220},{officialRowId:"545-second",monThu:250,friSun:300}]}];a.operatorTotal={monThu:410,friSun:520};assert.equal(go([a]).priceCells[0].prices.monThu,410)});
test("within-limit mixed entry and exit requires one actual charge",()=>{const a=fixture();a.sequence=["m4-460","m4-416"];a.context.mixed401="within_limit";a.events=[{pvpId:"m4-460",disposition:"paid",parts:[{officialRowId:"mixed-1",monThu:360,friSun:480}]},{pvpId:"m4-416",disposition:"mixed_exit_no_extra",parts:[{officialRowId:"mixed-2",monThu:0,friSun:0}]}];a.operatorTotal={monThu:360,friSun:480};assert.equal(go([a]).priceCells[0].prices.monThu,360)});
test("mixed within-limit double charge rejected",()=>{const a=fixture();a.sequence=["m4-460","m4-416"];a.context.mixed401="within_limit";a.events=[{pvpId:"m4-460",disposition:"paid",parts:[{officialRowId:"mixed-1",monThu:360,friSun:480}]},{pvpId:"m4-416",disposition:"paid",parts:[{officialRowId:"mixed-2",monThu:360,friSun:480}]}];a.operatorTotal={monThu:720,friSun:960};assert.throws(()=>go([a]),/mixed_window_double_charge/)});
