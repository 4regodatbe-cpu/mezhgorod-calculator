import {spawn,execFileSync} from 'node:child_process';
import {createWriteStream,readFileSync,writeFileSync,statSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {performance} from 'node:perf_hooks';
import assert from 'node:assert/strict';
const [output]=process.argv.slice(2);if(!output)throw Error('Pass report path');
const logPath=output+'.server.log',log=createWriteStream(logPath),start=performance.now();
const childEnv={...process.env,GEONAMES_LOCAL_PILOT:'1',GEONAMES_LOCAL_TEST:'1'};delete childEnv.GEONAMES_LOCAL_PILOT_DIR;
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3141'],
 {env:childEnv,stdio:['ignore','pipe','pipe']});
child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false});
const report={scope:'Fresh actual production Next server, bundled data; no route/geocoder calls',node:process.version,pid:child.pid};
const memory=()=>{const text=readFileSync('/proc/'+child.pid+'/status','utf8');return {rssKiB:Number(text.match(/^VmRSS:\s+(\d+)/m)?.[1]),highWaterKiB:Number(text.match(/^VmHWM:\s+(\d+)/m)?.[1])};};
function request(query){const t=performance.now(),body=JSON.parse(execFileSync('curl',['--silent','--show-error','--fail','--max-time','5','-H','content-type: application/json','--data',JSON.stringify({query}),'http://127.0.0.1:3141/r'],{encoding:'utf8'}));assert.equal(body.localSource?.provider,'geonames');assert.ok(body.items.length);return {ms:performance.now()-t,firstItem:body.items[0]};}
try{
 for(let i=0;i<300;i++){if(child.exitCode!==null)throw Error('Server exited '+child.exitCode);let s='';try{s=readFileSync(logPath,'utf8');}catch{}if(s.includes('Ready in'))break;await new Promise(r=>setTimeout(r,25));if(i===299)throw Error('Server readiness timeout');}
 report.processReadyMs=performance.now()-start;report.beforeFirstRequest=memory();
 report.coldFirstRequest=request('Доне');report.afterColdRequest=memory();const samples=[];
 for(const q of ['Доне','Волноваха','Ялта Крым','Санкт-Петербург','Краснодар'])for(let i=0;i<7;i++)samples.push(request(q).ms);
 samples.sort((a,b)=>a-b);report.warmSamples=samples;report.warmP95Ms=samples[Math.floor(samples.length*.95)];report.afterWarmRequests=memory();
 const html=execFileSync('curl',['--silent','--show-error','--fail','--max-time','10','http://127.0.0.1:3141/v3'],{encoding:'utf8',maxBuffer:2*1024*1024});
 assert.ok(html.includes('https://www.geonames.org/'));assert.ok(html.includes('https://creativecommons.org/licenses/by/4.0/'));report.visibleAttributionHtml='PASS';
 report.functions=[];
 for(const path of ['.next/server/app/r/route.js.nft.json','.next/server/app/api/suggest/route.js.nft.json']){
  const trace=JSON.parse(readFileSync(path,'utf8')),files=new Set(trace.files.map(f=>resolve(dirname(path),f)));let bytes=0,dataBytes=0,dataFiles=0;
  for(const f of files){const size=statSync(f).size;bytes+=size;if(f.includes('/data/local-settlements/')){dataBytes+=size;dataFiles++;}}
  assert.equal(dataFiles,readdirSync('data/local-settlements').length,'Every immutable pilot asset must be traced');assert.ok(bytes<250*1024*1024,'Documented ordinary function bundle limit, not plan certification');
  report.functions.push({trace:path,files:files.size,bytes,dataFiles,dataBytes});
 }
 report.status='PASS';
}catch(error){report.status='FAIL';report.error=String(error);process.exitCode=1;}
finally{if(child.exitCode===null){const exited=new Promise(r=>child.once('exit',r));child.kill('SIGTERM');await exited;}log.end();writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
