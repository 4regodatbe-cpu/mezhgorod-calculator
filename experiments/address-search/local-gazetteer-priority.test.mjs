import test from 'node:test';
import assert from 'node:assert/strict';
import {createLocalGazetteer} from './local-gazetteer.mjs';
const row=(id,lat,lng,country,admin)=>[id,'Одинаковое',['Одинаковое'],lat,lng,country,[admin],100,'PPL',[],1,'2026-10-24',country,[]];
const records=[row(1,55.75,37.62,'RU','Московская область'),row(2,48.0158753,37.8013407,'UA','ДНР'),row(3,44.495,34.166,'UA','Крым'),row(4,50.45,30.52,'UA','Киевская область')];
test('comparable settlements rank Crimea, new territories, Russia, other countries without changing endpoints',()=>{
 const index=createLocalGazetteer({schemaVersion:1,runtimeApproved:false,records});
 const items=index.search('Одинаковое').items;
 assert.deepEqual(items.map(x=>x.id),['geonames-3','geonames-2','geonames-1','geonames-4']);
 assert.deepEqual(items.find(x=>x.id==='geonames-3').position,{lat:44.495,lng:34.166});
 assert.equal(items.find(x=>x.id==='geonames-2').source.id,2);
 assert.deepEqual(index.search('Одинаковое Московская').items.map(x=>x.id),['geonames-1']);
});
