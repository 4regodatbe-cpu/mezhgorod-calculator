import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import {NextRequest} from 'next/server';
import {POST} from '../app/api/v3/calculate/route.ts';
const cities={anapa:[37.316,44.895],kerch:[36.468,45.356],yalta:[34.1689,44.4988],adler:[39.923,43.428],moscow:[37.617,55.756],rostov:[39.71,47.22],donetsk:[37.8029,48.0156],volnovakha:[37.4968,47.6019],melitopol:[35.365,46.848]};
const pairs=[['anapa','kerch'],['anapa','yalta'],['yalta','adler'],['yalta','moscow'],['yalta','rostov'],['donetsk','volnovakha'],['donetsk','melitopol']].flatMap(([a,b])=>[[a,b],[b,a]]);
const root=process.env.CRIMEA_PROBE_OUTPUT;
if(!root)throw Error('CRIMEA_PROBE_OUTPUT required');
fs.mkdirSync(root,{recursive:true});
const realFetch=globalThis.fetch;
// Match the UI contract: tariff adapters require an instant, not a bare date.
const departureAt='2026-11-02T12:00:00+03:00';
for(const [a,b] of pairs){
 const id=a+'-'+b;if(process.argv[2]&&process.argv[2]!==id)continue;
 const file=root+'/'+id+'.json';if(fs.existsSync(file)){
  if(JSON.parse(fs.readFileSync(file,'utf8')).departureAt!==departureAt)throw Error('Different departure input already saved; select a new CRIMEA_PROBE_OUTPUT directory');
  continue;
 }
 const captures=[];
 globalThis.fetch=async(...args)=>{const url=String(args[0]);const response=await realFetch(...args);if(/router.project-osrm.org|valhalla|brouter/.test(url)){try{captures.push({url,status:response.status,body:await response.clone().json()});}catch{}}return response;};
 const point=name=>({label:name,position:{lng:cities[name][0],lat:cities[name][1]}});
 const start=Date.now();
 try{const response=await POST(new NextRequest('http://localhost/api/v3/calculate',{method:'POST',body:JSON.stringify({from:point(a),to:point(b),departureAt}),signal:AbortSignal.timeout(90000)}));const body=await response.json();const fast=body.legs?.[0]?.fast;const summary={id,httpStatus:response.status,elapsedMs:Date.now()-start,meters:fast?.meters,seconds:fast?.seconds,provider:fast?.provider,quality:fast?.quality,tolls:fast?.tolls,error:body.error};fs.writeFileSync(file,JSON.stringify({capturedAt:new Date().toISOString(),departureAt,from:point(a),to:point(b),summary,body},null,2));fs.writeFileSync(root+'/'+id+'.providers.json.gz',gzipSync(JSON.stringify(captures)));console.log(JSON.stringify(summary));}finally{globalThis.fetch=realFetch;}
}
