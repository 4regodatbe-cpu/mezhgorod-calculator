import fs from 'node:fs';
import {POST} from '../app/api/v3/calculate/route.ts';
import {NextRequest} from 'next/server.js';
import {validV3Response} from '../app/v3/components/response-validation.ts';
const point=(label,lng,lat)=>({label,position:{lng,lat}});
const cases={
 'donetsk-krasnodar':[point('Донецк',37.8028,48.0159),point('Краснодар',38.9753,45.0355)],
 'volnovakha-krasnodar':[point('Волноваха',37.4934079,47.6014517),point('Краснодар',38.9753,45.0355)],
 'volnovakha-moscow':[point('Волноваха',37.4934079,47.6014517),point('Москва',37.6173,55.7558)],
 'moscow-petersburg':[point('Москва',37.6173,55.7558),point('Санкт-Петербург',30.3159,59.9391)],
 'krasnodar-petersburg':[point('Краснодар',38.9753,45.0355),point('Санкт-Петербург',30.3159,59.9391)]
};
const name=process.argv[2];if(!cases[name])throw Error('Choose a case: '+Object.keys(cases).join(', '));
const departureAt='2026-10-15T00:30:00+03:00';
const [from,to]=cases[name],request={from,to,departureAt,diagnostics:false};
const started=Date.now();
const response=await POST(new NextRequest('http://localhost/api/v3/calculate',{method:'POST',body:JSON.stringify(request)}));
const body=await response.json(),fast=body.legs?.[0]?.fast;
const summary={name,status:response.status,validResponse:validV3Response(body),elapsedMs:Date.now()-started,
 meters:fast?.meters,seconds:fast?.seconds,comfortFare:fast?.pricingByVehicle?.comfort?.totalPrice,
 dualTariff:fast?.pricingByVehicle?.comfort?.dualTariff,tolls:fast?.tolls};
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const path=`experiments/nationwide-tolls/source-snapshots/route-fixes-2026-10-15/${name}-${stamp}.json`;
fs.writeFileSync(path,JSON.stringify({capturedAt:new Date().toISOString(),scope:'Live external routing/API, representative city coordinates; not exact user addresses',request,...summary,body},null,2));
console.log(JSON.stringify(summary));
if(response.status!==200||!summary.validResponse)process.exitCode=1;
