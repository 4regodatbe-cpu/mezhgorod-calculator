const localDateFormatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'});
const timeFormatter=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Moscow',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
function validDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value);return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
function validInstant(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value))return false;
 return validDate(value.slice(0,10))&&Number.isFinite(new Date(value).getTime());
}
function boundary(value){
 if(value===undefined||value===null)return null;
 if(validDate(value))return {date:value,midnight:true};
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)||!validDate(value.slice(0,10)))return {invalid:true};
 const instant=new Date(value);if(!Number.isFinite(instant.getTime()))return {invalid:true};
 return {date:localDateFormatter.format(instant),midnight:timeFormatter.format(instant)==='00:00:00'&&instant.getUTCMilliseconds()===0};
}
function fareValidityOnDate(row,date){
 if(!validDate(date))return 'unknown';
 for(const [first,second] of [[row.validFrom,row.effectiveFrom],[row.validUntil,row.effectiveUntil]]) {
  if(first==null||second==null)continue;
  const a=boundary(first),b=boundary(second);
  if(a?.invalid||b?.invalid||a.date!==b.date||a.midnight!==b.midnight)return 'unknown';
  if(!a.midnight&&new Date(first).getTime()!==new Date(second).getTime())return 'unknown';
 }
 const a=boundary(row.validFrom??row.effectiveFrom),b=boundary(row.validUntil??row.effectiveUntil);
 if(a?.invalid||b?.invalid)return 'unknown';
 if(a&&b&&a.date>b.date)return 'unknown';
 if(a&&date<a.date||b&&date>b.date||b?.midnight&&date===b.date)return 'outside';
 if(a&&!a.midnight&&date===a.date||b&&!b.midnight&&date===b.date)return 'unknown';
 return 'inside';
}
module.exports={validDate,validInstant,fareValidityOnDate};
