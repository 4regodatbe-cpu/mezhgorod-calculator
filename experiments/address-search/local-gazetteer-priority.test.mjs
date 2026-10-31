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
test('priority-area display requires an existing verified Russian name, never translates an alias',()=>{
 const valid=row(11,44.495,34.166,'UA','Крым');valid[1]='Проверенное';valid[2]=['Проверенное','Verified'];
 const unknown=row(12,44.495,34.166,'UA','Крым');unknown[1]='Unverified';unknown[2]=['Unverified'];unknown[13]=['ru_name_unverified'];
 const ukrainian=row(13,44.495,34.166,'UA','Крым');ukrainian[1]='Невідоме';ukrainian[2]=['Невідоме'];
 const index=createLocalGazetteer({schemaVersion:1,runtimeApproved:false,records:[valid,unknown,ukrainian]});
 assert.equal(index.search('Verified').items[0].title,'Проверенное');
 assert.deepEqual(index.search('Unverified').items,[]);
 assert.deepEqual(index.search('Невідоме').items,[]);
});
