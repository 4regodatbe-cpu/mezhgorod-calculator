import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync}from'node:fs';
import {rankPhotonFeatures,photonSearchUrls,type PhotonFeature}from'../lib/photon-address-search';
import {SPECIAL_TERRITORY_BOUNDARIES as zones}from'../lib/special-territory-boundaries';
import {detailedAddressScore}from'../lib/address-query';
const saved=(file:string)=>(JSON.parse(readFileSync(new URL('../experiments/address-search/2026-10-29-stage-a2-photon/'+file,import.meta.url),'utf8')) as {features:PhotonFeature[]}).features;
test('real Krasnodar capture ranks city/street/house evidence independently of provider ordering',()=>{
 const features=saved('1-RU.json');const target=features.find(f=>f.properties?.city==='Краснодар'&&f.properties?.street==='Красная улица'&&f.properties?.housenumber==='100')!;assert.ok(target);
 for(const query of ['Краснодар Красная 100','Красная 100 Краснодар','100 Красная Краснодар']){
  const result=rankPhotonFeatures([...features].reverse(),zones,query);
  assert.equal(result[0].id,`${target.properties!.osm_type}-${target.properties!.osm_id}`);assert.match(result[0].label,/Красная улица, 100/);
  assert.ok(result.some(x=>/Елизаветинская/.test(x.label)),'other-city streets stay selectable');
 }
});
test('Moscow detailed capture outranks unrelated towns but does not manufacture house1',()=>{
 const features=saved('0-RU.json');const unrelated:PhotonFeature={geometry:{coordinates:[30,50]},properties:{name:'Посторонний населённый пункт',city:'Посторонний населённый пункт',osm_key:'place',osm_value:'city',osm_id:'unrelated'}};
 for(const query of ['Москва Тверская 1','Тверская 1 Москва','1 Тверская Москва']){
  const r=rankPhotonFeatures([unrelated,...features],zones,query);assert.notEqual(r[0].id,'place-unrelated');assert.match(r[0].label,/Москва/);assert.match(r[0].label,/Тверская улица, 8 к1/);
 }
 assert.ok(!features.some(f=>f.properties?.street==='Тверская улица'&&f.properties?.housenumber==='1'),'this saved window is not evidence of the exact house');
});
test('detailed search keeps the full original query and does not launch locality bbox windows',()=>{
 for(const q of ['Донецк, улица Ленина 1 ДНР','Краснодар улица Красная','Москва Тверская 1']){
  const urls=photonSearchUrls(q).map(x=>new URL(x));assert.equal(urls.length,3);assert.ok(urls.every(x=>x.searchParams.get('q')===q&&!x.searchParams.has('bbox')));
 }
});
test('a number in a complete settlement name must not erase existing geographical priority',()=>{
 const place=(id:number,lng:number,lat:number):PhotonFeature=>({geometry:{coordinates:[lng,lat]},properties:{name:'8 Марта','name:ru':'8 Марта',city:'8 Марта',osm_key:'place',osm_value:'village',osm_id:id}});
 const result=rankPhotonFeatures([place(1,37.62,55.75),place(2,37.8029,48.0156)],zones,'8 Марта');
 assert.deepEqual(result.map(x=>x.id),['place-2','place-1']);
});
test('a municipal/county value in a provider city field cannot stand in for the requested city',()=>{
 const base={street:'Красная улица',housenumber:'100'};
 const sameCity=detailedAddressScore({...base,city:'Краснодар',housenumber:'101'},'Краснодар Красная 100');
 for(const city of ['городской округ Краснодар','Краснодарский край','Краснодарский район'])assert.ok(detailedAddressScore({...base,city},'Краснодар Красная 100')<sameCity,city);
});
test('detailed priority-area labels use verified Russian context, not raw Ukrainian administration',()=>{
 const feature:PhotonFeature={geometry:{coordinates:[37.8029,48.0156]},properties:{name:'Подлинное имя объекта',street:'улица Примерная',housenumber:'1',city:'Донецька міська громада',district:'Неперевірений район',county:'Непідтверджена громада',state:'Донецька область',country:'Україна','city:ru':'Донецк',osm_key:'building',osm_value:'yes',osm_id:77}};
 const r=rankPhotonFeatures([feature],zones,'Донецк Примерная 1')[0];assert.equal(r.title,'Подлинное имя объекта');assert.equal(r.region,'ДНР');assert.match(r.label,/улица Примерная, 1/);assert.match(r.label,/Донецк/);assert.doesNotMatch(r.label,/міська|район|громада|Донецька|Україна/);
 assert.deepEqual(r.position,{lat:48.0156,lng:37.8029});
});
