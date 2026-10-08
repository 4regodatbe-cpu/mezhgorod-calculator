import assert from "node:assert/strict";
import {test} from "node:test";
import {deriveM4MixedStatus as derive} from "./m4-mixed-time-policy.mjs";
function rec(kms,times,direction="to_moscow"){
 const ids=kms.map(km=>"m4-"+km);
 return derive(ids.map(pvpId=>({pvpId,routeId:"test",direction})),ids.map((pvpId,i)=>({pvpId,routeId:"test",at:times[i]})),"test",direction);
}
test("without mixed-gate crossings both systems are not used",()=>{const x=derive([],[],"test","to_moscow");assert.equal(x.status,"resolved");assert.equal(x.mixedContext.mixed401,"not_used");assert.equal(x.mixedContext.mixed633,"not_used")});
test("401 section exactly 12h remains in ordinary payment window",()=>assert.equal(rec([460,416],["2026-10-08T10:00:00+03:00","2026-10-08T22:00:00+03:00"]).mixedContext.mixed401,"within_limit"));
test("401 section 12h + 1 minute requires extra payment state",()=>assert.equal(rec([460,416],["2026-10-08T10:00:00+03:00","2026-10-08T22:01:00+03:00"]).mixedContext.mixed401,"exceeded_limit"));
test("633 section 60 minutes: both official sources agree no extra charge",()=>assert.equal(rec([672,636],["2026-10-08T10:00:00+03:00","2026-10-08T11:00:00+03:00"]).mixedContext.mixed633,"within_limit"));
test("633 section 90 minutes: 60/120-minute operator discrepancy is unresolved",()=>{const x=rec([672,636],["2026-10-08T10:00:00+03:00","2026-10-08T11:30:00+03:00"]);assert.equal(x.status,"unknown");assert.match(x.reason,/conflicting_official/);});
test("633 section exactly 120 minutes still disputed",()=>assert.equal(rec([672,636],["2026-10-08T10:00:00+03:00","2026-10-08T12:00:00+03:00"]).status,"unknown"));
test("633 section over 120 minutes: both sources imply exceeded",()=>assert.equal(rec([672,636],["2026-10-08T10:00:00+03:00","2026-10-08T12:01:00+03:00"]).mixedContext.mixed633,"exceeded_limit"));
test("southbound gate order works",()=>assert.equal(rec([636,672],["2026-10-08T10:00:00+03:00","2026-10-08T10:30:00+03:00"],"to_krasnodar").mixedContext.mixed633,"within_limit"));
test("single gate in a mixed system cannot establish exit rule",()=>assert.equal(rec([636],["2026-10-08T10:00:00+03:00"]).status,"unknown"));
test("out-of-order chronology is invalid",()=>assert.equal(rec([672,636],["2026-10-08T11:00:00+03:00","2026-10-08T10:00:00+03:00"]).status,"unknown"));
test("inconsistent named direction is invalid",()=>assert.equal(rec([636,672],["2026-10-08T10:00:00+03:00","2026-10-08T10:30:00+03:00"],"to_moscow").status,"unknown"));
test("zone 401 wrong direction cannot claim verified mixed context",()=>assert.equal(rec([416,460],["2026-10-08T10:00:00+03:00","2026-10-08T11:00:00+03:00"],"to_moscow").status,"unknown"));
test("naive timestamps without offsets are invalid",()=>assert.equal(rec([672,636],["2026-10-08T10:00:00","2026-10-08T11:00:00"]).status,"unknown"));
