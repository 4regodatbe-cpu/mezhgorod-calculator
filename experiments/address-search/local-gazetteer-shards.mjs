// Isolated offline loader; reuses the reviewed prototype's ranking and search.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createLocalGazetteer,normalize} from './local-gazetteer.mjs';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function compileShards(data,directory){
 // The existing constructor provides record/schema validation.
 createLocalGazetteer(data);
 const groups=new Map();
 for(const row of data.records){
  const keys=new Set(row[2].map(normalize).filter(x=>x.length>=3).map(x=>x.slice(0,3)));
  for(const key of keys){if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);}
 }
 await mkdir(directory,{recursive:true});
 const manifest={schemaVersion:1,runtimeApproved:false,sourceDate:data.sourceDate,license:data.license,sources:data.sources,recordCount:data.records.length,shards:{}};
 for(const [key,records] of [...groups].sort(([a],[b])=>a<b?-1:1)){
  const raw=Buffer.from(JSON.stringify({...data,records})),bytes=gzipSync(raw,{level:9}),sha256=digest(bytes),file=sha256+'.json.gz';
  if(raw.length>32*1024*1024)throw Error('Shard exceeds bounded raw size');
  await writeFile(join(directory,file),bytes);
  manifest.shards[key]={file,sha256,bytes:bytes.length,rawBytes:raw.length,records:records.length};
 }
 await writeFile(join(directory,'manifest.json'),JSON.stringify(manifest)+'\n');return manifest;
}
export function createShardLoader(manifest,loadBytes){
 if(manifest.schemaVersion!==1||manifest.runtimeApproved!==false||!manifest.shards||Object.keys(manifest.shards).length>30000)throw Error('Invalid shard manifest');
 // Single resident shard; serialization prevents concurrent cold loads from
 // allocating several indexes. Cache and queue have explicit bounds.
 let current=null,tail=Promise.resolve(),pending=0,loads=0;
 async function search(query,{signal,limit=20,maxScan=10000}={}){
  if(typeof query!=='string'||query.length>200||!Number.isSafeInteger(limit)||limit<1||limit>50||!Number.isSafeInteger(maxScan)||maxScan<1||maxScan>10000)throw Error('Invalid search bounds');
  const key=normalize(query).split(' ')[0].slice(0,3),meta=Object.hasOwn(manifest.shards,key)?manifest.shards[key]:null;
  if(signal?.aborted)throw signal.reason??Error('Aborted');
  if(key.length<3||!meta)return {items:[],runtimeApproved:false,truncated:false,hasMore:false};
  if(pending>=16)throw Error('Local gazetteer queue full');
  pending++;
  const task=tail.then(async()=>{
   if(signal?.aborted)throw signal.reason??Error('Aborted');
   if(current?.key!==key){
    if(!/^[a-f0-9]{64}\.json\.gz$/.test(meta.file)||!Number.isSafeInteger(meta.bytes)||meta.bytes<1||meta.bytes>8*1024*1024||!Number.isSafeInteger(meta.rawBytes)||meta.rawBytes<1||meta.rawBytes>32*1024*1024)throw Error('Invalid shard metadata');
    current=null;
    const bytes=await loadBytes(meta.file);
    if(bytes.length!==meta.bytes||digest(bytes)!==meta.sha256)throw Error('Shard integrity mismatch');
    if(signal?.aborted)throw signal.reason??Error('Aborted');
    const raw=gunzipSync(bytes,{maxOutputLength:meta.rawBytes});
    if(raw.length!==meta.rawBytes)throw Error('Shard raw length mismatch');
    const data=JSON.parse(raw.toString('utf8'));
    if(data.records.length!==meta.records)throw Error('Shard record count mismatch');
    current={key,index:createLocalGazetteer(data)};loads++;
   }
   if(signal?.aborted)throw signal.reason??Error('Aborted');
   return current.index.search(query,{limit,maxScan});
  });
  tail=task.catch(()=>{});try{return await task;}finally{pending--;}
 }
 return {search,stats:()=>({residentShards:current?1:0,pending,loads})};
}
export async function openShardLoader(directory){
 const bytes=await readFile(join(directory,'manifest.json'));if(bytes.length>8*1024*1024)throw Error('Manifest size cap');
 return createShardLoader(JSON.parse(bytes),file=>readFile(join(directory,file)));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [input,output]=process.argv.slice(2);if(!input||!output)throw Error('Pass catalog and output directory');
 const manifest=await compileShards(JSON.parse(await readFile(input,'utf8')),output),values=Object.values(manifest.shards);
 console.log(JSON.stringify({shards:values.length,records:manifest.recordCount,gzipBytes:values.reduce((n,s)=>n+s.bytes,0),maxRawBytes:Math.max(...values.map(s=>s.rawBytes))}));
}
