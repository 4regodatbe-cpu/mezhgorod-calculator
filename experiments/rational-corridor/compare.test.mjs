import test from 'node:test';
import assert from 'node:assert/strict';
import {compareCorridors} from './compare.mjs';
const route=(id,hours,specialHours,km)=>({id,seconds:hours*3600,specialSeconds:specialHours*3600,meters:km*1000,verified:true});
test('owner trial weight: two ordinary hours equal one special hour; tie prefers less actual time',()=>{
 const direct=route('direct',1,1,60),external=route('external',2,0,120);
 const r=compareCorridors([external,direct]);
 assert.equal(r.specialTimeWeight,2);
 assert.equal(r.ranked[0].score,r.ranked[1].score);
 assert.equal(r.selected,'direct');
 assert.equal(compareCorridors([direct,route('external',1.9,0,115)]).selected,'external');
 assert.equal(compareCorridors([direct,route('external',2.1,0,125)]).selected,'direct');
});
test('huge detour for a small reduction retains the direct trip',()=>{
 const r=compareCorridors([route('direct',3,3,200),route('external',12,2,900)]);
 assert.equal(r.selected,'direct');
});
test('substantial exposure reduction can justify a moderate total detour',()=>{
 const r=compareCorridors([route('direct',7,7,450),route('external',9,2,650)]);
 assert.equal(r.selected,'external');assert.equal(r.extraSeconds,7200);assert.equal(r.avoidedSpecialSeconds,18000);
});
test('a slower route with no exposure saving cannot win',()=>{
 assert.equal(compareCorridors([route('direct',2,1,120),route('external',4,1,250)]).selected,'direct');
});
test('unverified timing and unavailable alternative cannot produce a recommendation',()=>{
 const a=route('direct',3,3,200),b={...route('external',8,1,600),verified:false};
 assert.equal(compareCorridors([a,b]).status,'insufficient-evidence');
 assert.equal(compareCorridors([a]).selected,null);
 assert.equal(compareCorridors([a,{...b,verified:true,specialSeconds:999999}]).selected,null);
});
test('ranking is invariant to candidate order and contains no place-name exceptions',()=>{
 const a=route('x',7,7,450),b=route('y',9,2,650);
 assert.equal(compareCorridors([a,b]).selected,compareCorridors([b,a]).selected);
});
