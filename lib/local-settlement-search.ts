import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {createShardLoader,type LocalLoader} from '../experiments/address-search/local-gazetteer-shards.mjs';
import type {Suggestion} from '../app/v2/components/types.ts';
import {normalize} from '../experiments/address-search/local-gazetteer.mjs';
type Store={loader:LocalLoader;excludedNames:Set<string>};
let cached: {directory:string; promise:Promise<Store>} | undefined;
export function localPilotAllowed(env:NodeJS.ProcessEnv=process.env):boolean {
 if(env.GEONAMES_LOCAL_PILOT!=='1')return false;
 if(env.VERCEL==='1'||env.VERCEL_ENV!==undefined)return env.VERCEL_ENV==='preview'&&env.VERCEL_GIT_COMMIT_REF==='fix/v3-missing-route-prices-2026-10-15';
 return env.NODE_ENV!=='production'||env.GEONAMES_LOCAL_TEST==='1';
}
export function isDetailedAddress(query:string):boolean {
 return /\d|[,;]|(?:^|\s)(?:ул\.?|улица|проспект|пр-т|переулок|пер\.?|шоссе|дом|д\.?|корпус|кв\.?)(?:\s|$)/iu.test(query);
}
async function load(directory:string):Promise<Store>{
 const receiptBytes=await readFile(join(directory,'admission.json'));if(receiptBytes.length>16384)throw Error('Invalid admission size');
 const receipt=JSON.parse(receiptBytes.toString('utf8')) as {scope?:string;manifestSha256?:string;excludedNamesSha256?:string};
 if(receipt.scope!=='local-pilot-only')throw Error('Missing local pilot admission');
 const manifest=await readFile(join(directory,'manifest.json'));
 if(manifest.length>8*1024*1024)throw Error('Invalid manifest size');
 if(createHash('sha256').update(manifest).digest('hex')!==receipt.manifestSha256)throw Error('Admission integrity mismatch');
 const guardBytes=await readFile(join(directory,'excluded-names.json'));
 if(guardBytes.length>8*1024*1024||createHash('sha256').update(guardBytes).digest('hex')!==receipt.excludedNamesSha256)throw Error('Coverage guard integrity mismatch');
 const guard=JSON.parse(guardBytes.toString('utf8')) as {schemaVersion?:number;names?:unknown};
 if(guard.schemaVersion!==1||!Array.isArray(guard.names)||guard.names.length>300000||!guard.names.every((x:unknown)=>typeof x==='string'&&x.length>=3&&x.length<=200))throw Error('Invalid coverage guard');
 return {loader:createShardLoader(JSON.parse(manifest.toString('utf8')),file=>readFile(join(directory,file))),excludedNames:new Set(guard.names)};
}
/** Explicit local pilot only; unset switch preserves the existing public API. */
export async function searchLocalSettlements(query:string,signal?:AbortSignal):Promise<null|{items:Suggestion[];partial:boolean;localSource:Record<string,unknown>}>{
 if(!localPilotAllowed()||isDetailedAddress(query))return null;
 const directory=process.env.GEONAMES_LOCAL_PILOT_DIR??join(process.cwd(),'data/local-settlements');
 if(signal?.aborted)throw signal.reason??Error('Cancelled');
 if(cached?.directory!==directory){
  const promise=load(directory);cached={directory,promise};
  void promise.catch(()=>{if(cached?.promise===promise)cached=undefined;});
 }
 const store=await cached.promise;
 const result=await store.loader.search(query,{signal});
 const omittedNameMatch=store.excludedNames.has(normalize(query));
 // Don't hide an already admitted exact city (e.g. Mariupol) because an
 // unrelated omitted homonym exists. Never substitute a mere prefix match
 // when the exact requested name is known only in the omitted corpus.
 if(omittedNameMatch&&!result.items.some(item=>item.exact))return null;
 if(signal?.aborted)throw signal.reason??Error('Cancelled');
 if(!result.items.length)return null; // Street/detail misses still reach Photon.
 return {items:result.items.map(({id,title,label,region,position})=>({id,title,label,region,position})),partial:omittedNameMatch||result.truncated||!!result.hasMore,
  localSource:{provider:'geonames',scope:'local-pilot-only',precision:'settlement-centre',sourceDate:result.sourceDate,
   attribution:'GeoNames — CC BY 4.0; filtered and indexed by Mezhgorod Calculator',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',
   sourceUrl:'https://www.geonames.org/',semanticAccuracyCertified:false,omittedExactHomonymsPossible:omittedNameMatch}};
}
