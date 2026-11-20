import test from "node:test";
import assert from "node:assert/strict";
import { durationWithDays, duration } from "../app/v2/components/format";
test("V3 duration omits zero components, preserves numeric input and V2 output",()=>{
  for (const [minutes,text] of [[45,"45 мин"],[135,"2 ч 15 мин"],[780,"13 ч"],[1500,"1 д 1 ч"],[3025,"2 д 2 ч 25 мин"]] as const) assert.equal(durationWithDays(minutes*60),text);
  assert.equal(duration(1500*60),"25 ч 0 мин");
});
