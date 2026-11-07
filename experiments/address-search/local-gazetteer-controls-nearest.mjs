// Bounded new coordinate admission checks; not a road/toll audit or city overrides.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const [input,output]=process.argv.slice(2);if(!input||!output)throw Error('Pass catalog and evidence directory');mkdirSync(output,{recursive:true});
const catalog=JSON.parse(readFileSync(input,'utf8'));
const controls=JSON.parse(readFileSync(new URL('./local-gazetteer-evidence-2026-10-28/coordinate-comparison-2026-10-29.json',import.meta.url),'utf8')).results;
const report={scope:'15control nearest-road checks only, no route/toll audit',source:'https://router.project-osrm.org',maxRequests:15,results:[],stopped:false};
for(const control of controls){
 const row=catalog.records.find(r=>r[0]===control.geonamesId);if(!row)throw Error('Missing source control');
 const url=`https://router.project-osrm.org/nearest/v1/driving/${row[4]},${row[3]}?number=1`,path=join(output,row[0]+'.json');
 const result={id:row[0],name:row[1],position:{lat:row[3],lng:row[4]},url,status:'UNVERIFIED'};
 try{
  result.httpStatus=Number(execFileSync('curl',['--silent','--show-error','--max-time','6','--retry','0','--output',path,'--write-out','%{http_code}',url],{encoding:'utf8',timeout:8000}));result.curlExit=0;
  const bytes=readFileSync(path);result.sha256=createHash('sha256').update(bytes).digest('hex');
  const body=JSON.parse(bytes);result.providerCode=body.code;result.waypoint=body.waypoints?.[0];
  result.status=result.httpStatus===200&&body.code==='Ok'&&Number.isFinite(result.waypoint?.distance)?'NEAREST_AVAILABLE_NOT_CITY_ACCURACY_CERTIFICATE':'PROVIDER_FAILURE';
 }catch(error){result.curlExit=error.status??null;result.error=String(error.stderr??error.message).slice(0,1500);report.stopped=true;}
 report.results.push(result);writeFileSync(join(output,'review.json'),JSON.stringify(report,null,2)+'\n');
 if(report.stopped||result.status==='PROVIDER_FAILURE'){report.stopped=true;break;}
}
writeFileSync(join(output,'review.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
