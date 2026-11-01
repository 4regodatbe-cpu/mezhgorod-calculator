import {NextRequest} from 'next/server';
import {POST} from '../../app/api/v3/calculate/route.ts';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const from={label:'Донецк — ДНР',position:{lat:48.023,lng:37.80224}};
const targets={volnovakha:{label:'Волноваха — ДНР',position:{lat:47.6008,lng:37.49358}},melitopol:{label:'Мелитополь — Запорожская область',position:{lat:46.84735,lng:35.38196}}};
const id=process.argv[2];
if(!Object.hasOwn(targets,id))throw Error('Use volnovakha or melitopol');
const controller=new AbortController();
const timer=setTimeout(()=>controller.abort('AUDIT01_90S_DEADLINE'),90_000);
const started=performance.now();
const path=resolve('experiments/ui-v1-release/checks',`${id}.json`);
let record;
try{
  const request=new NextRequest('http://localhost/api/v3/calculate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({from,to:targets[id],departureAt:'2026-11-01T12:00:00+03:00'}),signal:controller.signal});
  const response=await POST(request);
  const body=await response.json();
  record={case:id,source:'local Next route handler and live routing providers',departureAt:'2026-11-01T12:00:00+03:00',from,to:targets[id],status:response.status,elapsedMs:performance.now()-started,serverTiming:response.headers.get('server-timing'),body};
}catch(error){record={case:id,source:'local Next route handler and live routing providers',departureAt:'2026-11-01T12:00:00+03:00',from,to:targets[id],elapsedMs:performance.now()-started,error:String(error)};process.exitCode=1;}
finally{clearTimeout(timer);await mkdir(resolve('experiments/ui-v1-release/checks'),{recursive:true});await writeFile(path,JSON.stringify(record));}
const leg=record.body?.legs?.[0];
console.log(JSON.stringify({case:id,status:record.status,error:record.error,elapsedMs:record.elapsedMs,serverTiming:record.serverTiming,meters:leg?.fast?.meters,seconds:leg?.fast?.seconds,coordinateCount:leg?.fast?.coordinates?.length,pricingByVehicle:leg?.fast?.pricingByVehicle}));
