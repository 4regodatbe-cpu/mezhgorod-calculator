import {readFileSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {classifyTerritory} from '../../lib/special-territory-geometry.ts';
import {SPECIAL_TERRITORY_BOUNDARIES} from '../../lib/special-territory-boundaries.ts';
import {inCrimea} from '../../lib/crimea-geography.ts';
const [input,output]=process.argv.slice(2);if(!input||!output)throw Error('Pass catalog and output');
const data=JSON.parse(readFileSync(input,'utf8')),counts={},bySourceCountry={},qualityByRegion={};const start=performance.now();
for(const r of data.records){
 let territory;
 try{territory=classifyTerritory({lat:r[3],lng:r[4]},SPECIAL_TERRITORY_BOUNDARIES)??(inCrimea({lat:r[3],lng:r[4]})?'crimea':r[5]==='RU'?'other-RU':'outside-priority-UA');}catch{territory='ambiguous';}
 counts[territory]=(counts[territory]??0)+1;bySourceCountry[r[5]]=(bySourceCountry[r[5]]??0)+1;
 qualityByRegion[territory]??={};for(const flag of r[13])qualityByRegion[territory][flag]=(qualityByRegion[territory][flag]??0)+1;
}
const result={status:'SOURCE_POINT_COUNTS_ONLY',records:data.records.length,counts,bySourceCountry,qualityByRegion,elapsedMs:performance.now()-start,
 independentlyComplete:false,coordinateAccuracyVerified:false};writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
