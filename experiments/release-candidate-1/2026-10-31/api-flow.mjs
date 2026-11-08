import assert from 'node:assert/strict';
import {writeFileSync,readFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {validPoint} from '../../../lib/route-input-validation.ts';
import {validV3Response} from '../../../app/v3/components/response-validation.ts';
const base=process.argv[2];if(!base||new URL(base).hostname!=='127.0.0.1')throw Error('Only explicit localhost RC1 server allowed');
const out='experiments/release-candidate-1/2026-10-31/checks/';
const report={sourceCommit:process.argv[3],mode:'actual built local HTTP /r and V3; real GeoNames; controlled Photon outage; one live routing request',startedAt:new Date().toISOString(),cities:[],checks:[],status:'STARTED'};
const save=()=>writeFileSync(out+'api-flow.json',JSON.stringify(report,null,2)+'\n');save();
const cities=new Map();
async function post(path,body,budgetMs=10000){
 const at=performance.now();const response=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(budgetMs)});
 return {status:response.status,elapsedMs:performance.now()-at,body:await response.json(),serverTiming:response.headers.get('Server-Timing')};
}
try{
 for(const query of ['Доне','Донецк ДНР','Донецк Ростовская область','Волноваха','Ялта Крым','Луганск ЛНР','Мариуполь ДНР','Краснодар','Москва','Санкт-Петербург','Анапа']){
  const result=await post('/r',{query});report.cities.push({query,...result});save();
  assert.equal(result.status,200,query);assert.equal(result.body.localSource?.provider,'geonames',query);assert.ok(result.body.items.length,query);
  for(const item of result.body.items)assert.equal(validPoint(item),true,query);
  const item=result.body.items[0];cities.set(query,item);
  if(query==='Доне'){assert.equal(item.id,'geonames-709717');assert.ok(result.body.items.some(x=>x.id==='geonames-565348'));assert.ok(!result.body.items.some(x=>x.id==='geonames-709711'));}
  if(query==='Донецк Ростовская область')assert.equal(item.id,'geonames-565348');
  for(const [q,region] of [['Донецк ДНР','ДНР'],['Ялта Крым','Крым'],['Луганск ЛНР','ЛНР'],['Мариуполь ДНР','ДНР']])if(query===q)assert.equal(item.region,region);
 }
 const fault=JSON.parse(readFileSync(out+'photon-fault-counts.json','utf8'));assert.equal(fault.photonAttempts,0);report.checks.push({name:'eleven real city HTTP queries with Photon denied',status:'PASS',photonAttempts:0});
 for(const page of ['/v3','/v2']){const response=await fetch(base+page,{signal:AbortSignal.timeout(10000)});const html=await response.text();assert.equal(response.status,200);if(page==='/v3'){assert.match(html,/GeoNames/);assert.match(html,/Откуда/);assert.match(html,/Куда/);}report.checks.push({name:'HTTP SSR '+page,status:'PASS',note:'Not browser hydration or mobile interaction'});}
 const invalid=await post('/api/v3/calculate',{from:cities.get('Краснодар'),to:cities.get('Анапа'),rates:{standard:-1,comfort:30,comfortPlus:35,minivan:50}});assert.equal(invalid.status,400);report.checks.push({name:'unsafe tariff input rejected before routing',status:'PASS'});
 const at=performance.now();
 const route=await post('/api/v3/calculate',{from:cities.get('Краснодар'),to:cities.get('Анапа'),departureAt:'2026-10-31T12:00:00+03:00',rates:{standard:25,comfort:30,comfortPlus:35,minivan:50},multiplier:1},45000);
 writeFileSync(out+'live-krasnodar-anapa.json',JSON.stringify({...route,capturedAt:new Date().toISOString()},null,2)+'\n');
 report.liveRoute={status:route.status,elapsedMs:performance.now()-at,serverTiming:route.serverTiming};save();
 assert.equal(route.status,200,JSON.stringify(route.body));assert.equal(validV3Response(route.body),true);
 const trip=route.body.legs[0].fast;assert.ok(trip.meters>0&&trip.seconds>0);
 for(const price of Object.values(trip.pricingByVehicle))assert.ok(Number.isFinite(price.totalPrice)&&price.totalPrice>0);
 if(trip.tolls.pricingStatus==='unknown')for(const key of ['amount','weekdayAmount','weekendAmount'])assert.equal(trip.tolls[key],null);
 report.liveRoute={...report.liveRoute,status:'PASS',meters:trip.meters,seconds:trip.seconds,tollStatus:trip.tolls.pricingStatus,tollAmount:trip.tolls.amount,tariffIndependentlyCertified:false};
 report.status='PASS';
}catch(error){report.status='FAILED_OR_BLOCKED';report.error=String(error);process.exitCode=1;}
finally{report.completedAt=new Date().toISOString();save();console.log(JSON.stringify({status:report.status,cities:report.cities.length,checks:report.checks,liveRoute:report.liveRoute,error:report.error}));}
