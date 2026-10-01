import { writeFile } from "node:fs/promises";

const VALHALLA = "https://valhalla1.openstreetmap.de/route";
const OVERPASS_ENDPOINTS = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];
const CORRIDOR_BOXES = [
  "55.45,37.55,56.35,40.80",
  "54.90,40.60,56.25,43.90",
  "54.75,43.70,56.25,46.80",
  "54.70,46.60,56.35,49.95",
];
const ROUTE_RADIUS_KM = 1.0;
const LEGACY_RADIUS_KM = 10;
const MIN_LEGACY_RUN = 5;
const EVENT_CLUSTER_KM = 0.25;

const routeSpecs = [
  { name: "moscow-kazan", from: { lat: 55.755819, lon: 37.617644 }, to: { lat: 55.796127, lon: 49.106405 }, officialAmount: 5847 },
  { name: "kazan-moscow", from: { lat: 55.796127, lon: 49.106405 }, to: { lat: 55.755819, lon: 37.617644 }, officialAmount: 5847 },
];

const legacyPoints = [
  [37.87,55.75],[38.22,55.72],[38.46,55.72],[38.94,55.8],[39.46,55.93],
  [40.41,56.08],[40.65,55.62],[41.63,55.34],[42.04,55.58],[43.24,55.04],
  [43.84,55.39],[45.47,55.52],[46.42,55.5],[47.5,55.5],[48.17,55.4],
  [48.75,55.75],[48.84,54.94],[49.28,55.61],[49.12,55.78],[49.66,55.51],
];
const legacyNames = [
  "Москва","Электроугли","ЦКАД","Орехово-Зуево","Петушки","Владимир","Гусь-Хрустальный","Меленки","Муром","Дивеево","Арзамас","Сергач","Шумерля","Канаш","Большие Кайбицы","Ивановское (Р241); legacy label: Иннополис","Тетюши","аэропорт Казань","Казань (Р239)","Шали",
];
const adjacentTariffs = [176,322,244,359,636,165,522,205,510,311,602,348,392,215,243,155,280,162,62];

function distanceKm(a,b){
  const rad=Math.PI/180; const dLat=(b[1]-a[1])*rad; const dLon=(b[0]-a[0])*rad;
  const v=Math.sin(dLat/2)**2+Math.cos(a[1]*rad)*Math.cos(b[1]*rad)*Math.sin(dLon/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(v),Math.sqrt(1-v));
}
function round(v,d=3){const f=10**d; return Math.round(v*f)/f;}

function decodePolyline(encoded,precision=6){
  const out=[]; const factor=10**precision; let index=0,lat=0,lon=0;
  while(index<encoded.length){
    let result=0,shift=0,byte;
    do{byte=encoded.charCodeAt(index++)-63;result|=(byte&0x1f)<<shift;shift+=5;}while(byte>=0x20&&index<encoded.length);
    lat+=result&1?~(result>>1):result>>1;
    result=0;shift=0;
    do{byte=encoded.charCodeAt(index++)-63;result|=(byte&0x1f)<<shift;shift+=5;}while(byte>=0x20&&index<encoded.length);
    lon+=result&1?~(result>>1):result>>1;
    out.push([lon/factor,lat/factor]);
  }
  return out;
}

async function fetchJson(url,init,timeoutMs){
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetch(url,{...init,signal:controller.signal});
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data?.remark||data?.error||`HTTP ${response.status}`);
    return data;
  } finally { clearTimeout(timer); }
}

async function routeGeometry(spec){
  // Exact parity with app/api/v2/calculate fast Valhalla semantics: use_tolls = 1.
  const body={
    locations:[spec.from,spec.to],
    costing:"auto",
    costing_options:{auto:{use_tolls:1}},
    units:"kilometers",
    directions_type:"none",
  };
  const data=await fetchJson(VALHALLA,{
    method:"POST",
    headers:{"content-type":"application/json",accept:"application/json","user-agent":"MezhgorodSegment5A2b/1.0"},
    body:JSON.stringify(body),
  },70_000);
  const geometry=(data.trip?.legs??[]).flatMap(leg=>leg.shape?decodePolyline(leg.shape):[]);
  if(geometry.length<2||!data.trip?.summary?.length) throw new Error(`${spec.name}: no usable route geometry`);
  return {geometry,km:data.trip.summary.length,seconds:data.trip.summary.time};
}

