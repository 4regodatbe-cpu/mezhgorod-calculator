// Offline atlas projection. Does not call a provider or change application data.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url);
const read=path=>readFileSync(new URL(path,root));
const parse=path=>JSON.parse(read(path).toString('utf8'));
const hash=path=>({path,sha256:createHash('sha256').update(read(path)).digest('hex')});
const base='experiments/junction-atlas/2026-10-30/';
const osmPath='experiments/tariff-proof-selection/m4-545-directed-osm.json';
const historyPath='experiments/tariff-proof-selection/m4-545-route-history-review.json';
const osm=parse(osmPath),history=parse(historyPath);
const nodeSource=base+'raw/m4-r298-node3057885104.json';
const waySource=base+'raw/m4-r298-way301694367-full.json';
const full=parse(waySource).elements;
const nodes=new Map([...osm.nodes,...full.filter(x=>x.type==='node').map(x=>({...x,id:String(x.id)}))].map(n=>[n.id,n]));
const ways=new Map(osm.ways.map(w=>[w.id,w]));
const r298=full.find(x=>x.type==='way');
assert.equal(r298.id,301694367);assert.equal(r298.tags.oneway,'yes');
assert.equal(r298.tags['destination:ref'],'Р-298');
assert.equal(r298.nodes.at(-1),3057885104);
const node=parse(nodeSource).elements.find(x=>x.type==='node');
assert.deepEqual([node.lat,node.lon],[nodes.get(String(node.id)).lat,nodes.get(String(node.id)).lon]);
ways.set(String(r298.id),{...r298,id:String(r298.id),nodes:r298.nodes.map(String)});
function point(id,kind,title,direction,wayIds,sourcePath=osmPath){
 const n=nodes.get(id);assert.ok(n,'missing exact node '+id);
 return {id:'m4-'+id,road:'M4',kind,title,position:{lat:n.lat,lon:n.lon},
  coordinateSource:{path:sourcePath,nodeId:id,meaning:'original OSM node, not pixel-derived or official tariff chainage'},
  crossingRoads: id==='3057885104' ? ['М-4 «Дон»','Р-298'] : ['М-4 «Дон»: обходной и старый коридоры'],
  interchangeName:null,direction,osm:{nodeId:id,wayIds},
  mapUrl:`https://yandex.ru/maps/?ll=${n.lon}%2C${n.lat}&z=18&pt=${n.lon}%2C${n.lat}%2Cpm2rdm`,
  operatorScheme:sourcePath===osmPath?'experiments/tariff-proof-selection/M4_545_ENGINEERING_CROSSWALK.md':null,
  evidence:{visual:sourcePath===osmPath?'locality corroboration only; exact lane/coordinate comes from retained OSM, not browser canvas':'not independently viewed on a map in this block; original OSM node/way only',
   directed:'one-way graph/selected route as referenced by connections',operatorBoundary:'not established by this point alone'},
  tariffPair:null,tariffReason:'Point/plaza is not a unique charge product; see applicable complete directed route binding.'};
}
const points=[
 point('4522140254','technical','Разделение трёх северных ветвей у Калина Ойл','northbound',['799492317','799492326','522875739']),
 point('5818209495','plaza','ПВП545, южная северная кассовая ветвь в обходной коридор','northbound',['615270691']),
 point('3504914294','plaza','ПВП545, северная кассовая ветвь','northbound',['606838738']),
 point('9620416636','plaza','ПВП545, соседняя ветвь к старому коридору','northbound',['467980114']),
 point('365274796','plaza','ПВП545, противоположное направление старого коридора','southbound',['467980112']),
 point('6594393968','plaza','ПВП545, южная группа противоположного направления','southbound',['702218804']),
 point('3842564088','plaza','ПВП545, северная группа противоположного направления','southbound',['702218806']),
 point('4513805004','technical','Общее слияние двух северных ветвей в обходной коридор','northbound',['799492323','1043769288','702218808']),
 point('4512436102','technical','Отдельный выход северной ветви к старому коридору','northbound',['1043769285','454710293']),
 point('3057885096','technical','Начало подтверждённого соединительного съезда М4 к Р-298','northbound_to_west',['1044709392','301694367'],waySource),
 point('3057885104','exit','Конец съезда с М4 к Р-298, Курск/Воронеж','northbound_to_west',['301694367','705714822'],waySource),
];
function connection(id,direction,ids,gate,selected=false){
 const seq=ids.map(id=>{const w=ways.get(id);assert.ok(w,id);assert.equal(w.tags.oneway,'yes');return w;});
 for(let i=1;i<seq.length;i++)assert.equal(seq[i-1].nodes.at(-1),seq[i].nodes[0],id+' disconnected');
 assert.ok(seq.some(w=>w.nodes.includes(gate)));
 const first=nodes.get(seq[0].nodes[0]),last=nodes.get(seq.at(-1).nodes.at(-1));
 assert.ok(direction==='southbound'?last.lat<first.lat:last.lat>first.lat,id+' reversed');
 return {id,direction,wayIds:ids,fromNode:seq[0].nodes[0],toNode:seq.at(-1).nodes.at(-1),gateNode:gate,
  proof:'retained exact one-way node order, contiguous at shared nodes',selectedRouteWitness:selected?{path:historyPath,field:'reviewedFinalChunk.gatePathEdges/onwardWayAndEndNodes',caseId:history.caseId}:null,
  turnRestrictions:'all legal turns/access restrictions are not independently certified by this selected OSM subset',
  completeOperatorProduct:false,priceRub:null};
}
const connections=[
 connection('m4-545-north-southern-cash','northbound',['799492317','615270676','615270691','615270694','1043769287','799492323'],'5818209495',true),
 connection('m4-545-north-northern-cash','northbound',['799492326','799492325','606838738','799492324','1043769289','702218809','787089819','1043769288'],'3504914294'),
 connection('m4-545-north-old-road','northbound',['522875739','799492316','467980114','467980113','1043769286','432522383','1043769285'],'9620416636'),
 connection('m4-545-south-old-road-local','southbound',['467980112'],'365274796'),
 connection('m4-545-south-southern-bank-local','southbound',['702218804'],'6594393968'),
 connection('m4-545-south-northern-bank-local','southbound',['702218806'],'3842564088'),
];
const gateNodes=connections.map(c=>c.gateNode);assert.equal(new Set(gateNodes).size,6);
const onward=history.reviewedFinalChunk.onwardWayAndEndNodes;
assert.ok(onward.some(x=>x.wayId==='301694367'&&x.endNodeId==='3057885104'));
const sources=[osmPath,historyPath,nodeSource,waySource,base+'raw/m4-map-accessibility.txt',base+'raw/m4-north-short-route-accessibility.txt',base+'raw/m4-south-short-route-accessibility.txt',base+'raw/m4-operator-article-accessibility.txt',base+'raw/m4-osm-z15-19984-10901.png',base+'raw/m4-osm-z15-19984-10900.png'].map(hash);
console.log(JSON.stringify({schemaVersion:1,road:'M4',date:'2026-10-30',mode:'research_only_not_runtime',sources,
 sourceNotes:{retainedOsmDate:osm.source.retrievedDate,newOsmUrls:['https://api.openstreetmap.org/api/0.6/node/3057885104.json','https://api.openstreetmap.org/api/0.6/way/301694367/full.json'],newOsmHttpStatus:200,newOsmTimestamp:r298.timestamp,newOsmVersion:r298.version,
  operatorArticle:'https://avtodor-tr.ru/press-center/news/rezhim-platnosti-vveden-na-uchastke-avtomobilnoy-dorogi-m-4-don-v-obkhod-sela-novaya-usman-i-sela-ro/',articleDate:'2016-12-26',articleObservation:'existing operator browser tab read; no origin HTTP freshness inferred',
  attribution:'© OpenStreetMap contributors, ODbL; Yandex route UI is separate non-operator evidence'},
 points,connections,r298Exit:{fromNode:'3057885096',toNode:'3057885104',wayId:'301694367',oneway:true,destinationRef:'Р-298',destination:r298.tags.destination,sourcePath:waySource,selectedOnwardWitness:historyPath,officialKm:null},
 mapControls:[{direction:'northbound',requestedPoints:3,observedUiDistanceMeters:880,observedUiMinutes:2,constructed:true,exactViaSnapOrLaneVerified:false,evidence:base+'raw/m4-north-short-route-accessibility.txt'},
  {direction:'southbound',requestedPoints:2,observedUiDistanceMeters:25,observedUiMinutes:1,constructed:true,exactViaSnapOrLaneVerified:false,evidence:base+'raw/m4-south-short-route-accessibility.txt'}],
 tariffBindings:[{id:'existing-m4-545-north-73.9-working',status:'retained_owner_accepted_working_model_not_new_pair',caseId:history.caseId,direction:'northbound',products:['m4-545-a','m4-545-b'],weekdayAmount:320,weekendAmount:410,operatorCategory:'I',payment:'cash/card',physicalObservedPlazaEvents:1,
  sourceRuleDate:'2016-12-26',priceOrder:'58',priceEffectiveFrom:'2026-03-02T00:00:00+03:00',source:'experiments/tariff-proof-selection/B05_ACCEPTED_PRICE_BASIS.json',
  decision:'docs/checkpoints/2026-10-28-owner-best-available-working-truth-APPROVED.md',implementation:'experiments/tariff-proof-selection/m4-545-accepted-working.mjs',
  appliesOnlyWhen:'complete reviewed approach+gate5818209495+onwardR298 witness and existing no-overlap replacement guards pass; not every nearby gate, southbound path or whole M4 total',receiptVerified:false,
  introducedByAtlas:false}],
 summary:{pointRecords:points.length,localDirectedPlazaConnections:connections.length,geographicGroups:['PVP545 branch/plaza complex','M4→R298 connector'],newCoordinateBindings:2,newOperatorTariffBindings:0,newRouteProviderCalls:0,newOsmRequests:2,standardOsmTileViews:2,appRuntimeChanged:false},
 remaining:['No new official chainage assigned to R298 node; OSM coordinate/branch identity is now explicit.',
  'No southbound full origin/destination vector or price admitted from three local opposite-direction gates.',
  'Yandex approximate toll estimate is not imported; 320/410 remains the existing owner-approved model only.',
  'Visual raster overview corroborates corridors, not exact lane IDs, legal-turn completeness or surveyed operator boundaries.']},null,2));
