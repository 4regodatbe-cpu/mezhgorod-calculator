// Real-data regression fixtures, not application lookup overrides.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createLocalGazetteer} from './local-gazetteer.mjs';
import {openShardLoader} from './local-gazetteer-shards.mjs';
const [input,directory,output]=process.argv.slice(2);if(!input||!directory||!output)throw Error('Pass catalog, shards and report');
const full=createLocalGazetteer(JSON.parse(readFileSync(input,'utf8'))),lazy=await openShardLoader(directory);
const original=globalThis.fetch;let networkCalls=0;globalThis.fetch=()=>{networkCalls++;throw Error('Provider outage: no external calls allowed');};
const results=[];
try{
 for(const query of ['Доне','Донецк','Донецк Ростовская область','Волноваха','Луганск','Мариуполь','Мелитополь','Бердянск','Геническ','Симферополь','Севастополь','Ялта','Керчь','Краснодар','Москва','Санкт-Петербург','Тарасовка','Нов','несуществующийпункт']){
  const actual=await lazy.search(query),expected=full.search(query);
  assert.deepEqual(actual.items,expected.items,query);assert.equal(actual.truncated,expected.truncated,query);
  if(query==='Донецк')assert.deepEqual(actual.items.slice(0,2).map(x=>x.id),['geonames-709717','geonames-565348']);
  if(query==='Волноваха')assert.equal(actual.items[0].id,'geonames-689198');
  results.push({query,status:'PASS',count:actual.items.length,truncated:actual.truncated});
 }
}finally{globalThis.fetch=original;}
writeFileSync(output,JSON.stringify({status:'PASS',runtimeApproved:false,networkCalls,queries:results},null,2)+'\n');console.log(JSON.stringify({pass:results.length,networkCalls}));
