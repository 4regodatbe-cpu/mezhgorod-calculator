import type {EstimateResult} from './estimate.ts';
export type TollView=Readonly<{subject:'tolls-only';status:EstimateResult['status'];label:string|null;secondary:string|null}>;
const valid=(n:number|null):n is number=>n!==null&&Number.isSafeInteger(n)&&n>=0;
const rub=(n:number)=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';

/** No transfer/basefare input: approximate tolls never relabel the whole transfer price. */
export function tollEstimateView(result:EstimateResult):TollView {
 if(result.status==='disabled')return {subject:'tolls-only',status:'disabled',label:null,secondary:null};
 if((result.status==='confirmed'||result.status==='estimated')&&valid(result.totalRub))return {
  subject:'tolls-only',status:result.status,
  label:`Платные дороги: ${rub(result.totalRub)}${result.status==='estimated'?' (ориентировочно)':''}`,
  secondary:result.status==='estimated'
   ?result.components.some(c=>c.method==='comparable_upper_bound')?'Консервативная верхняя граница сопоставимых тарифов; не чек оператора.':'Ориентировочная расчётная стоимость по доступным тарифным данным.'
   :null};
 const known=result.confirmedSubtotalRub,assessed=result.assessedSubtotalRub;
 const secondary=valid(assessed)
  ?valid(known)&&assessed===known?`Подтверждённая часть: ${rub(known)}; это не полная стоимость платных дорог.`
   :`Оценено ${rub(assessed)} (ориентировочно)${valid(known)?`, включая подтверждённую часть ${rub(known)}`:''}; это не полный итог.`
  :null;
 return {subject:'tolls-only',status:'insufficient',label:'Платные дороги: стоимость уточняется',secondary};
}
