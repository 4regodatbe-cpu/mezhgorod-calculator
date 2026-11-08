// Bounded data review, NOT a list of runtime lookup overrides.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {createLocalGazetteer,normalize} from './local-gazetteer.mjs';
export const reviewQueries=['Донецк','Волноваха','Луганск','Мариуполь','Мелитополь','Бердянск','Геническ','Симферополь','Севастополь','Ялта','Керчь','Краснодар','Москва','Санкт-Петербург','Тарасовка'];
export function inspectRow(row){
 return {id:row[0],name:row[1],aliases:row[2],position:{lat:row[3],lng:row[4]},featureCode:row[8],adminCodes:row[9],adminLabels:row[6],qualityFlags:row[13],
  source:{dump:row[12],line:row[10],modifiedAt:row[11]},
  sourceIsSettlement:row[8].startsWith('PPL'),
  russianNameVerified:!row[13].includes('ru_name_unverified'),
  adminLabelsVerified:!row[13].some(x=>x==='admin_binding_missing'||x==='admin_ru_unverified'),
  independentCoordinateReview:'NOT_CONFIRMED',roadAccess:'NOT_CHECKED'};
}
export function review(data){
 const index=createLocalGazetteer(data);
 return {status:'PARTIAL_DATA_ADMISSION',runtimeApproved:false,records:index.recordCount,sourceDate:data.sourceDate,
  licence:data.license,sources:data.sources,
  queries:reviewQueries.map(query=>({query,
   exactRecords:data.records.filter(r=>r[2].some(n=>normalize(n)===normalize(query))).map(inspectRow),
   rankedFirstFive:index.search(query).items.slice(0,5).map(x=>({id:x.id,label:x.label,position:x.position,territory:x.territory})),
   prefixStatus:index.search(query.slice(0,4))})),
  gates:{sourceTypes:'P settlement classes only, not A administrative points',
   adminIdentity:'source country + hierarchical admin codes, not name joins',
   coordinates:'finite WGS84 and territory membership do not prove settlement identity or routable road access',
   independentBatchAttempt:'ru.wikipedia.org action=query prop=coordinates|pageprops: HTTP503, curl22; no retry',
   publicAdmission:'NOT_CONFIRMED; unresolved admin labels and independent coordinate checks; runtime untouched'}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [input,output]=process.argv.slice(2);if(!input||!output)throw Error('Pass catalog and report path');
 const bytes=readFileSync(input),result=review(JSON.parse(bytes));
 result.catalogSha256=createHash('sha256').update(bytes).digest('hex');
 writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({status:result.status,records:result.records,queries:result.queries.length,
 exactRows:result.queries.reduce((n,r)=>n+r.exactRecords.length,0),unverifiedAdminRows:result.queries.flatMap(r=>r.exactRecords).filter(r=>!r.adminLabelsVerified).length}));
}
