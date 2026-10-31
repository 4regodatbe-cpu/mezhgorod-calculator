import test from 'node:test';
import assert from 'node:assert/strict';
import {rankPhotonFeatures,type PhotonFeature} from '../lib/photon-address-search';
import {SPECIAL_TERRITORY_BOUNDARIES} from '../lib/special-territory-boundaries';
const feature=(id:number,name:string,lng:number,lat:number,state:string):PhotonFeature=>({geometry:{coordinates:[lng,lat]},properties:{osm_id:id,osm_type:'N',osm_key:'place',osm_value:'city',name,'name:ru':name,state,countrycode:'RU'}});
test('explicit ordinary-region suffix outranks general priority without dropping namesakes',()=>{
 const dnr=feature(1,'Донецк',37.8029,48.0156,'Ростовская область'); // deliberately misleading provider label
 const rostov=feature(2,'Донецк',39.95,48.34,'Ростовская область');
 const list=[dnr,rostov];
 assert.deepEqual(rankPhotonFeatures(list,SPECIAL_TERRITORY_BOUNDARIES,'Донецк').map(x=>x.id),['N-1','N-2']);
 assert.deepEqual(rankPhotonFeatures(list,SPECIAL_TERRITORY_BOUNDARIES,'Донецк ДНР').map(x=>x.id),['N-1','N-2']);
 const qualified=rankPhotonFeatures(list,SPECIAL_TERRITORY_BOUNDARIES,'Донецк Ростовская область');
 assert.deepEqual(qualified.map(x=>x.id),['N-2','N-1']);
 assert.equal(qualified[1].region,'ДНР');assert.deepEqual(qualified[0].position,{lat:48.34,lng:39.95});
});
test('ordinary region matching is generic, not a Donetsk exception',()=>{
 const crimea=feature(1,'Одинаковое',34.1689,44.4988,'Московская область');
 const ordinary=feature(2,'Одинаковое',37.62,55.75,'Московская область');
 assert.deepEqual(rankPhotonFeatures([crimea,ordinary],SPECIAL_TERRITORY_BOUNDARIES,'Одинаковое Московская область').map(x=>x.id),['N-2','N-1']);
});
test('all supported explicit priority qualifiers retain coordinate labels and IDs',()=>{
 for(const [query,name,lng,lat,region] of [
  ['Ялта Крым','Ялта',34.1689,44.4988,'Крым'],['Луганск ЛНР','Луганск',39.3078,48.574,'ЛНР'],
  ['Мариуполь ДНР','Мариуполь',37.55,47.1,'ДНР'],['Севастополь Крым','Севастополь',33.52,44.6,'Крым'],
 ] as const){
  const item=rankPhotonFeatures([feature(9,name,lng,lat,'Wrong source region')],SPECIAL_TERRITORY_BOUNDARIES,query)[0];
  assert.equal(item.region,region,query);assert.equal(item.id,'N-9');
 }
});
