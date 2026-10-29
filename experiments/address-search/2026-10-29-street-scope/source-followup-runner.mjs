import fs from 'node:fs';import {createHash} from 'node:crypto';
const dir='/workspace/geonames-preview-publish-fc83523/experiments/address-search/2026-10-29-street-scope',url=new URL('https://photon.komoot.io/api/');
for(const [key,value] of Object.entries({q:'Донецк, улица Артёма',layer:'street',limit:'20',countrycode:'UA'}))url.searchParams.set(key,value);
const r={reason:'Global street window returned only Rostov Donetsk; check existing UA country-filter variant once',url:String(url),startedAt:new Date().toISOString()},start=performance.now();
try{const response=await fetch(url,{signal:AbortSignal.timeout(20000)}),b=Buffer.from(await response.arrayBuffer());Object.assign(r,{httpStatus:response.status,file:'donetsk-UA.body',bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});fs.writeFileSync(dir+'/donetsk-UA.body',b);try{r.featureCount=JSON.parse(b).features.length;}catch{r.json=false;}}catch(e){r.error={name:e.name,code:e.cause?.code??null};}
r.elapsedMs=Math.round(performance.now()-start);fs.writeFileSync(dir+'/followup-review.json',JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));
