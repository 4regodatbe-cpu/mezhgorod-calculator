import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
const read=s=>readFileSync(new URL(s,import.meta.url),"utf8");
test("selected-route full booth audit is opt-in to protect performance",()=>{
 const s=read("../../app/v2/components/use-v2-calculation.ts");
 assert.match(s,/useState\(false\)/);
 assert.match(s,/diagnostics:\s*deepTollDiagnostics/);
});
test("V2 page connects user opt-in to selected-route API",()=>{
 const s=read("../../app/v2/page.tsx");
 assert.match(s,/deepTollDiagnostics=\{deepTollDiagnostics\}/);
 assert.match(s,/onDeepTollDiagnosticsChange=/);
});
test("user sees that the extended strict PVP audit does not change fare money",()=>{
 const s=read("../../app/v2/components/calculator-form.tsx");
 assert.match(s,/Углублённая проверка пунктов оплаты/);
 assert.match(s,/без изменения стоимости/);
});
test("strict nationwide verifier requires full Valhalla match before declaring physical facility",()=>{
 const s=read("./m1-m3-gate-evidence.mjs");
 assert.match(s,/validation.complete!==true/);
 assert.match(s,/boothEventCoverage!=="complete"/);
});
