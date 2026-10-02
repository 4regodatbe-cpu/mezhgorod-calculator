import fs from "node:fs";

const m11 = JSON.parse(fs.readFileSync("data/tolls/m11/2026-10-01-58-679-spatial-anchors.json", "utf8"));
const cases = [
  ["krasnodar-spb", [38.9753,45.0355], [30.3351,59.9343]],
  ["golubitskaya-spb", [37.2761,45.3258], [30.3351,59.9343]],
  ["vityazevo-spb", [37.2821,45.0019], [30.3351,59.9343]],
  ["kazan-yalta", [49.1064,55.7961], [34.1663,44.4952]],
];
const ckadAnchors = [[37.75,55.32],[37.80,55.35],[38.05,55.39],[38.34,55.53],[38.35,55.65],[38.46,55.72],[38.50,55.90],[37.92,56.13],[37.55,56.18]];
const rad=Math.PI/180;
function pointSeg(p,a,b){const latScale=110.574,lonScale=111.320*Math.cos(p[1]*rad);const ax=(a[0]-p[0])*lonScale,ay=(a[1]-p[1])*latScale,bx=(b[0]-p[0])*lonScale,by=(b[1]-p[1])*latScale,dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;if(l2<1e-12)return Math.hypot(ax,ay);const t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/l2));return Math.hypot(ax+t*dx,ay+t*dy);}
function nearest(route,p){let d=Infinity,idx=-1;for(let i=0;i<route.length-1;i++){const x=pointSeg(p,route[i],route[i+1]);if(x<d){d=x;idx=i;}}return {km:Math.round(d*1000)/1000,index:idx};}
for(const [id,from,to] of cases){
  const url=`https://router.project-osrm.org/route/v1/driving/${from.join(",")};${to.join(",")}?overview=full&geometries=geojson`;
  const r=await fetch(url,{headers:{"user-agent":"MezhgorodCalc/2.0"},signal:AbortSignal.timeout(30000)});const j=await r.json();const route=j.routes?.[0]?.geometry?.coordinates??[];
  const facilities=m11.facilities.map(f=>({point:f.tariffPointId,anchors:f.anchors.map(a=>nearest(route,[a.lon,a.lat])).sort((a,b)=>a.km-b.km)[0]}));
  const ckad=ckadAnchors.map((a,i)=>({i,...nearest(route,a)}));
  console.log(JSON.stringify({id,km:j.routes?.[0]?.distance/1000,points:route.length,m11:facilities,ckad},null,2));
}
