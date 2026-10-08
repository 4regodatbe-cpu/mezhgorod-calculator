import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
import {quoteM4WithEventTimes as quote} from "./m4-pvp-timed-quote.mjs";
const template=JSON.parse(readFileSync(new URL("./matrix/m4-pvp-corridors.json",import.meta.url),"utf8"));
const clone=x=>JSON.parse(JSON.stringify(x));
const m=clone(template);
m.priceCells=[{direction:"to_moscow",sequence:["m4-1223","m4-1184"],context:{mixed401:"not_used",mixed633:"not_used"},prices:{monThu:1100,friSun:2200},source:{kind:"official_verified_corridor",url:"https://avtodor-tr.ru/road/tariffs/",effectiveFrom:"2026-01-01",effectiveTo:"2026-12-31"}}];
function req(first="2026-10-08T13:00:00+03:00",second="2026-10-08T14:00:00+03:00"){
 const sequence=["m4-1223","m4-1184"];
 return {routeId:"synthetic-route",direction:"to_moscow",
 routeProof:{routeId:"synthetic-route",status:"complete",sameSelectedGeometry:true,mainlineContinuity:"verified",reentryStatus:"not_observed",unknownCandidateCount:0,candidateCount:2,checkedCandidateCount:2},
 confirmedPvps:sequence.map((pvpId,i)=>({pvpId,routeId:"synthetic-route",direction:"to_moscow",status:"confirmed",osmNodeId:"synthetic-"+i,routeIndex:i+1})),
 mixedContext:{routeId:"synthetic-route",verified:true,mixed401:"not_used",mixed633:"not_used"},
 pvpPassageTimes:[first,second].map((at,i)=>({pvpId:sequence[i],routeId:"synthetic-route",at}))};
}
test("identical Thursday profile uses weekday price",()=>assert.equal(quote(m,req()).amountRub,1100));
test("identical Friday profile uses weekend price",()=>assert.equal(quote(m,req("2026-10-09T13:00:00+03:00","2026-10-09T14:00:00+03:00")).amountRub,2200));
test("special Thursday before May uses weekend charge",()=>assert.equal(quote(m,req("2026-04-30T13:00:00+03:00","2026-04-30T14:00:00+03:00")).amountRub,2200));
test("Thu to Fri overnight is unknown, never uses first profile silently",()=>assert.equal(quote(m,req("2026-10-08T23:50:00+03:00","2026-10-09T00:10:00+03:00")).amountRub,null));
test("Monday to operator preholiday is unknown",()=>assert.equal(quote(m,req("2026-11-02T23:50:00+03:00","2026-11-03T00:10:00+03:00")).amountRub,null));
test("Fri to Sat overnight remains one weekend price",()=>{const x=quote(m,req("2026-10-09T23:50:00+03:00","2026-10-10T00:10:00+03:00"));assert.equal(x.amountRub,2200);assert.deepEqual(x.tariffDates,["2026-10-09","2026-10-10"])});
test("fare version switch overnight fails closed even on same weekend",()=>{const v=clone(m);v.priceCells[0].source.effectiveTo="2026-10-09";v.priceCells.push({...clone(v.priceCells[0]),prices:{monThu:1200,friSun:2400},source:{...clone(v.priceCells[0].source),effectiveFrom:"2026-10-10",effectiveTo:"2026-12-31"}});assert.equal(quote(v,req("2026-10-09T23:50:00+03:00","2026-10-10T00:10:00+03:00")).amountRub,null)});
test("unverified year 2027 fails closed",()=>assert.equal(quote(m,req("2027-01-03T12:00:00+03:00","2027-01-03T13:00:00+03:00")).amountRub,null));
test("missing passage times is unknown",()=>{const r=req();delete r.pvpPassageTimes;assert.equal(quote(m,r).amountRub,null)});
test("wrong PVP time identity is unknown",()=>{const r=req();r.pvpPassageTimes[1].pvpId="m4-1093";assert.equal(quote(m,r).amountRub,null)});
test("cross-route time evidence is unknown",()=>{const r=req();r.pvpPassageTimes[0].routeId="other";assert.equal(quote(m,r).amountRub,null)});
test("actual empty trusted matrix remains unknown",()=>assert.equal(quote(template,req()).amountRub,null));
