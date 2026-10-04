import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/v2/calculate/route.ts";
import { POST as classify } from "../app/api/v2/classify/route.ts";
import { osrmRoute, valhalla } from "../lib/route-providers.ts";
let transit=false;
const requestedPaths:number[][][]=[];
const originalFetch=globalThis.fetch;
const point=(lng:number,lat:number)=>({label:"Название не определяет зону",position:{lng,lat}});
const from=point(38.98,45.04),to=point(39.05,45.1);
function response(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json"}});}
function polyline(points:number[][]){let lat=0,lng=0,s='';const enc=(n:number)=>{let v=n<0?~(n<<1):n<<1,r='';while(v>=32){r+=String.fromCharCode((32|(v&31))+63);v>>=5;}return r+String.fromCharCode(v+63);};for(const [x,y]of points){const a=Math.round(y*1e6),b=Math.round(x*1e6);s+=enc(a-lat)+enc(b-lng);lat=a;lng=b;}return s;}
globalThis.fetch=async(input)=>{
  const url=new URL(String(input));
  if(url.hostname==='photon.komoot.io')return response({features:[{geometry:{coordinates:[37.8029,48.0156]},properties:{name:"Геокодированная точка"}}]});
  if(url.hostname==='valhalla1.openstreetmap.de'&&url.pathname==='/route') {
    const q=JSON.parse(url.searchParams.get('json')!);const points=q.locations.map((p:{lon:number;lat:number})=>[p.lon,p.lat]);
    requestedPaths.push(points);
    if(transit)return response({},503);
    const legs=points.slice(1).map((p:number[],i:number)=>({shape:polyline([points[i],p]),summary:{length:100,time:(i+1)*1000},maneuvers:[]}));
    return response({trip:{summary:{length:legs.length*100,time:legs.reduce((s:number,l:{summary:{time:number}})=>s+l.summary.time,0)},legs}});
  }
  if(url.hostname==='router.project-osrm.org') {
    let points=url.pathname.split('/').at(-1)!.split(';').map(p=>p.split(',').map(Number));
    requestedPaths.push(points);
    if(transit)points=[points[0],[37.8029,48.0156],points.at(-1)!];
    const legs=points.slice(1).map((p,i)=>({distance:100000,duration:(i+1)*1000,steps:[{geometry:{coordinates:[points[i],p]}}]}));
    return response({routes:[{distance:legs.length*100000,duration:legs.reduce((s,l)=>s+l.duration,0),geometry:{coordinates:points},legs}]});
  }
  return response({},503); // Unknown toll validation is not a free road.
};
const req=(body:unknown)=>new NextRequest('http://localhost/api/v2/calculate',{method:'POST',body:JSON.stringify(body)});
test('coordinate endpoint classifies all areas and rejects malformed input',async()=>{
  const r=await classify(req({positions:[{lat:48.0156,lng:37.8029},{lat:44.95,lng:34.1}]}));assert.equal(r.status,200);assert.deepEqual((await r.json()).territories,['dnr',null]);
  assert.equal((await classify(req({positions:[{lat:200,lng:0}]}))).status,400);
});
test('both providers retain distinct per-leg seconds and geometries',async()=>{
  for(const route of [await valhalla(from,to,1,[from.position,{lat:45.06,lng:39.01},to.position]),await osrmRoute(from,to,[from.position,{lat:45.06,lng:39.01},to.position])]){
    assert.deepEqual(route.legs?.map(l=>l.seconds),[1000,2000]);assert.ok(route.legs?.every(l=>l.coordinates.length===2));assert.equal(route.seconds,3000);
  }
});
test('ordinary calculation preserves unknown toll price, prices all classes and does not require via',async()=>{
  const r=await POST(req({from,to,mode:'dual',modeOverride:true}));const body=await r.json();assert.equal(r.status,200,JSON.stringify(body));
  assert.equal(body.mode,'dual');assert.equal(body.legs[0].fast.tolls.pricingStatus,'unknown');assert.equal(body.legs[0].fast.tolls.amount,null);
  assert.ok(body.legs[0].fast.pricingByVehicle.comfort.totalPrice>0);
});
test('server geocoding automatically enables special rates; manual ordinary remains ordinary',async()=>{
  const r=await POST(req({from,to:{label:'Без координат'},mode:'standard',specialRates:{standard:71,comfort:81,comfortPlus:91,minivan:111}}));
  const body=await r.json();assert.equal(r.status,200,JSON.stringify(body));assert.equal(body.mode,'dual');assert.equal(body.options.length,1);
  const segments=body.options[0].fast.pricingByVehicle.comfort.pricingSegments;
  assert.ok(segments.some((s:{type:string;ratePerKm:number})=>s.type==='special'&&s.ratePerKm===81));
  assert.ok(requestedPaths.some(p=>p.some(([lng])=>lng===39.86)),'mainland candidate selected by destination coordinates');
  assert.equal(requestedPaths.some(p=>p.some(([lng])=>lng===36.7161)),false,'outside-zone destination does not request Crimea');
  assert.ok(body.options.every((o:{free:unknown;freeCandidate:unknown})=>o.free===null&&o.freeCandidate===null));
  const manual=await POST(req({from,to:point(37.8029,48.0156),mode:'standard',modeOverride:true}));const m=await manual.json();assert.equal(manual.status,200);assert.equal(m.mode,'standard');assert.equal(m.automaticMode,'dual');assert.ok(m.options[0].fast.pricingByVehicle.comfort.pricingSegments.every((s:{type:string})=>s.type==='normal'));
});
test('transit is removed even in manual ordinary mode, not returned as zero price',async()=>{
  transit=true;
  const r=await POST(req({from,to,mode:'standard',modeOverride:true}));assert.notEqual(r.status,200);const body=await r.json();assert.equal(body.legs,undefined);assert.ok(body.error);transit=false;
});
test.after(()=>{globalThis.fetch=originalFetch;});