async function queryInventory(){
  const byId=new Map(); const attempts=[];
  for(let boxIndex=0;boxIndex<CORRIDOR_BOXES.length;boxIndex+=1){
    const bbox=CORRIDOR_BOXES[boxIndex];
    const query=`[out:json][timeout:35];(node["highway"="toll_gantry"](${bbox});node["barrier"="toll_booth"](${bbox}););out body;`;
    let ok=false;
    for(const endpoint of OVERPASS_ENDPOINTS){
      const started=Date.now();
      try{
        const data=await fetchJson(endpoint,{
          method:"POST",
          headers:{"content-type":"application/x-www-form-urlencoded","user-agent":"MezhgorodM12Parity/1.0 (GitHub Actions)"},
          body:new URLSearchParams({data:query}),
        },50_000);
        if(!Array.isArray(data.elements)) throw new Error("response has no elements array");
        for(const e of data.elements) if(e.type==="node"&&Number.isFinite(e.lat)&&Number.isFinite(e.lon)) byId.set(`${e.type}/${e.id}`,e);
        attempts.push({boxIndex:boxIndex+1,endpoint,ok:true,elapsedMs:Date.now()-started,count:data.elements.length});
        ok=true; break;
      } catch(error){ attempts.push({boxIndex:boxIndex+1,endpoint,ok:false,elapsedMs:Date.now()-started,error:error instanceof Error?error.message:String(error)}); }
    }
    if(!ok) throw new Error(`all Overpass endpoints failed for corridor box ${boxIndex+1}`);
  }
  return {candidates:[...byId.values()],attempts};
}

function cumulative(route){const c=[0];for(let i=1;i<route.length;i+=1)c.push(c[i-1]+distanceKm(route[i-1],route[i]));return c;}
function projectSegment(point,a,b){
  const mean=((point[1]+a[1]+b[1])/3)*Math.PI/180; const xs=111.320*Math.cos(mean),ys=110.574;
  const bx=(b[0]-a[0])*xs,by=(b[1]-a[1])*ys,px=(point[0]-a[0])*xs,py=(point[1]-a[1])*ys;
  const den=bx*bx+by*by; const raw=den>0?(px*bx+py*by)/den:0; const t=Math.max(0,Math.min(1,raw));
  const projected=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  return {t,projected,distanceKm:distanceKm(point,projected)};
}
function projectRoute(route,cum,point){
  let best=null;
  for(let i=1;i<route.length;i+=1){
    const h=projectSegment(point,route[i-1],route[i]);
    if(!best||h.distanceKm<best.distanceKm){
      const seg=cum[i]-cum[i-1]; best={distanceKm:h.distanceKm,chainageKm:cum[i-1]+seg*h.t,segmentIndex:i-1,projected:h.projected};
    }
  }
  return best;
}

function isPlaton(tags={}){
  const text=[tags.network,tags.operator,tags["contact:website"]].filter(Boolean).join(" ").toLowerCase();
  return text.includes("платон")||text.includes("рт-инвест")||tags["toll:hgv_articulated"]==="yes";
}
function classifyCandidate(candidate,hit){
  const tags=candidate.tags??{};
  const platon=isPlaton(tags);
  const freeFlowGantry=tags.highway==="toll_gantry"&&!platon;
  const near=hit.distanceKm<=ROUTE_RADIUS_KM;
  return {
    osmId:candidate.id, osmType:candidate.type, coordinate:[candidate.lon,candidate.lat], tags,
    nearestDistanceKm:round(hit.distanceKm), chainageKm:round(hit.chainageKm),
    platon, freeFlowGantry, nearRoute:near,
    eligibleM12Evidence:near&&freeFlowGantry,
    exclusionReason: near&&freeFlowGantry?null:platon?"Platon HGV gantry":tags.barrier==="toll_booth"?"barrier toll booth is not M-12 free-flow evidence":!near?`outside ${ROUTE_RADIUS_KM} km route radius`:"not a passenger M-12 free-flow gantry",
  };
}

function clusterEvents(items){
  const sorted=[...items].sort((a,b)=>a.chainageKm-b.chainageKm||a.osmId-b.osmId); const clusters=[];
  for(const item of sorted){
    const last=clusters.at(-1);
    if(last&&item.chainageKm-last.maxChainageKm<=EVENT_CLUSTER_KM){
      last.items.push(item); last.maxChainageKm=item.chainageKm; last.chainageKm=round(last.items.reduce((s,x)=>s+x.chainageKm,0)/last.items.length);
    } else clusters.push({chainageKm:item.chainageKm,maxChainageKm:item.chainageKm,items:[item]});
  }
  return clusters.map((cluster,index)=>({eventIndex:index,chainageKm:cluster.chainageKm,osmIds:cluster.items.map(x=>x.osmId),coordinates:cluster.items.map(x=>x.coordinate),maxLateralKm:round(Math.max(...cluster.items.map(x=>x.nearestDistanceKm)))}));
}

