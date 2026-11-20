import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NextRequest} from 'next/server';
import {GET} from '../app/api/suggest/route.ts';
import {isDetailedAddress} from '../lib/address-query.ts';
import {rankPhotonFeatures,photonSearchUrls,photonStreetMatchesSettlement,type PhotonFeature} from '../lib/photon-address-search.ts';
import {SPECIAL_TERRITORY_BOUNDARIES as zones} from '../lib/special-territory-boundaries.ts';

const street=(id:number,city:string,name:string,lng:number,lat:number):PhotonFeature=>({geometry:{coordinates:[lng,lat]},properties:{osm_id:id,osm_type:'W',osm_key:'highway',osm_value:'residential',name,city,'city:ru':city,countrycode:'RU'}});
const localEnv=['GEONAMES_LOCAL_PILOT','GEONAMES_LOCAL_TEST','GEONAMES_LOCAL_PILOT_DIR','VERCEL','VERCEL_ENV'] as const;
async function withLocalPilot(run:()=>Promise<void>){
 const saved=localEnv.map(k=>process.env[k]),fetch=globalThis.fetch;
 process.env.GEONAMES_LOCAL_PILOT='1';process.env.GEONAMES_LOCAL_TEST='1';process.env.GEONAMES_LOCAL_PILOT_DIR='data/local-settlements';delete process.env.VERCEL;delete process.env.VERCEL_ENV;
 try{await run();}finally{globalThis.fetch=fetch;for(const [i,k] of localEnv.entries()){if(saved[i]===undefined)delete process.env[k];else process.env[k]=saved[i];}}
}

