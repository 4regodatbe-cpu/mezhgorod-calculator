import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {createShardLoader,type LocalLoader} from '../experiments/address-search/local-gazetteer-shards.mjs';
import type {Suggestion} from '../app/v2/components/types.ts';
let cached: {directory:string; promise:Promise<LocalLoader>} | undefined;
export function isDetailedAddress(query:string):boolean {
 return /\d|[,;]|(?:^|\s)(?:ул\.?|улица|проспект|пр-т|переулок|пер\.?|шоссе|дом|д\.?|корпус|кв\.?)(?:\s|$)/iu.test(query);
}
async function load(directory:string):Promise<LocalLoader>{
 const receiptBytes=await readFile(join(directory,'admission.json'));if(receiptBytes.length>16384)throw Error('Invalid admission size');
 const receipt=JSON.parse(receiptBytes.toString('utf8')) as {scope?:string;manifestSha256?:string};
 if(receipt.scope!=='local-pilot-only')throw Error('Missing local pilot admission');
 const manifest=await readFile(join(directory,'manifest.json'));
 if(manifest.length>8*1024*1024)throw Error('Invalid manifest size');
 if(createHash('sha256').update(manifest).digest('hex')!==receipt.manifestSha256)throw Error('Admission integrity mismatch');
 return createShardLoader(JSON.parse(manifest.toString('utf8')),file=>readFile(join(directory,file)));
}
/** Explicit local pilot only; unset switch preserves the existing public API. */
export async function searchLocalSettlements(query:string,signal?:AbortSignal):Promise<null|{items:Suggestion[];partial:boolean;localSource:Record<string,unknown>}>{
 const directory=process.env.GEONAMES_LOCAL_PILOT_DIR;
 if(process.env.GEONAMES_LOCAL_PILOT!=='1'||!directory||isDetailedAddress(query))return null;
 if(signal?.aborted)throw signal.reason??Error('Cancelled');
 if(cached?.directory!==directory){
  const promise=load(directory);cached={directory,promise};
  void promise.catch(()=>{if(cached?.promise===promise)cached=undefined;});
 }
 const loader=await cached.promise,result=await loader.search(query,{signal});
 if(signal?.aborted)throw signal.reason??Error('Cancelled');
 if(!result.items.length)return null; // Street/detail misses still reach Photon.
 return {items:result.items.map(({id,title,label,region,position})=>({id,title,label,region,position})),partial:result.truncated||!!result.hasMore,
  localSource:{provider:'geonames',scope:'local-pilot-only',precision:'settlement-centre',sourceDate:result.sourceDate,
   attribution:'GeoNames — CC BY 4.0; filtered and indexed by Mezhgorod Calculator',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',
   sourceUrl:'https://www.geonames.org/',semanticAccuracyCertified:false}};
}
