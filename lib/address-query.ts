/** A detail query must never be replaced with a settlement-centre lookup. */
export function hasAddressTerms(query: string): boolean {
  return /\d|(?:^|[\s,;])(?:ул\.?|улица|проспект|пр-т|переулок|пер\.?|шоссе|дом|д\.?|корпус|кв\.?)(?:\s|$)/iu.test(query);
}
export function isStreetQuery(query: string): boolean {
  return !/\d/u.test(query)&&/(?:^|[\s,;])(?:ул\.?|улица|проспект|пр-т|переулок|пер\.?|шоссе)(?:\s|$)/iu.test(query);
}
export function isDetailedAddress(query: string): boolean {
  if (hasAddressTerms(query)) return true;
  const parts=query.split(/[,;]/u).map(part=>part.trim());
  // A comma separates regional context too, not only street/address detail.
  return parts.length>1 && !(parts.length===2 && isRegionQualifier(parts[1]));
}

function isRegionQualifier(value: string): boolean {
  return /^(?:днр|лнр|крым|республика крым|россия|рф|украина|[\p{L}\s-]+\s(?:область|обл\.?|край|республика))$/iu.test(value);
}

/** Only an unambiguous city-first street query may offer a separate city.
 * Never guess a city from arbitrary word order or reinterpret a house query. */
export function settlementForStreetQuery(query: string): string | null {
  if (/\d/u.test(query)) return null;
  const parts=query.split(/[,;]/u).map(part=>part.trim());
  if (parts.length>1) {
    if(!parts[0]||hasAddressTerms(parts[0])||!parts.slice(1).some(hasAddressTerms))return null;
    return [parts[0],...parts.slice(1).filter(isRegionQualifier)].join(' ');
  }
  // City-first input need not contain a comma. Keep the explicit region in
  // the prefix; never infer the city from the street name or arbitrary order.
  const marker=/(?:^|\s)(?:ул\.?|улица|проспект|пр-т|переулок|пер\.?|шоссе)(?=\s|$)/iu.exec(query);
  const prefix=marker?query.slice(0,marker.index).trim():'';
  return prefix&&!hasAddressTerms(prefix)?prefix:null;
}

const markers=new Set(['г','город','городской','округ','улица','ул','проспект','пр','т','переулок','пер','шоссе','дом','д']);
function words(value: unknown): string[] {
  if(typeof value!=='string')return [];
  return value.toLocaleLowerCase('ru-RU').replace(/ё/gu,'е').replace(/і/gu,'и').replace(/ї/gu,'и').replace(/є/gu,'е')
    .replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(/\s+/u).filter(x=>x&&!markers.has(x));
}

/** Rank only evidence actually returned in locality/street/house fields.
 * In particular state/county text cannot satisfy the requested city. This is
 * relevance, not an exact-address/coordinate certificate or a postal parser. */
export function detailedAddressScore(properties: Record<string,unknown>, query: string): number {
  const tokens=words(query),requested=new Set(tokens);
  const matches=(candidate:string[])=>candidate.length>0&&candidate.every(x=>requested.has(x));
  const cities=['city:ru','city','town','village'].map(key=>{
    const value=properties[key];
    // Some providers put an administrative unit into a locality slot. Its
    // city-looking token still cannot establish membership in that city.
    if(typeof value==='string'&&/(?:^|[^\p{L}])(?:область|обл|край|район|р-н|округ|громада|oblast|region|county|municipality)(?:$|[^\p{L}])/iu.test(value))return [];
    return words(value);
  });
  const street=words(properties.street??(properties.osm_key==='highway'?properties.name:undefined));
  const house=words(properties.housenumber);
  const city=cities.some(matches),streetMatch=matches(street);
  const houseRequested=tokens.some(x=>/\d/u.test(x)&&!street.includes(x));
  const houseMatch=houseRequested&&matches(house);
  const evidence=new Set([...cities.flat(),...street,...house]);
  const complete=streetMatch&&(!houseRequested||houseMatch)&&tokens.length>0&&tokens.every(x=>evidence.has(x));
  const cityWithAddress=city&&(streetMatch||houseMatch);
  return Number(complete)*8_000_000+Number(cityWithAddress)*4_000_000+Number(streetMatch)*2_000_000+
    Number(houseMatch)*1_000_000+tokens.filter(x=>evidence.has(x)).length;
}
