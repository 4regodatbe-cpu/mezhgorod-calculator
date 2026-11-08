// Three explicit TEST crosswalks, not lookup answers or runtime overrides.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const [input,output]=process.argv.slice(2);if(!input||!output)throw Error('Pass catalog and output');
const data=JSON.parse(readFileSync(input,'utf8'));
const snapshot=JSON.parse(readFileSync(new URL('../../data/address-city-snapshot.json',import.meta.url),'utf8'));
if(createHash('sha256').update(JSON.stringify(snapshot.records)).digest('hex')!==snapshot.recordsSha256)throw Error('Invalid retained OSM evidence hash');
const pairs=[[709717,'R-1413957'],[565348,'R-1517207'],[542420,'R-7373058']];
const rad=x=>x*Math.PI/180;
const results=pairs.map(([id,osm])=>{
 const row=data.records.find(r=>r[0]===id),source=snapshot.records.find(r=>r.suggestion.id===osm);
 if(!row||!source)throw Error('Missing explicit test crosswalk record');
 const p=source.suggestion.position,dl=rad(row[3]-p.lat),dn=rad(row[4]-p.lng);
 const a=Math.sin(dl/2)**2+Math.cos(rad(row[3]))*Math.cos(rad(p.lat))*Math.sin(dn/2)**2;
 return {geonamesId:id,osmId:osm,geonamesPosition:{lat:row[3],lng:row[4]},osmPosition:p,
   separationMeters:2*6371000*Math.asin(Math.min(1,Math.sqrt(a))),
   osmCapture:source.source,independentAccuracyCertified:false};
});
const result={status:'REFERENCE_POINT_COMPARISON_ONLY',osmSnapshotId:snapshot.snapshotId,osmReviewedAt:snapshot.reviewedAt,
 noNewSourceCapture:true,noAcceptanceDistanceThresholdInvented:true,results};
writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
