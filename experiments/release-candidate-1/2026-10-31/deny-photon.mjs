// Local fault injection only; no application/configuration changes or fabricated responses.
import {writeFileSync} from 'node:fs';
if(process.env.RC1_FAULT_TEST!=='1'||process.env.GEONAMES_LOCAL_TEST!=='1')throw Error('Explicit local RC1 test required');
const stats={pid:process.pid,mode:'controlled Photon outage; actual application and GeoNames corpus',photonAttempts:0};
const output='experiments/release-candidate-1/2026-10-31/checks/photon-fault-counts.json';
const save=()=>writeFileSync(output,JSON.stringify(stats,null,2)+'\n');save();
const actualFetch=globalThis.fetch;
globalThis.fetch=async(input,...rest)=>{
 const url=new URL(typeof input==='string'||input instanceof URL?String(input):input.url);
 if(url.hostname==='photon.komoot.io'){stats.photonAttempts++;save();throw Error('RC1 controlled Photon unavailable');}
 return actualFetch(input,...rest);
};
process.on('exit',save);
