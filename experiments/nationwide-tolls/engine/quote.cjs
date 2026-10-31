const {validDate,fareValidityOnDate}=require('./fare-validity.cjs');
const registry=require('../TARIFF_SELECTION_REGISTER.json');
const {matrixProductId}=require('./tariff-product-identity.cjs');
function createQuoteEngine(registry){
const label='Стоимость не подтверждена';
const key=r=>JSON.stringify([r.road,r.from,r.to,r.profile]);
const rows=[...registry.selected,...registry.provisional,...registry.history];
const index=new Map();
for(const row of rows){const k=key(row);if(!index.has(k))index.set(k,[]);index.get(k).push(row);}
const provisionalRows=new Set(registry.provisional);
function unknown(reason,components=[]){return {pricingStatus:'unknown',rub:null,priceConfirmation:'unknown',displayLabel:'Стоимость платных дорог неизвестна',reason,components};}
function quote(input){
 if(!input||!Array.isArray(input.components)||!input.routeId)return unknown('invalid-route-input');
 if(input.evidenceComplete!==true)return unknown('incomplete-paid-road-evidence');
 if(!input.components.length)return input.confirmedNoPaidCrossing===true?{pricingStatus:'free',rub:0,priceConfirmation:'confirmed',displayLabel:null,components:[]}:unknown('free-route-not-confirmed');
 const components=[],seen=new Set(),families=new Set();
 for(const c of input.components){
  if(!c||typeof c!=='object'||typeof c.road!=='string'||!c.road)return unknown('invalid-component',components);
  if(c.routeId!==input.routeId||c.exactTraversal!==true)return unknown('component-not-bound-to-selected-route',components);
  // Different matrix representations of one road are exclusive; a separate
  // tariff product such as the western bypass remains additive.
  const family=matrixProductId(c.road);
  if(c.productId!=null&&c.productId!==family)return unknown('component-product-mismatch',components);
  if(families.has(family))return unknown('multiple-representations-of-one-road-group',components);families.add(family);
  if(!c.traversalId||seen.has(c.traversalId))return unknown('duplicate-or-missing-traversal-id',components);seen.add(c.traversalId);
  if(!validDate(c.localDate))return unknown('missing-local-crossing-date',components);
  if(c.profileResolved!==true)return unknown('unresolved-tariff-profile',components);
  const versions=(index.get(key(c))||[]).map(row=>({row,status:fareValidityOnDate(row,c.localDate)}));
  if(versions.some(v=>v.status==='unknown'))return unknown('unresolved-fare-version-boundary',components);
  const found=versions.filter(v=>v.status==='inside').map(v=>v.row);
  if(found.length!==1)return unknown(found.length?'ambiguous-fare-version':'missing-current-exact-fare',components);
  const r=found[0];
  if(r.runtimeEligible===false)return unknown('audit-only-fare-row',components);
  if(r.requiresTariffContext===true&&c.tariffContextResolved!==true)return unknown('unresolved-operator-tariff-context',components);
  if(r.requiresLane!=null&&c.verifiedLane!==r.requiresLane)return unknown('unresolved-operator-lane',components);
  if(c.road==='a289'&&r.vehicleCategory!==1)return unknown('wrong-or-missing-vehicle-category',components);
  const isCandidate=!r.validFrom&&!r.effectiveFrom||provisionalRows.has(r)||String(r.verification||'').includes('candidate')||r.road.endsWith('-candidate');
  if(!Number.isSafeInteger(r.rub)||r.rub<0)return unknown('invalid-fare-amount',components);
  components.push({...c,rub:r.rub,priceConfirmation:isCandidate?'unconfirmed':'confirmed',displayLabel:isCandidate?label:null,source:r.source});
 }
 const uncertain=components.some(c=>c.priceConfirmation==='unconfirmed');
 if(!Number.isSafeInteger(components.reduce((sum,c)=>sum+c.rub,0)))return unknown('invalid-total-amount',components);
 return {pricingStatus:'priced',rub:components.reduce((sum,c)=>sum+c.rub,0),priceConfirmation:uncertain?'unconfirmed':'confirmed',displayLabel:uncertain?label:null,components};
}
function formatCopy(result){return result.rub===null?result.displayLabel:`Платные дороги: ${result.rub} ₽${result.displayLabel?'\n'+result.displayLabel:''}`;}
return {quote,formatCopy};
}
module.exports={...createQuoteEngine(registry),createQuoteEngine};
