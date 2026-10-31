import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { NextRequest } from 'next/server';
import { exactB11SourcePair } from './b11-exact-reuse-change.mjs';

const original = fs.readFileSync(new URL('../experiments/address-search/checks/b11-reuse/api-before.txt', import.meta.url), 'utf8');
const optimized = original.replace('(trip:T) => timing.measureSync("response_pricing"', '(trip:T, verifiedSplit?:ReturnType<typeof analyzeRoute>) => timing.measureSync("response_pricing"')
  .replace('const territorySplit = analyzeRoute(trip.coordinates,trip.meters,trip.seconds,from.position,to.position,zones);', 'const territorySplit = verifiedSplit ?? analyzeRoute(trip.coordinates,trip.meters,trip.seconds,from.position,to.position,zones);')
  .replace('fast:attachPricing(option.fast)', 'fast:attachPricing(option.fast,option.split)');
assert.equal(exactB11SourcePair(original, optimized), true);
const counters = { before: 0, after: 0 };
globalThis.__b11Analysis = variant => { counters[variant]++; };
const api = new URL('../app/api/v3/calculate/route.ts', import.meta.url);
const hook = registerHooks({ load(url, context, next) {
  const variant = url === `${api.href}?b11=before` ? 'before' : url === `${api.href}?b11=after` ? 'after' : null;
  if (!variant) return next(url, context);
  let source = variant === 'before' ? original : optimized;
  source = source.replace('import { analyzeRoute, candidatePlans, endpointPolicy }', 'import { analyzeRoute as rawAnalyzeRoute, candidatePlans, endpointPolicy }');
  source += `\nfunction analyzeRoute(...args:Parameters<typeof rawAnalyzeRoute>) { globalThis.__b11Analysis('${variant}'); return rawAnalyzeRoute(...args); }\n`;
  return { format: 'module', source: stripTypeScriptTypes(source), shortCircuit: true };
} });
const beforePost = (await import(`${api.href}?b11=before`)).POST;
const afterPost = (await import(`${api.href}?b11=after`)).POST;
hook.deregister();
const ordinary = { label: 'Анапа', position: {lng:37.32,lat:44.90} };
const special = { label: 'Донецк — ДНР', position: {lng:37.8013407,lat:48.0158753} };
const to = { label: 'Краснодар', position: {lng:38.98,lat:45.04} };
const gates = [[37.5878131,45.168457],[37.8330177,45.1961096],[38.5327744,45.171408]];
function polyline(points) { let lat=0,lng=0,s='';const enc=n=>{let v=n<0?~(n<<1):n<<1,r='';while(v>=32){r+=String.fromCharCode((32|(v&31))+63);v>>=5;}return r+String.fromCharCode(v+63);};for(const[x,y]of points){const a=Math.round(y*1e6),b=Math.round(x*1e6);s+=enc(a-lat)+enc(b-lng);lat=a;lng=b;}return s; }
const request = body => new NextRequest('http://localhost/api/v3/calculate',{method:'POST',body:JSON.stringify(body)});
async function execute(post, body, transport) {
  const priorFetch = globalThis.fetch, priorInfo = console.info;
  const calls = [];
  globalThis.fetch = async (input, init) => { const url=String(input); calls.push([url,String(init?.body??'')]); return transport(new URL(url),init); };
  console.info = () => {};
  try { const at=performance.now(), response=await post(request(body)); return {status:response.status,body:await response.json(),elapsedMs:performance.now()-at,calls}; }
  finally {globalThis.fetch=priorFetch;console.info=priorInfo;}
}
function controlled(kind) {
  return async (url) => {
    if(url.pathname==='/trace_attributes') {
      if(kind==='incomplete') return Response.json({}, {status:503});
      const edges=[{toll:true,names:['А-289'],way_id:1,end_node:{type:'toll_booth',node_id:13022464435}}];
      if(kind==='unknown')edges.push({toll:true,names:['ЗСД'],way_id:2,end_node:{type:'toll_booth',node_id:999999}});
      return Response.json({edges});
    }
    if(url.pathname==='/route') {
      const q=JSON.parse(url.searchParams.get('json')), controls=q.locations.map(p=>[p.lon,p.lat]);
      const isSpecial=controls[0][1]>47;
      const shape=[...controls.slice(0,-1),...(isSpecial?gates:gates.slice(1)),controls.at(-1)];
      return Response.json({trip:{summary:{length:isSpecial?450:170,time:isSpecial?22000:10000},legs:[{shape:polyline(shape),summary:{length:isSpecial?450:170,time:isSpecial?22000:10000},maneuvers:[]}]}});
    }
    return Response.json({}, {status:503});
  };
}
test('before/after full API parity: ordinary/special, both modes, all vehicle fares, paid/unknown/incomplete', async () => {
  for(const from of [ordinary,special])for(const mode of ['standard','dual'])for(const kind of ['priced','unknown','incomplete']) {
    const body={from,to,mode,modeOverride:true,departureAt:'2026-10-13T09:00:00+03:00'};
    counters.before=0;counters.after=0;
    const before=await execute(beforePost,body,controlled(kind)), after=await execute(afterPost,body,controlled(kind));
    assert.equal(before.status,200);assert.deepEqual(after.body,before.body);assert.deepEqual(after.calls,before.calls);
    assert.equal(after.body.specialEndpoint,from===special,'case must exercise intended API branch');
    assert.equal(counters.before,1);assert.equal(counters.after,from===special?0:1);
    const fast=after.body.legs[0].fast;
    assert.deepEqual(Object.keys(fast.pricingByVehicle).sort(),['comfort','comfort_plus','minivan','standard']);
    assert.equal(fast.tolls.pricingStatus,kind==='priced'?'priced':'unknown');
    if(kind!=='priced')assert.equal(fast.tolls.amount,null);
    assert.equal(after.body.legs[0].free,null);
  }
});
test('input errors, cancelled transport and upstream failures retain safe status/body', async () => {
  const base={from:ordinary,to,departureAt:'2026-10-13T09:00:00+03:00'};
  for(const body of [{...base,departureAt:'2026-02-30'},base]) {
    const transport=async()=>{throw new DOMException('cancelled','AbortError');};
    const a=await execute(beforePost,body,transport), b=await execute(afterPost,body,transport);
    assert.deepEqual([a.status,a.body],[b.status,b.body]);assert.ok(a.status>=400);
  }
});
test('retained Donetsk OSRM capture: selected fastest geometry, requests and complete API response unchanged', async () => {
  const source='experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/dnr-донецк-moscow-center/2026-10-15T22-34-03-156Z-capture.json.gz';
  const bytes=fs.readFileSync(source);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'8b168610a9b6e899b6ca4074e64cfbea2f52bc6ccafddc09f63c28716df2f630');
  const saved=JSON.parse(zlib.gunzipSync(bytes));let misses=0;
  const transport=async(url,init)=>{
    const hit=saved.calls.find(c=>new URL(c.url).pathname===url.pathname && (url.pathname!=='/trace_attributes'||JSON.stringify(JSON.parse(c.body).shape)===JSON.stringify(JSON.parse(String(init?.body)).shape)));
    if(!hit){misses++;return Response.json({}, {status:503});}
    return new Response(hit.text,{status:hit.status,headers:{'Content-Type':hit.contentType??'application/json'}});
  };
  const body={from:saved.record.spec.from,to:saved.record.spec.to,departureAt:'2026-10-15T09:00:00+03:00'};
  const a=await execute(beforePost,body,transport), b=await execute(afterPost,body,transport);
  assert.equal(a.status,200);assert.deepEqual(b.body,a.body);assert.deepEqual(b.calls,a.calls);
  assert.equal(misses,0,'missing saved response is NOT a successful full replay');
  assert.equal(b.body.legs[0].fast.seconds,saved.record.route.seconds);
  console.log('B11_SAVED_HANDLER '+JSON.stringify({source,networkRequests:0,beforeMs:a.elapsedMs,afterMs:b.elapsedMs,parity:'MATCH',requestsPerRun:a.calls.length,misses}));
});
