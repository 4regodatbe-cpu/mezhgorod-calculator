const fs=require('node:fs'),path=require('node:path');
const key=(from,to,profile)=>JSON.stringify([from,to,profile]);
function directedVector(sections){
 const groups=sections.map(id=>String(id).split('+'));
 // Historical generators reverse sections, but not PVPs within a section.
 // A multi-section northbound trip must enter the combined section at460,
 // not416. Keep a standalone section unchanged: it has no travel direction.
 if(groups.length<2||groups.every(ids=>ids.length===1))return groups.flat();
 const km=id=>Number(/^m4-([0-9]+)(?:-[ab])?$/.exec(id)?.[1]);
 const direction=Math.sign(km(groups.at(-1).at(-1))-km(groups[0][0]));
 if(!Number.isFinite(direction)||direction===0)throw Error('unresolved-m4-section-direction');
 return groups.flatMap(ids=>[...ids].sort((a,b)=>direction*(km(a)-km(b))));
}
function compileEndpoints(matrix,reviewed,operator={rows:[]}){
 const groups=new Map(),excluded=[],excludedEndpoints=[],unknown=[],correctedKeys=new Map();
 for(const row of matrix.rows){
  if(row.road!=='m4-candidate')continue;
  const original=row.sectionVector.flatMap(id=>String(id).split('+'));
  const vector=directedVector(row.sectionVector);
  const from=vector[0],to=vector.at(-1),k=key(from,to,row.profile);
  correctedKeys.set(key(original[0],original.at(-1),row.profile),k);
  const internalRamp=vector.slice(1,-1).find(id=>['m4-355','m4-672'].includes(id));
  if(internalRamp){excluded.push({key:k,sourceChain:row.sectionVector,rub:row.rub,reason:'ramp-tariff-substituted-inside-through-trip',ramp:internalRamp});continue;}
  const entries=groups.get(k)||[];entries.push({...row,from,to,sectionVector:vector});groups.set(k,entries);
 }
 const selected=new Map();
 for(const[k,entries]of groups){
  const first=entries[0];
  // Published 355 rule proves entry towards Moscow only; other directed
  // ramp endpoints cannot be manufactured by reversing an offline chain.
  if((first.from==='m4-355'||first.to==='m4-355') && first.from!==first.to && !(first.from==='m4-355'&&Number(first.to.slice(3))<355)){
   excludedEndpoints.push({key:k,from:first.from,to:first.to,profile:first.profile,reason:'not-a-published-continuous-355-entry-pair',ruleSource:'source-snapshots/m4-355-receipt-rule-verified-2026-10-14.json'});continue;
  }
  if(new Set(entries.map(r=>r.rub)).size!==1){unknown.push({key:k,reason:'remaining-fare-conflict'});continue;}
  selected.set(k,{...first,runtimeEligible:true,disposition:'canonical-continuous-endpoint-estimate',
   priceConfirmation:'unconfirmed',verification:'topology-filtered endpoint estimate; operator rows/date provenance kept separately from unconfirmed exact OD binding',
   topologySource:'source-snapshots/m4-conflict-topology-evidence-2026-10-14.json',sourceChain:first.sectionVector});
 }
 const operatorKeys=new Set();
 for(const row of operator.rows){
  const k=key(row.from,row.to,row.profile);
  if(row.road!=='m4-candidate'||!['monThu','friSun'].includes(row.profile)||!Number.isSafeInteger(row.rub)||row.rub<0||!row.source||!row.ruleSource||row.vehicleCategory!==1||row.paymentProfile!=='no-transponder'||row.sourceFareStatus!=='verified-operator-exact-pair'||operatorKeys.has(k))throw Error('invalid-operator-endpoint');
  operatorKeys.add(k);
  if(selected.has(k)&&selected.get(k).rub!==row.rub)throw Error('operator-endpoint-conflicts-with-compiled-fare');
  selected.set(k,{...row,runtimeEligible:true});
 }
 const reviewedKeys=new Set();
 for(const row of reviewed.rows){
  const k=key(row.from,row.to,row.profile);
  if(row.road!=='m4-candidate'||!['monThu','friSun'].includes(row.profile)||!Number.isSafeInteger(row.rub)||row.rub<0||!row.source||!row.observationId||reviewedKeys.has(k))throw Error('invalid-reviewed-endpoint');
  reviewedKeys.add(k);selected.set(k,{...row,runtimeEligible:true});
 }
 const conflicts=matrix.m4EndpointConflicts;
 const conflictKey=row=>{const original=key(row.from,row.to,row.profile);return correctedKeys.get(original)||original;};
 return {schemaVersion:1,purpose:'One saved estimate per directed pair/profile, not official fare certification',
  rows:[...selected.values()].sort((a,b)=>key(a.from,a.to,a.profile).localeCompare(key(b.from,b.to,b.profile))),excluded,excludedEndpoints,unknown:unknown.filter(r=>!selected.has(r.key)),
  counts:{rawConflictKeys:conflicts.length,resolvedConflictEstimates:conflicts.filter(r=>selected.has(conflictKey(r))).length,
   excludedConflictKeys:conflicts.filter(r=>excludedEndpoints.some(e=>e.key===conflictKey(r))).length,
   unknownConflictKeys:conflicts.filter(r=>!selected.has(conflictKey(r))&&!excludedEndpoints.some(e=>e.key===conflictKey(r))).length,excludedChains:excluded.length,activeEndpointKeys:selected.size,reviewedCells:reviewed.rows.length,operatorCells:operator.rows.length}};
}
function writeEndpointRegister(root){const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
 const out=compileEndpoints(read('TARIFF_VECTOR_MATRIX_2026-10-12.json'),read('M4_REVIEWED_ENDPOINT_CELLS_2026-10-13.json'),read('M4_OPERATOR_ENDPOINT_CELLS.json'));
 fs.writeFileSync(path.join(root,'M4_ACTIVE_ENDPOINT_REGISTER.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out.counts));}
module.exports={compileEndpoints,writeEndpointRegister};
if(require.main===module)writeEndpointRegister(path.resolve(__dirname,'..'));