function legacyReplay(route){
  const cum=cumulative(route);
  const anchors=legacyPoints.map((point,index)=>{const h=projectRoute(route,cum,point);return {index,name:legacyNames[index],nearestDistanceKm:round(h.distanceKm),chainageKm:round(h.chainageKm),withinLegacyRadius:h.distanceKm<=LEGACY_RADIUS_KM};});
  const matched=[];
  const segments=adjacentTariffs.map((amount,index)=>{
    const a=anchors[index],b=anchors[index+1]; const direct=distanceKm(legacyPoints[index],legacyPoints[index+1]);
    const travelled=Math.abs(b.chainageKm-a.chainageKm); const eligible=a.withinLegacyRadius&&b.withinLegacyRadius;
    const min=direct*.68-12,max=direct*1.75+12; const ok=eligible&&travelled>=min&&travelled<=max;
    if(ok) matched.push(index);
    return {index,name:`${a.name} → ${b.name}`,amount,startDistanceKm:a.nearestDistanceKm,endDistanceKm:b.nearestDistanceKm,travelledKm:round(travelled,1),directKm:round(direct,1),matched:ok};
  });
  let longest=0,current=0,previous=null;
  for(const index of matched){if(previous!=null&&index-previous<=2)current+=1;else current=1;longest=Math.max(longest,current);previous=index;}
  const accepted=longest>=MIN_LEGACY_RUN;
  const sum=accepted?segments.filter(x=>x.matched).reduce((s,x)=>s+x.amount,0):0;
  return {anchors,segments,matchedIndexes:matched,longestRunLength:longest,minimumRequiredRun:MIN_LEGACY_RUN,acceptedByLegacy:accepted,inferredAmount:sum};
}

function corridorParity(a,b){
  // Sample both shapes and measure each sample against vertices of the opposite shape.
  // This is diagnostic, intentionally independent of toll-node evidence.
  function oneWay(source,target){
    const sourceStep=Math.max(1,Math.floor(source.length/180));
    const targetStep=Math.max(1,Math.floor(target.length/1200));
    const values=[];
    for(let i=0;i<source.length;i+=sourceStep){
      let best=Infinity;
      for(let j=0;j<target.length;j+=targetStep) best=Math.min(best,distanceKm(source[i],target[j]));
      values.push(best);
    }
    values.sort((x,y)=>x-y);
    const q=p=>values[Math.min(values.length-1,Math.floor((values.length-1)*p))];
    return {samples:values.length,medianKm:round(q(.5)),p95Km:round(q(.95)),maxKm:round(values.at(-1))};
  }
  return {forwardToReverse:oneWay(a,b),reverseToForward:oneWay(b,a)};
}

const startedAt=Date.now();
const [inventory,...routeData]=await Promise.all([queryInventory(),...routeSpecs.map(routeGeometry)]);
const routes=[];
for(let i=0;i<routeSpecs.length;i+=1){
  const spec=routeSpecs[i],live=routeData[i],cum=cumulative(live.geometry);
  const classified=inventory.candidates.map(candidate=>classifyCandidate(candidate,projectRoute(live.geometry,cum,[candidate.lon,candidate.lat])));
  const eligible=classified.filter(x=>x.eligibleM12Evidence);
  const excludedNear=classified.filter(x=>x.nearRoute&&!x.eligibleM12Evidence);
  const events=clusterEvents(eligible);
  const legacy=legacyReplay(live.geometry);
  routes.push({name:spec.name,officialAmount:spec.officialAmount,valhallaKm:round(live.km,1),geometryKm:round(cum.at(-1),1),routePointCount:live.geometry.length,eligibleCount:eligible.length,eventCount:events.length,events,eligible,excludedNear,legacy});
  console.log(`\n${spec.name}: km=${live.km.toFixed(1)} points=${live.geometry.length} M12Eligible=${eligible.length} events=${events.length} legacyMatched=${legacy.matchedIndexes.length}/19 longest=${legacy.longestRunLength} legacyAccepted=${legacy.acceptedByLegacy} inferred=${legacy.inferredAmount}`);
  for(const event of events) console.log(`  EVENT ${event.eventIndex} chainage=${event.chainageKm.toFixed(3)}km ids=${event.osmIds.join(",")}`);
  console.log(`  excludedNear=${excludedNear.length} (Platon=${excludedNear.filter(x=>x.platon).length}, booths=${excludedNear.filter(x=>x.tags.barrier==="toll_booth").length})`);
}
const parity=corridorParity(routeData[0].geometry,routeData[1].geometry);
console.log(`\ncorridor parity F→R median=${parity.forwardToReverse.medianKm} p95=${parity.forwardToReverse.p95Km} max=${parity.forwardToReverse.maxKm}`);
console.log(`corridor parity R→F median=${parity.reverseToForward.medianKm} p95=${parity.reverseToForward.p95Km} max=${parity.reverseToForward.maxKm}`);

const report={
  generatedAt:new Date().toISOString(), wallElapsedMs:Date.now()-startedAt, diagnosticOnly:true,
  productionRouteParity:{costing:"auto",useTolls:1,source:"app/api/v2/calculate fast Valhalla semantics"},
  thresholds:{routeRadiusKm:ROUTE_RADIUS_KM,eventClusterKm:EVENT_CLUSTER_KM,legacyRadiusKm:LEGACY_RADIUS_KM},
  inventory:{candidateCount:inventory.candidates.length,attempts:inventory.attempts}, corridorParity:parity, routes,
};
await writeFile("segment5a2b-m12-production-parity.json",`${JSON.stringify(report,null,2)}\n`);
if(routes.some(r=>!r.routePointCount)||routes.every(r=>r.eventCount===0)) process.exitCode=1;
