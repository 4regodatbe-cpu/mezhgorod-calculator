import test from 'node:test';
import assert from 'node:assert/strict';
import {geocode} from '../lib/route-providers.ts';

test('direct geocode aborts stalled transport and preserves unavailable contract', async()=>{
 const fetchOriginal=globalThis.fetch, timeoutOriginal=AbortSignal.timeout;
 const controller=new AbortController();
 let requestedTimeout=0;
 AbortSignal.timeout=(ms:number)=>{requestedTimeout=ms;return controller.signal;};
 globalThis.fetch=async(_url,init)=>{
  assert.equal(init?.signal,controller.signal);
  const pending=new Promise<Response>((_resolve,reject)=>controller.signal.addEventListener('abort',()=>reject(controller.signal.reason),{once:true}));
  controller.abort(new DOMException('deadline','TimeoutError'));
  return pending;
 };
 try{await assert.rejects(geocode({label:'fixture'}),{message:'GEOCODE_UNAVAILABLE'});assert.equal(requestedTimeout,25000);}
 finally{globalThis.fetch=fetchOriginal;AbortSignal.timeout=timeoutOriginal;}
});

test('direct geocode preserves first feature and supplied-coordinate bypass',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return Response.json({features:[{geometry:{coordinates:[37,55]},properties:{name:'First',city:'City'}},{geometry:{coordinates:[38,56]}}]});};
 try{assert.deepEqual(await geocode({label:'q'}),{label:'First, City',position:{lng:37,lat:55}});assert.deepEqual(await geocode({label:'provided',position:{lat:1,lng:2}}),{label:'provided',position:{lat:1,lng:2}});assert.equal(calls,1);}
 finally{globalThis.fetch=original;}
});
