import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,writeFileSync} from "node:fs";
import {gunzipSync} from "node:zlib";
import {createHash} from "node:crypto";
import {calculateLegTolls} from "../../lib/v3-calculation/route-leg-pricing";
import {validateTollEdges} from "../../lib/toll-validator";
import {tollsForApi} from "../../lib/v2-calculation/free-route-selection";
import {tollEstimateText} from "../../lib/toll-estimate-view";
import type {RouteWithGeometry} from "../../lib/route-providers";
import {assessV3Tolls} from "../../lib/v3-calculation/toll-estimate-adapter";
import {resolveM11ProductBoundaries} from "../../lib/v3-calculation/m11-product-boundaries";
import type {M11ValhallaLeg} from "../../lib/toll-engine/m11-road-evidence-types";

const hash=(b:Uint8Array|string)=>createHash("sha256").update(b).digest("hex");
const read=(p:string)=>JSON.parse(readFileSync(p,"utf8"));
type CaptureRef={path:string;sha256:string};
type Capture={record:{spec:{id:string};provider:string;route:RouteWithGeometry};calls:{url:string;method:string;body:string;status:number;text:string}[]};
const c5=read("experiments/road-ref-boundaries/checks/2026-10-29-stage-c/c5-composition.json").results as {caseId:string;capture:CaptureRef}[];
const gran=read("experiments/road-ref-boundaries/checks/2026-10-29-stage-c/c4-zsd.json").results[0] as {caseId:string;capture:CaptureRef};
const tor=read("experiments/toll-estimates/checks/2026-10-30-recovery/torzhok-recovery.json") as {caseId:string;capture:CaptureRef};
const specs=[
 {caseId:tor.caseId,capture:tor.capture,full:[5904,6084],parts:[5904,6084],m12:true},
 {caseId:"pair-m4-m11-krasnodar-to-spb",capture:c5[0].capture,full:[10464,12334],parts:[10464,12334],m12:false},
 {caseId:gran.caseId,capture:gran.capture,full:[null,null],parts:[null,null],m12:false,zsdComponent:600},
 {caseId:"max-chain-m12-ckad-m11-zsd-arzamas-to-prim",capture:c5[1].capture,full:[null,null],parts:[6928,7268],m12:true},
];
const report:{status:string;scope:string;externalRequests:number;results:unknown[];guards?:unknown}={status:"STARTED",scope:"Four existing selected geometries; actual current component pricing OFF/ON, two departures. Recorded HTTP only; no routing/capture/source audit.",externalRequests:0,results:[]};
let guardInput:Parameters<typeof assessV3Tolls>[0]|null=null;
const reportPath=new URL("./checks/2026-10-30-integration/f4-cases.json",import.meta.url);
const save=()=>writeFileSync(reportPath,JSON.stringify(report,null,2)+"\n");save();
for(const spec of specs)test("F4 integrated saved evidence OFF/ON: "+spec.caseId,async()=>{
 const savedFetch=globalThis.fetch;
 const savedEnv={flag:process.env.V3_TOLL_ESTIMATE,mode:process.env.NODE_ENV,vercel:process.env.VERCEL_ENV};
 const raw=readFileSync(spec.capture.path);assert.equal(hash(raw),spec.capture.sha256);
 const data=JSON.parse(gunzipSync(raw).toString("utf8")) as Capture,route=data.record.route;
 const geometry=JSON.stringify(route.coordinates),geometrySha256=hash(geometry);let deliveries=0,unrecorded=0;
 const rows:unknown[]=[];
 try{
  process.env.NODE_ENV="test";delete process.env.VERCEL_ENV;
  globalThis.fetch=async(url,init)=>{
   const parsed=new URL(String(url));const request=JSON.parse(String(init?.body??"{}")) as {shape?:unknown;costing?:string;shape_match?:string};
   const index=data.calls.findIndex(c=>{
    if(!c.url.includes("/trace_attributes")||parsed.pathname!=="/trace_attributes"||c.method!=="POST"||c.status!==200)return false;
    const old=JSON.parse(c.body) as typeof request;return JSON.stringify(old.shape)===JSON.stringify(request.shape)&&old.costing===request.costing&&old.shape_match===request.shape_match;
   });
   if(index<0){unrecorded++;throw new Error("F4_UNRECORDED_REQUEST_FORBIDDEN "+parsed.pathname);}
   deliveries++;const c=data.calls[index];return new Response(c.text,{status:c.status,headers:{"content-type":"application/json"}});
  };
  // Rebuild the same existing validator's route-bound private trace context.
  const validation=await validateTollEdges(route.coordinates);assert.equal(validation.complete,true);assert.equal(validation.boothEventCoverage,"complete");
  const dates=["2026-10-15T09:00:00+03:00","2026-10-17T09:00:00+03:00"];
  for(const [i,departureAt] of dates.entries()){
   const args={includeTollEstimate:true,routeGeometry:route.coordinates,routeSeconds:route.seconds,departureAt,selectedFastProvider:data.record.provider,selectedFastRoute:route,valhallaEvidence:null,confirmedFreeRoute:null,diagnosticFastValidation:validation};
   delete process.env.V3_TOLL_ESTIMATE;const off=await calculateLegTolls(args);assert.equal("tollEstimate" in off,false);
   process.env.V3_TOLL_ESTIMATE="1";const on=await calculateLegTolls(args);const {tollEstimate,...strictOn}=on;
   assert.deepEqual(strictOn,off,"ON must not change any legacy strict field, audit, validation or money");
   assert.ok(tollEstimate,"actual V3 path must produce the optional DTO");
   const actual={departureAt,status:tollEstimate.status,totalRub:tollEstimate.totalRub,knownPartRub:tollEstimate.knownPartRub,
    strict:tollsForApi(off.tolls,off.fastValidation),warnings:tollEstimate.warnings,reasons:tollEstimate.reasons,
    components:off.componentAudit.components.map(c=>({id:c.id,rub:c.tolls?.amount??null,reason:c.reason})),text:tollEstimateText(tollEstimate)};
   rows.push(actual);save();
   if(spec.caseId===tor.caseId&&i===0)guardInput={route,departureAt,validation,components:off.componentAudit.components,
    strict:{pricingStatus:actual.strict.pricingStatus,amount:actual.strict.amount,priceConfirmation:off.tolls.priceConfirmation},
    m11:resolveM11ProductBoundaries(route.coordinates,route.seconds,departureAt,route.m11RoadEvidence,validation)};
   if(spec.zsdComponent){
    // Owner's600 control is a COMPONENT, not an authorization to erase M4/M11.
    const zsd=off.componentAudit.components.find(c=>c.id==="zsd");assert.equal(zsd?.tolls?.amount,spec.zsdComponent);
    assert.equal(off.componentAudit.status,"priced");assert.ok(off.componentAudit.components.every(c=>c.tolls));
    const sum=off.componentAudit.components.reduce((n,c)=>n+c.tolls!.amount,0);assert.equal(tollEstimate.totalRub,sum);assert.equal(tollEstimate.totalRub,off.tolls.amount);
    assert.ok(sum>spec.zsdComponent);assert.equal(tollEstimate.status,"estimated");assert.ok(tollEstimate.warnings.some(s=>s.includes("состав оплаты")));
    assert.doesNotMatch(actual.text.label,/Платные дороги: 600 ₽/u);
   }else{
    assert.equal(tollEstimate.totalRub,spec.full[i],JSON.stringify(actual));assert.equal(tollEstimate.knownPartRub,spec.parts[i],JSON.stringify(actual));
    assert.equal(tollEstimate.status,spec.full[i]===null?"unknown":"estimated");
    if(spec.full[i]===null)assert.match(actual.text.partial!,/не полный итог/u);
   }
   assert.equal(tollEstimate.warnings.some(s=>s.includes("регистрационные границы")),spec.m12);
  }
  assert.equal(JSON.stringify(route.coordinates),geometry);assert.equal(unrecorded,0,"no invented response or external request");
  report.results.push({caseId:spec.caseId,status:"PASS",capture:spec.capture,geometrySha256,geometryUnchanged:true,strictUnchanged:true,recordedTraceDeliveries:deliveries,unrecordedRequests:unrecorded,rows});
 }catch(error){report.results.push({caseId:spec.caseId,status:"FAIL",capture:spec.capture,geometrySha256,rows,error:error instanceof Error?error.message:String(error),unrecordedRequests:unrecorded});throw error;}
 finally{
  report.externalRequests+=unrecorded;globalThis.fetch=savedFetch;
  for(const [key,value] of [["V3_TOLL_ESTIMATE",savedEnv.flag],["NODE_ENV",savedEnv.mode],["VERCEL_ENV",savedEnv.vercel]]){if(value===undefined)delete process.env[key!];else process.env[key!]=value;}
  report.status=report.results.length===4?"COMPLETE":"IN_PROGRESS";save();
 }
});
test("F4 reversed/stale geometry, incomplete trace and duplicate product cannot borrow a full estimate",()=>{
 assert.ok(guardInput,"positive source-bound case must precede negative guards");
 const input:Parameters<typeof assessV3Tolls>[0]=guardInput;
 const old={flag:process.env.V3_TOLL_ESTIMATE,mode:process.env.NODE_ENV,vercel:process.env.VERCEL_ENV};
 try{
  process.env.V3_TOLL_ESTIMATE="1";process.env.NODE_ENV="test";delete process.env.VERCEL_ENV;
  assert.equal(assessV3Tolls(input)?.totalRub,5904);
  const reverse={...input,route:{...input.route,coordinates:[...input.route.coordinates].reverse()}};
  assert.equal(assessV3Tolls(reverse)?.totalRub,null,"forward provider sections cannot price a reversed geometry");
  assert.equal(assessV3Tolls({...input,validation:{...input.validation!,complete:false}})?.totalRub,null);
  const head=input.components.find(c=>c.id==="m11-15-58")!;
  assert.equal(assessV3Tolls({...input,components:[...input.components,head]})?.totalRub,null);
  assert.equal(assessV3Tolls({...input,departureAt:"2026-02-30T09:00:00+03:00"})?.totalRub,null);
  // CONTROLLED dense long-loop perturbation of a COPY, never saved geometry.
  // Matching road names/endpoints cannot authorize another CKAD arc.
  const long=structuredClone(input),legs=long.route.legs as M11ValhallaLeg[];
  const m=legs[0].maneuvers!.find(m=>m.street_names?.includes("А-113"))!,at=m.begin_shape_index!+2;
  const origin=legs[0].coordinates[at-1],loop=Array.from({length:1000},(_,i)=>{
    const a=2*Math.PI*(i+1)/1000;return [origin[0]+2*(Math.cos(a)-1),origin[1]+2*Math.sin(a)] as [number,number];
  });
  legs[0].coordinates.splice(at,0,...loop);
  for(const step of legs[0].maneuvers!){if(step.begin_shape_index!>=at)step.begin_shape_index!+=loop.length;if(step.end_shape_index!>=at)step.end_shape_index!+=loop.length;}
  long.route.coordinates=legs.flatMap(l=>l.coordinates);
  assert.equal(assessV3Tolls(long)?.totalRub,null,"same endpoint names do not price a different long arc");
  report.guards={status:"PASS",reversedGeometryRejected:true,incompleteTraceRejected:true,duplicateRejected:true,invalidDateRejected:true,differentLongArcRejected:true};
 }catch(error){report.guards={status:"FAIL",error:error instanceof Error?error.message:String(error)};throw error;}
 finally{for(const [key,value] of [["V3_TOLL_ESTIMATE",old.flag],["NODE_ENV",old.mode],["VERCEL_ENV",old.vercel]]){if(value===undefined)delete process.env[key!];else process.env[key!]=value;}save();}
});
