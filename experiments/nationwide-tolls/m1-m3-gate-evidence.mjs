// Independent selected-route gate audit for M1/M3.
// Operator km labels are NOT exact OSM node IDs; never price by proximity/label.
function validateM1M3Inventory(inventory) {
 if(!inventory || inventory.schemaVersion!==1 || !Array.isArray(inventory.gates)||inventory.gates.length!==4)throw Error("bad_gate_inventory");
 const ids=new Set(),nodes=new Set();
 for(const g of inventory.gates){
   if(!g||!["m1","m3"].includes(g.roadId)||!/^m[13]-pvp-\d+$/.test(g.id)||ids.has(g.id)||
     !Number.isSafeInteger(g.km)||g.km<=0||!Array.isArray(g.verifiedOsmNodeIds))throw Error("invalid_gate");
   ids.add(g.id);
   for(const node of g.verifiedOsmNodeIds){
     if(typeof node!=="string"||!/^[1-9][0-9]*$/.test(node)||nodes.has(node))throw Error("invalid_or_duplicate_osm_node");
     nodes.add(node);
   }
 }
 const expected=["m1-pvp-46","m3-pvp-86","m3-pvp-136","m3-pvp-168"];
 if(expected.some(x=>!ids.has(x)))throw Error("operator_gate_missing");
 return true;
}
function roadFamily(names){
 if(!Array.isArray(names))return null;
 const namesNorm=names.filter(x=>typeof x==="string").map(x=>x.toLowerCase());
 // M-11 must not match M-1. Match a road ref boundary rather than substring.
 const m1=namesNorm.some(n=>/(?:^|[^а-яa-z0-9])(?:м|m)\s*[-–—]?\s*1(?![0-9])/u.test(n));
 const m3=namesNorm.some(n=>/(?:^|[^а-яa-z0-9])(?:м|m)\s*[-–—]?\s*3(?![0-9])/u.test(n));
 return m1&&!m3?"m1":m3&&!m1?"m3":null;
}
function auditM1M3SelectedRoute(inventory,validation,routeId) {
 const fail=(reason,extras={})=>({status:"unknown",reason,routeId:routeId??null,candidateRoads:[],verifiedGates:[],unmappedPaidNodes:[],strictPriceAllowed:false,...extras});
 try{validateM1M3Inventory(inventory)}catch{return fail("gate_inventory_invalid")}
 if(typeof routeId!=="string"||!routeId)return fail("route_identity_missing");
 if(!validation || validation.source!=="Valhalla map matching" ||
    validation.complete!==true || validation.boothEventCoverage!=="complete" ||
    validation.chunkCount<=0 || validation.checkedChunkCount!==validation.chunkCount ||
    validation.failedChunkCount!==0 || !Array.isArray(validation.tollBooths))
   return fail("same_selected_route_trace_incomplete");
 // This audit is called only on selected geometry; caller guarantees the
 // validation was produced from that geometry. No independently verified
 // routeId from Valhalla means money still cannot be enabled.
 const candidateRoads=new Set(),verifiedGates=[],unmappedPaidNodes=[],seen=new Set();
 const known=new Map(inventory.gates.flatMap(g=>g.verifiedOsmNodeIds.map(n=>[n,g])));
 for(const b of validation.tollBooths){
   if(!b||b.edgeToll!==true)continue;
   const id=b.osmNodeId===null||b.osmNodeId===undefined?null:String(b.osmNodeId);
   const g=id?known.get(id):undefined;
   const family=g?.roadId??roadFamily(b.roadNames);
   if(!family)continue;
   candidateRoads.add(family);
   if(!id || !g){unmappedPaidNodes.push({osmNodeId:id,roadId:family,reason:"node_not_yet_verified_against_operator_gate"});continue;}
   if(seen.has(g.id)){return fail("duplicate_same_gate_in_selected_route",{candidateRoads:[...candidateRoads],verifiedGates,unmappedPaidNodes});}
   seen.add(g.id);
   verifiedGates.push({id:g.id,roadId:g.roadId,km:g.km,osmNodeId:id,edgeToll:true,fareRowId:g.fareRowId});
 }
 const candidate=[...candidateRoads];
 // Verified OSM tags alone are not an approved whole-journey fare: require
 // operator-effective date, road continuity, exits/re-entries, and all systems.
 return {status:unmappedPaidNodes.length===0&&verifiedGates.length>0?"physical_gate_nodes_matched":"candidate_needs_osm_operator_node_mapping",
 reason:unmappedPaidNodes.length?"operator_osm_gate_mapping_incomplete":!verifiedGates.length?"no_verifiable_m1_m3_booths":"tariff_route_completeness_not_verified",
 routeId,candidateRoads:candidate,verifiedGates,unmappedPaidNodes,strictPriceAllowed:false};
}
export {validateM1M3Inventory,auditM1M3SelectedRoute};
