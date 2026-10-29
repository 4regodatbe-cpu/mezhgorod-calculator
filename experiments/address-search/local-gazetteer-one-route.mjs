// One explicitly requested route compatibility check, not a route audit.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const [base,directory]=process.argv.slice(2);if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(base)||!directory)throw Error('Pass local server and output');mkdirSync(directory,{recursive:true});
const query=q=>JSON.parse(execFileSync('curl',['--silent','--show-error','--fail','--max-time','5','-H','content-type: application/json','--data',JSON.stringify({query:q}),base+'/r'],{encoding:'utf8'}));
const a=query('Ялта Крым'),b=query('Санкт-Петербург');if(a.localSource?.provider!=='geonames'||b.localSource?.provider!=='geonames')throw Error('Not local source');
const from=a.items[0],to=b.items[0],body={from,to,departureAt:'2026-10-29',vehicle:'standard'};
writeFileSync(directory+'/request.json',JSON.stringify(body,null,2)+'\n');
const started=Date.now(),report={scope:'ONE real V3 YaltaCrimea -> StPetersburg calculation using GeoNames; no price certification or retries',startedAt:new Date().toISOString(),from,to};
try{
 report.httpStatus=Number(execFileSync('curl',['--silent','--show-error','--max-time','65','--retry','0','-H','content-type: application/json','--data',JSON.stringify(body),'-o',directory+'/response.json','--write-out','%{http_code}',base+'/api/v3/calculate'],{encoding:'utf8',timeout:68000}));report.curlExit=0;
 const raw=readFileSync(directory+'/response.json');report.sha256=createHash('sha256').update(raw).digest('hex');const response=JSON.parse(raw);
 report.error=response.error??null;report.legs=response.legs?.length??0;report.options=response.options?.length??0;report.status=report.httpStatus===200?'ROUTE_RESPONSE_RECEIVED_NOT_TARIFF_CERTIFICATION':'FAILED';
}catch(error){report.status='BLOCKED_OR_FAILED';report.curlExit=error.status??null;report.error=String(error.stderr??error.message).slice(0,1500);}
report.elapsedMs=Date.now()-started;writeFileSync(directory+'/review.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
