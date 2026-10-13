import type { Result } from '../../v2/components/types';
const money=(value:unknown)=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0;
const positive=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)&&value>0;
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const strings=(value:unknown)=>Array.isArray(value)&&value.every(x=>typeof x==='string');
function validTrip(value:unknown):boolean {
 if(!object(value)||!positive(value.meters)||!positive(value.seconds))return false;
 if(value.quality!==undefined&&(!object(value.quality)||typeof value.quality.message!=='string'||!strings(value.quality.providers)))return false;
 if(!object(value.pricingByVehicle))return false;
 for(const vehicle of ['standard','comfort','comfort_plus','minivan']) {
  const p=value.pricingByVehicle[vehicle];
  if(!object(p)||typeof p.requiresSplit!=='boolean'||typeof p.reviewRequired!=='boolean'||typeof p.dualTariff!=='boolean'||!Array.isArray(p.pricingSegments))return false;
  if(p.totalPrice!==null&&!money(p.totalPrice))return false;
  if(p.totalPrice===null&&p.requiresSplit!==true||p.totalPrice!==null&&(p.requiresSplit||p.reviewRequired))return false;
  if(!p.pricingSegments.every(s=>object(s)&&positive(s.distanceKm)&&positive(s.ratePerKm)&&money(s.amount)&&['normal','special'].includes(String(s.tariffType))&&typeof s.from==='string'&&typeof s.to==='string'))return false;
  if(p.totalPrice!==null&&p.pricingSegments.reduce((sum:number,s)=>sum+s.amount,0)!==p.totalPrice)return false;
 }
 return true;
}
function validLeg(value:unknown):boolean {
 if(!object(value)||typeof value.from!=='string'||typeof value.to!=='string'||!validTrip(value.fast)||!object(value.fast))return false;
 const t=value.fast.tolls;
 if(!object(t)||!strings(t.segments)||typeof t.period!=='string'||!['matched','none'].includes(String(t.confidence)))return false;
 const values=[t.amount,t.weekdayAmount,t.weekendAmount];
 if(t.pricingStatus==='unknown'){if(!values.every(x=>x===null))return false;}
 else if(t.pricingStatus==='free'){if(!values.every(x=>x===0))return false;}
 else if(t.pricingStatus==='priced'){if(!values.every(money)||!['confirmed','unconfirmed'].includes(String(t.priceConfirmation)))return false;}
 else return false;
 return value.free==null||validTrip(value.free);
}
export function validV3Response(value:unknown):value is Result {
 if(!object(value))return false;
 if(value.automaticMode!==undefined&&!['standard','dual'].includes(String(value.automaticMode)))return false;
 if(!Array.isArray(value.legs)||!value.legs.length||!value.legs.every(validLeg))return false;
 if(value.options!==undefined&&(!Array.isArray(value.options)||!value.options.every(validLeg)))return false;
 return true;
}
