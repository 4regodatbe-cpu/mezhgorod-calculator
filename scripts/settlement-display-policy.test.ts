import test from 'node:test';
import assert from 'node:assert/strict';
import {rankPhotonFeatures} from '../lib/photon-address-search';
import {SPECIAL_TERRITORY_BOUNDARIES} from '../lib/special-territory-boundaries';
import {createLocalGazetteer} from '../experiments/address-search/local-gazetteer.mjs';
test('source ru language tags do not override Ukrainian orthography, and valid localized alternatives win',()=>{
 const data={schemaVersion:1,runtimeApproved:false,records:[[709711,'Донецьке',['Донецьке','Donetske'],48.93347,37.69006,'UA',[],0,'PPL',[],22461,'2026-09-03','UA',[]]]};
 assert.deepEqual(createLocalGazetteer(data).search('Доне').items,[]);
 for(const name of ['Донецьке','Луганськ','Donetske']){
  const f={geometry:{coordinates:[37.69006,48.93347] as [number,number]},properties:{name,'name:ru':name,osm_key:'place',osm_value:'village',osm_id:1}};
  assert.deepEqual(rankPhotonFeatures([f],SPECIAL_TERRITORY_BOUNDARIES,'Доне'),[],name);
  assert.equal(rankPhotonFeatures([{...f,properties:{...f.properties,name_ru:'Проверенное'}}],SPECIAL_TERRITORY_BOUNDARIES,'Доне')[0].title,'Проверенное — ДНР');
 }
});
test('homonym labels remain human-only, retain each endpoint, and disclose unverified district',()=>{
 const row=(id:number,lat:number)=>[id,'Донецкий',['Донецкий'],lat,38.67627,'UA',[],0,'PPL',[],1,'2026-10-24','UA',['admin_ru_unverified']];
 const rows=[row(709713,48.6996),row(811884,48.7)];const before=JSON.stringify(rows);
 const items=createLocalGazetteer({schemaVersion:1,runtimeApproved:false,records:rows}).search('Доне').items;
 assert.equal(items.length,2);assert.notEqual(items[0].label,items[1].label);
 for(const item of items){assert.doesNotMatch(item.label,/geonames-|48\.6996|48\.7|38\.67627/);assert.match(item.label,/район не уточнён/);assert.ok(item.id.startsWith('geonames-'));}
 assert.deepEqual(items.map(x=>x.id),['geonames-709713','geonames-811884']);
 assert.deepEqual(items.map(x=>x.position.lat),[48.6996,48.7]);assert.equal(JSON.stringify(rows),before);
});
