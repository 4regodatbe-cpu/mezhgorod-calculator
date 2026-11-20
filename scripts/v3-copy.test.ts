import assert from "node:assert/strict";
import { test } from "node:test";
import { buildV3Copy, roundFareForCopy } from "../app/v3/components/v3-copy.ts";
import type { Leg, TollView, Trip } from "../app/v2/components/types";

test("copy rounds at 200 and 700 rubles", () => {
  for (const [input, expected] of [[0,0],[199,0],[200,500],[699,500],[700,1000],[999,1000],[54420,54500],[60770,61000],[67119,67000],[108841,109000]]) assert.equal(roundFareForCopy(input), expected);
});
test("copy keeps road payment separate and does not invent an unknown amount", () => {
  const pricingByVehicle = Object.fromEntries(["standard","comfort","comfort_plus","minivan"].map((key, i) => [key, {requiresSplit:false,totalPrice:[54420,60770,67119,108841][i]}]));
  const trip = {meters:1814000,seconds:97320,pricingByVehicle} as unknown as Trip;
  const leg = {from:"Краснодар",to:"Оренбург"} as Leg;
  const free = {pricingStatus:"free",amount:0,weekdayAmount:0,weekendAmount:0,period:"free"} as TollView;
  const paid = {...free,pricingStatus:"priced",amount:1500,weekdayAmount:1500,weekendAmount:1500} as TollView;
  const unknown = {...free,pricingStatus:"unknown",amount:null,weekdayAmount:null,weekendAmount:null} as TollView;
  const a=buildV3Copy(leg,trip,free,"actual"), b=buildV3Copy(leg,trip,paid,"actual"), c=buildV3Copy(leg,trip,unknown,"actual");
  assert.match(a,/54\s500 ₽/); assert.doesNotMatch(a,/Платные дороги/);
  assert.match(b,/1\s500 ₽/); assert.match(b,/оплачиваются отдельно/);
  assert.match(c,/оплачиваются отдельно/); assert.doesNotMatch(c,/Ориентировочная стоимость/);
});
