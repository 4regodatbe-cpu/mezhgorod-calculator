import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
const get=s=>readFileSync(new URL(s,import.meta.url),"utf8");
test("V2 route metadata instructs automatic translators to leave React DOM intact",()=>assert.match(get("../../app/v2/layout.tsx"),/google: "notranslate"/));
test("loading labels are stable sibling elements, not text-node replacement",()=>{
 const x=get("../../app/v2/components/calculator-form.tsx");
 assert.equal(x.includes('loading ? "Считаем маршрут…" : "Рассчитать поездку"'),false);
 assert.equal(x.split('>Рассчитать поездку</span>').length-1,2);
 assert.equal(x.split('>Считаем маршрут…</span>').length-1,2);
});
test("desktop and mobile status never unmount during loading toggle",()=>{
 const x=get("../../app/v2/components/calculator-form.tsx");
 assert.equal(x.includes('{loading && <div role="status"'),false);
 assert.equal(x.split('<div role="status" aria-live="polite"').length-1,2);
});
