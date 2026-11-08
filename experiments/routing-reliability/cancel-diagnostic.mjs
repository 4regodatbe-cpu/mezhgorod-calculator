// Diagnostic evidence, not an assertion that the observed cancellation gap is acceptable.
import fs from 'node:fs';import {NextRequest} from 'next/server';
import {POST} from '../../app/api/v3/calculate/route.ts';
const controller=new AbortController(),original=globalThis.fetch,info=console.info;
const request=new NextRequest('http://localhost/api/v3/calculate',{method:'POST',signal:controller.signal,body:JSON.stringify({from:{label:'Анапа',position:{lng:37.32,lat:44.9}},to:{label:'Краснодар',position:{lng:38.98,lat:45.04}},departureAt:'2026-10-15T09:00:00+03:00'})});
const report={mode:'actual current V3 handler with controlled immediate upstream failures; no network',calls:[],source:'current working runtime; compare pinned before/after report',finding:'UNASSESSED'};
globalThis.fetch=async(url,init)=>{
 if(!controller.signal.aborted)controller.abort();
 report.calls.push({host:new URL(url).hostname,callerAborted:request.signal.aborted,providerSignalAborted:init?.signal?.aborted??null});
 return new Response('{}',{status:503,headers:{'content-type':'application/json'}});
};console.info=()=>{};
try{const response=await POST(request);report.httpStatus=response.status;report.response=await response.json();report.finding=report.calls.length&&report.calls.every(c=>c.callerAborted&&!c.providerSignalAborted)?'CONFIRMED_CALLER_ABORT_NOT_PROPAGATED':report.calls.length&&report.calls.every(c=>c.providerSignalAborted)?'CALLER_ABORT_REACHES_PROVIDER':'NOT_REPRODUCED';}
finally{globalThis.fetch=original;console.info=info;}
fs.writeFileSync(process.argv[2]??'experiments/routing-reliability/2026-10-29/cancel-diagnostic.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
