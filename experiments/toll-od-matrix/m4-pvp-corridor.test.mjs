import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
import {validateM4PvpMatrix,quoteM4ByPvp} from "./m4-pvp-corridor.mjs";
const actual=JSON.parse(readFileSync(new URL("./matrix/m4-pvp-corridors.json",import.meta.url),"utf8"));
const clone=o=>JSON.parse(JSON.stringify(o));
const synthetic=clone(actual);
const officialFixture={kind:"official_verified_corridor",url:"https://example.org/synthetic-test-only",effectiveFrom:"2026-10-01",effectiveTo:"2026-10-31"};
const contexts={mixed401:"not_used",mixed633:"not_used"};
synthetic.priceCells=[
 {direction:"to_moscow",sequence:["m4-1223","m4-1184","m4-1093"],context:contexts,prices:{monThu:1357,friSun:2468},source:officialFixture},
 {direction:"to_krasnodar",sequence:["m4-1093","m4-1184","m4-1223"],context:contexts,prices:{monThu:1467,friSun:2578},source:officialFixture},
 {direction:"to_moscow",sequence:["m4-460","m4-416","m4-355","m4-339"],context:{mixed401:"within_limit",mixed633:"not_used"},prices:{monThu:999,friSun:1111},source:officialFixture}
];
function request(direction,seq,ctx=contexts,profile="monThu",tariffDate="2026-10-09"){
 return {routeId:"synthetic-r1",direction,profile,tariffDate,
  routeProof:{routeId:"synthetic-r1",status:"complete",sameSelectedGeometry:true,mainlineContinuity:"verified",reentryStatus:"not_observed",unknownCandidateCount:0,candidateCount:seq.length,checkedCandidateCount:seq.length},
  confirmedPvps:seq.map((pvpId,i)=>({pvpId,status:"confirmed",routeId:"synthetic-r1",direction,routeIndex:i+1,osmNodeId:"synthetic-osm-node-"+i})),
  mixedContext:{routeId:"synthetic-r1",verified:true,...ctx}};
}
const south=["m4-1223","m4-1184","m4-1093"];
test("actual M4 dataset contains no invented official prices",()=>{assert.equal(validateM4PvpMatrix(actual),true);assert.equal(actual.priceCells.length,0);});
test("empty matrix cannot quote fabricated M4 price",()=>assert.equal(quoteM4ByPvp(actual,request("to_moscow",south)).amountRub,null));
test("fixed synthetic corridor fare: weekday",()=>assert.equal(quoteM4ByPvp(synthetic,request("to_moscow",south)).amountRub,1357));
test("fixed synthetic corridor fare: weekend",()=>assert.equal(quoteM4ByPvp(synthetic,request("to_moscow",south,contexts,"friSun")).amountRub,2468));
test("different direction has separate tariff",()=>assert.equal(quoteM4ByPvp(synthetic,request("to_krasnodar",[...south].reverse())).amountRub,1467));
test("same endpoints but skipped middle PVP is never same tariff",()=>assert.equal(quoteM4ByPvp(synthetic,request("to_moscow",["m4-1223","m4-1093"])).amountRub,null));
test("extra PVP cannot silently receive corridor fare",()=>assert.equal(quoteM4ByPvp(synthetic,request("to_moscow",[...south,"m4-1046"])).amountRub,null));
test("duplicate PVP is rejected",()=>assert.equal(quoteM4ByPvp(synthetic,request("to_moscow",["m4-1223","m4-1184","m4-1184","m4-1093"])).amountRub,null));
test("no PVP does not certify zero charge",()=>assert.equal(quoteM4ByPvp(synthetic,request("to_moscow",[])).status,"unknown"));
test("mixed zone with verified ordinary window",()=>assert.equal(quoteM4ByPvp(synthetic,request("to_moscow",["m4-460","m4-416","m4-355","m4-339"],{mixed401:"within_limit",mixed633:"not_used"})).amountRub,999));
test("mixed zone exceeded window not inferred",()=>assert.equal(quoteM4ByPvp(synthetic,request("to_moscow",["m4-460","m4-416","m4-355","m4-339"],{mixed401:"exceeded_limit",mixed633:"not_used"})).amountRub,null));
test("mixed zone not used contradicts actual PVP event",()=>assert.equal(quoteM4ByPvp(synthetic,request("to_moscow",["m4-460","m4-416","m4-355","m4-339"])).amountRub,null));
test("out-of-window tariff date rejected",()=>assert.equal(quoteM4ByPvp(synthetic,request("to_moscow",south,contexts,"monThu","2026-11-01")).amountRub,null));
test("unsupported route continuity rejected",()=>{const r=request("to_moscow",south);r.routeProof.reentryStatus="observed";assert.equal(quoteM4ByPvp(synthetic,r).amountRub,null)});
test("cross-route event rejected",()=>{const r=request("to_moscow",south);r.confirmedPvps[0].routeId="another";assert.equal(quoteM4ByPvp(synthetic,r).amountRub,null)});
test("partial PVP coverage rejected",()=>{const r=request("to_moscow",south);r.routeProof.unknownCandidateCount=1;assert.equal(quoteM4ByPvp(synthetic,r).amountRub,null)});
test("duplicate price key cannot be silently selected",()=>{const r=clone(synthetic);r.priceCells.push(clone(r.priceCells[0]));assert.throws(()=>validateM4PvpMatrix(r),/overlapping_cell_version/);});
test("unverified price source rejected",()=>{const r=clone(synthetic);r.priceCells[0].source.kind="estimated";assert.throws(()=>validateM4PvpMatrix(r),/invalid_cell_provenance/);});

test("nonoverlapping successor tariff versions accepted",()=>{
  const c=clone(synthetic);
  const old=c.priceCells[0];
  c.priceCells.push({...clone(old),prices:{monThu:1729,friSun:2830},source:{...old.source,effectiveFrom:"2026-11-01",effectiveTo:"2026-12-31"}});
  assert.equal(validateM4PvpMatrix(c),true);
  assert.equal(quoteM4ByPvp(c,request("to_moscow",south,contexts,"monThu","2026-10-09")).amountRub,1357);
  assert.equal(quoteM4ByPvp(c,request("to_moscow",south,contexts,"monThu","2026-11-15")).amountRub,1729);
});
test("overlapping tariff versions rejected",()=>{
  const c=clone(synthetic),old=c.priceCells[0];
  c.priceCells.push({...clone(old),source:{...old.source,effectiveFrom:"2026-10-31",effectiveTo:null}});
  assert.throws(()=>validateM4PvpMatrix(c),/overlapping_cell_version/);
});
test("same corridor with gap in versions is unknown during gap",()=>{
  const c=clone(synthetic),old=c.priceCells[0];
  c.priceCells.push({...clone(old),source:{...old.source,effectiveFrom:"2026-11-15",effectiveTo:"2026-12-31"}});
  assert.equal(quoteM4ByPvp(c,request("to_moscow",south,contexts,"monThu","2026-11-10")).amountRub,null);
});
test("one endless tariff version prohibits a successor",()=>{
  const c=clone(synthetic),old=c.priceCells[1];
  old.source.effectiveTo=null;
  c.priceCells.push({...clone(old),source:{...old.source,effectiveFrom:"2026-11-01",effectiveTo:"2026-12-31"}});
  assert.throws(()=>validateM4PvpMatrix(c),/overlapping_cell_version/);
});
