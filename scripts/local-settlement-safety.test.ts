import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {NextRequest} from 'next/server';
import {GET} from '../app/api/suggest/route.ts';
import {localPilotAllowed} from '../lib/local-settlement-search.ts';
test('Preview pilot is restricted to exact branch; Production cannot use local-test override',()=>{
 const base={GEONAMES_LOCAL_PILOT:'1',VERCEL:'1',VERCEL_GIT_COMMIT_REF:'fix/v3-missing-route-prices-2026-10-15'};
 assert.equal(localPilotAllowed({...base,VERCEL_ENV:'preview'}),true);
 for(const VERCEL_ENV of ['production','development',undefined])assert.equal(localPilotAllowed({...base,VERCEL_ENV,GEONAMES_LOCAL_TEST:'1'}),false);
 for(const VERCEL_GIT_COMMIT_REF of ['main','other',undefined])assert.equal(localPilotAllowed({...base,VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF}),false);
 assert.equal(localPilotAllowed({...base,VERCEL_ENV:'preview',GEONAMES_LOCAL_PILOT:'0'}),false);
 assert.equal(localPilotAllowed({NODE_ENV:'production',GEONAMES_LOCAL_PILOT:'1'}),false);
 assert.equal(localPilotAllowed({NODE_ENV:'production',GEONAMES_LOCAL_PILOT:'1',GEONAMES_LOCAL_TEST:'1'}),true);
});
test('failed local data falls back to pure Photon response; cancellation does not invoke Photon',async()=>{
 const saved={...process.env},original=globalThis.fetch,directory=await mkdtemp(join(tmpdir(),'geonames-failure-'));let calls=0;
 process.env.GEONAMES_LOCAL_PILOT='1';process.env.GEONAMES_LOCAL_TEST='1';process.env.GEONAMES_LOCAL_PILOT_DIR=directory;delete process.env.VERCEL;delete process.env.VERCEL_ENV;
 globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({features:[{geometry:{coordinates:[37.617,55.75]},properties:{name:'Москва',city:'Москва',state:'Москва',countrycode:'RU',osm_id:1,osm_type:'R',osm_key:'place',osm_value:'city'}}]}),{status:200});};
 try{
  const response=await GET(new NextRequest('http://localhost/api/suggest?q=Москва')),body=await response.json();assert.equal(response.status,200);assert.ok(calls>0);assert.ok(body.items.length);assert.equal(body.localSource,undefined);assert.ok(body.items.every((x:{id:string})=>!x.id.startsWith('geonames-')));
  const before=calls,controller=new AbortController();controller.abort();const cancelled=await GET(new NextRequest('http://localhost/api/suggest?q=Отменённый',{signal:controller.signal}));assert.equal(cancelled.status,502);assert.equal(calls,before);
 }finally{
  globalThis.fetch=original;for(const key of ['GEONAMES_LOCAL_PILOT','GEONAMES_LOCAL_TEST','GEONAMES_LOCAL_PILOT_DIR','VERCEL','VERCEL_ENV']){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key];}await rm(directory,{recursive:true});
 }
});
