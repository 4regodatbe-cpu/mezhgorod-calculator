import assert from 'node:assert/strict';
import test from 'node:test';
import {validV3Response} from '../app/v3/components/response-validation.ts';
import {resolveTollAmount,totalWithToll} from '../app/v2/components/quote-presentation.ts';
import type {TollView} from '../app/v2/components/types.ts';
const pricing={totalPrice:100,requiresSplit:false,reviewRequired:false,dualTariff:false,pricingSegments:[{distanceKm:10,ratePerKm:10,amount:100,tariffType:'normal',from:'A',to:'B'}]};
const toll:TollView={amount:880,weekdayAmount:1130,weekendAmount:1650,period:'ночной проезд',segments:['М-11'],confidence:'matched',pricingStatus:'priced'};
const data=()=>({automaticMode:'standard',legs:[{from:'A',to:'B',fast:{meters:10000,seconds:1000,tolls:{...toll},pricingByVehicle:Object.fromEntries(['standard','comfort','comfort_plus','minivan'].map(k=>[k,structuredClone(pricing)]))},free:null}]});
test('V3 actual amount preserves night/holiday/mixed crossing price, instead of schedule maxima',()=>{
 assert.equal(resolveTollAmount(toll,'actual').amount,880);
 assert.equal(totalWithToll(100,resolveTollAmount(toll,'actual')),980);
 assert.equal(resolveTollAmount(toll,'weekday').amount,1130);
});
test('unknown cannot become zero through the actual period',()=>{
 assert.equal(resolveTollAmount({...toll,pricingStatus:'unknown',amount:null},'actual').amount,null);
 assert.equal(resolveTollAmount({...toll,amount:Infinity},'actual').amount,null);
});
test('V3 accepts unknown toll only with null amounts and keeps a missing tariff distinct from free',()=>{
 const unknown:any=data();unknown.legs[0].fast.tolls={...unknown.legs[0].fast.tolls,amount:null,weekdayAmount:null,weekendAmount:null,period:'unknown',confidence:'none',pricingStatus:'unknown'};
 assert.equal(validV3Response(unknown),true);
 for(const key of ['amount','weekdayAmount','weekendAmount']){const contradicted=structuredClone(unknown);contradicted.legs[0].fast.tolls[key]=0;assert.equal(validV3Response(contradicted),false,`${key}=0 contradicts unknown`);}
 const free=structuredClone(unknown);free.legs[0].fast.tolls={...free.legs[0].fast.tolls,amount:0,weekdayAmount:0,weekendAmount:0,confidence:'none',pricingStatus:'free'};
 assert.equal(validV3Response(free),true);
});
test('valid complete and explicitly unavailable commercial fares pass the response guard',()=>{
 assert.equal(validV3Response(data()),true);
 const d=data();for(const p of Object.values(d.legs[0].fast.pricingByVehicle)){p.totalPrice=null as never;p.requiresSplit=true;p.reviewRequired=true;p.pricingSegments=[];}
 assert.equal(validV3Response(d),true);
});
test('malformed nested money, arrays, route statistics and contradictory status fail before rendering',()=>{
 for(const mutate of [
  (d:any)=>d.legs[0].fast.meters=-1,
  (d:any)=>d.legs[0].fast.tolls.segments={},
  (d:any)=>d.legs[0].fast.tolls.pricingStatus='free',
  (d:any)=>d.legs[0].fast.pricingByVehicle.comfort.totalPrice=Infinity,
  (d:any)=>d.legs[0].fast.pricingByVehicle.comfort.pricingSegments=[],
  (d:any)=>d.options=[{fast:null}],
 ]){const d=data();mutate(d);assert.equal(validV3Response(d),false);}
});

test('combined displayed fare and manual toll cannot overflow integer money',()=>{
 assert.equal(totalWithToll(Number.MAX_SAFE_INTEGER,{status:'priced',amount:1}),null);
 assert.equal(resolveTollAmount(toll,'actual','1e308').amount,null);
});
