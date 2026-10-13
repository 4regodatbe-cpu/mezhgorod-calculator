const registry=require('../TARIFF_SELECTION_REGISTER.json');
const label='Стоимость не подтверждена';
const key=r=>JSON.stringify([r.road,r.from,r.to,r.profile]);
const rows=[...registry.selected,...registry.provisional,...registry.history];
const index=new Map();
for(const row of rows){const k=key(row);if(!index.has(k))index.set(k,[]);index.get(k).push(row);}
const provisionalKeys=new Set(registry.provisional.map(key));
function unknown(reason,components=[]){return {pricingStatus:'unknown',rub:null,priceConfirmation:'unknown',displayLabel:'Стоимость платных дорог неизвестна',reason,components};}
function validDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value);
 return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
function quote(input){
 if(!input||!Array.isArray(input.components)||!input.routeId)return unknown('invalid-route-input');
 if(input.evidenceComplete!==true)return unknown('incomplete-paid-road-evidence');
 if(!input.components.length)return input.confirmedNoPaidCrossing===true?{pricingStatus:'free',rub:0,priceConfirmation:'confirmed',displayLabel:null,components:[]}:unknown('free-route-not-confirmed');
 const components=[],seen=new Set(),families=new Set();
 for(const c of input.components){
  if(!c||typeof c!=='object'||typeof c.road!=='string'||!c.road)return unknown('invalid-component',components);
  if(c.routeId!==input.routeId||c.exactTraversal!==true)return unknown('component-not-bound-to-selected-route',components);
  const family=c.road?.startsWith('m4')?'m4':c.road?.startsWith('m12')?'m12':c.road;
  if(families.has(family))return unknown('multiple-representations-of-one-road-group',components);families.add(family);
  if(!c.traversalId||seen.has(c.traversalId))return unknown('duplicate-or-missing-traversal-id',components);seen.add(c.traversalId);
  if(!validDate(c.localDate))return unknown('missing-local-crossing-date',components);
  if(c.profileResolved!==true)return unknown('unresolved-tariff-profile',components);
  const found=(index.get(key(c))||[]).filter(r=>(!r.validFrom&&!r.effectiveFrom||(r.validFrom||r.effectiveFrom)<=c.localDate)&&(!r.validUntil||c.localDate<r.validUntil));
  if(found.length!==1)return unknown(found.length?'ambiguous-fare-version':'missing-current-exact-fare',components);
  const r=found[0],isCandidate=provisionalKeys.has(key(r))||String(r.verification||'').includes('candidate')||r.road.endsWith('-candidate');
  if(!Number.isSafeInteger(r.rub)||r.rub<0)return unknown('invalid-fare-amount',components);
  components.push({...c,rub:r.rub,priceConfirmation:isCandidate?'unconfirmed':'confirmed',displayLabel:isCandidate?label:null,source:r.source});
 }
 const uncertain=components.some(c=>c.priceConfirmation==='unconfirmed');
 if(!Number.isSafeInteger(components.reduce((sum,c)=>sum+c.rub,0)))return unknown('invalid-total-amount',components);
 return {pricingStatus:'priced',rub:components.reduce((sum,c)=>sum+c.rub,0),priceConfirmation:uncertain?'unconfirmed':'confirmed',displayLabel:uncertain?label:null,components};
}
function formatCopy(result){return result.rub===null?result.displayLabel:`Платные дороги: ${result.rub} ₽${result.displayLabel?'\n'+result.displayLabel:''}`;}
module.exports={quote,formatCopy};
