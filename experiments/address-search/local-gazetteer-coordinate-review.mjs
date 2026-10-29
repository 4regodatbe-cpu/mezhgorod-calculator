// Source-ID-linked coordinate comparison; does NOT certify road snapping.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const [catalogPath,sourcePath,output]=process.argv.slice(2);if(!catalogPath||!sourcePath||!output)throw Error('Pass catalog, SPARQL response and output');
const bytes=readFileSync(sourcePath),data=JSON.parse(readFileSync(catalogPath,'utf8')),source=JSON.parse(bytes);
const rad=x=>x*Math.PI/180;
const results=source.results.bindings.map(b=>{
 const row=data.records.find(r=>String(r[0])===b.id.value);if(!row)throw Error('Unknown linked GeoNames ID');
 const point=b.coord.value.match(/^Point\((-?[\d.]+) (-?[\d.]+)\)$/);if(!point)throw Error('Unsupported point');
 const lng=Number(point[1]),lat=Number(point[2]);if(Math.abs(lat)>90||Math.abs(lng)>180)throw Error('Invalid WGS84');
 const a=Math.sin(rad(row[3]-lat)/2)**2+Math.cos(rad(lat))*Math.cos(rad(row[3]))*Math.sin(rad(row[4]-lng)/2)**2;
 return {geonamesId:row[0],name:row[1],wikidata:b.place.value,geoNamesPosition:{lat:row[3],lng:row[4]},referencePosition:{lat,lng},
  separationMeters:12742000*Math.asin(Math.min(1,Math.sqrt(a))),identityLink:'Wikidata P1566 GeoNames identifier',
  coordinateClaimProvenance:'P625 statement references NOT reviewed; do not assume independence from GeoNames',
  roadAccess:'NOT_CHECKED',coordinatesReplaced:false};
});
const report={status:'REFERENCE_COMPARISON_ONLY',sourceUrl:'https://query.wikidata.org/sparql',httpStatus:200,curlExit:0,
 sourceSha256:createHash('sha256').update(bytes).digest('hex'),queryFile:'coordinate-review-2026-10-29.rq',results,
 limits:'No acceptance tolerance invented; city representative points can differ. P1566 links identity, not independent coordinate accuracy or current administration. No raw data was imported into the lookup catalog.'};
writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({records:results.length,maxSeparationMeters:Math.max(...results.map(r=>r.separationMeters))}));
