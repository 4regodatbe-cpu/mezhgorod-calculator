import core from './quote.cjs';
import matrix from '../A289_OD_MATRIX_2026-10-13.json' with {type:'json'};

const expectedFrames=new Map([
  ['Maryanskaya>Slavyansk',['23']],
  ['Slavyansk>Varenikovskaya',['82']],
  ['Maryanskaya>Varenikovskaya',['23','82']],
  ['Varenikovskaya>Temryuk',['103']],
  ['Slavyansk>Temryuk',['82','103']],
  ['Maryanskaya>TamanBridge',['23','82','103']],
]);
const pairs=new Set(matrix.pricedUndirectedPairs.map(r=>[r.from,r.to].sort().join('>')));

/** A finished OD lookup needs the same selected route and a proven exit; city-route 620 also needs its bypass control. */
export function quoteA289SelectedRoute(evidence){
  if(!evidence||!evidence.routeId||evidence.selectedRouteId!==evidence.routeId||evidence.exitBindingComplete!==true)return null;
  const {from,to,frames}=evidence;
  if(!pairs.has([from,to].sort().join('>')))return null;
  if(from==='Maryanskaya'&&to==='Temryuk'||from==='Temryuk'&&to==='Maryanskaya'){
    if(evidence.temryukFastestControlMatched!==true)return null;
  } else {
    const ordered=expectedFrames.get(`${from}>${to}`)??expectedFrames.get(`${to}>${from}`)?.toReversed();
    if(!ordered||!Array.isArray(frames)||frames.join('>')!==ordered.join('>'))return null;
  }
  const q=core.quote({routeId:evidence.routeId,evidenceComplete:true,components:[{
    routeId:evidence.routeId,traversalId:'a289',exactTraversal:true,profileResolved:true,
    road:'a289',from,to,profile:'allDays',localDate:evidence.localDate,
  }]});
  return q.pricingStatus==='priced'?q:null;
}
