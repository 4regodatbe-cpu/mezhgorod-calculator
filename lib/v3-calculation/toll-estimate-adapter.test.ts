import test from "node:test";
import assert from "node:assert/strict";
import {tollEstimateEnabled} from "./toll-estimate-switch";
import {assessV3Tolls} from "./toll-estimate-adapter";
import {tollEstimateText,validTollEstimateView} from "../toll-estimate-view";
import type {TollValidation} from "../toll-validator";
const input:Parameters<typeof assessV3Tolls>[0]={route:{coordinates:[[30,59],[30.001,59.001]],meters:100,seconds:10},departureAt:"2026-10-15T09:00:00+03:00",
 validation:{status:"toll",source:"Valhalla map matching",complete:true,chunkCount:1,checkedChunkCount:1,failedChunkCount:0,boothEventCoverage:"complete",tollEdgeCount:1,checkedEdgeCount:1,wayIds:[],roadNames:[],message:"CONTROLLED"} satisfies TollValidation,
 components:[{id:"m11-58-679",detected:true,reason:"CONTROLLED directed fare",tolls:{amount:123,weekdayAmount:123,weekendAmount:150,period:"CONTROLLED",confidence:"matched",segments:[]}}],
 strict:{pricingStatus:"priced",amount:123,priceConfirmation:"confirmed"},m11:{candidate:false,headDetected:false,resolved:false,parts:null,reason:"CONTROLLED"}};
test("F2 switch is defaultOFF, local opt-in only, exact Preview branch, always denied in Production",()=>{
 assert.equal(tollEstimateEnabled({}),false);assert.equal(tollEstimateEnabled({NODE_ENV:"development",V3_TOLL_ESTIMATE:"1"}),true);
 assert.equal(tollEstimateEnabled({NODE_ENV:"production",V3_TOLL_ESTIMATE:"1"}),false);
 assert.equal(tollEstimateEnabled({VERCEL_ENV:"production",NODE_ENV:"test",V3_TOLL_ESTIMATE:"1"}),false);
 assert.equal(tollEstimateEnabled({VERCEL_ENV:"preview",VERCEL_GIT_COMMIT_REF:"main",V3_TOLL_ESTIMATE:"1"}),false);
 assert.equal(tollEstimateEnabled({VERCEL_ENV:"preview",VERCEL_GIT_COMMIT_REF:"fix/v3-missing-route-prices-2026-10-15",V3_TOLL_ESTIMATE:"1"}),true);
});
test("F2 OFF is absent and leaves strict inputs byte-identical",()=>{
 const saved=process.env.V3_TOLL_ESTIMATE;delete process.env.V3_TOLL_ESTIMATE;
 try{const before=JSON.stringify(input);assert.equal(assessV3Tolls(input),undefined);assert.equal(JSON.stringify(input),before);}finally{if(saved===undefined)delete process.env.V3_TOLL_ESTIMATE;else process.env.V3_TOLL_ESTIMATE=saved;}
});
test("F2 ON confirmed/estimated/partial remain separate and cannot mutate strict totals",()=>{
 const saved={flag:process.env.V3_TOLL_ESTIMATE,mode:process.env.NODE_ENV,vercel:process.env.VERCEL_ENV};process.env.V3_TOLL_ESTIMATE="1";process.env.NODE_ENV="test";delete process.env.VERCEL_ENV;
 try{
  const before=JSON.stringify(input),exact=assessV3Tolls(input)!;assert.equal(exact.status,"confirmed");assert.equal(exact.totalRub,123);assert.equal(JSON.stringify(input),before);
  const partial=assessV3Tolls({...input,strict:{...input.strict,pricingStatus:"unknown",amount:null},components:[...input.components,{id:"ckad",detected:true,tolls:null,reason:"missing"}]})!;
  assert.equal(partial.status,"unknown");assert.equal(partial.totalRub,null);assert.equal(partial.knownPartRub,123);assert.equal(validTollEstimateView(partial),true);
  const duplicate=assessV3Tolls({...input,components:[...input.components,...input.components]})!;assert.equal(duplicate.totalRub,null);
  const independent=assessV3Tolls({...input,validation:null})!;assert.equal(independent.status,"confirmed");assert.equal(independent.totalRub,123);
  const incomplete=assessV3Tolls({...input,strict:{...input.strict,pricingStatus:"unknown",amount:null},validation:{...input.validation!,complete:false}})!;assert.equal(incomplete.status,"unknown");
  const model=assessV3Tolls({...input,components:[{...input.components[0],id:"m12",reason:"current model"}]})!;assert.equal(model.status,"estimated");assert.equal(model.totalRub,123);assert.equal(model.warnings.length,1);
  const invalid=assessV3Tolls({...input,departureAt:"2026-02-30T09:00:00+03:00"})!;assert.equal(invalid.totalRub,null);
 }finally{for(const [key,value] of [["V3_TOLL_ESTIMATE",saved.flag],["NODE_ENV",saved.mode],["VERCEL_ENV",saved.vercel]]){if(value===undefined)delete process.env[key!];else process.env[key!]=value;}}
});
test("F2 client view rejects numeric unknown and separates partial from full and approximate labels",()=>{
 const v={version:1 as const,status:"estimated" as const,totalRub:5904,knownPartRub:5904,confirmedPartRub:1250,warnings:[],reasons:[]};
 assert.equal(validTollEstimateView(v),true);assert.match(tollEstimateText(v).label,/5\s904 ₽ \(ориентировочно\)/u);
 assert.equal(validTollEstimateView({...v,status:"unknown"}),false);
 const p=tollEstimateText({...v,status:"unknown",totalRub:null,knownPartRub:6928});assert.equal(p.label,"Платные дороги: стоимость уточняется");assert.match(p.partial!,/6\s928/u);assert.match(p.partial!,/не полный итог/u);
});
