import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
import {inspectNationwideCandidates as inspect} from "./national-preview.mjs";
const catalog=JSON.parse(readFileSync(new URL("./national-registry.json",import.meta.url),"utf8"));
test("22 catalog systems are visible but none is claimed charged",()=>{const x=inspect(catalog,[]);assert.equal(x.catalogNetworkCount,22);assert.equal(x.newFareApplied,false);assert.deepEqual(x.candidateNetworks,[])});
test("M1 and M11 are not confused",()=>assert.deepEqual(inspect(catalog,["М-11: Москва — Солнечногорск"]).candidateNetworks.map(x=>x.id),["m11"]));
test("regional raw checkpoint is a candidate not exact passage",()=>{const x=inspect(catalog,["Обход Тольятти"]);assert.equal(x.candidateNetworks[0].status,"candidate_unverified");assert.equal(x.exactCrossingVerified,false)});
test("two paid systems reported independently",()=>assert.deepEqual(inspect(catalog,["М-3: 65–86 км","ЦКАД: М-7 — М-12"]).candidateNetworks.map(x=>x.id),["m3","ckad"]));
test("unknown name ignored, not misrepresented as free",()=>{const x=inspect(catalog,["неизвестная платная дорога"]);assert.equal(x.candidateNetworks.length,0);assert.equal(x.reason,"geometry_candidate_is_not_map_matched_paid_passage")});
test("catalog with source fares is not a proof on selected road",()=>{const x=inspect(catalog,["Восточный выезд Уфы"]);assert.equal(x.candidateNetworks[0].hasReferenceFare,true);assert.equal(x.newFareApplied,false)});

test("strict M4 PVP signal is reported even when legacy checkpoint heuristics miss the road",()=>{
 const x=inspect(catalog,[],{m4StrictPvpCount:7});
 assert.deepEqual(x.candidateNetworks.map(i=>i.id),["m4"]);
 assert.equal(x.candidateNetworks[0].status,"strict_pvp_found_full_price_unverified");
 assert.equal(x.newFareApplied,false);
});
test("mere M4 candidacy without any verified paid gate is NOT enough",()=>assert.deepEqual(inspect(catalog,[],{m4StrictPvpCount:0}).candidateNetworks,[]));
test("M11,M12 and CKAD system evidence creates three preliminary candidates",()=>assert.deepEqual(inspect(catalog,[],{m11Candidate:true,m12Candidate:true,ckadCandidate:true}).candidateNetworks.map(x=>x.id),["m11","m12","ckad"]));

test("strict Valhalla M1 booth candidate appears without old nearby road label",()=>{
 const x=inspect(catalog,[],{m1m3Candidates:["m1"]});
 assert.deepEqual(x.candidateNetworks.map(n=>n.id),["m1"]);
 assert.equal(x.newFareApplied,false);
});
test("strict Valhalla M3 booth candidate appears without old estimated section",()=>{
 const x=inspect(catalog,[],{m1m3Candidates:["m3"]});
 assert.deepEqual(x.candidateNetworks.map(n=>n.id),["m3"]);
 assert.equal(x.exactCrossingVerified,false);
});
test("m1m3 candidate injection ignores unknown or forged road family ids",()=>{
 const x=inspect(catalog,[],{m1m3Candidates:["m1","m2","foo","m3"]});
 assert.deepEqual(x.candidateNetworks.map(n=>n.id),["m1","m3"]);
});
