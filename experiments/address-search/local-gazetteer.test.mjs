import test from 'node:test';
import assert from 'node:assert/strict';
import {createLocalGazetteer} from './local-gazetteer.mjs';
const row=(id,name,lat,lng,country='RU',admin=['Region'])=>[id,name,[name],lat,lng,country,admin,100,'PPL',['1','','',''],1,'2026-10-24',country,[]];
const data=records=>({schemaVersion:1,runtimeApproved:false,sourceDate:'2026-10-24',coordinateAccuracy:'unverified',license:{name:'CC-BY-4.0'},records});
test('universal prefix/aliases/normalization works without network and returns no invented unknown place',()=>{
 const old=globalThis.fetch;globalThis.fetch=()=>{throw Error('network forbidden');};
 try{const a=row(1,'Орёл',52.96,36.06);a[2].push('Orel');const index=createLocalGazetteer(data([a]));
 assert.equal(index.search('ОРЕ').items[0].id,'geonames-1');assert.equal(index.search('Orel').items[0].id,'geonames-1');
 assert.deepEqual(index.search('несуществующий').items,[]);assert.equal(index.search('ор').items.length,0);
 }finally{globalThis.fetch=old;}
});
test('new-territory settlement precedes Russian homonym without city-specific branches',()=>{
 const index=createLocalGazetteer(data([row(1,'Одинаковое',48.3382864,39.9509488),row(2,'Одинаковое',48.0158753,37.8013407,'UA')]));
 assert.deepEqual(index.search('Одинаковое').items.map(x=>x.id),['geonames-2','geonames-1']);
 assert.equal(index.search('Одинаковое ДНР').items[0].territory,'dnr');
});
test('same-label homonyms retain distinct IDs, coordinates and disambiguating labels',()=>{
 const index=createLocalGazetteer(data([row(1,'Посёлок',55,37),row(2,'Посёлок',56,38)]));
 const r=index.search('поселок');assert.equal(r.items.length,2);assert.notEqual(r.items[0].label,r.items[1].label);
 assert.equal(r.runtimeApproved,false);
});
test('Crimea is classified by coordinate, not original country field',()=>{
 const r=createLocalGazetteer(data([row(1,'Test place',44.495,34.166,'UA')])).search('Test');
 assert.equal(r.items[0].territory,'crimea');assert.equal(r.items[0].region,'Крым');
});
test('invalid coordinates and unbounded queries are rejected',()=>{
 assert.throws(()=>createLocalGazetteer(data([row(1,'Bad',91,37)])));
 const index=createLocalGazetteer(data([]));assert.throws(()=>index.search('x'.repeat(201)));
 assert.throws(()=>index.search('abc',{maxScan:10001}));
});
test('scan caps report truncation rather than claiming complete coverage',()=>{
 const index=createLocalGazetteer(data([row(1,'Prefix A',1,1),row(2,'Prefix B',2,2)]));
 const r=index.search('Prefix',{maxScan:1});assert.equal(r.truncated,true);assert.equal(r.hasMore,true);assert.equal(r.scanned,1);
 const limited=index.search('Prefix',{limit:1});assert.equal(limited.truncated,false);assert.equal(limited.hasMore,true);
});
