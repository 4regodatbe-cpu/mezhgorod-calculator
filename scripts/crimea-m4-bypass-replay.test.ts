import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { calculateLegTolls } from "../lib/v3-calculation/route-leg-pricing.ts";

test("own Yalta Rostov capture replays the complete V3 toll composer as 2060/2210 with no network",async()=>{
 const dir=new URL("../experiments/crimea-m4-bypass/",import.meta.url);
 const route=JSON.parse(gunzipSync(readFileSync(new URL("yalta-rostov-osrm-response.json.gz",dir))).toString()).routes[0];
 const captures=[1,2].map(i=>JSON.parse(readFileSync(new URL(`m4-retry-trace-${i}.json`,dir),"utf8")) as {url:string;requestBody:string;status:number;body:string});
 const original=globalThis.fetch;
 try {
  for(const [date,amount] of [["2026-10-20T12:00:00+03:00",2060],["2026-10-24T12:00:00+03:00",2210]] as const) {
   const unused=[...captures];let calls=0,misses=0;
   globalThis.fetch=async(input,init)=>{
    calls++;
    const index=unused.findIndex(c=>c.url===String(input)&&c.requestBody===init?.body);
    if(index<0){misses++;throw new Error("OFFLINE_REPLAY_MISS");}
    const [record]=unused.splice(index,1);
    return new Response(record.body,{status:record.status,headers:{"Content-Type":"application/json"}});
   };
   const result=await calculateLegTolls({routeGeometry:route.geometry.coordinates,routeSeconds:route.duration,
    departureAt:date,selectedFastProvider:"OSRM",selectedFastRoute:{meters:route.distance,seconds:route.duration,coordinates:route.geometry.coordinates},
    valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:null});
   assert.equal(result.tolls.amount,amount);
   assert.equal(result.componentAudit.status,"priced");
   assert.deepEqual(result.componentAudit.missing,[]);
   assert.deepEqual(result.componentAudit.priced,["m4","a289","krasnodar-west-bypass"]);
   assert.equal(result.componentAudit.components.find(c=>c.id==="krasnodar-west-bypass")?.tolls?.amount,410);
   assert.equal(result.tolls.segments.filter(s=>s.startsWith("М-4: Дальний западный обход")).length,1);
   assert.equal(calls,2);assert.equal(misses,0);assert.equal(unused.length,0);
  }
 } finally {globalThis.fetch=original;}
});
