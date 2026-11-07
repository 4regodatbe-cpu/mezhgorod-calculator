import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {roadBoundariesFromTrace} from '../../../../lib/toll-engine/road-trace-boundaries.ts';
import {optionalRoadKilometrage} from '../../../../lib/toll-engine/optional-road-kilometrage.ts';
import {matrixM4Component} from '../../../nationwide-tolls/engine/m4-route-adapter.mjs';
const root='experiments/road-ref-boundaries/';
const read=p=>readFileSync(p),json=p=>JSON.parse(read(p));
const hash=b=>createHash('sha256').update(b).digest('hex');
const fixture=json(root+'fixtures/granitnoe-kazan-m4.json');
const capturePath=fixture.provenance.capturePath,bytes=read(capturePath);
assert.equal(hash(bytes),fixture.provenance.captureSha256);
const capture=JSON.parse(gunzipSync(bytes));
const traceCalls=capture.calls.filter(c=>c.url.includes('/trace_attributes'));
assert.equal(traceCalls.length,13);assert.ok(traceCalls.every(c=>c.status===200));
const chunks=traceCalls.map(c=>JSON.parse(c.text).edges),route=capture.record.route.coordinates;
const boundary=roadBoundariesFromTrace(chunks,route);
assert.equal(boundary.status,'resolved');assert.equal(boundary.precision,'matched-road-edge');
const intake=root+'checks/2026-10-24-b04-osm-coordinate-intake/';
const previousVerification=json(intake+'verification.json');
const verifiedSources=[];
for(const [file,expected] of Object.entries(previousVerification.sha256)){
 const actual=hash(read(intake+file));assert.equal(actual,expected,file);verifiedSources.push({path:intake+file,sha256:actual});
}
const identity=json(intake+'reviewed-identity.json');
assert.equal(identity.runtimeEligible,false);assert.equal(identity.operatorScope,null);assert.equal(identity.officialKilometre,null);
const coordinates=identity.boundaries.map(row=>{
 const side=boundary[row.role];assert.equal(side.osmNodeId,String(row.nodeId));
 assert.equal(side.fromWayId,String(row.incomingWayId));assert.equal(side.toWayId,String(row.outgoingWayId));
 const raw=json(intake+`raw/node-${row.nodeId}.json`).elements.find(x=>x.type==='node'&&x.id===row.nodeId);
 assert.equal(raw.lat,row.coordinates.lat);assert.equal(raw.lon,row.coordinates.lon);
 const incoming=json(intake+`raw/way-${row.incomingWayId}.json`).elements.find(x=>x.type==='way');
 const outgoing=json(intake+`raw/way-${row.outgoingWayId}.json`).elements.find(x=>x.type==='way');
 assert.equal(incoming.nodes.at(-1),row.nodeId);assert.equal(outgoing.nodes[0],row.nodeId);
 let min=Infinity,index=-1;
 for(const [i,p] of route.entries()){
  const rad=Math.PI/180,d=Math.hypot((p[0]-raw.lon)*Math.cos(raw.lat*rad),p[1]-raw.lat)*111320;
  if(d<min){min=d;index=i;}
 }
 return {role:row.role,id:side.id,coordinate:[raw.lon,raw.lat],coordinateSource:intake+`raw/node-${row.nodeId}.json`,nodeTags:raw.tags??{},directedMembership:true,nearestSelectedVertex:{index,distanceMeters:Math.round(min*1000)/1000},meaning:'exact OSM graph transition; not an identified payment gate/operator fare endpoint',officialKilometre:null};
});
assert.ok(coordinates[0].nearestSelectedVertex.index<coordinates[1].nearestSelectedVertex.index);
const start=boundary.entry,end=boundary.exit;
const span=chunks.flatMap((chunk,chunkIndex)=>chunk.flatMap((edge,sourceIndex)=>{
 const after=chunkIndex>start.chunkIndex||chunkIndex===start.chunkIndex&&sourceIndex>=start.sourceIndex;
 const before=chunkIndex<end.chunkIndex||chunkIndex===end.chunkIndex&&sourceIndex<=end.sourceIndex;
 return after&&before?[{chunkIndex,sourceIndex,edge}]:[];
}));
const unique=new Map(span.map(x=>[`${x.edge.way_id}:${x.edge.end_node?.node_id}`,x]));
const edges=[...unique.values()];
assert.ok(edges.length>0);assert.ok(edges.some(x=>x.edge.toll===true));
const priceProfiles=['2026-10-15T09:00:00+03:00','2026-10-17T09:00:00+03:00'].map(departureAt=>{
 const result=matrixM4Component({candidate:true,exact:false,endpointOnly:true,roadBoundaries:boundary},departureAt,capture.record.route.seconds);
 assert.equal(result.tariffVector.from,boundary.entry.id);assert.equal(result.tariffVector.to,boundary.exit.id);
 assert.equal(result.tariffVector.priceStatus,'unknown');assert.equal(result.tolls,null);
 return {departureAt,tariffVector:result.tariffVector,reason:result.reason,tolls:null};
});
const km=optionalRoadKilometrage(boundary,true);assert.equal(km.status,'unknown');
const report={caseId:capture.record.spec.id,capture:{path:capturePath,sha256:hash(bytes)},inputs:{from:capture.record.spec.from,to:capture.record.spec.to,positions:capture.record.routePlan[0].positions},scope:'one retained selected-route graph extraction, not a new provider/trace/API replay or six-case audit',networkRequests:0,traceResponses:traceCalls.map((c,index)=>({index,httpStatus:c.status,bodySha256:hash(c.text)})),selectedGeometrySha256:boundary.routeSignature,boundary,coordinates,continuity:{resolverReason:boundary.reason,uniqueEdgeCount:edges.length,paidEdges:edges.filter(x=>x.edge.toll===true).length,observedPaidEdges:edges.filter(x=>x.edge.toll===true).map(x=>({chunkIndex:x.chunkIndex,sourceIndex:x.sourceIndex,wayId:String(x.edge.way_id),endNodeId:String(x.edge.end_node?.node_id),names:x.edge.names})),nonPaidEdges:edges.filter(x=>x.edge.toll===false).length,unknownTollFlags:edges.filter(x=>typeof x.edge.toll!=='boolean').length,scope:'selected continuous M4-ref traversal; toll flag is not an operator fare applicability/crosswalk certificate'},kilometrage:km,profiles:priceProfiles,operatorTariffVector:{status:'BLOCKED_BY_DATA',reason:'exact graph vector is known, but no reviewed operator endpoint/product crosswalk or applicable fare row',required:['operator diagram/register linking each exact directed access to charge/product boundary and branch/scale','applicable charge rule for this partial path, not a nearest PVP assumption','official directed matrix cell/source/date for the verified product; no new price needed merely to recognize geometry'],priceRub:null},verifiedSources};
writeFileSync(new URL('./m4-evidence.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({caseId:report.caseId,status:boundary.status,coordinates,continuity:report.continuity,operatorTariffVector:report.operatorTariffVector.status,prices:priceProfiles.map(x=>x.tariffVector.priceStatus),networkRequests:0},null,2));
