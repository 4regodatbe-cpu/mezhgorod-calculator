import type {TollValidation} from '@/lib/toll-validator';
import {M4_NODE_TO_PLAZA} from '@/lib/toll-engine/m4-plaza-nodes';
import nodeIdentities from '@/experiments/nationwide-tolls/source-snapshots/long-chain-2026-10-15/identity-sources/node-identities.json' with {type:'json'};
import {M11_P214_ENTRY_NODE,M11_P214_ENTRY_WAY} from './m11-p214-entry-boundary';
import {M11_P258_EXIT_NODE} from './m11-p258-exit-boundary';
import {isOdintsovoLane} from '@/experiments/nationwide-tolls/odintsovo-lane-identity.mjs';
import {type RegionalTollProductId,type RouteTollComponentId} from '@/lib/toll-engine/route-toll-composition';

const coreNetworks=new Set(['m1','m3','m4','m11','m11-15-58','m12','ckad','a289']);
const regionalIds=new Set<RegionalTollProductId>(['ufa-east','tolyatti','odintsovo','bagration','msd','zsd','shmsd','voznesensky','udmurt-bridges','khabarovsk','mytishchi','ryazan','amur-bridge']);
const regionalPatterns:readonly [RegExp,RegionalTollProductId][]=[
 [/восточный выезд/iu,'ufa-east'],[/обход тольятти/iu,'tolyatti'],
 [/северный обход одинцова/iu,'odintsovo'],[/проспект багратиона/iu,'bagration'],
 [/вознесенский тракт/iu,'voznesensky'],[/обход хабаровска/iu,'khabarovsk'],
 [/(?:^|[^а-яa-z0-9])зсд(?:$|[^а-яa-z0-9])|западный скоростной диаметр/iu,'zsd'],
 [/(?:^|[^а-яa-z0-9])шмсд(?:$|[^а-яa-z0-9])|широтная магистраль скоростного движения|витебская развязка/iu,'shmsd'],
 [/(?:^|[^а-яa-z0-9])мсд(?:$|[^а-яa-z0-9])|московский скоростной диаметр/iu,'msd'],
 [/мытищинская хорда/iu,'mytishchi'],[/мост.*(?:каму|буй)|удмурт.*мост/iu,'udmurt-bridges'],
 [/платн.*(?:псков)|псков.*платн/iu,'pskov-unresolved'],
 [/платн.*(?:рязани|рязан)|рязан.*(?:платн|путепровод)/iu,'ryazan'],
 [/мост.*(?:благовещенск|хэйхэ|хейхе)/iu,'amur-bridge'],
];
const smallVyazemy=/мал(?:ые|ых)\s+вяз[её]м/iu;
const corePatterns:readonly [RegExp,RouteTollComponentId][]=[
 [/(?:^|[^а-яa-z0-9])[мm]\s*[-‐‑–—]?\s*4(?=$|[^а-яa-z0-9])/iu,'m4'],
 [/(?:^|[^а-яa-z0-9])[аa]\s*[-‐‑–—]?\s*289(?=$|[^а-яa-z0-9])/iu,'a289'],
 [/(?:^|[^а-яa-z0-9])[мm]\s*[-‐‑–—]?\s*11(?=$|[^а-яa-z0-9])/iu,'m11'],
 [/(?:^|[^а-яa-z0-9])[мm]\s*[-‐‑–—]?\s*12(?=$|[^а-яa-z0-9])/iu,'m12'],
 [/(?:^|[^а-яa-z0-9])[мm]\s*[-‐‑–—]?\s*1(?=$|[^а-яa-z0-9])/iu,'m1'],
 [/(?:^|[^а-яa-z0-9])[мm]\s*[-‐‑–—]?\s*3(?=$|[^а-яa-z0-9])/iu,'m3'],
];

/** Identify paid evidence, not fare eligibility. Junction labels inside a
 * named product do not create additional traversals of intersecting roads. */
export function paidProductsFromName(name:string):RouteTollComponentId[] {
 if(smallVyazemy.test(name))return ['ckad-small-vyazemy'];
 const regional=regionalPatterns.filter(([pattern])=>pattern.test(name)).map(([,id])=>id);
 if(regional.length)return [...new Set(regional)];
 if(/цкад/iu.test(name))return ['ckad'];
 if(/дальний западный обход/iu.test(name))return ['krasnodar-west-bypass'];
 return corePatterns.filter(([pattern])=>pattern.test(name)).map(([,id])=>id);
}

