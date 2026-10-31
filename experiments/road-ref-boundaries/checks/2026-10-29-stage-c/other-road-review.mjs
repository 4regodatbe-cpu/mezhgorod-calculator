import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolveM11ProductBoundaries} from '../../../../lib/v3-calculation/m11-product-boundaries.ts';
import {resolveM12ProductBoundaries} from '../../../../lib/v3-calculation/m12-product-boundaries.ts';
import {resolveCkadProductBoundaries} from '../../../../lib/v3-calculation/ckad-product-boundaries.ts';
import {matrixZsdCashCardComponent} from '../../../../lib/v3-calculation/zsd-cash-card-component.ts';
import {matrixM11GeometryComponent} from '../../../nationwide-tolls/engine/m11-route-adapter.mjs';
import {matrixM12Component} from '../../../nationwide-tolls/engine/m12-route-adapter.mjs';
import {matrixCkadComponent} from '../../../nationwide-tolls/engine/ckad-route-adapter.mjs';
import {unpricedRoadCoverage} from '../../../../lib/v3-calculation/unpriced-road-coverage.ts';
const base='experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/';
const mode=process.argv[2],date='2026-10-15T09:00:00+03:00';
const data={
 m11:[['pair-m11-ckad-noginsk-to-tver/2026-10-16T01-29-30-153Z-capture.json.gz','3235c04e3f0d95c30df518d159c3e47bce988a0c4a0b1b5700b5ee9e206f61b1']],
 m12:[['single-m12-moscow-to-arzamas/2026-10-16T01-59-35-968Z-capture.json.gz','5f4671a2236dcd45e4c49a8f6c9ca260e8f9aefaa92c9c33901c2f6535348aec']],
 ckad:[['single-odintsovo-golitsyno-to-rublevo/2026-10-16T02-07-00-749Z-capture.json.gz',null]],
 zsd:[['dnr-гранитное-saint-petersburg-center/2026-10-15T11-56-56-059Z-capture.json.gz','0493305d255cfc779f4d2b7f15e5c4fb7161b80857f3af75a4c57567a6df3cb1'],['max-chain-m12-ckad-m11-zsd-arzamas-to-prim/2026-10-15T23-58-33-171Z-capture.json.gz','e8b5d42fb9b737227c04d195271c4cb4dde444a66f85aa579d238a0cd2769ed0']],
};
if(!data[mode])throw Error('Choose one bounded road: m11, m12, ckad, zsd');
let attempts=0;globalThis.fetch=async()=>{attempts++;throw Error('STAGE_C_EXTERNAL_REQUEST_FORBIDDEN');};
const results=data[mode].map(([relative,expected],index)=>{
 const path=base+relative,raw=readFileSync(path),sha256=createHash('sha256').update(raw).digest('hex');if(expected)assert.equal(sha256,expected);
 const capture=JSON.parse(gunzipSync(raw)),r=capture.record,route=r.route.coordinates;
 assert.equal(r.validation.complete,true);assert.equal(r.validation.boothEventCoverage,'complete');
 let physical,boundary,quote,missingEvidence;
 if(mode==='m11'){
  const edges=JSON.parse(capture.calls[4].text).edges;
  assert.deepEqual(edges.slice(63,73).map(e=>e.way_id),[1307036919,1301779282,1301779282,1307036921,1307036920,1307036920,599932042,423187295,599934826,900434333]);assert.equal(edges[67].end_node.node_id,6588472831);
  physical={directedExit:{from:'М-11',viaBooth:'6588472831',boothWay:'1307036920',to:'М-10',toWay:'900434333'},entry:'CKAD approach, not a proven p58 start',sourceCall:4,sourceEdges:[63,72]};
  boundary=resolveM11ProductBoundaries(route,r.route.seconds,date,r.route.m11RoadEvidence,r.validation);
  quote=matrixM11GeometryComponent({exact:boundary.resolved,parts:boundary.parts},date);assert.equal(quote?.tolls??null,null);
  missingEvidence=['bind THIS directed CKAD approach to the mainline58 virtual interface and head/mainline product division','exact selected parent-node/road sequence connecting that interface to reviewed147exit; a physical booth at a virtual boundary is not required'];
 }else if(mode==='m12'){
  const edges=JSON.parse(capture.calls[5].text).edges;
  assert.deepEqual(edges.slice(77,80).map(e=>e.way_id),[1550135076,1550561305,1206479738]);
  physical={directedExit:{fromWay:'1550135076',rampWay:'1550561305',toWay:'1206479738',to:'22Н-0239',not:'Р-158'},sourceCall:5,sourceEdges:[77,79],selectedSpan:r.route.m12EndpointSpan};
  boundary=resolveM12ProductBoundaries(route,r.route.m12EndpointSpan??r.route.m12StrictSpan);
  quote=matrixM12Component(boundary,date,r.route.seconds);assert.equal(quote?.tolls??null,null);
  missingEvidence=['operator registration/charge boundary IDs for the actual22Н-0239 exit and observed frame sequence','mapping that registered journey to published order302 endpoints; generic Арзамас label or nearest442km is insufficient'];
 }else if(mode==='ckad'){
  const edges=JSON.parse(capture.calls[3].text).edges;
  assert.ok(edges.slice(46,54).every(e=>e.toll===true));assert.equal(edges[54].toll,false);
  physical={continuousPaidEdges:[46,53],sourceCall:3,wayIds:[...new Set(edges.slice(46,54).map(e=>String(e.way_id)))],noIntermediateReentry:true,scope:'А-113 near Golitsyno; exact operator PK5 coordinate/chainage crosswalk remains missing'};
  boundary=resolveCkadProductBoundaries(route,r.route.m11RoadEvidence,r.validation);
  quote=matrixCkadComponent(boundary,date,r.route.seconds);assert.equal(quote?.tolls??null,null);
  missingEvidence=['official coordinate/OSM-to-chainage boundary proving this exact8edgeblock belongs to toll-freePK5, or the actual payable operator origin/destination pair','accessible publisher copy of retained PK5 plan2843-р/10.10.2019 or equivalent georeferenced primary boundary; no retry of blocked storage link'];
 }else{
  physical=index===0?{from:'КАД (юг)',entryWay:'1122966006',paymentNode:'933974870',paymentWay:'381576632',to:'Екатерингофка',exitWay:'183902370',operatorVector:'kad-south→ekateringofka'}:{observedPlaza:'1766158781',plazaWay:'355755817',scope:'Planernaya; larger than reviewed zone1/finished Ekateringofka vector'};
  boundary={completeSelectedTrace:true,scope:index===0?'reviewed_finished_vector':'other_recorded_vector'};
  quote=matrixZsdCashCardComponent(route,r.validation,date,r.route.seconds);
  if(index===0)assert.equal(quote.tolls?.amount,600);else assert.equal(quote.tolls,null);
  missingEvidence=index===0?[]:['operator cash/card product scope for the actual Planernaya entry/exit, not borrowed zone1 or Ekateringofka price','any applicable receipt-linked/multiple-payment rule for THIS directed passage'];
 }
 const coverage=unpricedRoadCoverage({segments:[],validation:r.validation,candidateNetworks:[],m1m3Candidates:[]});
 return {caseId:r.spec.id,capture:{path,sha256,expectedShaPreviouslyPinned:expected!==null},provider:r.provider,meters:r.route.meters,seconds:r.route.seconds,selectedTraceComplete:r.validation.complete,physical,boundary,quote,coverage:{core:coverage.matchedCoreProducts,regional:coverage.regionalProducts},status:quote?.tolls?'EXISTING_BOUND_PRODUCT_PRICE_RETAINED':'BLOCKED_BY_DATA',missingEvidence};
});
assert.equal(attempts,0);
const report={road:mode,date,source:'current pure boundary/quote adapters on1–2retainedrecords; not provider/trace/API replay or a mass route audit',externalRequests:attempts,pricePolicy:'latest retained official price/rule until replaced; neither document age nor an optional lane certificate is a standalone blocker; geometry/product conflicts remain material',results};
writeFileSync(new URL(`./c4-${mode}.json`,import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({road:mode,externalRequests:attempts,results:results.map(x=>({caseId:x.caseId,status:x.status,boundaryReason:x.boundary.reason??null,quoteReason:x.quote?.reason??null,amount:x.quote?.tolls?.amount??null}))},null,2));
