import test from 'node:test';
import assert from 'node:assert/strict';
import {rankPhotonFeatures} from '../lib/photon-address-search';
import {SPECIAL_TERRITORY_BOUNDARIES} from '../lib/special-territory-boundaries';
test('Photon comparable settlements prefer Crimea over new territories and Russia',()=>{
 const features=[[37.62,55.75,'RU'],[37.8013407,48.0158753,'UA'],[34.166,44.495,'UA']].map(([lng,lat,countrycode],i)=>({geometry:{coordinates:[lng,lat] as [number,number]},properties:{name:'Одинаковое','name:ru':'Одинаковое',osm_key:'place',osm_value:'village',osm_type:'node',osm_id:i+1,countrycode:String(countrycode)}}));
 assert.deepEqual(rankPhotonFeatures(features,SPECIAL_TERRITORY_BOUNDARIES,'Одинаковое').map(x=>x.id),['node-3','node-2','node-1']);
 assert.equal(rankPhotonFeatures(features,SPECIAL_TERRITORY_BOUNDARIES,'Одинаковое ДНР')[0].id,'node-2');
});
