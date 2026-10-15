import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/v3/calculate/route.ts';

const originalFetch=globalThis.fetch;
const point=(lng:number,lat:number)=>({label:'Контрольная точка',position:{lng,lat}});
const krasnodar=point(38.98,45.04),anapa=point(37.32,44.90),yalta=point(34.16,44.5);
const gates=[[37.5878131,45.168457],[37.8330177,45.1961096],[38.5327744,45.171408]];
function polyline(points:number[][]){let lat=0,lng=0,s='';const enc=(n:number)=>{let v=n<0?~(n<<1):n<<1,r='';while(v>=32){r+=String.fromCharCode((32|(v&31))+63);v>>=5;}return r+String.fromCharCode(v+63);};for(const [x,y] of points){const a=Math.round(y*1e6),b=Math.round(x*1e6);s+=enc(a-lat)+enc(b-lng);lat=a;lng=b;}return s;}
function response(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});}
// Only routing transport is simulated. The actual API, geographic policy,
// physical gate detector, matrix, composition and response serializers run.
globalThis.fetch=async(input)=>{
 const url=new URL(String(input));
 if(url.pathname==='/trace_attributes')return response({edges:[{toll:true,names:['А-289'],way_id:1,end_node:{type:'toll_booth',node_id:13022464435}}]});
 if(url.hostname==='valhalla1.openstreetmap.de'&&url.pathname==='/route'){
  const q=JSON.parse(url.searchParams.get('json')!);
  const controls=q.locations.map((p:{lon:number;lat:number})=>[p.lon,p.lat]);
  const isCrimea=controls[0][0]<35;
  const shape=[...controls.slice(0,-1),...(isCrimea?gates:gates.slice(1)),controls.at(-1)];
  return response({trip:{summary:{length:isCrimea?450:170,time:isCrimea?22000:10000},legs:[{shape:polyline(shape),summary:{length:isCrimea?450:170,time:isCrimea?22000:10000},maneuvers:[]}]}});
 }
 return response({},503);
};
const req=(body:unknown)=>new NextRequest('http://localhost/api/v3/calculate',{method:'POST',body:JSON.stringify(body)});
test('V3 Anapa and Yalta requests expose numeric A289 price without confirmation labels',async()=>{
 for(const [from,minPrice] of [[anapa,620],[yalta,800]] as const){
  const result=await POST(req({from,to:krasnodar,departureAt:'2026-10-13T09:00:00+03:00'}));
  const body=await result.json();
  assert.equal(result.status,200,JSON.stringify(body));
  assert.equal(body.legs.length,1);
  const tolls=body.legs[0].fast.tolls;
  assert.equal(tolls.pricingStatus,'priced',JSON.stringify(tolls));
  assert.ok(tolls.amount===minPrice||tolls.amount===minPrice+410,JSON.stringify(tolls));
  assert.equal('priceConfirmation' in tolls,false);
  assert.equal('displayLabel' in tolls,false);
  assert.ok(tolls.segments.every((segment:string)=>!segment.includes('Стоимость не подтверждена')));
  assert.ok(body.legs[0].fast.pricingByVehicle.comfort.totalPrice>0);
 }
});
test('omitted departure date is normalized; malformed rates are rejected',async()=>{
 const r=await POST(req({from:anapa,to:krasnodar}));
 assert.equal(r.status,200);
 assert.equal((await r.json()).legs[0].fast.tolls.pricingStatus,'priced');
 assert.equal((await POST(req({from:anapa,to:krasnodar,multiplier:-1}))).status,400);
});
test('invalid calendar and ambiguous dates fail before any external request',async()=>{
 const routingFetch=globalThis.fetch;
 let requests=0;
 globalThis.fetch=async()=>{requests++;throw new Error('Unexpected external request');};
 try {
  for(const departureAt of ['2026-02-30T09:00:00+03:00','2026-02-29','2026-04-31','10/13/2026','2026-10-13T09:00:00','2026-10-13T24:00:00Z']) {
   const result=await POST(req({from:anapa,to:krasnodar,departureAt}));
   assert.equal(result.status,400,departureAt);
   assert.equal((await result.json()).error,'Некорректная дата поездки',departureAt);
  }
  assert.equal(requests,0);
 } finally {globalThis.fetch=routingFetch;}
});
test('valid leap day and explicit timezone dates remain accepted',async()=>{
 for(const departureAt of ['2028-02-29T09:00:00+03:00','2026-10-13','2026-10-13T06:00:00.000Z']) {
  const result=await POST(req({from:anapa,to:krasnodar,departureAt}));
  assert.equal(result.status,200,departureAt+': '+JSON.stringify(await result.json()));
 }
});
test.after(()=>{globalThis.fetch=originalFetch;});
