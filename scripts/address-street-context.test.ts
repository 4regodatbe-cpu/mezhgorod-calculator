import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NextRequest} from 'next/server';
import {GET} from '../app/api/suggest/route.ts';
import {settlementForStreetQuery} from '../lib/address-query.ts';
import {searchLocalSettlements} from '../lib/local-settlement-search.ts';
import {rankPhotonFeatures,type PhotonFeature} from '../lib/photon-address-search.ts';
import {SPECIAL_TERRITORY_BOUNDARIES as zones} from '../lib/special-territory-boundaries.ts';

const saved=JSON.parse(readFileSync(new URL('../experiments/address-search/2026-10-29-street-scope/street-2.body',import.meta.url),'utf8')) as {features:PhotonFeature[]};
const envKeys=['GEONAMES_LOCAL_PILOT','GEONAMES_LOCAL_TEST','GEONAMES_LOCAL_PILOT_DIR','VERCEL','VERCEL_ENV'] as const;
async function withPilot(run:()=>Promise<void>){
 const old=envKeys.map(k=>process.env[k]),fetch=globalThis.fetch;
 process.env.GEONAMES_LOCAL_PILOT='1';process.env.GEONAMES_LOCAL_TEST='1';process.env.GEONAMES_LOCAL_PILOT_DIR='data/local-settlements';delete process.env.VERCEL;delete process.env.VERCEL_ENV;
 try{await run();}finally{globalThis.fetch=fetch;envKeys.forEach((k,i)=>{if(old[i]===undefined)delete process.env[k];else process.env[k]=old[i];});}
}
const request=(query:string,signal?:AbortSignal)=>new NextRequest('http://localhost/api/suggest?q='+encodeURIComponent(query),{signal});
const mockStreet=(id:number,city:string,state:string,position:{lng:number;lat:number},name='улица Артёма'):PhotonFeature=>({geometry:{coordinates:[position.lng,position.lat]},properties:{osm_id:id,osm_type:'W',osm_key:'highway',osm_value:'residential',name,city,'city:ru':city,state,countrycode:'RU'}});

