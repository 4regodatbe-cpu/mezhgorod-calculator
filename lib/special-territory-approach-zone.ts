import type { Position, GeoPoint } from "./special-territory-geometry.ts";

/** Temporary routing preference area traced from the user-approved red outline in the 2026-10-04 screenshot. Independent of tariff polygons. CRS84 [lng,lat]. Replace with reviewed GeoJSON when available. */
export const CRIMEA_APPROACH_ZONE: GeoPoint[] = [
 [31,46.64],[31.4,46.71],[31.92,46.8],[32.48,46.94],[33,47.17],[33.52,47.52],[34.03,47.8],[34.35,47.95],[34.74,47.98],[35.13,47.94],[35.52,47.84],[35.98,47.7],[36.36,47.56],[36.75,47.45],[37.06,47.37],[37.15,47.13],[37.14,46.9],[37,46.62],[36.81,46.4],[36.45,46.19],[36.03,46.06],[35.52,45.99],[34.94,45.91],[34.35,45.9],[33.77,45.93],[33.19,46],[32.68,46.03],[32.16,46.01],[31.71,46.05],[31.32,46.14]
];
const EPSILON=1e-9;
function onSegment(p:GeoPoint,a:GeoPoint,b:GeoPoint){
 const cross=(p[1]-a[1])*(b[0]-a[0])-(p[0]-a[0])*(b[1]-a[1]);
 return Math.abs(cross)<=EPSILON&&p[0]>=Math.min(a[0],b[0])-EPSILON&&p[0]<=Math.max(a[0],b[0])+EPSILON&&p[1]>=Math.min(a[1],b[1])-EPSILON&&p[1]<=Math.max(a[1],b[1])+EPSILON;
}
/** Coordinate-only route-choice test; address text is never consulted. Boundary points count inside. */
export function inCrimeaApproachZone(point:Position){
 const p:GeoPoint=[point.lng,point.lat];let inside=false;
 for(let i=0,j=CRIMEA_APPROACH_ZONE.length-1;i<CRIMEA_APPROACH_ZONE.length;j=i++){
  const a=CRIMEA_APPROACH_ZONE[i],b=CRIMEA_APPROACH_ZONE[j];
  if(onSegment(p,a,b))return true;
  if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside;
}
