// Bounded LOCAL API diagnostics: four street queries, one attempt per historical direction.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const base=new URL(process.env.LOCAL_V3_URL??'http://127.0.0.1:3208');
assert.ok(['localhost','127.0.0.1'].includes(base.hostname));
const output=process.env.AD_DIAGNOSTIC_OUTPUT??'/tmp/stage-ad-live-diagnostics.json';
const report={sourceSha:process.env.EXPECTED_COMMIT,kind:'LOCAL_API_LIVE_EXTERNAL_PROVIDERS',streets:[],routes:[]};
const save=()=>writeFileSync(output,JSON.stringify(report,null,2));
for(const query of ['Краснодар, Красная улица','Москва, Тверская улица','Донецк ДНР, улица Артёма','Ялта, улица Кирова']){
 const at=Date.now();
 try{const response=await fetch(new URL('/r',base),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query}),signal:AbortSignal.timeout(25_000)});
 const data=await response.json();report.streets.push({query,status:response.status,elapsedMs:Date.now()-at,partial:data.partial??null,fallback:data.fallback??null,localSource:data.localSource??null,items:(data.items??[]).slice(0,5).map(({id,title,label})=>({id,title,label}))});}
 catch(error){report.streets.push({query,error:error.name,elapsedMs:Date.now()-at});}save();
}
for(const [name,from,to] of [['Тверь → Адлер',[35.9176,56.8587],[39.918,43.4382]],['Голубицкая → Санкт-Петербург',[37.2761,45.3258],[30.3351,59.9343]]]){
 const at=Date.now();const point=([lng,lat])=>({label:'Public control',position:{lng,lat}});
 try{const response=await fetch(new URL('/api/v3/calculate',base),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mode:'standard',vehicle:'standard',departureAt:'2026-10-02T09:00:00+03:00',from:point(from),to:point(to)}),signal:AbortSignal.timeout(100_000)});
 const data=await response.json();report.routes.push({name,status:response.status,elapsedMs:Date.now()-at,error:data.error??null,legs:(data.legs??[]).map(leg=>({meters:leg.fast.meters,seconds:leg.fast.seconds,quality:leg.fast.quality,tolls:leg.fast.tolls?.pricingStatus??null}))});}
 catch(error){report.routes.push({name,error:error.name,elapsedMs:Date.now()-at});}save();
}
