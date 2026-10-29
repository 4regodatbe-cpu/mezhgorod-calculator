import test from 'node:test';
import assert from 'node:assert/strict';
import {NextRequest} from 'next/server';
import {GET} from '../app/api/suggest/route.ts';
import {POST} from '../app/r/route.ts';
import {isDetailedAddress,searchLocalSettlements} from '../lib/local-settlement-search.ts';
import {validPoint} from '../lib/route-input-validation.ts';
import {geocode} from '../lib/route-providers.ts';
test('detail intent preserves Photon for mixed city/street and house queries',()=>{
 for(const q of ['Москва улица Ленина','Донецк, Артема','Ялта дом 12','Краснодар ул. Ленина'])assert.equal(isDetailedAddress(q),true,q);
 for(const q of ['Доне','Донецк Ростовская область','Волноваха','Санкт-Петербург'])assert.equal(isDetailedAddress(q),false,q);
});
test('disabled local pilot preserves existing API selection',async()=>{
 const old=process.env.GEONAMES_LOCAL_PILOT;delete process.env.GEONAMES_LOCAL_PILOT;
 try{assert.equal(await searchLocalSettlements('Донецк'),null);}finally{if(old!==undefined)process.env.GEONAMES_LOCAL_PILOT=old;}
});
test('actual GET + admitted real data remain independent of completely unavailable Photon',async t=>{
 const directory=process.env.GEONAMES_TEST_DIR;
 if(!directory){t.skip('Set GEONAMES_TEST_DIR to generated admitted pilot corpus');return;}
 const env=[process.env.GEONAMES_LOCAL_PILOT,process.env.GEONAMES_LOCAL_PILOT_DIR],original=globalThis.fetch;let calls=0;
 process.env.GEONAMES_LOCAL_PILOT='1';process.env.GEONAMES_LOCAL_PILOT_DIR=directory;
 globalThis.fetch=async()=>{calls++;throw Error('Controlled complete external outage');};
 try{
  for(const query of ['Доне','Донецк','Донецк Ростовская область','Волноваха','Луганск','Мариуполь','Мелитополь','Бердянск','Геническ','Симферополь','Севастополь','Ялта','Ялта Крым','Керчь','Краснодар','Москва','Санкт-Петербург']){
   const response=await GET(new NextRequest('http://localhost/api/suggest?q='+encodeURIComponent(query))),body=await response.json();
   assert.equal(response.status,200,query);assert.ok(body.items.length,query);assert.equal(body.localSource.provider,'geonames');
   for(const item of body.items){
    assert.match(item.id,/^geonames-\d+$/);assert.ok(Number.isFinite(item.position.lat));assert.equal(typeof item.region,'string');
    assert.equal(validPoint(item),true);assert.deepEqual((await geocode(item)).position,item.position);
   }
   if(query==='Донецк')assert.deepEqual(body.items.slice(0,2).map((x:{id:string})=>x.id),['geonames-709717','geonames-565348']);
   if(query==='Волноваха')assert.equal(body.items[0].id,'geonames-689198');
  }
  assert.equal(calls,0);
  // V3 AddressField sends POST /r rather than calling GET directly.
  const forwarded=await POST(new NextRequest('http://localhost/r',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:'Волноваха'})}));
  assert.equal(forwarded.status,200);assert.equal((await forwarded.json()).items[0].id,'geonames-689198');assert.equal(calls,0);
  const controller=new AbortController();controller.abort();await assert.rejects(searchLocalSettlements('Донецк',controller.signal));
  // Only provider I/O is mocked here; actual endpoint and ranker execute.
  globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({features:[{type:'Feature',geometry:{type:'Point',coordinates:[37.617,55.75]},properties:{name:'улица Ленина',city:'Москва',country:'Россия',countrycode:'RU',osm_id:1,osm_type:'W',osm_key:'highway',osm_value:'residential'}}]}),{status:200,headers:{'content-type':'application/json'}});};
  const response=await GET(new NextRequest('http://localhost/api/suggest?q='+encodeURIComponent('Москва улица Ленина')));
  assert.equal(response.status,200);assert.ok(calls>0,'street/detail query reaches Photon');
 }finally{
  globalThis.fetch=original;
  for(const [key,value] of [['GEONAMES_LOCAL_PILOT',env[0]],['GEONAMES_LOCAL_PILOT_DIR',env[1]]] as const){if(value===undefined)delete process.env[key];else process.env[key]=value;}
 }
});