test('comma plus an explicit region is still a settlement query, not a street request',()=>{
 for(const q of ['Донецк, ДНР','Ялта, Крым','Донецк, Ростовская область'])assert.equal(isDetailedAddress(q),false,q);
 for(const q of ['Донецк, Артёма','Москва, Тверская улица','улица Красная, Краснодар'])assert.equal(isDetailedAddress(q),true,q);
});
test('street requests use the captured street window, not a mixed house/POI window or settlement bbox',()=>{
 for(const q of ['Краснодар, Красная улица','Москва, Тверская улица','Донецк,улица Артёма','Ялта, улица Кирова']){
  const urls=photonSearchUrls(q).map(u=>new URL(u));assert.equal(urls.length,3,q);
  for(const url of urls){assert.equal(url.searchParams.get('layer'),'street',q);assert.equal(url.searchParams.get('limit'),'20');assert.equal(url.searchParams.get('q'),q);assert.equal(url.searchParams.has('bbox'),false);}
 }
 assert.ok(photonSearchUrls('Москва Тверская 1').every(u=>!new URL(u).searchParams.has('layer')),'existing more detailed input remains supported');
});
test('all requested standalone cities including comma-qualified DNR use admitted data with zero Photon calls',async()=>withLocalPilot(async()=>{
 let calls=0;globalThis.fetch=async()=>{calls++;throw Error('Controlled complete Photon outage');};
 for(const [query,id] of [['Краснодар','geonames-542420'],['Москва','geonames-524901'],['Донецк, ДНР','geonames-709717'],['Ялта','geonames-688533']]){
  const r=await GET(new NextRequest('http://localhost/api/suggest?q='+encodeURIComponent(query))),b=await r.json();
  assert.equal(r.status,200,query);assert.equal(b.localSource?.provider,'geonames',query);assert.equal(b.items[0].id,id,query);
 }
 assert.equal(calls,0);
}));
test('saved real city/street candidates rank correctly without requiring a house',()=>{
 for(const [file,query,city,name] of [['1-RU.json','Краснодар, Красная улица','Краснодар','Красная улица'],['0-RU.json','Москва, Тверская улица','Москва','Тверская улица']]){
  const features=(JSON.parse(readFileSync(new URL('../experiments/address-search/2026-10-29-stage-a2-photon/'+file,import.meta.url),'utf8')) as {features:PhotonFeature[]}).features;
  const original=features.filter(f=>f.properties?.city===city&&f.properties?.street===name);
  assert.ok(original.length,query);
  const result=rankPhotonFeatures([...features].reverse(),zones,query),first=original.find(f=>`${f.properties?.osm_type}-${f.properties?.osm_id}`===result[0].id);
  assert.ok(first,query);assert.deepEqual(result[0].position,{lng:first.geometry!.coordinates![0],lat:first.geometry!.coordinates![1]});
 }
});
test('city+street outranks namesake streets in other cities independently of initial order',()=>{
 for(const [city,name,lng,lat] of [['Краснодар','Красная улица',38.976,45.033],['Москва','Тверская улица',37.61,55.76],['Донецк','улица Артёма',37.8,48.015],['Ялта','улица Кирова',34.16,44.5]] as const){
  const target=street(1,city,name,lng,lat),other=street(2,'Другой город',name,40,50);
  const items=rankPhotonFeatures([other,target],zones,`${city}, ${name}`);
  assert.equal(items[0].id,'W-1',city);assert.deepEqual(items[0].position,{lng,lat});assert.ok(items.some(x=>x.id==='W-2'));
 }
});
test('same-name city street ties retain territorial priority and explicit-region overrides',()=>{
 const rostov=street(1,'Донецк','улица Артёма',39.95,48.34);rostov.properties!.state='Ростовская область';
 const dnr=street(2,'Донецк','улица Артёма',37.8,48.015);
 assert.equal(rankPhotonFeatures([rostov,dnr],zones,'Донецк, улица Артёма')[0].id,'W-2');
 assert.equal(rankPhotonFeatures([dnr,rostov],zones,'Донецк, улица Артёма, Ростовская область')[0].id,'W-1');
});
test('no confirmed street point: actual settlement remains available, never a silent other-city substitute',async()=>withLocalPilot(async()=>{
 const cityResponse=await GET(new NextRequest('http://localhost/api/suggest?q=Краснодар'));
 const city=await cityResponse.json();
 globalThis.fetch=async()=>new Response(JSON.stringify({features:[street(123,'Ейск','Красная улица',38.267,46.671)]}),{status:200});
 // Equivalent separator keeps this negative fixture out of the shared pool's
 // positive URL cache used by the separate real-capture replay below.
 const r=await GET(new NextRequest('http://localhost/api/suggest?q='+encodeURIComponent('Краснодар; Красная улица'))),b=await r.json();
 assert.equal(r.status,200);assert.equal(b.items[0].id,'geonames-542420');assert.match(b.items[0].label,/Краснодар/);assert.doesNotMatch(b.items[0].label,/Красная/);
 assert.deepEqual(b.items[0].position,city.items[0].position);assert.equal(b.streetSearch.status,'unconfirmed');assert.equal(b.partial,true);
}));
test('invalid/missing street geometry is never invented or copied from another result',()=>{
 const invalid=street(1,'Краснодар','Красная улица',200,45),missing=street(2,'Краснодар','Красная улица',38,45);delete missing.geometry;
 assert.deepEqual(rankPhotonFeatures([invalid,missing],zones,'Краснодар, Красная улица'),[]);
 const city={id:'known',title:'Донецк',label:'Донецк — ДНР',region:'ДНР',position:{lng:37.8,lat:48.015}};
 assert.equal(photonStreetMatchesSettlement(street(3,'Донецк','улица Артёма',39.95,48.34),'Донецк, улица Артёма',city),false,'Rostov point is not a DNR street');
 assert.equal(photonStreetMatchesSettlement(street(4,'Донецк','улица Артёма',37.8,48.015),'Донецк, улица Артёма',{...city,position:undefined}),false);
});
test('a street containing the city word cannot impersonate that city',()=>{
 const right=street(1,'Москва','улица Москва',37.61,55.76),wrong=street(2,'Другой город','улица Москва',40,50);
 assert.equal(rankPhotonFeatures([wrong,right],zones,'Москва, улица Москва')[0].id,'W-1');
});
test('actual saved street windows serve three confirmed cities, not a substituted Rostov street for DNR',async()=>withLocalPilot(async()=>{
 for(const [i,query,city] of [['0','Краснодар, Красная улица','Краснодар'],['1','Москва, Тверская улица','Москва'],['2','Донецк, улица Артёма','Донецк'],['3','Ялта, улица Кирова','Ялта']]){
  const source=JSON.parse(readFileSync(new URL('../experiments/address-search/2026-10-29-street-scope/street-'+i+'.body',import.meta.url),'utf8')) as {features:PhotonFeature[]};
  globalThis.fetch=async()=>new Response(JSON.stringify(source),{status:200});
  const r=await GET(new NextRequest('http://localhost/api/suggest?q='+encodeURIComponent(query))),b=await r.json();assert.equal(r.status,200,query);
  if(i==='2'){assert.equal(b.items[0].id,'geonames-709717');assert.equal(b.localSource.precision,'settlement-centre');assert.equal(b.streetSearch.status,'unconfirmed');}
  else{
   assert.ok(!b.items[0].id.startsWith('geonames-'),query);assert.ok(b.items[0].label.includes(city),query);
   const original=source.features.find(f=>`${f.properties?.osm_type}-${f.properties?.osm_id}`===b.items[0].id)!;assert.ok(original,query);
   assert.deepEqual(b.items[0].position,{lng:original.geometry!.coordinates![0],lat:original.geometry!.coordinates![1]});
   assert.match(b.items[0].label,/ориентировочная точка улицы/);
  }
 }
}));
test('complete provider failure retains an explicitly city-only option; cancellation never returns that stale fallback',async()=>withLocalPilot(async()=>{
 globalThis.fetch=async()=>{throw Error('Controlled provider failure');};
 const q='Ялта, улица Недоступная',r=await GET(new NextRequest('http://localhost/api/suggest?q='+encodeURIComponent(q))),b=await r.json();
 assert.equal(r.status,200);assert.equal(b.items[0].id,'geonames-688533');assert.equal(b.streetSearch.status,'unavailable');assert.doesNotMatch(b.items[0].label,/Недоступная/);
 const controller=new AbortController();controller.abort();
 const aborted=await GET(new NextRequest('http://localhost/api/suggest?q='+encodeURIComponent(q),{signal:controller.signal}));assert.equal(aborted.status,502);
}));
test('local settlement work uses the existing total budget; an expired deadline starts no Photon requests',async()=>withLocalPilot(async()=>{
 const request=new NextRequest('http://localhost/api/suggest?q='+encodeURIComponent('Москва, улица Бюджетная'));
 const now=Date.now,started=now();let reads=0,calls=0;
 Date.now=()=>started+(reads++===0?0:20001);
 globalThis.fetch=async()=>{calls++;throw Error('Must not fetch beyond total deadline');};
 try{const r=await GET(request),b=await r.json();assert.equal(r.status,200);assert.equal(b.items[0].id,'geonames-524901');assert.equal(b.streetSearch.status,'unavailable');assert.equal(calls,0);}
 finally{Date.now=now;}
}));
