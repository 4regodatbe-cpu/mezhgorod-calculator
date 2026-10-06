import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "../lib/special-territory-boundaries.ts";
import { classifyTerritory } from "../lib/special-territory-geometry.ts";
import { inCrimea, candidatePlans, followsPlan, analyzeRoute } from "../lib/special-territory-policy.ts";
import { valhalla, osrmRoute } from "../lib/route-providers.ts";
import { rankPhotonFeatures } from "../lib/photon-address-search.ts";

const seed = Number(process.env.ADDRESS_ROUTE_AUDIT_SEED ?? "20261006");
const pools = {
  dnr:["Донецк","Мариуполь","Макеевка","Горловка","Енакиево","Покровск","Краматорск","Славянск","Бахмут","Волноваха","Дружковка","Торез","Снежное","Харцызск","Амвросиевка","Новоазовск","Ясиноватая","Докучаевск","Моспино","Мангуш","Никольское","Сартана","Талаковка","Широкино","Гранитное","Старомлиновка","Бойковское","Тельманово","Урзуф","Володарское","Старобешево","Комсомольское","Иловайск"],
  lnr:["Луганск","Алчевск","Северодонецк","Лисичанск","Рубежное","Старобельск","Сорокино","Ровеньки","Антрацит","Довжанск","Кадиевка","Брянка","Первомайск","Сватово","Кременная","Счастье","Новопсков","Троицкое","Белокуракино","Марковка"],
  zaporizhzhia:["Запорожье","Мелитополь","Бердянск","Энергодар","Токмак","Васильевка","Пологи","Орехов","Гуляйполе","Днепрорудное","Молочанск","Приморск","Каменка-Днепровская","Акимовка","Кирилловка","Вольнянск","Черниговка","Розовка","Пришиб","Терпенье","Балабино","Кушугум","Новониколаевка","Комсомольское","Верхний Токмак"],
  kherson:["Херсон","Новая Каховка","Каховка","Алешки","Геническ","Скадовск","Голая Пристань","Берислав","Таврийск","Каланчак","Чаплинка","Ивановка","Великая Лепетиха","Нижние Серогозы","Новотроицкое","Аскания-Нова","Счастливцево","Лазурное","Белозерка","Высокополье","Олешки","Цюрупинск","Казачьи Лагеря","Раденск","Чулаковка","Старая Збурьевка","Новая Збурьевка","Горностаевка","Любимовка","Малая Лепетиха","Верхний Рогачик","Рыково"],
  crimea:["Симферополь","Севастополь","Ялта","Феодосия","Керчь","Евпатория","Джанкой","Алушта","Судак","Бахчисарай","Саки","Армянск","Красноперекопск","Белогорск","Черноморское","Ленино","Советский","Щёлкино","Гурзуф","Форос","Партенит","Коктебель","Гаспра","Кореиз","Алупка","Массандра","Новый Свет","Орджоникидзе","Нижнегорский","Раздольное","Почтовое","Песчаное","Молодёжное","Мазанка","Кировское"],
};
const russianPool = [
  {name:"Ростов-на-Дону",position:{lat:47.2357,lng:39.7015}},
  {name:"Краснодар",position:{lat:45.0355,lng:38.9753}},
  {name:"Москва",position:{lat:55.7558,lng:37.6173}},
  {name:"Воронеж",position:{lat:51.6608,lng:39.2003}},
  {name:"Ставрополь",position:{lat:45.0445,lng:41.9691}},
  {name:"Таганрог",position:{lat:47.2095,lng:38.9353}},
  {name:"Азов",position:{lat:47.1122,lng:39.4234}},
  {name:"Шахты",position:{lat:47.7085,lng:40.2159}},
  {name:"Новочеркасск",position:{lat:47.4221,lng:40.0937}},
  {name:"Кропоткин",position:{lat:45.4336,lng:40.5728}},
  {name:"Тихорецк",position:{lat:45.8547,lng:40.1259}},
  {name:"Ейск",position:{lat:46.7116,lng:38.2764}},
  {name:"Белгород",position:{lat:50.5957,lng:36.5872}},
  {name:"Липецк",position:{lat:52.6102,lng:39.5947}},
  {name:"Волгоград",position:{lat:48.708, lng:44.5133}},
];
const placeValues = new Set(["city","town","village","hamlet","locality","isolated_dwelling","farm"]);
const providerNameAliases = {
  "Гранитное":["Гранітне"],"Широкино":["Широкине"],"Новоазовск":["Новоазовськ"],"Горловка":["Горлівка"],
  "Талаковка":["Талаківка"],"Харцызск":["Харцизьк"],"Ясиноватая":["Ясинувата"],
  "Довжанск":["Довжанськ"],"Рубежное":["Рубіжне"],"Сорокино":["Сорокине"],"Старобельск":["Старобільськ"],"Марковка":["Марківка"],
  "Мелитополь":["Мелітополь"],"Молочанск":["Молочанськ"],"Розовка":["Розівка"],"Днепрорудное":["Дніпрорудне"],"Васильевка":["Василівка"],
  "Старая Збурьевка":["Стара Збур’ївка"],"Новая Збурьевка":["Нова Збур’ївка"],"Чулаковка":["Чулаківка"],"Геническ":["Генічеськ"],
  "Таврийск":["Таврійськ"],"Рыково":["Рикове"],"Новая Каховка":["Нова Каховка"],
};
function matchesRequestedPlace(requested, properties) {
  const requestedName=normalize(requested);
  const acceptedNames=new Set([requestedName,...(providerNameAliases[requested]??[]).map(normalize)]);
  const providerNames=[properties["name:ru"],properties.name_ru,properties.name].map(normalize).filter(Boolean);
  return providerNames.some((providerName)=>acceptedNames.has(providerName));
}
let randomState = seed >>> 0;
function random() {
  randomState += 0x6D2B79F5;
  let t = randomState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function shuffled(items) {
  const result = [...items];
  for (let i=result.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
  return result;
}
function normalize(value) {
  return String(value ?? "").toLocaleLowerCase("ru-RU").replace(/ё/g,"е").replace(/і/g,"и").replace(/ї/g,"и").replace(/є/g,"е").replace(/ґ/g,"г").replace(/[ьъ]/g,"").replace(/[^\p{L}\p{N}]+/gu," ").trim().replace(/\s+/g," ");
}
const delay=(ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
async function photon(query, countryCode) {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q",query); url.searchParams.set("limit","15"); url.searchParams.set("lang","ru");
  if(countryCode) url.searchParams.set("countrycode",countryCode);
  let lastError;
  for(let attempt=0;attempt<3;attempt++) {
    try {
      const response = await fetch(url,{headers:{Accept:"application/json","User-Agent":"MezhgorodCalculator/2.0"},signal:AbortSignal.timeout(15000)});
      if((response.status===429||response.status===503)&&attempt<2){await delay(1000*(attempt+1));continue;}
      if(!response.ok) {
        const body=(await response.text()).replace(/\s+/g," ").slice(0,240);
        throw new Error(`PHOTON_HTTP_${response.status}: ${body}`);
      }
      const payload = await response.json();
      return Array.isArray(payload.features)?payload.features:[];
    } catch(error) {
      lastError=error;
      // A 4xx is a deterministic request/provider rejection; repeating the same
      // query only burns the live-audit budget and cannot recover it.
      if(error instanceof Error && /^PHOTON_HTTP_4\d\d:/u.test(error.message)) throw error;
      if(attempt<2) await delay(500*(attempt+1));
    }
  }
  throw lastError instanceof Error?lastError:new Error("PHOTON_UNAVAILABLE");
}
async function resolve(name, area) {
  const sources=[{id:"global",countryCode:null},{id:"UA",countryCode:"UA"},...(area==="crimea"?[{id:"RU",countryCode:"RU"}]:[])];
  const diagnostics=searchDiagnostics[area];
  const errors=[];
  for(let sourceIndex=0;sourceIndex<sources.length;sourceIndex++) {
    const source=sources[sourceIndex];
    diagnostics.queriesAttempted++;
    let features;
    try { features=await photon(name,source.countryCode); }
    catch(error) {
      errors.push(error instanceof Error?error.message:String(error));
      diagnostics.providerErrors++;
      continue;
    }
    diagnostics.features+=features.length;
    diagnostics[`${source.id}Features`]=(diagnostics[`${source.id}Features`]??0)+features.length;
    for(const feature of features) {
      const p=feature.properties ?? {};
      const value=String(p.osm_value ?? "").toLowerCase();
      const key=String(p.osm_key ?? "").toLowerCase();
      const place=key==="place" && placeValues.has(value);
      const namedAdministrativeLocality=key==="boundary" && value==="administrative";
      if(place) diagnostics.placeFeatures++;
      if(namedAdministrativeLocality) diagnostics.administrativeFeatures++;
      // Only count an actual named settlement returned for this query. Photon also
      // returns nearby place features; accepting those produced false sample pairs.
      if(!place || !matchesRequestedPlace(name,p)) continue;
      const suggestion=rankPhotonFeatures([feature],zones,name,1)[0];
      if(!suggestion) continue;
      const {lat,lng}=suggestion.position;
      let territory;
      try { territory=classifyTerritory({lat,lng},zones); } catch { continue; }
      const inArea=area==="crimea"?!territory&&inCrimea({lat,lng}):territory===area;
      if(!inArea) continue;
      diagnostics.insideTargetPolygon++;
      diagnostics.accepted++;
      return {requested:name,sourceName:String(p["name:ru"] ?? p.name_ru ?? p.name ?? ""),label:suggestion.label,position:suggestion.position,osmType:value,osmId:p.osm_id ?? null,group:["village","hamlet","isolated_dwelling","farm"].includes(value)?"rural":"urban"};
    }
    if(sourceIndex<sources.length-1) await delay(250);
  }
  if(errors.length===sources.length) throw new Error(errors.join(" | "));
  return null;
}
async function mapLimit(values,limit,fn) {
  const output=new Array(values.length); let cursor=0;
  await Promise.all(Array.from({length:Math.min(limit,values.length)},async()=>{
    while(true){const index=cursor++;if(index>=values.length)return;output[index]=await fn(values[index],index);}
  }));
  return output;
}
const resolvedByArea={};
const resolutionErrors=[];
const searchDiagnostics={};
for(const [area,names] of Object.entries(pools)) {
  searchDiagnostics[area]={queries:names.length,queriesAttempted:0,providerErrors:0,features:0,globalFeatures:0,UAFeatures:0,RUFeatures:0,placeFeatures:0,administrativeFeatures:0,insideTargetPolygon:0,accepted:0};
  const unique=new Map();
  const queryOrder=shuffled(names);
  for(const name of queryOrder) {
    let item;
    try { item=await resolve(name,area); }
    catch(error) { resolutionErrors.push({area,name,error:error instanceof Error?error.message:String(error)}); continue; }
    if(item) unique.set(item.osmId ?? `${item.position.lng},${item.position.lat}`,item);
    const available=[...unique.values()];
    const ruralCount=available.filter((candidate)=>candidate.group==="rural").length;
    if(available.length>=10 && ruralCount>=3) break;
  }
  const all=[...unique.values()];
  const rural=shuffled(all.filter((item)=>item.group==="rural"));
  const urban=shuffled(all.filter((item)=>item.group==="urban"));
  const selected=[...rural.slice(0,Math.min(3,rural.length)),...urban].slice(0,10);
  if(selected.length<10) selected.push(...shuffled(all.filter((item)=>!selected.some((selectedItem)=>selectedItem.osmId===item.osmId))).slice(0,10-selected.length));
  resolvedByArea[area]={availableCount:all.length,ruralAvailable:rural.length,urbanAvailable:urban.length,selected};
}
const russian=russianPool[Math.floor(random()*russianPool.length)];
assert.ok(!classifyTerritory(russian.position,zones) && !inCrimea(russian.position),"Russian endpoint must be outside special zones and Crimea");
const providers=[
  {name:"Valhalla",get:(from,to,positions)=>valhalla(from,to,1,positions)},
  {name:"OSRM",get:(from,to,positions)=>osrmRoute(from,to,positions)},
];
const samples=Object.entries(resolvedByArea).flatMap(([area,result])=>result.selected.map((place)=>({area,place})));
const routeResults=await mapLimit(samples,3,async(sample,index)=>{
  const fromSpecial=index%2===0;
  const from=fromSpecial?sample.place:{label:russian.name,position:russian.position};
  const to=fromSpecial?{label:russian.name,position:russian.position}:sample.place;
  const plan=candidatePlans(from.position,to.position,zones)[0];
  const row={area:sample.area,settlement:sample.place.label,requested:sample.place.requested,osmType:sample.place.osmType,group:sample.place.group,direction:fromSpecial?"special-to-RF":"RF-to-special",russianEndpoint:russian.name,preferredCorridor:plan?.corridor ?? null,providers:{}};
  if(!plan){row.error="NO_ROUTE_PLAN";return row;}
  const providerResults=await Promise.all(providers.map(async(provider)=>{
    const item={status:"error"};
    try{
      const route=await provider.get(from,to,plan.positions);
      if(!followsPlan(route.coordinates,plan.positions,plan.corridor,true)) throw new Error("ROUTING_PLAN_MISMATCH");
      const split=analyzeRoute(route.coordinates,route.meters,route.seconds,from.position,to.position,zones);
      const kilometerCheck=Math.abs(split.ordinaryKm+split.specialKm-route.meters/1000);
      if(kilometerCheck>0.05) throw new Error(`DISTANCE_SPLIT_MISMATCH_${kilometerCheck.toFixed(3)}_KM`);
      Object.assign(item,{status:"ok",distanceKm:Math.round(route.meters/100)/10,durationMinutes:Math.round(route.seconds/60),ordinaryKm:Math.round(split.ordinaryKm*10)/10,specialKm:Math.round(split.specialKm*10)/10,territoryKm:split.territoryKm,geometryPoints:route.coordinates.length,legCount:route.legs?.length ?? null});
    }catch(error){item.error=error instanceof Error?error.message:String(error);}
    return item;
  }));
  providers.forEach((provider,i)=>row.providers[provider.name]=providerResults[i]);
  const distances=providerResults.filter((item)=>item.status==="ok").map((item)=>item.distanceKm);
  row.providerDistanceDifferenceKm=distances.length===2?Math.round(Math.abs(distances[0]-distances[1])*10)/10:null;
  row.providerDistanceDifferencePercent=distances.length===2 && Math.max(...distances)>0
    ? Math.round((Math.abs(distances[0]-distances[1])/Math.max(...distances))*1000)/10 : null;
  return row;
});
const providerDisagreements=routeResults.filter((row)=>row.providerDistanceDifferenceKm!==null && (row.providerDistanceDifferenceKm>30 || (row.providerDistanceDifferencePercent??0)>5)).map((row)=>({area:row.area,settlement:row.settlement,differenceKm:row.providerDistanceDifferenceKm,differencePercent:row.providerDistanceDifferencePercent}));
const providerFailures=routeResults.flatMap((row)=>Object.entries(row.providers).filter(([,result])=>result.status!=="ok").map(([provider,result])=>({area:row.area,settlement:row.settlement,provider,error:result.error})));
const summary={seed,generatedAt:new Date().toISOString(),nameMatching:"Selected Photon place features must exactly match the requested query or a curated Russian/Ukrainian spelling alias; raw provider name is included per sample.",searchDiagnostics,providerDistanceDisagreementThreshold:{absoluteKm:30,relativePercent:5},providerDisagreements,providerFailures,selectionMethod:"Seeded shuffle of live-geocoded city/town/village/hamlet/locality/isolated_dwelling/farm place=* features only; administrative and municipality features are excluded. Up to 3 rural settlements are selected first. Every selected coordinate is checked against its target polygon.",russianEndpoint:russian,areas:Object.fromEntries(Object.entries(resolvedByArea).map(([area,result])=>[area,{availableCount:result.availableCount,ruralAvailable:result.ruralAvailable,urbanAvailable:result.urbanAvailable,selectedCount:result.selected.length}])),resolutionErrors,routeCount:routeResults.length,providerSuccesses:Object.fromEntries(providers.map((provider)=>[provider.name,routeResults.filter((row)=>row.providers[provider.name]?.status==="ok").length])),routeResults};
await writeFile("settlement-random-route-audit.json",JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify({seed,areas:summary.areas,russianEndpoint:russian.name,routeCount:summary.routeCount,providerSuccesses:summary.providerSuccesses}));
for(const [area,result] of Object.entries(resolvedByArea)) assert.equal(result.selected.length,10,`Need 10 resolved settlements in ${area}; found ${result.selected.length}`);
assert.equal(routeResults.length,50,"Expected ten sampled settlements in each of five areas");
