import {extractODTraversals} from './od-geometry.mjs';
import {calculateOD} from './engine.mjs';

/** Quoting is strictly diagnostic, never imported into live app, no request from browser. */
function quoteRouteOD({route,boundaries,matrices,profile,freeValidation}) {
  const unknown=(reason,parts=[])=>({status:'unknown',amountRub:null,reason,parts,diagnosticOnly:true});
  if (!route || typeof route.routeId !== 'string' || !Array.isArray(matrices) || !profile) return unknown('invalid_quote_request');
  const detection=extractODTraversals(route,boundaries);
  if(detection.status==='unknown') return unknown('geometry:'+detection.reason);
  if(detection.status==='no_paid_spans') {
    if(freeValidation?.status==='independently_confirmed_free' && freeValidation?.routeId===route.routeId && freeValidation?.coverage==='all_edges' && freeValidation?.method==='separate_toll_booth_validator')
      return {status:'free',amountRub:0,reason:null,parts:[],diagnosticOnly:true};
    return unknown('no_paid_spans_not_independent_free_evidence');
  }
  let amount=0;
  const parts=[];
  for(const crossing of detection.traversals){
    const matches=matrices.filter(m=>m?.source?.systemId===crossing.systemId);
    if(matches.length!==1) return unknown('missing_or_duplicate_system_tariff_matrix');
    const tariff=calculateOD(matches[0],{routeId:route.routeId,profile,traversals:[crossing]});
    if(tariff.status!=='priced' || !Number.isSafeInteger(tariff.amountRub))return unknown('missing_or_unverified_directed_pair',parts);
    amount+=tariff.amountRub;
    if(!Number.isSafeInteger(amount))return unknown('route_amount_overflow');
    parts.push({...tariff.parts[0],tariffEffectiveFrom:matches[0].source.effectiveFrom, sourceDocument:matches[0].source.document});
  }
  return {status:'diagnostic_priced',amountRub:amount,reason:null,parts,diagnosticOnly:true,
    tariffEffectiveDateComplete:parts.every(p=>typeof p.tariffEffectiveFrom==='string' && /^\d{4}-\d\d-\d\d$/.test(p.tariffEffectiveFrom))};
}
export {quoteRouteOD};
