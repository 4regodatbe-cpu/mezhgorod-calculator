// Offline inventory only. Neither real-route existence nor tariffs are inferred.
export function enumerateM4PvpSignatures(knownPvps) {
  if (!Array.isArray(knownPvps) || !knownPvps.length) throw Error("no_pvps");
  const items=knownPvps.map(id=>{
    if(typeof id!=="string" || !/^m4-[1-9][0-9]*$/.test(id)) throw Error("invalid_pvp");
    return {id,km:Number(id.slice(3))};
  });
  if(new Set(items.map(x=>x.id)).size!==items.length || items.some(x=>!Number.isSafeInteger(x.km)))throw Error("duplicate_pvp");
  items.sort((a,b)=>a.km-b.km);
  const rows=[],ids=new Set();
  for(const direction of ["to_krasnodar","to_moscow"]){
    const ordered=direction==="to_krasnodar"?items:[...items].reverse();
    for(let i=0;i<ordered.length;i++){
      for(let j=i;j<ordered.length;j++){
        const sequence=ordered.slice(i,j+1).map(x=>x.id);
        const key=direction+"|"+sequence.join(">");
        if(ids.has(key))throw Error("duplicate_sequence");ids.add(key);
        const flags=[];
        if(sequence.some(x=>x==="m4-416"||x==="m4-460"))flags.push("mixed401_unverified_time_state");
        if(sequence.some(x=>x==="m4-636"||x==="m4-672"))flags.push("mixed633_conflicting_60_120_min_rule");
        if(sequence.includes("m4-339")&&sequence.includes("m4-355"))flags.push("receipt339355_directional");
        if(sequence.includes("m4-545"))flags.push("545_two_possible_tariff_rows_one_physical_gate");
        rows.push({key,direction,firstPvp:sequence[0],lastPvp:sequence.at(-1),sequence,flags,priceRub:null,status:"hypothesis_not_verified_route"});
      }
    }
  }
  return rows;
}
