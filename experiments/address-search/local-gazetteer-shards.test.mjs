import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {compileShards,createShardLoader,openShardLoader} from './local-gazetteer-shards.mjs';
import {createLocalGazetteer} from './local-gazetteer.mjs';
const row=(id,name,aliases,lat,lng)=>[id,name,aliases,lat,lng,'RU',['Регион'],1,'PPL',[],1,'2026-10-24','RU',[]];
const data={schemaVersion:1,runtimeApproved:false,records:[row(1,'Тест',['Тест','Альфа'],48,37),row(2,'Тест',['Тест'],55,40)]};
test('sharded lookups preserve homonyms, aliases, ranking; one cached load per prefix',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gazetteer-test-'));
 try{
  await compileShards(data,dir);const full=createLocalGazetteer(data),lazy=await openShardLoader(dir);
  for(const query of ['Тес','Тест','Альф','Неизвестный'])assert.deepEqual((await lazy.search(query)).items,full.search(query).items);
  assert.deepEqual(lazy.stats(),{residentShards:1,pending:0,loads:2});
 }finally{await rm(dir,{recursive:true});}
});
test('integrity failures and cancellation never return stale results; failures recover',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gazetteer-test-'));
 try{
  const manifest=await compileShards(data,dir);let bad=true,release;
  const lazy=createShardLoader(manifest,async file=>bad?Buffer.from('bad'):readFile(join(dir,file)));
  await assert.rejects(lazy.search('Тест'),/integrity/);bad=false;
  assert.equal((await lazy.search('Тест')).items.length,2);
  const abort=new AbortController();abort.abort();await assert.rejects(lazy.search('Тест',{signal:abort.signal}));
  const delayed=createShardLoader(manifest,async file=>{await new Promise(r=>{release=r;});return readFile(join(dir,file));});
  const controller=new AbortController(),pending=delayed.search('Тест',{signal:controller.signal});
  await new Promise(r=>setImmediate(r));controller.abort();release();await assert.rejects(pending);
 }finally{await rm(dir,{recursive:true});}
});
test('reject unsafe paths and invalid query bounds, including cache misses',async()=>{
 const lazy=createShardLoader({schemaVersion:1,runtimeApproved:false,shards:{тес:{file:'../bad'}}},()=>{throw Error('must not read');});
 await assert.rejects(lazy.search('Тест'),/metadata/);await assert.rejects(lazy.search('Нет',{limit:100}),/bounds/);
});
test('queue is bounded and concurrent same-prefix requests share one load',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gazetteer-test-'));
 try{
  const manifest=await compileShards(data,dir);let release,reads=0;
  const lazy=createShardLoader(manifest,async file=>{reads++;await new Promise(r=>{release=r;});return readFile(join(dir,file));});
  const tasks=Array.from({length:16},()=>lazy.search('Тест'));
  await assert.rejects(lazy.search('Тест'),/queue full/);
  await new Promise(r=>setImmediate(r));release();await Promise.all(tasks);
  assert.equal(reads,1);assert.deepEqual(lazy.stats(),{residentShards:1,pending:0,loads:1});
 }finally{await rm(dir,{recursive:true});}
});
