import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {calculateRoutePricing} from '../lib/route-pricing-integration.ts';
const require=createRequire(import.meta.url);
const {fareValidityOnDate:validity}=require('../experiments/nationwide-tolls/engine/fare-validity.cjs');
const {quote}=require('../experiments/nationwide-tolls/engine/quote.cjs');
const request=(road:string,from:string,to:string,profile:string,date:string)=>({routeId:'r',evidenceComplete:true,components:[{routeId:'r',traversalId:road,exactTraversal:true,profileResolved:true,road,from,to,profile,localDate:date}]});
test('CKAD midnight ISO boundary is active on its first Moscow date',()=>{
 assert.equal(quote(request('ckad','М-4 Дон','М-11 Нева','allDays','2026-03-01')).rub,null);
 assert.equal(quote(request('ckad','М-4 Дон','М-11 Нева','allDays','2026-03-02')).rub,2517);
});
test('date-only input cannot choose a price on an intraday change',()=>{
 assert.equal(quote(request('m11-15-58','moscow','sheremetyevo2','night','2026-04-24')).rub,null);
 assert.equal(quote(request('m11-15-58','moscow','sheremetyevo2','night','2026-04-25')).rub,110);
 assert.equal(validity({effectiveUntil:'2026-10-16T00:00:00+03:00'},'2026-10-16'),'outside');
 assert.equal(validity({effectiveUntil:'2026-10-16T01:00:00+03:00'},'2026-10-16'),'unknown');
});
test('validity uses Moscow day, rejects impossible bounds and preserves exclusive ends',()=>{
 assert.equal(validity({effectiveFrom:'2026-03-01T21:00:00Z'},'2026-03-02'),'inside');
 assert.equal(validity({validFrom:'2026-02-30'},'2026-03-02'),'unknown');
 assert.equal(validity({validFrom:'2026-10-16',validUntil:'2026-10-15'},'2026-10-16'),'unknown');
 assert.equal(validity({validFrom:'2026-10-01',validUntil:'2026-10-16'},'2026-10-16'),'outside');
});
const priced=(ordinaryKm:number,specialKm:number)=>calculateRoutePricing({from:'A',to:'B',mode:'dual',vehicle:'standard',legs:[{from:'A',to:'B',distanceKm:ordinaryKm+specialKm,territorySplit:{ordinaryKm,specialKm} as never}]});
test('fractional zones round once and displayed parts sum to the trip price',()=>{
 const p=priced(0.014,0.007); // 0.49 + 0.49 rub, formerly 0 + 0.
 assert.equal(p.totalPrice,1);assert.deepEqual(p.pricingSegments.map(s=>s.amount),[1,0]);
 for(const [a,b] of [[123.456,7.891],[0.001,0.001],[199.999,20.777]]){
  const p=priced(a,b);assert.equal(p.totalPrice,Math.round(a*35+b*70));
  assert.equal(p.pricingSegments.reduce((sum,s)=>sum+s.amount,0),p.totalPrice);
 }
});
test('zone loss and monetary overflow cannot produce an apparently complete fare',()=>{
 const p=calculateRoutePricing({from:'A',to:'B',legs:[{from:'A',to:'B',distanceKm:100,territorySplit:{ordinaryKm:50,specialKm:49.9995} as never}]});
 assert.equal(p.totalPrice,null);
 const overflow=priced(1e308,0);assert.equal(overflow.totalPrice,null);assert.deepEqual(overflow.pricingSegments,[]);
});
test('undated matrix prices retain numeric estimate but cannot become confirmed',()=>{
 const q=quote(request('m1','33 km','66 km','allDays','2026-10-13'));
 assert.equal(q.priceConfirmation,'unconfirmed');assert.equal(q.displayLabel,'Стоимость не подтверждена');
});

test('expired provisional history cannot mark an independently dated current row provisional',()=>{
 const {createQuoteEngine}=require('../experiments/nationwide-tolls/engine/quote.cjs');
 const cell={road:'demo',from:'a',to:'b',profile:'allDays',rub:200,source:'fixture'};
 const engine=createQuoteEngine({selected:[{...cell,validFrom:'2026-10-01'}],provisional:[{...cell,validFrom:'2026-01-01',validUntil:'2026-10-01',verification:'candidate'}],history:[]});
 const q=engine.quote(request('demo','a','b','allDays','2026-10-13'));
 assert.equal(q.rub,200);assert.equal(q.priceConfirmation,'confirmed');
 const overlap=createQuoteEngine({selected:[{...cell,validFrom:'2026-10-01'}],provisional:[{...cell,validFrom:'2026-09-01'}],history:[]});
 assert.equal(overlap.quote(request('demo','a','b','allDays','2026-10-13')).rub,null);
});
test('conflicting validity aliases cannot silently choose the more permissive date',()=>{
 assert.equal(validity({validFrom:'2026-10-01',effectiveFrom:'2026-10-12'},'2026-10-13'),'unknown');
 assert.equal(validity({validUntil:'2026-10-16',effectiveUntil:'2026-10-17'},'2026-10-15'),'unknown');
 assert.equal(validity({validFrom:'2026-03-02',effectiveFrom:'2026-03-02T00:00:00+03:00'},'2026-03-02'),'inside');
});