test('D1: city-first street context works without punctuation and preserves explicit region',()=>{
 for(const [query,context] of [['Донецк ДНР улица Артёма','Донецк ДНР'],['Донецк Ростовская область ул. Артёма','Донецк Ростовская область'],['Ялта Крым улица Кирова','Ялта Крым'],['Москва улица Тверская','Москва'],['Краснодар проспект Чекистов','Краснодар'],['Донецк ДНР, улица Артёма','Донецк ДНР'],['Ялта, улица Кирова, Крым','Ялта Крым']])assert.equal(settlementForStreetQuery(query),context,query);
 assert.equal(settlementForStreetQuery('улица Артёма'),null,'do not invent an unspecified city');
 assert.equal(settlementForStreetQuery('Москва улица Тверская 1'),null,'existing detailed-address path is preserved');
});
test('D1: retained Rostov-only Photon answer cannot replace unpunctuated requested DNR city',async()=>withPilot(async()=>{
 const city=await searchLocalSettlements('Донецк ДНР');assert.ok(city?.items[0].position);
 let calls=0;globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify(saved),{status:200});};
 const response=await GET(request('Донецк ДНР улица Артёма')),body=await response.json();
 assert.equal(response.status,200);assert.equal(body.streetSearch?.status,'unconfirmed');assert.equal(body.localSource?.provider,'geonames');
 assert.deepEqual(body.items[0],city.items[0]);assert.equal(body.items[0].id,'geonames-709717');assert.ok(body.items.every((x:{label:string})=>!x.label.includes('Ростовская')));
 assert.ok(calls>0&&calls<=3,'no extra street fan-out');
}));
test('D1: one compatible street does not allow incompatible namesakes to leak into the same response',async()=>withPilot(async()=>{
 const city=await searchLocalSettlements('Донецк ДНР');assert.ok(city?.items[0].position);
 // Controlled synthetic street proves filtering only, not real Artyoma coverage.
 const correct=mockStreet(910001,'Донецк','ДНР',city.items[0].position);
 globalThis.fetch=async()=>new Response(JSON.stringify({features:[...saved.features,correct]}),{status:200});
 const response=await GET(request('Донецк ДНР, улица Артёма')),body=await response.json();
 assert.equal(response.status,200);assert.deepEqual(body.items.map((x:{id:string})=>x.id),['W-910001']);assert.deepEqual(body.items[0].position,city.items[0].position);assert.doesNotMatch(body.items[0].label,/Ростовская/);
}));
test('D1: explicit ordinary region is retained instead of forcing the priority-region namesake',async()=>withPilot(async()=>{
 const rostov=await searchLocalSettlements('Донецк Ростовская область'),dnr=await searchLocalSettlements('Донецк ДНР');assert.ok(rostov?.items[0].position);assert.ok(dnr?.items[0].position);
 const dnrPosition=dnr.items[0].position;
 globalThis.fetch=async()=>new Response(JSON.stringify({features:[mockStreet(910002,'Донецк','ДНР',dnrPosition),...saved.features]}),{status:200});
 const response=await GET(request('Донецк Ростовская область улица Артёма')),body=await response.json();
 assert.equal(response.status,200);assert.ok(body.items.length>0);assert.ok(body.items.every((x:{label:string})=>x.label.includes('Ростовская область')));assert.ok(body.items.every((x:{id:string})=>x.id!=='W-910002'));
}));
test('D1: generic requested city filters a same-name street in another city without city-specific code',async()=>withPilot(async()=>{
 const city=await searchLocalSettlements('Краснодар');assert.ok(city?.items[0].position);
 const correct=mockStreet(910003,'Краснодар',city.items[0].region!,city.items[0].position,'Красная улица');
 globalThis.fetch=async()=>new Response(JSON.stringify({features:[mockStreet(910004,'Ейск','Краснодарский край',{lng:38.267,lat:46.671},'Красная улица'),correct]}),{status:200});
 const response=await GET(request('Краснодар улица Красная')),body=await response.json();
 assert.equal(response.status,200);assert.deepEqual(body.items.map((x:{id:string})=>x.id),['W-910003']);assert.deepEqual(body.items[0].position,city.items[0].position);
}));
test('D1: explicit priority region rejects incompatible coordinates even without a local-store result',()=>{
 assert.deepEqual(rankPhotonFeatures(saved.features,zones,'Донецк ДНР ул. Артёма'),[]);
 const lying=saved.features.map(f=>({...f,properties:{...f.properties,state:'ДНР'}}));
 assert.deepEqual(rankPhotonFeatures(lying,zones,'Донецк ДНР ул. Артёма'),[],'region text cannot override actual coordinate classification');
});
test('D1: source outage keeps admitted city fallback; cancellation never returns a stale city',async()=>withPilot(async()=>{
 globalThis.fetch=async()=>{throw Error('Controlled source outage');};
 const response=await GET(request('Донецк ДНР ул. Несуществующая')),body=await response.json();
 assert.equal(response.status,200);assert.equal(body.items[0].id,'geonames-709717');assert.equal(body.streetSearch?.status,'unavailable');assert.doesNotMatch(body.items[0].label,/Несуществующая/);
 const controller=new AbortController();controller.abort();assert.equal((await GET(request('Донецк ДНР ул. Отменённая',controller.signal))).status,502);
}));
test('D1: city fallback does not extend total search budget or start Photon after expiry',async()=>withPilot(async()=>{
 const req=request('Москва улица Бюджетная'),original=Date.now,started=original();let reads=0,calls=0;
 Date.now=()=>started+(reads++===0?0:20001);globalThis.fetch=async()=>{calls++;throw Error('Must not fetch after expiry');};
 try{const response=await GET(req),body=await response.json();assert.equal(response.status,200);assert.equal(body.items[0].id,'geonames-524901');assert.equal(body.streetSearch?.status,'unavailable');assert.equal(calls,0);}finally{Date.now=original;}
}));
