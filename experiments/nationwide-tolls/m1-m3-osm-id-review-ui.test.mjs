import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
test("only unmapped paid gate nodes are disclosed for manual OSM source verification",()=>{
 const code=readFileSync(new URL("../../app/v2/components/result-panels.tsx",import.meta.url),"utf8");
 assert.match(code,/OSM-кандидаты \(не утверждены как ПВП\)/);
 assert.match(code,/m1m3GateAudit\.unmappedPaidNodes\.length > 0/);
});
