import assert from 'node:assert/strict';
import test from 'node:test';
import {validateTollEdges} from '../lib/toll-validator.ts';
const route:[number,number][]=[[60,60],[60.001,60.001],[60.002,60.002]];
test('one temporary trace rate limit retries and preserves an actual paid edge',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>++calls===1?new Response('',{status:429,headers:{'retry-after':'0'}}):Response.json({edges:[{toll:true,names:['ЗСД'],way_id:1}]});
 try{const result=await validateTollEdges(route);assert.equal(calls,2);assert.equal(result.complete,true);assert.equal(result.status,'toll');assert.deepEqual(result.roadNames,['ЗСД']);}
 finally{globalThis.fetch=original;}
});
test('a persistent rate limit cannot become free and has exactly one retry',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return new Response('',{status:429,headers:{'retry-after':'0'}});};
 try{const result=await validateTollEdges(route);assert.equal(calls,2);assert.equal(result.complete,false);assert.equal(result.status,'unknown');}
 finally{globalThis.fetch=original;}
});
test('a long Retry-After remains incomplete without ignoring the server delay',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return new Response('',{status:429,headers:{'retry-after':'60'}});};
 try{const result=await validateTollEdges(route);assert.equal(calls,1);assert.equal(result.complete,false);assert.equal(result.status,'unknown');}
 finally{globalThis.fetch=original;}
});
