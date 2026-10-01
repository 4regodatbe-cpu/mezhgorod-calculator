import fs from "node:fs";
const key=process.env.HERE_API_KEY;
if(!key){ console.error("HERE_API_KEY is required for live benchmark; no production fallback is enabled."); process.exit(2); }
const cases=JSON.parse(fs.readFileSync("data/external-toll-benchmark.json","utf8"));
const geocodes={
"Moscow":"55.7558,37.6173","Voronezh":"51.6608,39.2003","Rostov-on-Don":"47.2357,39.7015","Krasnodar":"45.0355,38.9753","Anapa":"44.8950,37.3163","Novorossiysk":"44.7239,37.7687","Gelendzhik":"44.5610,38.0767","Sochi":"43.5855,39.7231","Saint Petersburg":"59.9343,30.3351","Tver":"56.8587,35.9176","Veliky Novgorod":"58.5256,31.2742","Zelenograd":"55.9825,37.1814","Klin":"56.3333,36.7333","Torzhok":"57.0413,34.9601","Chudovo":"59.1249,31.6865","Kazan":"55.7961,49.1064","Vladimir":"56.1291,40.4070","Murom":"55.5792,42.0524","Arzamas":"55.3949,43.8408","Nizhny Novgorod":"56.2965,43.9361"};
const observations=[];
for(const c of cases){
  const origin=geocodes[c.from], destination=geocodes[c.to];
  if(!origin||!destination){ observations.push({caseId:c.id,provider:"HERE-v8",routeCompatible:null,tollDetected:null,amountRub:null,currency:null,failure:"benchmark-endpoint-not-geocoded",observedAt:new Date().toISOString()}); continue; }
  const u=new URL("https://router.hereapi.com/v8/routes");
  u.searchParams.set("origin",origin);u.searchParams.set("destination",destination);u.searchParams.set("transportMode","car");u.searchParams.set("routingMode","fast");u.searchParams.set("return","summary,tolls");u.searchParams.set("currency","RUB");u.searchParams.set("tolls[summaries]","total");u.searchParams.set("apiKey",key);
  try{
    const r=await fetch(u); const j=await r.json();
    if(!r.ok){ observations.push({caseId:c.id,provider:"HERE-v8",routeCompatible:null,tollDetected:null,amountRub:null,currency:null,failure:`http-${r.status}`,observedAt:new Date().toISOString()}); continue; }
    const sections=j.routes?.[0]?.sections??[]; const notices=sections.flatMap(s=>s.notices??[]);
    if(notices.some(n=>n.code==="tollsDataUnavailable")){ observations.push({caseId:c.id,provider:"HERE-v8",routeCompatible:true,tollDetected:null,amountRub:null,currency:null,failure:"tollsDataUnavailable",observedAt:new Date().toISOString()}); continue; }
    const totals=sections.map(s=>s.travelSummary?.tolls?.total??s.summary?.tolls?.total).filter(Boolean);
    const currencies=new Set(totals.map(t=>t.currency).filter(Boolean)); const values=totals.map(t=>Number(t.value)).filter(Number.isFinite);
    observations.push({caseId:c.id,provider:"HERE-v8",routeCompatible:true,tollDetected:values.some(v=>v>0),amountRub:values.length?values.reduce((a,b)=>a+b,0):0,currency:currencies.size===1?[...currencies][0]:currencies.size?"MIXED":"RUB",failure:null,observedAt:new Date().toISOString()});
  }catch(e){ observations.push({caseId:c.id,provider:"HERE-v8",routeCompatible:null,tollDetected:null,amountRub:null,currency:null,failure:`network:${e?.name??"error"}`,observedAt:new Date().toISOString()}); }
}
fs.mkdirSync("artifacts",{recursive:true}); fs.writeFileSync("artifacts/segment9-here-observations.json",JSON.stringify(observations,null,2));
console.log(`HERE observations: ${observations.length}; failures: ${observations.filter(o=>o.failure).length}`);
