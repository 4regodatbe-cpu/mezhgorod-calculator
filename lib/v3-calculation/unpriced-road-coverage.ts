import type { TollValidation } from '@/lib/toll-validator';
import { detectedFamiliesFromLegacySegments } from '@/lib/toll-engine/route-toll-composition';

const coreNetworks = new Set(['m1','m3','m4','m11','m11-15-58','m12','ckad','a289']);
const regionalPatterns = [
  /восточный выезд/iu, /обход тольятти/iu, /северный обход одинцова/iu,
  /проспект багратиона/iu, /вознесенский тракт/iu, /обход хабаровска/iu,
  /(?:^|[^а-яa-z])(?:зсд|шмсд|мсд)(?:$|[^а-яa-z])/iu,
  /западный скоростной диаметр/iu, /широтная магистраль скоростного движения/iu,
  /московский скоростной диаметр/iu, /витебская развязка/iu,
  /мытищинская хорда/iu, /мост.*(?:каму|буй)/iu,
  /платн.*(?:псков|рязани|рязан)/iu, /мост.*(?:благовещенск|хэйхэ)/iu,
];

// Detection blocks incomplete totals; it never supplies a fare or proves a
// complete road traversal. Only evidence produced for the selected route enters.
export function unpricedRoadCoverage(args: {
  segments: readonly string[];
  validation: TollValidation | null;
  candidateNetworks: readonly {id: string}[];
  m1m3Candidates: readonly string[];
}) {
  const families = detectedFamiliesFromLegacySegments(args.segments);
  for (const road of args.m1m3Candidates) if (road === 'm1' || road === 'm3') families.add(road);
  for (const network of args.candidateNetworks) {
    if (network.id === 'm1' || network.id === 'm3') families.add(network.id);
    else if (!coreNetworks.has(network.id)) families.add('regional');
  }
  const regionalReasons = new Set<string>();
  const detectName = (name: string) => {
    for (const family of detectedFamiliesFromLegacySegments([name])) families.add(family);
    if (regionalPatterns.some(pattern => pattern.test(name))) {
      families.add('regional');regionalReasons.add(name);
    }
  };
  for (const name of args.segments) detectName(name);
  for (const name of args.validation?.roadNames ?? []) detectName(name);
  for (const booth of args.validation?.tollBooths ?? []) {
    if (booth.edgeToll !== true) continue;
    const roadFamilies = detectedFamiliesFromLegacySegments(booth.roadNames);
    for (const name of booth.roadNames) detectName(name);
    // A paid event without an identified supported road cannot disappear from
    // the total simply because the local catalog has no matching road name.
    if (!roadFamilies.size && !booth.roadNames.some(name=>regionalPatterns.some(pattern=>pattern.test(name)))) {
      families.add('regional');regionalReasons.add('unmapped_selected_route_paid_booth');
    }
  }
  return {m1:families.has('m1'),m3:families.has('m3'),regional:families.has('regional'),regionalReason:[...regionalReasons].join('; ') || 'regional_exact_traversal_not_priced'};
}
