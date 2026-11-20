import physical from '@/experiments/nationwide-tolls/source-snapshots/m11/2026-10-18-ckad47-entry/directed-ckad47-entry.json' with {type:'json'};
import type {Coordinate} from '../tolls';
import type {TollValidation} from '../toll-validator';
import {nearestSegment,haversineKm} from '../toll-engine/m11-moscow-geometry';

/** Direct northbound CKAD47 access, independently identified as PVP18.
 * The adjacent MMK plazas and the reverse access remain separate boundaries. */
export function inspectM11CkadHeadEntry(route:readonly Coordinate[],validation:TollValidation|null) {
 const fail=()=>({resolved:false,gateIndex:null});
 if(validation?.status!=='toll'||validation.complete!==true||validation.boothEventCoverage!=='complete'
  ||!validation.chunkCount||validation.checkedChunkCount!==validation.chunkCount||validation.failedChunkCount!==0)return fail();
 const gates=validation.tollBooths?.filter(g=>g.osmNodeId===physical.gateNodeId&&g.wayId===physical.gateWayId);
 // wayIds is intentionally paid-only: the three CKAD access links are not
 // marked toll. Their continuity is proved by the independent physical corridor.
 if(gates?.length!==1||!validation.wayIds.includes(physical.orderedWayIds.at(-1)!))return fail();
 if(!validation.paidRoadEdges?.some(e=>e.wayId===physical.orderedWayIds.at(-1)))return fail();
 const hits=physical.anchors.map(a=>nearestSegment(route,[a.coordinate as Coordinate]));
 if(hits.some((h,i)=>h.distanceKm>0.025||i>0&&h.index<=hits[i-1].index))return fail();
 const first=Math.floor(hits[0].index),last=Math.ceil(hits.at(-1)!.index);
 if(first<0||last>=route.length)return fail();
 const corridor=physical.corridorCoordinates as Coordinate[];
 for(let i=first;i<=last;i++){
  if(nearestSegment(corridor,[route[i]]).distanceKm>0.025)return fail();
  if(i<last&&haversineKm(route[i],route[i+1])>2)return fail();
 }
 return {resolved:true,gateIndex:hits[1].index};
}
