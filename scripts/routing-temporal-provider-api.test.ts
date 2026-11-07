import test from "node:test";
import assert from "node:assert/strict";
import {setTimeout as wait} from "node:timers/promises";
import {NextRequest} from "next/server";
import {POST} from "../app/api/v3/calculate/route";
const points=[[37.32,44.9],[37.8330177,45.1961096],[38.5327744,45.171408],[38.98,45.04]];
function shape(){let out="",lat=0,lng=0;const put=(d:number)=>{let n=d<0?~(d<<1):d<<1;while(n>=32){out+=String.fromCharCode((32|(n&31))+63);n>>>=5;}out+=String.fromCharCode(n+63);};for(const [x,y] of points){const a=Math.round(y*1e6),b=Math.round(x*1e6);put(a-lat);put(b-lng);lat=a;lng=b;}return out;}
const request=()=>new NextRequest("http://localhost/api/v3/calculate",{method:"POST",body:JSON.stringify({from:{label:"A",position:{lng:37.32,lat:44.9}},to:{label:"B",position:{lng:38.98,lat:45.04}},departureAt:"2026-10-15T09:00:00+03:00"})});
test("actual V3 API: each hanging provider expires independently; slow faster route remains eligible",async()=>{
 const originalFetch=globalThis.fetch,originalTimeout=AbortSignal.timeout;
 const keeper=setTimeout(()=>{},5000);
 try{
  // Only shorten the production provider timer; real timers, no fake settlements.
  AbortSignal.timeout=ms=>originalTimeout(ms===25_000?35:ms);
  for(const hanging of ['valhalla1.openstreetmap.de','router.project-osrm.org','brouter.de',null]){
   let lateAborted=false;
   globalThis.fetch=async(input,init)=>{
    const url=new URL(String(input));
    if(url.pathname==='/trace_attributes')return Response.json({}, {status:503});
    if(url.hostname===hanging){init?.signal?.addEventListener('abort',()=>{lateAborted=true;},{once:true});return new Promise<Response>(()=>{});}
    const seconds=url.hostname==='valhalla1.openstreetmap.de'?5000:10000;
    if(!hanging&&url.hostname==='valhalla1.openstreetmap.de')await wait(15);
    if(url.hostname==='valhalla1.openstreetmap.de')return Response.json({trip:{summary:{length:170,time:seconds},legs:[{shape:shape(),summary:{length:170,time:seconds}}]}});
    if(url.hostname==='brouter.de')return Response.json({features:[{properties:{'track-length':170000,'total-time':seconds},geometry:{coordinates:points}}]});
    return Response.json({routes:[{distance:170000,duration:seconds,geometry:{coordinates:points},legs:[]}]});
   };
   const response=await POST(request());assert.equal(response.status,200,String(hanging));
   const data=await response.json();assert.equal(data.legs[0].fast.meters,170000);
   if(hanging)assert.equal(lateAborted,true);else assert.equal(data.legs[0].fast.seconds,5000,'fastest valid ETA wins even if response arrives later');
  }
  AbortSignal.timeout=ms=>originalTimeout(ms===90_000?100:ms===25_000?200:ms);
  for(const delay of [3,150]){
   globalThis.fetch=async(input)=>{
    const url=new URL(String(input));
    if(url.hostname!=='router.project-osrm.org')return Response.json({}, {status:503});
    await wait(delay);
    return Response.json({routes:[{distance:170000,duration:10000,geometry:{coordinates:points},legs:[]}]});
   };
   const response=await POST(request());
   assert.equal(response.status,delay<100?200:502);
   if(delay>100)assert.match((await response.json()).error,/время ожидания расчёта/);
   await wait(60); // let a late non-cooperative response finish; no new response is committed
  }
 }finally{globalThis.fetch=originalFetch;AbortSignal.timeout=originalTimeout;clearTimeout(keeper);}
});
