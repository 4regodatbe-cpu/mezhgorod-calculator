import test from 'node:test';
import assert from 'node:assert/strict';
import {rankPhotonFeatures,type PhotonFeature} from '../lib/photon-address-search';
import {SPECIAL_TERRITORY_BOUNDARIES} from '../lib/special-territory-boundaries';
const feature=(id:number,lng:number,lat:number,name:string,ru?:string):PhotonFeature=>({geometry:{coordinates:[lng,lat]},properties:{osm_id:id,osm_type:'N',osm_key:'place',osm_value:'village',name,'name:ru':ru}});
test('source-tagged Russian display is used in all five coordinate-derived areas without changing identity',()=>{
 const areas=[['Крым',34.1689,44.4988],['ДНР',37.8029,48.0156],['ЛНР',39.99,48.316],['Запорожская область',35.365,46.848],['Херсонская область',32.6169,46.6354]] as const;
 for(const [i,[region,lng,lat]] of areas.entries()){
  const item=rankPhotonFeatures([feature(i,lng,lat,'Foreign alias','Проверенное')],SPECIAL_TERRITORY_BOUNDARIES,'Foreign alias')[0];
  assert.equal(item.title,`Проверенное — ${region}`);assert.equal(item.region,region);
  assert.deepEqual(item.position,{lat,lng});assert.equal(item.id,`N-${i}`);
 }
});
test('unverified Latin, Ukrainian and even untagged Cyrillic names are not invented as Russian',()=>{
 for(const name of ['Unverified','Невідоме','Непроверенное'])assert.deepEqual(rankPhotonFeatures([feature(1,34.1689,44.4988,name)],SPECIAL_TERRITORY_BOUNDARIES,name),[]);
 for(const ru of ['Romanized','Невідоме'])assert.deepEqual(rankPhotonFeatures([feature(1,34.1689,44.4988,'Unknown',ru)],SPECIAL_TERRITORY_BOUNDARIES,'Unknown'),[]);
});
test('streets and houses keep their existing Photon response',()=>{
 const street=feature(7,34.1689,44.4988,'улица Примерная');Object.assign(street.properties!,{osm_key:'highway',osm_value:'residential',street:'улица Примерная',housenumber:'7'});
 assert.equal(rankPhotonFeatures([street],SPECIAL_TERRITORY_BOUNDARIES,'улица Примерная')[0].id,'N-7');
});
