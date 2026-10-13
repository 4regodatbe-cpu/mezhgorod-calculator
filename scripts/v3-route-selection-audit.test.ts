import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/v3/calculate/route.ts';
import { isUsableRoute } from '../lib/v3-calculation/route-candidate.ts';
import type { Coordinate } from '../lib/tolls.ts';

const anapa={label:'Анапа',position:{lng:37.32,lat:44.90}};
const krasnodar={label:'Краснодар',position:{lng:38.98,lat:45.04}};
const donetsk={label:'Донецк',position:{lng:37.8029,lat:48.0156}};
const moscow={label:'Москва',position:{lng:37.6174782,lat:55.7505412}};
const twoFrames:Coordinate[]=[[37.8330177,45.1961096],[38.5327744,45.171408]];
const threeFrames:Coordinate[]=[[37.5878131,45.168457],...twoFrames];
function polyline(points:Coordinate[]){let lat=0,lng=0,s='';const enc=(n:number)=>{let v=n<0?~(n<<1):n<<1,r='';while(v>=32){r+=String.fromCharCode((32|(v&31))+63);v>>=5;}return r+String.fromCharCode(v+63);};for(const [x,y] of points){const a=Math.round(y*1e6),b=Math.round(x*1e6);s+=enc(a-lat)+enc(b-lng);lat=a;lng=b;}return s;}
function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});}
type Provider={meters:number;seconds:number;interior?:Coordinate[];coordinates?:Coordinate[]};
async function calculate(from:typeof anapa,to:typeof anapa,providers:{valhalla?:Provider;osrm?:Provider;brouter?:Provider}){
 const original=globalThis.fetch;
 const requests:string[]=[];
 globalThis.fetch=async(input)=>{
  const url=new URL(String(input));requests.push(url.href);
  const provider=url.hostname==='valhalla1.openstreetmap.de'&&url.pathname==='/route'?'valhalla':url.hostname==='router.project-osrm.org'?'osrm':url.hostname==='brouter.de'?'brouter':null;
  if(!provider||!providers[provider])return json({},503);
  const p=providers[provider]!;
  const coordinates=p.coordinates??[[from.position.lng,from.position.lat],...(p.interior??[]),[to.position.lng,to.position.lat]];
  if(provider==='valhalla')return json({trip:{summary:{length:p.meters/1000,time:p.seconds},legs:[{shape:polyline(coordinates),summary:{length:p.meters/1000,time:p.seconds},maneuvers:[]}]}});
  if(provider==='osrm')return json({routes:[{distance:p.meters,duration:p.seconds,geometry:{coordinates},legs:[]}]});
  return json({features:[{properties:{'track-length':p.meters,'total-time':p.seconds},geometry:{coordinates}}]});
 };
 try {
  const result=await POST(new NextRequest('http://localhost/api/v3/calculate',{method:'POST',body:JSON.stringify({from,to,departureAt:'2026-10-13T09:00:00+03:00'})}));
  return {status:result.status,body:await result.json(),requests};
 } finally {globalThis.fetch=original;}
}

test('fastest OSRM geometry owns the A289 quote; slower Valhalla evidence cannot replace it',async()=>{
 const r=await calculate(anapa,krasnodar,{
  valhalla:{meters:200000,seconds:12000,interior:threeFrames},
  osrm:{meters:170000,seconds:10000,interior:twoFrames},
  brouter:{meters:180000,seconds:11000,interior:threeFrames},
 });
 assert.equal(r.status,200,JSON.stringify(r.body));
 const fast=r.body.legs[0].fast;
 assert.equal(fast.seconds,10000);assert.equal(fast.meters,170000);
 assert.deepEqual(fast.quality.providers,['OSRM']);
 assert.equal(fast.tolls.pricingStatus,'priced');
 assert.ok([833,1243].includes(fast.tolls.amount),JSON.stringify(fast.tolls));
 assert.equal(r.body.legs[0].free,null);assert.equal(r.body.legs[0].freeError,undefined);
 assert.equal(r.requests.filter(url=>url.includes('/route?')&&url.includes('toll_booth_penalty')).length,0);
});

test('ordinary V3 skips malformed fast distance and keeps the valid provider route',async()=>{
 const r=await calculate(anapa,krasnodar,{valhalla:{meters:-1,seconds:1,interior:twoFrames},osrm:{meters:170000,seconds:10000,interior:twoFrames}});
 assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.legs[0].fast.meters,170000);
 assert.deepEqual(r.body.legs[0].fast.quality.providers,['OSRM']);
});

test('special-zone V3 filters invalid time before choosing and pricing the winning route',async()=>{
 const r=await calculate(donetsk,moscow,{valhalla:{meters:1200000,seconds:-1},osrm:{meters:1210000,seconds:60000}});
 assert.equal(r.status,200,JSON.stringify(r.body));
 assert.equal(r.body.options.length,1);assert.equal(r.body.options[0].fast.seconds,60000);
 assert.equal(r.body.options[0].fast.meters,1210000);assert.deepEqual(r.body.options[0].fast.quality.providers,['OSRM']);
});

test('equal ETA keeps provider order in both ordinary and special V3 chains',async()=>{
 for(const [from,to] of [[anapa,krasnodar],[donetsk,moscow]]){
  const r=await calculate(from,to,{valhalla:{meters:170000,seconds:10000,interior:from===anapa?twoFrames:[]},osrm:{meters:180000,seconds:10000,interior:from===anapa?twoFrames:[]}});
  assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.legs[0].fast.meters,170000);
  assert.deepEqual(r.body.legs[0].fast.quality.providers,['Valhalla']);
 }
});

test('route candidate requires finite positive totals, valid coordinates and matching endpoints',()=>{
 const good={meters:170000,seconds:10000,coordinates:[[37.32,44.90],...twoFrames,[38.98,45.04]] as Coordinate[]};
 assert.equal(isUsableRoute(good,anapa,krasnodar),true);
 for(const bad of [{...good,meters:NaN},{...good,seconds:Infinity},{...good,coordinates:[]},{...good,coordinates:[[0,0],[38.98,45.04]] as Coordinate[]},{...good,coordinates:[[37.32,44.90],[37,91],[38.98,45.04]] as Coordinate[]},{...good,coordinates:good.coordinates.toReversed()}])assert.equal(isUsableRoute(bad,anapa,krasnodar),false);
});

test('incomplete geometry never becomes a straight line priced as a real road',async()=>{
 const r=await calculate(anapa,krasnodar,{osrm:{meters:170000,seconds:10000,coordinates:[]}});
 assert.equal(r.status,502,JSON.stringify(r.body));assert.equal(r.body.legs,undefined);
});

test('unresolved A289 vector stays unknown instead of reviving a legacy numeric total',async()=>{
 const r=await calculate(anapa,krasnodar,{osrm:{meters:200000,seconds:12000,interior:threeFrames}});
 assert.equal(r.status,200,JSON.stringify(r.body));
 assert.equal(r.body.legs[0].fast.tolls.pricingStatus,'unknown',JSON.stringify(r.body.legs[0].fast.tolls));
 assert.equal(r.body.legs[0].fast.tolls.amount,null);
});
