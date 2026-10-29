import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const [beforePath,afterPath,output]=process.argv.slice(2);if(!beforePath||!afterPath||!output)throw Error('Pass old catalog, rebuilt catalog and output');
const old=JSON.parse(readFileSync(beforePath,'utf8')),bytes=readFileSync(afterPath),next=JSON.parse(bytes);
assert.equal(old.records.length,next.records.length);let titles=0,admin=0,newUnknown=0;const examples=[];
for(let i=0;i<old.records.length;i++){
 const a=old.records[i],b=next.records[i];
 for(const field of [0,3,4,5,7,8,9,10,11,12])assert.deepEqual(a[field],b[field],`ID/location/type/provenance changed: ${a[0]}`);
 if(a[1]!==b[1])titles++;
 if(JSON.stringify(a[6])!==JSON.stringify(b[6])){admin++;if(examples.length<10)examples.push({id:a[0],before:a[6],after:b[6]});}
 if(!a[13].includes('ru_name_unverified')&&b[13].includes('ru_name_unverified'))newUnknown++;
}
const sev=next.records.find(r=>r[0]===694423);assert.ok(sev[6].includes('Город Севастополь'));
writeFileSync(output,JSON.stringify({status:'PASS',records:next.records.length,coordinateIdTypeAndSourceChanges:0,titleChanges:titles,adminLabelChanges:admin,
 newlyFlaggedRomanizedNames:newUnknown,sourceSha256:createHash('sha256').update(bytes).digest('hex'),
 exampleSourceEvidence:{archive:'GeoNames alternatenames/UA.zip saved 2026-10-24',adminId:694422,
  oldAliasId:9066179,oldAlias:'Gorod Sevastopol',selectedExistingAliasId:16719546,selectedExistingAlias:'Город Севастополь',newTranslationCreated:false},examples,
 runtimeApproved:false},null,2)+'\n');console.log(JSON.stringify({records:next.records.length,titles,admin,newUnknown}));
