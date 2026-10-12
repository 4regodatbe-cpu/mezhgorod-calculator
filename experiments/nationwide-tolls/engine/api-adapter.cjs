const {quote,formatCopy}=require('./quote.cjs');
function priceRouteResult(trip,evidence){
 if(!trip||!Number.isFinite(trip.meters)||!Number.isFinite(trip.seconds))throw new TypeError('Invalid route result');
 const result=quote(evidence);
 return {...trip,tolls:{amount:result.rub,weekdayAmount:null,weekendAmount:null,period:'дата и время проезда',segments:result.components.map(c=>`${c.road}: ${c.rub} ₽${c.displayLabel?' · '+c.displayLabel:''}`),confidence:result.priceConfirmation==='confirmed'?'matched':'none',pricingStatus:result.pricingStatus,priceConfirmation:result.priceConfirmation,displayLabel:result.displayLabel,reason:result.reason??null},matrixQuote:result};
}
function copyRouteResult(trip){if(!trip.matrixQuote)throw new TypeError('Missing matrix quote');return formatCopy(trip.matrixQuote);}
module.exports={priceRouteResult,copyRouteResult};
