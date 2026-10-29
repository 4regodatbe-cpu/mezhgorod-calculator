import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateCatalog} from './local-gazetteer-validate.mjs';
import {compileShards} from './local-gazetteer-shards.mjs';
import {classifyTerritory} from '../../lib/special-territory-geometry.ts';
import {SPECIAL_TERRITORY_BOUNDARIES} from '../../lib/special-territory-boundaries.ts';
import {inCrimea} from '../../lib/crimea-geography.ts';
const [input,directory,output]=process.argv.slice(2);if(!input||!directory||!output)throw Error('Pass source catalog, shard directory and report');
const bytes=readFileSync(input),data=JSON.parse(bytes),validation=validateCatalog(data);
if(validation.status!=='STRUCTURAL_REVIEW_COMPLETE')throw Error('Catalog validation blocked');
const eligible=new Set(validation.eligibleIds),records=[],quarantine=[];
for(const row of data.records){
 if(!eligible.has(row[0]))continue;
 let territory;try{territory=classifyTerritory({lat:row[3],lng:row[4]},SPECIAL_TERRITORY_BOUNDARIES);}catch{quarantine.push({id:row[0],reason:'ambiguous_territory'});continue;}
 const crimea=inCrimea({lat:row[3],lng:row[4]});
 if(row[5]!=='RU'&&!territory&&!crimea){quarantine.push({id:row[0],reason:'outside_requested_scope'});continue;}
 if(row[13].includes('admin_ru_unverified')&&!territory&&!crimea){quarantine.push({id:row[0],reason:'unverified_display_administration'});continue;}
 // Don't publish unverified source districts as confirmed Russian UI labels.
 const copy=structuredClone(row);if(copy[13].includes('admin_ru_unverified'))copy[6]=[];
 records.push(copy);
}
const admission={scope:'local-pilot-only',sourceSha256:createHash('sha256').update(bytes).digest('hex'),
 semantics:'source-reported settlement centres; not exact addresses; full-corpus semantic accuracy not certified',unverifiedLowerAdminLabelsOmitted:true};
const pilot={...data,admission,records};
const manifest=await compileShards(pilot,directory);
// Explicit receipt prevents an arbitrary research catalog being silently enabled.
writeFileSync(directory+'/admission.json',JSON.stringify({...admission,manifestSha256:createHash('sha256').update(readFileSync(directory+'/manifest.json')).digest('hex')})+'\n');
writeFileSync(output,JSON.stringify({status:'LOCAL_PILOT_CORPUS',...admission,records:records.length,shards:Object.keys(manifest.shards).length,quarantine,
 structuralQuarantineCount:validation.issues.length},null,2)+'\n');console.log(JSON.stringify({records:records.length,quarantine:quarantine.length,scope:admission.scope}));
