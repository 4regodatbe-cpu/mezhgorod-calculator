import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const base='a1c169d3c7dce49b7d1d3747b9698e7aee4b581a';
const head=git('rev-parse','HEAD');
const paths=git('diff','--name-only',base,head).split('\n').filter(Boolean);
const patterns=[
 ['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u],
 ['github-token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/u],
 ['share-token',/[?&](?:_vercel_share|x-vercel-protection-bypass|share_token)=[^\s"'<>]+/iu],
 ['bearer-token',/Bearer\s+[A-Za-z0-9_.-]{32,}/u],
 ['jwt',/\beyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/u],
];
const findings=[];let archivePayloads=0;
function scan(path,bytes){const text=bytes.toString('utf8');for(const [rule,re]of patterns)if(re.test(text))findings.push({path,rule});}
const files=paths.map(path=>{
 const bytes=execFileSync('git',['show',`${head}:${path}`],{maxBuffer:64*1024*1024});scan(path,bytes);
 if(path.endsWith('.gz')){scan(`${path}:uncompressed`,gunzipSync(bytes));archivePayloads++;}
 if(path.endsWith('.zip')){scan(`${path}:members`,execFileSync('unzip',['-p',path],{maxBuffer:64*1024*1024}));archivePayloads++;}
 return {path,bytes:bytes.length,gitBlob:git('rev-parse',`${head}:${path}`),sha256:createHash('sha256').update(bytes).digest('hex')};
});
const manifestErrors=[];let verifiedHashes=0;
for(const path of paths.filter(p=>p.endsWith('/manifest.json'))){
 const m=JSON.parse(readFileSync(path,'utf8'));
 const root=path.startsWith('experiments/routing-reliability/')?'experiments/routing-reliability/':path.slice(0,path.lastIndexOf('/')+1);
 const sources=Array.isArray(m.sourceFiles)?m.sourceFiles:Object.entries(m.sourceFiles??{}).map(([path,sha256])=>({path,sha256}));
 for(const row of [...(m.files??[]),...sources]){
  if(!row.path||!row.sha256)continue;
  const target=row.path.startsWith('app/')||row.path.startsWith('lib/')||row.path.startsWith('scripts/')||row.path.startsWith('experiments/')?row.path:root+row.path;
  try{
   const sourceCommit=m.sourceRuntimeCommit??m.finalGateRuntimeCommit;
   const bytes=sources.includes(row)&&sourceCommit?execFileSync('git',['show',`${sourceCommit}:${target}`]):readFileSync(target);
   const actual=createHash('sha256').update(bytes).digest('hex');if(actual!==row.sha256)manifestErrors.push({manifest:path,target,reason:'hash mismatch',sourceCommit:sources.includes(row)?sourceCommit:null});else verifiedHashes++;
  }catch{manifestErrors.push({manifest:path,target,reason:'missing'});}
 }
}
const prohibited=paths.filter(p=>/^(?:data\/|android\/|\.github\/|vercel\.json$|package(?:-lock)?\.json$|pnpm-lock\.yaml$)/u.test(p));
execFileSync('git',['merge-base','--is-ancestor',base,head]);
const result={date:'2026-10-29',base,head,tree:git('rev-parse',`${head}^{tree}`),fastForward:true,commits:git('log','--reverse','--format=%H %s',`${base}..${head}`).split('\n'),files,prohibited,scan:{scope:'changed bytes plus decoded gzip/ZIP payloads; bounded pattern scan, not proof of absence of all secrets',archivePayloads,findings},manifestValidation:{verifiedHashes,errors:manifestErrors}};
writeFileSync(new URL('./preflight.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({head,commits:result.commits.length,files:files.length,bytes:files.reduce((n,r)=>n+r.bytes,0),prohibited,scan:result.scan,manifestValidation:result.manifestValidation},null,2));
if(findings.length||prohibited.length||manifestErrors.length)process.exitCode=1;
