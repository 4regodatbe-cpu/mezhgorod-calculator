// Consolidation/integrity only. No application tests, route replay or external calls.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url),base='experiments/junction-atlas/2026-10-30/';
const bytes=p=>readFileSync(new URL(p,root));
const sha=p=>createHash('sha256').update(bytes(p)).digest('hex');
const names=['m4','zsd','m12','m11','ckad','zsd-extended'];
const cases=names.map(name=>({name,path:base+name+'.json',data:JSON.parse(bytes(base+name+'.json'))}));
const points=cases.flatMap(c=>c.data.points.map(p=>({...p,caseFile:c.path})));
assert.equal(points.length,32);assert.equal(new Set(points.map(p=>p.id)).size,32);
for(const c of cases){for(const s of c.data.sources)assert.equal(sha(s.path),s.sha256,s.path);assert.ok(c.data.mode==='research_only_not_runtime');}
const tests={m4:6,zsd:4,m12:2,m11:1,ckad:1,'zsd-extended':1};
for(const [name,count] of Object.entries(tests)){const log=bytes(base+(name==='m4'?'m4-south':name)+'-checks.log').toString('utf8');assert.match(log,new RegExp('pass '+count+'(?:\\s|$)','u'));assert.match(log,/fail 0(?:\s|$)/u);}
const controls=cases.flatMap(c=>{
 const a=c.data;
 if(c.name==='m4')return a.mapControls.map(x=>({case:c.name,direction:x.direction,meters:x.observedUiDistanceMeters,minutes:x.observedUiMinutes,status:'SHORT_CONTROL_CONSTRUCTED',exactSnapOrPolyline:false}));
 return (a.mapControls??[a.mapControl]).map(x=>({case:c.name,...x,exactSnapOrPolyline:false}));
});
assert.equal(controls.length,8);assert.equal(controls.filter(x=>x.status==='UNRESOLVED_DETOUR').length,2);
const acquisitions=[
 ['OSM_PRIMARY','https://api.openstreetmap.org/api/0.6/node/3057885104.json','raw/m4-r298-node3057885104.json','new exact R298 coordinate'],
 ['OSM_PRIMARY','https://api.openstreetmap.org/api/0.6/way/301694367/full.json','raw/m4-r298-way301694367-full.json','new exact R298 parent-node order'],
 ['OSM_PRIMARY','https://api.openstreetmap.org/api/0.6/way/1307036920/full.json','raw/m11-exit-way1307036920-full.json','recover missing original for already known exit gate'],
 ['OSM_PRIMARY','https://api.openstreetmap.org/api/0.6/way/1080462753/full.json','raw/ckad-way1080462753-full.json','exact local CKAD gantry/way coordinates'],
 ['OSM_PRIMARY','https://api.openstreetmap.org/api/0.6/way/355755817/full.json','raw/zsd-planernaya-way355755817-full.json','recover original of already observed Planernaya booth'],
 ['OSM_RASTER','https://tile.openstreetmap.org/15/19984/10901.png','raw/m4-osm-z15-19984-10901.png','inspected original overview, south plaza'],
 ['OSM_RASTER','https://tile.openstreetmap.org/15/19984/10900.png','raw/m4-osm-z15-19984-10900.png','inspected original overview, north merge'],
 ['OSM_RASTER','https://tile.openstreetmap.org/16/38274/19067.png','raw/zsd-exit-osm-z16-38274-19067.png','inspected Ekateringofka exit area'],
 ['OSM_RASTER','https://tile.openstreetmap.org/16/40699/20569.png','raw/m12-ramp-osm-z16-40699-20569.png','inspected M12 ramp area, not legal-turn certification'],
 ['OSM_RASTER','https://tile.openstreetmap.org/15/19752/10264.png','raw/ckad-local-osm-z15-19752-10264.png','inspected local A113 corridor'],
].map(([type,url,relativePath,purpose])=>({type,url,path:base+relativePath,purpose,date:'2026-10-30',observedHttpStatus:200,bytes:bytes(base+relativePath).length,sha256:sha(base+relativePath)}));
const interchanges=[
 {id:'m4-r298',kind:'exit',points:['m4-3057885096','m4-3057885104'],currentIndependentMapCompatibility:'not tested; original directed OSM and retained trace corroborated'},
 {id:'zsd-kad-south',kind:'entry',points:['zsd-10270133471','zsd-1833109726'],currentIndependentMapCompatibility:'not tested; retained original/selected trace'},
 {id:'zsd-ekateringofka',kind:'exit',points:['zsd-1339782267','zsd-25893875'],currentIndependentMapCompatibility:'short exit control257m and raster corroboration, exact snapping unavailable'},
 {id:'m11-ckad47',kind:'entry',points:['M11-8087316065','M11-3566326245'],currentIndependentMapCompatibility:'UNRESOLVED_DETOUR29900m; physical original still documented'},
 {id:'m11-voskresenskoye',kind:'exit',points:['M11-6588472831'],currentIndependentMapCompatibility:'not tested; recovered original exit-way and retained selected trace'},
 {id:'m12-22Н0239',kind:'exit',points:['M12-14102954884','M12-10090995838'],currentIndependentMapCompatibility:'UNRESOLVED_DETOUR57000m at motorway join; interior165m positive'},
];
for(const x of interchanges)for(const id of x.points)assert.ok(points.some(p=>p.id===id),id);
console.log(JSON.stringify({schemaVersion:1,date:'2026-10-30',timezone:'Europe/Moscow',scope:'local research atlas; not runtime tariff input or all-road completion',
 sourceHead:'f29c83784c794dc77e4d9805465cab444d9d3e47',publishedHead:'c2f52ee93cd98a81ecd05efa0358fb38c6704124',pr:{number:14,draft:true,merged:false,verification:'Connector re-read before final local consolidation'},
 counters:{completedBoundedResearchBlocks:6,pointRecords:32,geographicInterchangeApproaches:6,entries:2,exits:4,approachesWithUnresolvedCurrentMapCompatibility:2,
  retainedAcceptedWorkingVectorsIndexed:2,newOperatorTariffBindings:0,newPrices:0,newFunctionalTariffBlockersClosed:0,
  targetedAtlasChecks:15,checksFailed:0,yandexRouteControls:8,shortControls:6,detourConflicts:2,osmPrimaryRequests:5,osmRasterViews:5,newValhallaOsrmBrouterRequests:0},
 counterMeaning:{interchanges:'Physical approach records, not six independently proven current legal turns or full operator tariff pairs.',
  pointRecords:'Includes plazas, gantries, source way endpoints and technical nodes; not32interchanges.',
  existingVectors:'One retained M4 compound320/410 working vector using two products, plus existing ZSD600 finished pair; no newly admitted tariff.'},
 caseFiles:cases.map(c=>({name:c.name,path:c.path,sha256:sha(c.path),pointRecords:c.data.points.length})),
 points,interchanges,mapControls:controls,acquisitions,
 limitations:['Opera screenshot unavailable; one30second timeout, no fabricated visual/browser actions.',
  'Only five original OSM raster images inspected; exact coordinates come from source nodes, not map pixels.',
  'M11 CKAD entry and M12 motorway join have material map-routing disagreement; cause unknown, no runtime workaround applied.',
  'Virtual58, M12registration identities, exact CKADfree-domain and extendedZSD payment bundle remain unbound.',
  'OtherM4 Platov/R260 vector4443232947→358467208 is separate and not closed here.',
  'No push, share link, app/CI/Production/main/Android/backup change or full audit.'],
 checksumVerification:'All referenced case source bytes and15 saved focused-check counts verified offline; no test/build rerun.'},null,2));
