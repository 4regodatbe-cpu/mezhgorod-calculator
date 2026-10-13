import {writeFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import { POST } from '../app/api/v3/calculate/route.ts';
import { NextRequest } from 'next/server.js';

const cases = [
  ['moscow-voronezh', {label:'Москва',position:{lng:37.6173,lat:55.7558}}, {label:'Воронеж',position:{lng:39.2003,lat:51.6608}}],
  ['volnovakha-moscow', {label:'Волноваха — ДНР',position:{lng:37.4934079,lat:47.6014517}}, {label:'Москва',position:{lng:37.6173,lat:55.7558}}],
  ['ufa-petersburg', {label:'Уфа',position:{lng:55.9721,lat:54.7388}}, {label:'Санкт-Петербург',position:{lng:30.3159,lat:59.9391}}],
  ['ufa-moscow', {label:'Уфа',position:{lng:55.9721,lat:54.7388}}, {label:'Москва',position:{lng:37.6173,lat:55.7558}}],
  ['petersburg-moscow', {label:'Санкт-Петербург',position:{lng:30.3159,lat:59.9391}}, {label:'Москва',position:{lng:37.6173,lat:55.7558}}],
  ['petersburg-sevastopol', {label:'Санкт-Петербург',position:{lng:30.3159,lat:59.9391}}, {label:'Севастополь',position:{lng:33.5251,lat:44.6167}}],
];
const originalFetch = globalThis.fetch;
const departureAt = new Date().toISOString();
for (const [name, from, to] of cases) {
  if (process.argv[2] && process.argv[2] !== name) continue;
  const providers = [];
  globalThis.fetch = async (...args) => {
    const url = new URL(String(args[0]));
    const routing = url.pathname === '/route' || url.hostname === 'router.project-osrm.org' || url.hostname === 'brouter.de';
    try {
      const response = await originalFetch(...args);
      if (routing) {
        let data = null;
        try { data = await response.clone().json(); } catch {}
        providers.push({url:url.origin+url.pathname,status:response.status,data});
      }
      return response;
    } catch (error) {
      if (routing) providers.push({url:url.origin+url.pathname,error:String(error)});
      throw error;
    }
  };
  try {
    const started=Date.now();
    const response=await POST(new NextRequest('http://localhost/api/v3/calculate',{method:'POST',body:JSON.stringify({from,to,departureAt})}));
    const body=await response.json();
    const fast=body.legs?.[0]?.fast;
    const summary={name,status:response.status,elapsedMs:Date.now()-started,meters:fast?.meters,seconds:fast?.seconds,quality:fast?.quality,tolls:fast?.tolls,providerResults:providers.map(p=>({url:p.url,status:p.status,error:p.error,distance:p.data?.routes?.[0]?.distance??p.data?.trip?.summary?.length,seconds:p.data?.routes?.[0]?.duration??p.data?.trip?.summary?.time}))};
    const selectedRaw=providers.find(p=>Math.round(p.data?.routes?.[0]?.distance??(p.data?.trip?.summary?.length*1000))===fast?.meters&&Math.round(p.data?.routes?.[0]?.duration??p.data?.trip?.summary?.time)===fast?.seconds)?.data;
    const selectedRawFile=selectedRaw?`experiments/nationwide-tolls/live-controls/2026-10-13-stage10-ui-${name}.provider.json.gz`:null;
    if(selectedRawFile)writeFileSync(selectedRawFile,gzipSync(JSON.stringify(selectedRaw)));
    writeFileSync(`experiments/nationwide-tolls/live-controls/2026-10-13-stage10-ui-${name}.json`,JSON.stringify({capturedAt:new Date().toISOString(),externalRoutingSimulated:false,from,to,departureAt,endpointScope:'Representative city coordinates; exact user screenshot addresses not provided',recordScope:'API body/provider summaries plus compressed chosen provider response',body,...summary,selectedRawFile},null,2));
    console.log(JSON.stringify(summary));
  } finally { globalThis.fetch=originalFetch; }
}
