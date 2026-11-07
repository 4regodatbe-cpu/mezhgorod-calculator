import test from "node:test";
import assert from "node:assert/strict";
import {NextRequest} from "next/server";
import {POST} from "../app/api/v3/calculate/route";
import type {CalculationTimingSummary} from "../lib/calculation-timing";
test("HTTP200 rejected geometry retains transport success separately from validator failure",async()=>{
 const fetchOriginal=globalThis.fetch,logOriginal=console.info;let summary:CalculationTimingSummary|undefined;
 try{
  console.info=(tag,value)=>{if(tag==='calculation_timing')summary=value;};
  globalThis.fetch=async input=>new URL(String(input)).hostname==='router.project-osrm.org'?Response.json({routes:[{distance:170000,duration:10000,geometry:{coordinates:[[38.98,45.04],[37.32,44.9]]},legs:[]}]}):Response.json({}, {status:503});
  const response=await POST(new NextRequest('http://localhost/api/v3/calculate',{method:'POST',body:JSON.stringify({from:{label:'A',position:{lng:37.32,lat:44.9}},to:{label:'B',position:{lng:38.98,lat:45.04}}})}));
  assert.equal(response.status,502);
  const osrm=summary?.routingAttempts?.find(row=>row.provider==='OSRM');
  assert.equal(osrm?.httpStatus,200);assert.equal(osrm?.failure,'invalid_geometry');assert.equal(osrm?.geometryUsable,false);assert.equal(osrm?.validator,'rejected');
 }finally{globalThis.fetch=fetchOriginal;console.info=logOriginal;}
});
