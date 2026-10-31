import test from "node:test";
import assert from "node:assert/strict";
import {registerHooks} from "node:module";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import ts from "typescript";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import type {TollEstimateView} from "../toll-estimate-view";
import type {Trip,TollView} from "../../app/v2/components/types";
import {validV3Response} from "../../app/v3/components/response-validation";
// Native Node does not compile TSX. Transform only existing local components
// for real React SSR, then remove this per-test-process loader hook.
const hook=registerHooks({load(url,context,next){
 if(!url.endsWith(".tsx"))return next(url,context);
 const source=readFileSync(fileURLToPath(url),"utf8");
 return {format:"module",shortCircuit:true,source:ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText};
}});
const {RouteCard}=await import("../../app/v2/components/route-card.tsx");hook.deregister();
const strict:TollView={amount:null,weekdayAmount:null,weekendAmount:null,pricingStatus:"unknown",period:"CONTROLLED departure",confidence:"none",segments:[]};
const base:Trip={meters:1000,seconds:100};
const draw=(view?:TollEstimateView)=>renderToStaticMarkup(createElement(RouteCard,{title:"CONTROLLED",accent:"blue",trip:{...base,...(view?{tollEstimate:view}:{})},toll:strict,tollPeriod:"actual",onTollPeriodChange:()=>{},onCopy:()=>{},copied:false,onManualToll:()=>{}}));
const view=(status:TollEstimateView["status"],rub:number|null,known=rub):TollEstimateView=>({version:1,status,totalRub:rub,knownPartRub:known,confirmedPartRub:status==="confirmed"?rub:1250,warnings:[],reasons:[]});
test("F3 real React card renders confirmed and explicitly estimated toll-only states",()=>{
 assert.match(draw(view("confirmed",5800)),/Платные дороги: 5\s800 ₽/u);
 const html=draw({...view("estimated",5904),warnings:["М-12: регистрационные границы не подтверждены"]});
 assert.match(html,/5\s904 ₽ \(ориентировочно\)/u);assert.match(html,/регистрационные границы/u);assert.match(html,/не к тарифу трансфера по километражу/u);
 assert.match(html,/role="status"/u);assert.match(html,/Стоимость платных дорог вручную/u);
});
test("F3 incomplete total cannot become a numeric full fare; input strict fields stay unchanged",()=>{
 const before=JSON.stringify(strict),html=draw(view("unknown",null,6928));
 assert.match(html,/Платные дороги: стоимость уточняется/u);assert.match(html,/Известная часть: 6\s928 ₽/u);assert.match(html,/не полный итог/u);
 assert.doesNotMatch(html,/Платные дороги: 6\s928/u);assert.equal(JSON.stringify(strict),before);
});
test("F3 absent overlay keeps legacy unknown/manual UI and responsive markup; escaped warnings",()=>{
 const off=draw();assert.match(off,/Стоимость платных дорог неизвестна/u);assert.match(off,/Стоимость платных дорог вручную/u);
 assert.doesNotMatch(off,/Дополнительная оценка|ориентировочно/u);assert.match(off,/min-w-0/u);
 const unsafe=draw({...view("estimated",5904),warnings:["<script>not markup</script>"]});assert.match(unsafe,/&lt;script&gt;/u);assert.doesNotMatch(unsafe,/<script>/u);
});
test("F3 API keeps legacy contract OFF and accepts only a well-formed optional estimate ON",()=>{
 const pricing=Object.fromEntries(["standard","comfort","comfort_plus","minivan"].map(k=>[k,{dualTariff:false,totalPrice:1000,requiresSplit:false,reviewRequired:false,multiplier:1,corridor:{id:"normal"},pricingSegments:[{distanceKm:1,ratePerKm:1000,amount:1000,tariffType:"normal",type:"normal",from:"A",to:"B",reason:"CONTROLLED",reviewRequired:false}]}]));
 const leg={from:"A",to:"B",fast:{...base,tolls:strict,pricingByVehicle:pricing},free:null};
 const response={legs:[leg],mode:"standard"};const before=JSON.stringify(response);assert.equal(validV3Response(response),true);assert.equal(JSON.stringify(response),before);
 const on={...leg,fast:{...leg.fast,tollEstimate:view("estimated",5904)}};assert.equal(validV3Response({legs:[on],mode:"dual",options:[on]}),true);
 assert.equal(validV3Response({legs:[{...on,fast:{...on.fast,tollEstimate:{...on.fast.tollEstimate,status:"unknown"}}}]}),false);
 assert.equal(validV3Response({legs:[on],options:[leg]}),false,"dual/options must agree on the supplementary layer too");
});
