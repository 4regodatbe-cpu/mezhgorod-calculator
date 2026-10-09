import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
const read=name=>readFileSync(new URL(name,import.meta.url),"utf8");
test("V2 root opts out of machine translation that can mutate React child nodes",()=>{
  const source=read("../../app/v2/page.tsx");
  assert.match(source,/\<main translate="no" className="notranslate calculator-modern/);
});
test("both loading buttons keep translation disabled",()=>{
  const source=read("../../app/v2/components/calculator-form.tsx");
  assert.equal(source.split('<span translate="no" className="notranslate relative flex items-center gap-2">').length-1,2);
});
test("form opts out of translation",()=>assert.match(read("../../app/v2/components/calculator-form.tsx"),/\<section translate="no" className="notranslate/));
test("error boundary also opts out of translation",()=>assert.match(read("../../app/v2/error.tsx"),/\<main translate="no" className="notranslate/));
