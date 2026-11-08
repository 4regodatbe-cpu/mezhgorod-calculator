import test from 'node:test';import assert from 'node:assert/strict';
import {NextRequest} from 'next/server';import {POST} from '../app/api/v3/calculate/route.ts';
import {validateTollEdges} from '../lib/toll-validator.ts';
const from={label:'Анапа',position:{lng:37.32,lat:44.9}},to={label:'Краснодар',position:{lng:38.98,lat:45.04}};
const request=(signal:AbortSignal)=>new NextRequest('http://localhost/api/v3/calculate',{method:'POST',signal,body:JSON.stringify({from,to,departureAt:'2026-10-15T09:00:00+03:00'})});
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
test('an already cancelled calculation starts no geocoder or route request',async()=>{
 const controller=new AbortController();controller.abort();const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return json({},503);};
 try{const response=await POST(request(controller.signal));assert.equal(response.status,400);assert.deepEqual(await response.json(),{error:'Расчёт отменён'});assert.equal(calls,0);}finally{globalThis.fetch=original;}
});
test('caller cancellation reaches every pending route provider and does not start toll matching',async()=>{
 const controller=new AbortController(),original=globalThis.fetch;const signals:AbortSignal[]=[];let traces=0,aborted=0;
 globalThis.fetch=async(url,init)=>{
  if(new URL(String(url)).pathname==='/trace_attributes'){traces++;return json({},503);}
  const signal=init!.signal as AbortSignal;signals.push(signal);if(signals.length===1)queueMicrotask(()=>controller.abort());
  return new Promise<Response>((resolve,reject)=>{const timer=setTimeout(()=>resolve(json({},503)),15);const cancel=()=>{clearTimeout(timer);aborted++;reject(new DOMException('Cancelled','AbortError'));};if(signal.aborted)cancel();else signal.addEventListener('abort',cancel,{once:true});});
 };
 try{const response=await POST(request(controller.signal));assert.equal(response.status,400);assert.equal(signals.length,3);assert.ok(signals.every(s=>s.aborted));assert.equal(aborted,3);assert.equal(traces,0);}finally{globalThis.fetch=original;}
});
test('cancellation during selected-route trace aborts matching and cannot turn partial evidence into a result',async()=>{
 const controller=new AbortController(),original=globalThis.fetch;let traceAborted=false;
 globalThis.fetch=async(url,init)=>{
  const u=new URL(String(url));
  if(u.hostname==='router.project-osrm.org')return json({routes:[{distance:170000,duration:10000,geometry:{coordinates:[[37.32,44.9],[37.8330177,45.1961096],[38.5327744,45.171408],[38.98,45.04]]},legs:[]}]});
  if(u.pathname!=='/trace_attributes')return json({},503);
  queueMicrotask(()=>controller.abort());const signal=init!.signal as AbortSignal;
  return new Promise<Response>((resolve,reject)=>{const timer=setTimeout(()=>resolve(json({},503)),15);const cancel=()=>{clearTimeout(timer);traceAborted=true;reject(new DOMException('Cancelled','AbortError'));};if(signal.aborted)cancel();else signal.addEventListener('abort',cancel,{once:true});});
 };
 try{const response=await POST(request(controller.signal));assert.equal(response.status,400);assert.equal(traceAborted,true);assert.deepEqual(await response.json(),{error:'Расчёт отменён'});}finally{globalThis.fetch=original;}
});
test('special corridors forward cancellation without switching to a different corridor',async()=>{
 const controller=new AbortController(),original=globalThis.fetch;const signals:AbortSignal[]=[];let traces=0;
 globalThis.fetch=async(url,init)=>{
  if(new URL(String(url)).pathname==='/trace_attributes'){traces++;return json({},503);}
  const signal=init!.signal as AbortSignal;signals.push(signal);if(signals.length===1)queueMicrotask(()=>controller.abort());
  return new Promise<Response>((resolve,reject)=>{const timer=setTimeout(()=>resolve(json({},503)),15);const cancel=()=>{clearTimeout(timer);reject(signal.reason);};if(signal.aborted)cancel();else signal.addEventListener('abort',cancel,{once:true});});
 };
 const body={from:{label:'Донецк',position:{lng:37.8029,lat:48.0156}},to:{label:'Москва',position:{lng:37.62,lat:55.75}},departureAt:'2026-10-15T09:00:00+03:00'};
 try{const response=await POST(new NextRequest('http://localhost/api/v3/calculate',{method:'POST',signal:controller.signal,body:JSON.stringify(body)}));assert.equal(response.status,400);assert.ok(signals.length>=2);assert.ok(signals.every(s=>s.aborted));assert.equal(traces,0);}finally{globalThis.fetch=original;}
});
test('label-only geocoding also receives caller cancellation and never starts routing',async()=>{
 const controller=new AbortController(),original=globalThis.fetch;const signals:AbortSignal[]=[];
 globalThis.fetch=async(url,init)=>{
  assert.equal(new URL(String(url)).hostname,'photon.komoot.io');const signal=init!.signal as AbortSignal;signals.push(signal);if(signals.length===1)queueMicrotask(()=>controller.abort());
  return new Promise<Response>((resolve,reject)=>{const timer=setTimeout(()=>resolve(json({},503)),15);const cancel=()=>{clearTimeout(timer);reject(signal.reason);};if(signal.aborted)cancel();else signal.addEventListener('abort',cancel,{once:true});});
 };
 try{const response=await POST(new NextRequest('http://localhost/api/v3/calculate',{method:'POST',signal:controller.signal,body:JSON.stringify({from:{label:'Анапа'},to:{label:'Краснодар'}})}));assert.equal(response.status,400);assert.equal(signals.length,2);assert.ok(signals.every(s=>s.aborted));}finally{globalThis.fetch=original;}
});
test('abort interrupts trace429 Retry-After wait without an early or late retry',async()=>{
 const controller=new AbortController(),original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;setTimeout(()=>controller.abort(),0);return new Response('',{status:429,headers:{'retry-after':'1'}});};
 try{await assert.rejects(validateTollEdges([[37.32,44.9],[38.98,45.04]],controller.signal),e=>e===controller.signal.reason);assert.equal(calls,1);}finally{globalThis.fetch=original;}
});
