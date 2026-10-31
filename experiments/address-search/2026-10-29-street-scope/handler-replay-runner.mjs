import fs from 'node:fs';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
import {NextRequest} from '/workspace/geonames-preview-publish-fc83523/node_modules/next/server.js';
import {GET} from '/workspace/geonames-preview-publish-fc83523/app/api/suggest/route.ts';
const root='/workspace/geonames-preview-publish-fc83523',dir=root+'/experiments/address-search/2026-10-29-street-scope';
const sources=Object.fromEntries(['Краснодар, Красная улица','Москва, Тверская улица','Донецк, улица Артёма','Ялта, улица Кирова'].map((q,i)=>[q,fs.readFileSync(dir+`/street-${i}.body`,'utf8')]));
const ua=fs.readFileSync(dir+'/donetsk-UA.body','utf8');let fetches=0;
globalThis.fetch=async url=>{fetches++;const u=new URL(url),q=u.searchParams.get('q');assert.equal(u.searchParams.get('layer'),'street');assert.ok(sources[q],'No external request allowed');return new Response(q.startsWith('Донецк')&&u.searchParams.get('countrycode')==='UA'?ua:sources[q],{status:200});};
const report={mode:'actual current Next GET handler + admitted GeoNames; provider I/O replayed from five saved actual HTTP responses, NO new live calls',environment:{node:process.version},results:[],sourceFiles:{}};
for(const file of ['lib/address-query.ts','lib/photon-address-search.ts','lib/local-settlement-search.ts','app/api/suggest/route.ts','app/v2/components/address-field.tsx','lib/route-input-validation.ts','lib/route-providers.ts'])report.sourceFiles[file]=createHash('sha256').update(fs.readFileSync(root+'/'+file)).digest('hex');
for(const query of ['Краснодар','Краснодар, Красная улица','Москва','Москва, Тверская улица','Донецк, ДНР','Донецк, улица Артёма','Ялта','Ялта, улица Кирова']){
 const before=fetches,start=performance.now(),response=await GET(new NextRequest('http://localhost/api/suggest?q='+encodeURIComponent(query))),body=await response.json();
 report.results.push({query,httpStatus:response.status,elapsedMs:Math.round(performance.now()-start),controlledProviderFetches:fetches-before,body});assert.equal(response.status,200,query);
 if(!sources[query])assert.equal(fetches,before,'City must not call Photon');
}
const old=JSON.parse(fs.readFileSync(root+'/experiments/address-search/2026-10-29-stage-a4-local/city-browser-review.json','utf8'));
const priorMoscow=old.viewports[0].searches.find(x=>x.query==='Москва').body.items[0].position;
const currentMoscow=report.results.find(x=>x.query==='Москва').body.items[0].position;
assert.deepEqual(currentMoscow,priorMoscow);
report.reusedEvidence={path:'../2026-10-29-stage-a4-local/city-browser-review.json',sourceRuntimeCommit:old.sourceRuntimeCommit,cityInputCoordinateComparison:'PASS',newBrowserRun:false,newRouteRequest:false,controlRoute:{httpStatus:old.controlRoute.httpStatus,elapsedMs:old.controlRoute.elapsedMs,meters:old.controlRoute.body.legs[0].fast.meters}};
fs.writeFileSync(dir+'/handler-replay.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.results.map(({query,httpStatus,elapsedMs,controlledProviderFetches,body})=>({query,httpStatus,elapsedMs,controlledProviderFetches,first:body.items[0],streetSearch:body.streetSearch})),null,2));
