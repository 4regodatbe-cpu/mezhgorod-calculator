import type { RouteTollComponentValue } from "../toll-engine/route-toll-composition";

const KEYS = ["m4-545-a", "m4-545-b"] as const;
type Matrix = {
  reason: string;
  priceConfirmation: string;
  productCoverage?: {sectionVector: string[]} | null;
  tolls: {amount:number;weekdayAmount:number;weekendAmount:number;period:string;segments:string[];confidence:string} | null;
} | null;
type Accepted = {status:string;amount:number|null;weekdayAmount?:number;weekendAmount?:number;period?:string;coverageKeys?:string[];isWholeRouteTotal?:boolean} | null;

/** Split an accepted 545 working subtotal out of an M4 endpoint quote only
 * when that quote names both tariff products once and in route order. */
export function splitM4MatrixAt545(matrix: Matrix, accepted: Accepted): {matrix: Matrix; product: RouteTollComponentValue | null} {
  const amount=accepted?.amount, weekday=accepted?.weekdayAmount, weekend=accepted?.weekendAmount, period=accepted?.period;
  if (!accepted || accepted.status !== "accepted_working_calculation" || accepted.isWholeRouteTotal !== false ||
      ![amount,weekday,weekend].every(Number.isSafeInteger) ||
      typeof amount!=="number"||typeof weekday!=="number"||typeof weekend!=="number"||typeof period!=="string"||
      amount < 0 || weekday < 0 || weekend < 0 || JSON.stringify(accepted.coverageKeys) !== JSON.stringify(KEYS)) return {matrix,product:null};
  const product: RouteTollComponentValue = {
    amount,weekdayAmount:weekday,weekendAmount:weekend,
    period,segments:["М-4 ПВП 545: 517–544 км + 544–589 км; компонент маршрута, не итог всей поездки"],confidence:"matched",
  };
  const vector=matrix?.productCoverage?.sectionVector;
  const coverageComplete=Array.isArray(vector) && KEYS.every(key=>
    vector.filter(value=>value===key).length===1 && vector.indexOf(KEYS[1])===vector.indexOf(KEYS[0])+1);
  const fareComplete=Boolean(matrix?.tolls) && matrix!.tolls!.period===period &&
    [matrix!.tolls!.amount,matrix!.tolls!.weekdayAmount,matrix!.tolls!.weekendAmount].every(Number.isSafeInteger);
  if (!matrix || !coverageComplete || !fareComplete) {
    return {matrix:matrix ? {...matrix,tolls:null,reason:"m4_545_product_coverage_not_proven; complete M4 amount remains unknown"} : null,product};
  }
  const remainder=matrix.tolls!.amount-amount;
  const weekdayAmount=matrix.tolls!.weekdayAmount-weekday;
  const weekendAmount=matrix.tolls!.weekendAmount-weekend;
  if (![remainder,weekdayAmount,weekendAmount].every(value=>Number.isSafeInteger(value)&&value>=0)) {
    return {matrix:{...matrix,tolls:null,reason:"m4_545_product_subtraction_invalid; complete M4 amount remains unknown"},product};
  }
  const segments=matrix.tolls!.segments.map((segment,index)=>index===0
    ? `М-4 ${vector.filter(key=>!KEYS.includes(key as typeof KEYS[number])).join(" → ")||"без иных тарифных продуктов"} · агрегат исключает отдельно выделенный ПВП 545 · Стоимость не подтверждена`
    : segment);
  return {matrix:{...matrix,reason:"M4 endpoint estimate with exact 545 products replaced once",tolls:{...matrix.tolls!,amount:remainder,weekdayAmount,weekendAmount,segments}},product};
}
