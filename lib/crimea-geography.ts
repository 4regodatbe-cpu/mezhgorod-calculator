import type { Position, GeoPoint } from "./special-territory-geometry.ts";

export function inCrimea(p: Position) {
  const ring: GeoPoint[] = [[32.45,45.35],[33.6,44.35],[34.1,44.3],[34.9,44.7],[36.65,45.15],[36.65,45.55],[35.7,45.8],[35.02,46.18],[34.55,46.0],[33.6,46.23],[32.45,45.9]];
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) { const a=ring[i],b=ring[j]; if((a[1]>p.lat)!==(b[1]>p.lat) && p.lng<(b[0]-a[0])*(p.lat-a[1])/(b[1]-a[1])+a[0]) inside=!inside; }
  return inside;
}
