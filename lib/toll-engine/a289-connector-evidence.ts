import type { Coordinate } from "@/lib/tolls";

// Selected Valhalla maneuver/shape anchors, NOT a new tariff source.
// Provenance/raw hashes: docs/checkpoints/evidence/2026-10-16-part19b-a289-connector-diagnosis.json
const controls: Record<"entry" | "exit", Coordinate[]> = {
  entry: [[38.295164,45.207196],[38.293165,45.206594],[38.290048,45.206306]],
  exit: [[38.289318,45.20618],[38.292057,45.206371],[38.295398,45.206445]],
};
const distance = (a: Coordinate, b: Coordinate) => Math.hypot(
  (a[0]-b[0])*111_000*Math.cos((a[1]+b[1])*Math.PI/360), (a[1]-b[1])*111_000);

/** Only a unique, directed, densely sampled passage through this actual ramp. */
export function a289SlavyanskConnector(route: Coordinate[]): "entry" | "exit" | null {
  if(route.length<3 || route.some(p=>!p || p.length!==2 || !p.every(Number.isFinite) || Math.abs(p[0])>180 || Math.abs(p[1])>90))return null;
  const lengths=route.slice(1).map((p,i)=>distance(route[i],p));
  const stations=[0];
  for(const length of lengths)stations.push(stations.at(-1)!+length);
  const passage=(point:Coordinate) => {
    const hits:number[]=[];
    for(let i=0;i<lengths.length;i++){
      // Never infer a ramp crossing by interpolating a sparse long chord.
      if(lengths[i]>500 || lengths[i]===0)continue;
      const scale=111_000*Math.cos(point[1]*Math.PI/180);
      const ax=(route[i][0]-point[0])*scale, ay=(route[i][1]-point[1])*111_000;
      const dx=(route[i+1][0]-route[i][0])*scale, dy=(route[i+1][1]-route[i][1])*111_000;
      const t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/(dx*dx+dy*dy)));
      if(Math.hypot(ax+t*dx,ay+t*dy)<=25)hits.push(stations[i]+t*lengths[i]);
    }
    if(!hits.length)return null;
    // Adjacent samples describe one encounter; a later return is ambiguous.
    if(hits.some((s,i)=>i>0 && s-hits[i-1]>100))return null;
    return hits.reduce((a,b)=>a+b,0)/hits.length;
  };
  const matches=(Object.keys(controls) as (keyof typeof controls)[]).filter(kind=>{
    const positions=controls[kind].map(passage);
    if(positions.some(p=>p===null))return false;
    const [before,join,after]=positions as number[];
    return before<join && join<after && after-before<1000;
  });
  return matches.length===1?matches[0]:null;
}
