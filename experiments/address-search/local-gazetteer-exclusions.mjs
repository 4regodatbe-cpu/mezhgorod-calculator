// Coverage guard only: omitted records contribute names, never coordinates/results.
import {normalize} from './local-gazetteer.mjs';
import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
export function writeExclusionGuard(data,admittedIds,directory){
 const guard=buildExclusionGuard(data,admittedIds),bytes=Buffer.from(JSON.stringify({...guard,sharedExactNames:undefined})+'\n');
 writeFileSync(join(directory,'excluded-names.json'),bytes);
 return {sha256:createHash('sha256').update(bytes).digest('hex'),excludedRecords:guard.excludedRecords,uniqueNames:guard.names.length,sharedNames:guard.sharedExactNames.length};
}
export function buildExclusionGuard(data,admittedIds){
 const admitted=new Set(admittedIds),names=new Set(),includedNames=new Set();let excludedRecords=0;
 for(const row of data.records){
  const target=admitted.has(row[0])?includedNames:names;if(!admitted.has(row[0]))excludedRecords++;
  for(const value of row[2]){const key=normalize(value);if(key.length>=3&&key.length<=200)target.add(key);}
 }
 return {schemaVersion:1,excludedRecords,names:[...names].sort(),sharedExactNames:[...names].filter(n=>includedNames.has(n)).sort(),
  purpose:'Known omitted exact names without an admitted exact match fall back to Photon; admitted exact homonyms retain limited-coverage metadata. No omitted coordinates admitted.'};
}
