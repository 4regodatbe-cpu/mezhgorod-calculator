// Experiment9: one reviewed real 545 case, not a tariff/product classifier.
// Interprets saved evidence only. No I/O, routing calls, prices or app imports.
const expectedGatePath = [
  ['1043769291','4522140254'],
  ['799492317','2350820444'],
  ['615270676','5818209500'],
  ['615270691','5818209495'],
  ['615270691','5818209499'],
  ['615270694','9605783251'],
  ['1043769287','5818209497'],
  ['799492323','4513805004'],
];
// Exact retained successor witness; a common remote exit alone is insufficient.
const expectedOnwardPath = [
  ['702218808','3504913992'],
  ['433128212','3504913991'],
  ['455836734','11071854764'],
  ['799492327','4522140268'],
  ['455836733','4522140267'],
  ['499441803','4513804873'],
  ['455836738','4904703560'],
  ['499441802','4522140270'],
  ['455836737','4522140273'],
  ['454892385','6955740858'],
  ['743103710','4904703618'],
  ['743103711','5127092327'],
  ['743103712','6955740857'],
  ['1044709398','9612743505'],
  ['1044709397','9612743504'],
  ['1044709396','4975866638'],
  ['1044709394','4904703727'],
  ['1044709393','9612743482'],
  ['743103709','6788667380'],
  ['723824074','11071950213'],
  ['1192745821','11071950212'],
  ['1192745820','4904703890'],
  ['1192744596','11071960450'],
  ['723824073','2938423267'],
  ['290284958','3057885083'],
  ['604693287','4513804998'],
  ['1044709392','3057885096'],
  ['301694367','3057885104'],
  ['705714822','318331760'],
];
export function inspectSaved545History(capture) {
  const unknown = reason => ({historyStatus:'unknown', reason, pricingStatus:'unknown', rub:null});
  const validation = capture?.record?.validation;
  const traceCalls = capture?.calls?.filter(c => String(c.url).includes('/trace_attributes')) ?? [];
  if (!validation?.complete || validation.failedChunkCount !== 0 ||
      validation.checkedChunkCount !== validation.chunkCount ||
      traceCalls.length !== validation.chunkCount || !traceCalls.length) return unknown('incomplete_trace');
  const chunks = [];
  try {
    for (const c of traceCalls) {
      if (c.status !== 200) return unknown('failed_trace_response');
      const edges = JSON.parse(c.text).edges;
      if (!Array.isArray(edges) || !edges.length) return unknown('missing_edges');
      for (let i=0;i<edges.length;i++) {
        const e=edges[i];
        if (!Number.isInteger(e.begin_shape_index) || !Number.isInteger(e.end_shape_index) ||
            e.begin_shape_index < 0 || e.end_shape_index < e.begin_shape_index ||
            (i && edges[i-1].end_shape_index !== e.begin_shape_index)) return unknown('shape_index_gap');
      }
      chunks.push(edges);
    }
  } catch { return unknown('malformed_trace_response'); }
  const hits=chunks.flatMap((edges,chunkIndex)=>edges.flatMap((e,edgeIndex)=>
    String(e.end_node?.node_id)==='5818209495' ? [{chunkIndex,edgeIndex}] : []));
  // A repeated hit could be chunk overlap or re-entry, neither is safe to deduplicate here.
  if (hits.length!==1) return unknown('target_event_not_unique');
  const {chunkIndex,edgeIndex}=hits[0], edges=chunks[chunkIndex];
  const start=edgeIndex-3;
  if (start<0 || expectedGatePath.some(([way,node],i)=>
    String(edges[start+i]?.way_id)!==way || String(edges[start+i]?.end_node?.node_id)!==node)) {
    return unknown('unproved_directed_cash_path');
  }
  if (edges[edgeIndex].end_node.type!=='toll_booth') return unknown('unproved_booth_event');
  // This case continues on the reviewed bypass-side M4 path before its R-298 exit.
  const connector=edges.findIndex((e,i)=>i>start+7 && String(e.way_id)==='301694367' &&
    String(e.end_node?.node_id)==='3057885104');
  if (connector<0 || expectedOnwardPath.some(([way,node],i)=>
      String(edges[start+8+i]?.way_id)!==way || String(edges[start+8+i]?.end_node?.node_id)!==node)) {
    return unknown('unproved_onward_R298_exit');
  }
  return {
    historyStatus:'observed_reviewed_case',
    predecessor:'northbound_M4_to_fork_4522140254',
    cashBranch:'southern_northbound_5818209495',
    successor:'bypass_side_M4_then_connector_301694367_to_R298',
    traceCallIndex:capture.calls.indexOf(traceCalls[chunkIndex]),
    gateEdgeIndex:edgeIndex,
    connectorEdgeIndex:connector,
    observedGateCount:1,
    candidateProducts:['517-544','544-589'],
    confirmedProducts:[],
    // The geographic witness cannot certify operator coverage, validity or additivity.
    pricingStatus:'unknown', rub:null,
    missingProof:['dated_operator_route_product_rule','certified_product_boundary_crossings','applicable_fare_and_no_double_payment'],
  };
}
