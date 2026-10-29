import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const types=new Set(['PPL','PPLA','PPLA2','PPLA3','PPLA4','PPLA5','PPLC','PPLF','PPLG','PPLL','PPLR']);
const safeText=x=>typeof x==='string'&&x.trim().length>0&&x.length<=300&&!/[\u0000-\u001f\u007f]/u.test(x);
export function validateCatalog(data){
 if(data.schemaVersion!==1||!Array.isArray(data.records)||data.records.length>300000||data.license?.name!=='CC-BY-4.0'||!Array.isArray(data.sources)||data.sources.length!==4)throw Error('Invalid catalog envelope');
 const seen=new Set(),issues=[],eligible=[],counts={};
 const flag=(id,reason)=>{counts[reason]=(counts[reason]??0)+1;issues.push({id,reason});};
 for(const r of data.records){
  const id=r?.[0];let invalid=false;
  const fail=reason=>{invalid=true;flag(id,reason);};
  if(!Array.isArray(r)||r.length!==14){fail('invalid_tuple');continue;}
  if(!Number.isSafeInteger(id)||id<=0)fail('invalid_id');
  if(seen.has(id))fail('duplicate_id');seen.add(id);
  if(!safeText(r[1]))fail('invalid_name');
  if(!Number.isFinite(r[3])||!Number.isFinite(r[4])||Math.abs(r[3])>90||Math.abs(r[4])>180||(r[3]===0&&r[4]===0))fail('invalid_coordinate');
  if(!Array.isArray(r[2])||r[2].length<1||r[2].length>32||!r[2].every(safeText)||!r[2].includes(r[1]))fail('invalid_aliases');
  if(!['RU','UA'].includes(r[5])||!types.has(r[8]))fail('invalid_country_or_type');
  if(!Array.isArray(r[6])||r[6].length>4||!r[6].every(safeText)||new Set(r[6]).size!==r[6].length)fail('invalid_admin_labels');
  // GeoNames admin-code fields can contain legacy textual identifiers with
  // apostrophes. Preserve opaque source keys, don't invent a numeric schema.
  if(!Array.isArray(r[9])||r[9].length!==4||!r[9].every(x=>typeof x==='string'&&x.length<=100&&!/[\u0000-\u001f\u007f]/u.test(x)))fail('invalid_admin_codes');
  if(!Number.isSafeInteger(r[7])||r[7]<0||!Number.isSafeInteger(r[10])||r[10]<1||!/^\d{4}-\d{2}-\d{2}$/.test(r[11])||!['RU','UA'].includes(r[12]))fail('invalid_provenance');
  if(!Array.isArray(r[13])||!r[13].every(safeText))fail('invalid_quality_flags');
  if(invalid)continue;
  if(r[13].includes('ru_name_unverified')||!/[А-Яа-яЁё]/u.test(r[1])){flag(id,'unverified_russian_name');continue;}
  if(r[13].includes('admin_binding_missing')||!r[9][0]||r[6].length===0){flag(id,'missing_admin_binding');continue;}
  eligible.push(id);
 }
 return {status:counts.duplicate_id?'BLOCKED_DUPLICATE_IDS':'STRUCTURAL_REVIEW_COMPLETE',records:data.records.length,eligibleForFurtherReview:eligible.length,eligibleIds:eligible,
 counts,issues,semanticAccuracyCertified:false,roadAccessCertified:false,
 admission:'Structurally screened candidate corpus only. Lower-admin quality flags remain; independent controls and honest display policy required before runtime activation.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [input,output]=process.argv.slice(2);if(!input||!output)throw Error('Pass catalog and report');
 const bytes=readFileSync(input),report=validateCatalog(JSON.parse(bytes));report.catalogSha256=createHash('sha256').update(bytes).digest('hex');
 writeFileSync(output,JSON.stringify(report)+'\n');console.log(JSON.stringify({...report,issues:report.issues.length,eligibleIds:undefined}));
}
