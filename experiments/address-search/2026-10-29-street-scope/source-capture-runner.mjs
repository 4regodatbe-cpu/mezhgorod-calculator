import fs from 'node:fs';
import {createHash} from 'node:crypto';
const dir='/workspace/geonames-preview-publish-fc83523/experiments/address-search/2026-10-29-street-scope';
fs.mkdirSync(dir,{recursive:true});
const report={source:'Photon actual street-layer requests, no mocks; initial four-query bounded sample',sourceRuntimeBase:'d7cc05f68f3950ceb2178324b89b25927bb4f249',requests:[]};
for(const [i,query] of ['Краснодар, Красная улица','Москва, Тверская улица','Донецк, улица Артёма','Ялта, улица Кирова'].entries()){
 const url=new URL('https://photon.komoot.io/api/');url.searchParams.set('q',query);url.searchParams.set('layer','street');url.searchParams.set('limit','20');
 const item={query,url:String(url),startedAt:new Date().toISOString()},start=performance.now();
 try{const response=await fetch(url,{signal:AbortSignal.timeout(20000)});const bytes=Buffer.from(await response.arrayBuffer());item.httpStatus=response.status;item.file=`street-${i}.body`;item.bytes=bytes.length;item.sha256=createHash('sha256').update(bytes).digest('hex');fs.writeFileSync(dir+'/'+item.file,bytes);try{item.featureCount=JSON.parse(bytes.toString()).features?.length??null;}catch{item.json=false;}}
 catch(error){item.error={name:error.name,code:error.cause?.code??null};}
 item.elapsedMs=Math.round(performance.now()-start);report.requests.push(item);fs.writeFileSync(dir+'/capture-review.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(item));
}