export function unpricedRoadCoverage(args:{segments:readonly string[];validation:TollValidation|null;
 candidateNetworks:readonly {id:string}[];m1m3Candidates:readonly string[]}) {
 const families=new Set<RouteTollComponentId>();
 const regional=new Map<RegionalTollProductId,Set<string>>();
 const matchedCoreProducts=new Set<RouteTollComponentId>();
 let small=false;
 const addRegional=(id:RegionalTollProductId,reason:string)=>{
  if(!regional.has(id))regional.set(id,new Set());regional.get(id)!.add(reason);
 };
 const detect=(name:string,matched:boolean)=>{
  const products=paidProductsFromName(name);
  for(const id of products){
   if(id==='ckad-small-vyazemy')small=true;
   else if(regionalIds.has(id as RegionalTollProductId)||id==='pskov-unresolved')addRegional(id as RegionalTollProductId,name);
   else if(matched)matchedCoreProducts.add(id);
   if(id==='m1'||id==='m3')families.add(id);
  }
  return products;
 };
 for(const road of args.m1m3Candidates)if(road==='m1'||road==='m3')families.add(road);
 for(const network of args.candidateNetworks){
  const id=network.id;
  if(id==='m1'||id==='m3')families.add(id);
  else if(id==='ckad-small-vyazemy')small=true;
  else if(id==='pskov')addRegional('pskov-unresolved','pskov_product_boundaries_unresolved');
  else if(regionalIds.has(id as RegionalTollProductId))addRegional(id as RegionalTollProductId,id);
  else if(!coreNetworks.has(id))addRegional('unknown-paid-road','unmapped_network:'+id);
 }
 for(const name of args.segments)detect(name,false);
 const boothAliases=new Set<string>();
 for(const booth of args.validation?.tollBooths??[]){
  // Names on one event are aliases, not several independent paid roads.
  let products:RouteTollComponentId[];
  if(isOdintsovoLane(booth)) {
   products=['odintsovo'];
   addRegional('odintsovo','source_bound_selected_route_odintsovo_lane:'+booth.osmNodeId);
  } else products=detect(booth.roadNames.join(" · "),true);
  // Trace often omits names on the short plaza lanes. The exact traversed
  // OSM node, already bound in the saved M4 inventory, identifies the road;
  // it does not establish a tariff, entry/exit pair or complete coverage.
  if(!products.length && booth.osmNodeId && M4_NODE_TO_PLAZA.has(booth.osmNodeId)) {
   products=['m4'];
   matchedCoreProducts.add('m4');
  }
  if(!products.length && booth.osmNodeId) {
   // Exact independently sourced p214 lane identity; this names the road, not its fare.
   if(booth.osmNodeId===M11_P214_ENTRY_NODE && booth.wayId===M11_P214_ENTRY_WAY) {products=['m11'];matchedCoreProducts.add('m11');}
   if(booth.osmNodeId===M11_P258_EXIT_NODE) {products=['m11'];matchedCoreProducts.add('m11');}
   const product=nodeIdentities.nodes.find(node=>node.osmNodeId===booth.osmNodeId)?.productId;
   if(product==='m4') {products=['m4'];matchedCoreProducts.add('m4');}
   if(product==='m11') {products=['m11'];matchedCoreProducts.add('m11');}
   if(product==='zsd') {products=['zsd'];addRegional('zsd','saved_selected_route_zsd_booth:'+booth.osmNodeId);}
  }
  if(!products.length)addRegional('unknown-paid-road','unmapped_selected_route_paid_booth');
  else for(const name of booth.roadNames)boothAliases.add(name);
 }
 const namedPaidProducts=(args.validation?.roadNames??[])
  .filter(name=>!boothAliases.has(name)).flatMap(name=>detect(name,true));
 // Even a named-road-free result cannot explain a physically paid event.
 if(args.validation?.tollEdgeCount && !namedPaidProducts.length
  && !args.validation.tollBooths?.length)addRegional('unknown-paid-road','unmapped_selected_route_paid_edges');
 if(args.validation?.complete===false)addRegional('unknown-paid-road','selected_route_payment_trace_incomplete');
 const regionalProducts=[...regional].map(([id,reasons])=>({id,reason:[...reasons].join('; ')}));
 return {m1:families.has('m1'),m3:families.has('m3'),regional:regionalProducts.length>0,
  regionalReason:regionalProducts.map(p=>p.reason).join('; ')||'regional_exact_traversal_not_priced',
  regionalProducts,smallVyazemy:small,matchedCoreProducts:[...matchedCoreProducts]};
}
