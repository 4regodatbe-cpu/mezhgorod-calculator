// Offline research index. No imports from application services; never fetches.
import {classifyTerritory} from '../../lib/special-territory-geometry.ts';
import {SPECIAL_TERRITORY_BOUNDARIES} from '../../lib/special-territory-boundaries.ts';
import {inCrimea} from '../../lib/crimea-geography.ts';
const regionNames={dnr:'ДНР',lnr:'ЛНР',zaporizhzhia:'Запорожская область',kherson:'Херсонская область'};
export const normalize=value=>value.toLocaleLowerCase('ru-RU').replace(/ё/gu,'е').replace(/[—–-]/gu,' ').replace(/\s+/gu,' ').trim();
export function createLocalGazetteer(data){
 if(data?.schemaVersion!==1||data.runtimeApproved!==false||!Array.isArray(data.records)||data.records.length>300000)throw Error('Invalid research gazetteer');
 const records=data.records,postings=[];
 for(let i=0;i<records.length;i++){
  const r=records[i];
  if(!Number.isSafeInteger(r[0])||!Array.isArray(r[2])||r[2].length>32||!Number.isFinite(r[3])||!Number.isFinite(r[4])||Math.abs(r[3])>90||Math.abs(r[4])>180)throw Error('Invalid research record');
  for(const name of new Set(r[2].map(normalize)))if(name.length>=3)postings.push([name,i]);
 }
 postings.sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:a[1]-b[1]);
 const find=key=>{let a=0,b=postings.length;while(a<b){const m=(a+b)>>>1;if(postings[m][0]<key)a=m+1;else b=m;}return a;};
 function search(query,{limit=20,maxScan=10000}={}){
  if(typeof query!=='string'||query.length>200||!Number.isSafeInteger(limit)||limit<1||limit>50||!Number.isSafeInteger(maxScan)||maxScan<1||maxScan>10000)throw Error('Invalid search bounds');
  const q=normalize(query),words=q.split(' '),prefix=words[0];
  if(prefix.length<3)return {items:[],runtimeApproved:false,truncated:false};
  const seen=new Set(),matches=[];let scanned=0,start=find(prefix);
  for(;start<postings.length&&postings[start][0].startsWith(prefix)&&scanned<maxScan;start++,scanned++){
   const index=postings[start][1];if(seen.has(index))continue;seen.add(index);const r=records[index];
   let territory=null;const quality=[...r[13]];
   try{territory=classifyTerritory({lat:r[3],lng:r[4]},SPECIAL_TERRITORY_BOUNDARIES);}catch{quality.push('territory_ambiguous');}
   const crimea=!quality.includes('territory_ambiguous')&&inCrimea({lng:r[4],lat:r[3]});
   const region=territory?regionNames[territory]:crimea?'Крым':r[6][0]??r[5];
   const context=normalize([...r[2],...r[6],region].join(' '));if(!words.every(w=>context.includes(w)))continue;
   const exact=r[2].some(n=>normalize(n)===q),tier=crimea?0:territory?1:r[5]==='RU'?2:3;
   const label=[r[1],region,...r[6].filter(s=>s!==region)].join(' — ');
   matches.push({id:'geonames-'+r[0],title:r[1],label,region,position:{lat:r[3],lng:r[4]},territory:territory??(crimea?'crimea':null),
    qualityFlags:quality,source:{provider:'geonames',id:r[0],dump:r[12],line:r[10],modifiedAt:r[11],precision:data.coordinateAccuracy},exact,tier,population:r[7]});
  }
  matches.sort((a,b)=>Number(b.exact)-Number(a.exact)||a.tier-b.tier||b.population-a.population||a.id.localeCompare(b.id));
  const counts=new Map();for(const m of matches)counts.set(m.label,(counts.get(m.label)??0)+1);
  for(const m of matches)if(counts.get(m.label)>1)m.label+=` · ${m.id} · ${m.position.lat}, ${m.position.lng}`;
  const truncated=start<postings.length&&postings[start][0].startsWith(prefix);
  return {items:matches.slice(0,limit),runtimeApproved:false,truncated,hasMore:truncated||matches.length>limit,matchingRecords:matches.length,scanned,
    sourceDate:data.sourceDate,license:data.license};
 }
 return {search,recordCount:records.length,postingCount:postings.length};
}
