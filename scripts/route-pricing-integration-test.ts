import test from "node:test";
import assert from "node:assert/strict";
import { calculateRoutePricing, SPECIAL_RATES } from "../lib/route-pricing-integration.ts";
import { splitRouteByTerritory, type VerifiedTerritory } from "../lib/special-territory-geometry.ts";
const zones:VerifiedTerritory[] = (["dnr","lnr","zaporizhzhia","kherson"] as const).map((id,i)=>({id,verified:true,source:{url:"https://example.org",title:"test",checkedAt:"2026-10-03"},geometry:{type:"Polygon",coordinates:[[[i*10,-1],[i*10+2,-1],[i*10+2,1],[i*10,1],[i*10,-1]]]}}));
const split=splitRouteByTerritory({coordinates:[[-2,0],[2,0]],routedDistanceMeters:400000,routedDurationSeconds:20000,zones});
const input={from:"Любой текст",to:"Москва",legs:[{from:"A",to:"B",distanceKm:400,territorySplit:split}]};
test("geometric segments compose normal and special mileage for all four rates",()=>{
  for(const vehicle of Object.keys(SPECIAL_RATES) as Array<keyof typeof SPECIAL_RATES>) {
    const p=calculateRoutePricing({...input,vehicle,normalRateOverrides:{[vehicle]:40}});
    assert.equal(p.dualTariff,true);assert.equal(p.pricingSegments.length,2);
    assert.equal(p.pricingSegments[1].ratePerKm,SPECIAL_RATES[vehicle]);
    assert.equal(p.totalPrice,200*40+200*SPECIAL_RATES[vehicle]);
    assert.equal(p.pricingSegments.reduce((s,p)=>s+p.distanceKm,0),400);
  }
});
test("custom rates and urgency apply after geometric splitting",()=>{
  assert.equal(calculateRoutePricing({...input,vehicle:"comfort",normalRateOverrides:{comfort:30},specialRateOverrides:{comfort:100},multiplier:1.2}).totalPrice,31200);
});
test("manual ordinary mode changes rates without modifying geography",()=>{
  const p=calculateRoutePricing({...input,mode:"standard",normalRateOverrides:{comfort:30}});
  assert.equal(p.totalPrice,12000);assert.equal(p.dualTariff,false);assert.equal(split.specialKm,200);
});
test("address labels cannot classify endpoints or substitute for missing geometry",()=>{
  const a=calculateRoutePricing(input),b=calculateRoutePricing({...input,from:"Донецк",to:"Херсон"});
  assert.equal(a.totalPrice,b.totalPrice);
  assert.equal(calculateRoutePricing({...input,legs:[{from:"Краснодар",to:"Москва",distanceKm:400}]}).totalPrice,null);
});
