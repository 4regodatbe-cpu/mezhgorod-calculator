import test from 'node:test';
import assert from 'node:assert/strict';
import {NextRequest} from 'next/server';
import {POST} from '../app/api/v3/calculate/route.ts';
import {validV3Response} from '../app/v3/components/response-validation.ts';
const anapa={label:'Анапа',position:{lng:37.32,lat:44.90}};
const krasnodar={label:'Краснодар',position:{lng:38.98,lat:45.04}};
const yalta={label:'Ялта',position:{lng:34.16,lat:44.5}};
const gates=[[37.5878131,45.168457],[37.8330177,45.1961096],[38.5327744,45.171408]];
function polyline(points:number[][]){let lat=0,lng=0,s='';const enc=(n:number)=>{let v=n<0?~(n<<1):n<<1,r='';while(v>=32){r+=String.fromCharCode((32|(v&31))+63);v>>=5;}return r+String.fromCharCode(v+63);};for(const [x,y]of points){const a=Math.round(y*1e6),b=Math.round(x*1e6);s+=enc(a-lat)+enc(b-lng);lat=a;lng=b;}return s;}
const json=(data:unknown,status=200)=>Response.json(data,{status});
type Mode='a289'|'extra'|'failed'|'malformed'|'free';
async function request(mode:Mode,diagnostics=false,special=false){
 const original=globalThis.fetch;
 const traceShapes:Array<Array<{lon:number;lat:number}>>=[];
 globalThis.fetch=async(input,init)=>{
  const url=new URL(String(input));
  if(url.pathname==='/trace_attributes'){
   traceShapes.push(JSON.parse(String(init?.body)).shape);
   if(mode==='failed')return json({},503);
   if(mode==='malformed')return json({edges:[]});
   if(mode==='free')return json({edges:[{toll:false,names:['local road']}]});
   const edges=[{toll:true,names:['А-289'],way_id:1,end_node:{type:'toll_booth',node_id:13022464435}}];
   if(mode==='extra')edges.push({toll:true,names:['ЗСД'],way_id:2,end_node:{type:'toll_booth',node_id:999999}});
   return json({edges});
  }
  if(url.hostname==='valhalla1.openstreetmap.de'&&url.pathname==='/route'){
   const q=JSON.parse(url.searchParams.get('json')!);
   const controls=q.locations.map((p:{lon:number;lat:number})=>[p.lon,p.lat]);
   const shape=mode==='free'?controls:[...controls.slice(0,-1),...(special?gates:gates.slice(1)),controls.at(-1)];
   const length=mode==='free'?3:special?450:170,time=mode==='free'?600:special?22000:10000;
   return json({trip:{summary:{length,time},legs:[{shape:polyline(shape),summary:{length,time},maneuvers:[]}]}});
  }
  return json({},503);
 };
 try{
  const from=mode==='free'?{label:'A',position:{lng:60,lat:60}}:special?yalta:anapa;
  const to=mode==='free'?{label:'B',position:{lng:60.03,lat:60.03}}:krasnodar;
  const result=await POST(new NextRequest('http://localhost/api/v3/calculate',{method:'POST',body:JSON.stringify({from,to,departureAt:'2026-10-14T12:00:00+03:00',diagnostics})}));
  const body=await result.json();assert.equal(result.status,200,JSON.stringify(body));
  assert.equal(validV3Response(body),true);
  return {body,traceShapes};
 }finally{globalThis.fetch=original;}
}

test('mandatory paid trace cannot be disabled by diagnostics on ordinary or special V3',async()=>{
 for(const special of [false,true]){
  const outputs=[];
  for(const diagnostics of [false,true]){
   const result=await request('extra',diagnostics,special);
   assert.ok(result.traceShapes.length>0);
   const toll=result.body.legs[0].fast.tolls;
   assert.equal(toll.pricingStatus,'unknown');assert.equal(toll.amount,null);
   assert.ok(toll.segments.some((s:string)=>s.includes('zsd')));
   outputs.push(toll);
  }
  assert.deepEqual(outputs[0],outputs[1]);
 }
});

test('complete paid traces preserve the actual A289 price without confirmation labels',async()=>{
 for(const [special,amount]of [[false,620],[true,800]] as const){
  const result=await request('a289',false,special);
  assert.ok(result.traceShapes.some(shape=>shape.some(p=>Math.abs(p.lon-38.5327744)<0.00001)));
  assert.equal(result.body.legs[0].fast.tolls.amount,amount);
  assert.equal('displayLabel' in result.body.legs[0].fast.tolls,false);
  assert.equal('priceConfirmation' in result.body.legs[0].fast.tolls,false);
  assert.ok(result.body.legs[0].fast.tolls.segments.every((segment:string)=>!segment.includes('Стоимость не подтверждена')));
  assert.equal(result.body.legs.length,1);assert.equal(result.body.legs[0].free,null);
 }
});

test('failed or empty paid traces cannot certify a complete numeric amount',async()=>{
 for(const mode of ['failed','malformed'] as const){
  const result=await request(mode);
  const toll=result.body.legs[0].fast.tolls;
  assert.equal(toll.pricingStatus,'unknown');
  for(const key of ['amount','weekdayAmount','weekendAmount'])assert.equal(toll[key],null);
  assert.ok(toll.segments.some((s:string)=>s.includes('selected_route_payment_trace_incomplete')));
 }
});

test('a fully checked two-point free route retains explicit zero',async()=>{
 const result=await request('free');
 assert.ok(result.traceShapes.length>0);
 const toll=result.body.legs[0].fast.tolls;
 assert.equal(toll.pricingStatus,'free');assert.equal(toll.amount,0);
 assert.equal('priceConfirmation' in toll,false);assert.equal('displayLabel' in toll,false);
});

test('V3 response guard rejects multiple routes and mismatched duplicate special options',async()=>{
 const {body}=await request('a289');
 assert.equal(validV3Response({...body,legs:[body.legs[0],body.legs[0]]}),false);
 assert.equal(validV3Response({...body,options:[body.legs[0],body.legs[0]]}),false);
 assert.equal(validV3Response({...body,options:[structuredClone(body.legs[0])]}),true);
 for(const mutate of [
  (option:any)=>option.fast.seconds+=1,
  (option:any)=>option.fast.tolls.amount+=1,
  (option:any)=>option.fast.pricingByVehicle.comfort.totalPrice+=1,
 ]){
  const option=structuredClone(body.legs[0]);mutate(option);
  assert.equal(validV3Response({...body,options:[option]}),false);
 }
 const alternative=structuredClone(body.legs[0]);alternative.free=structuredClone(alternative.fast);
 assert.equal(validV3Response({...body,legs:[alternative]}),false);
});
