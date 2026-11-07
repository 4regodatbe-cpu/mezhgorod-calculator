// Review-only. Never imported by app/lib; does not activate a provider.
import {rankPhotonFeatures} from '../../lib/photon-address-search.ts';
import {SPECIAL_TERRITORY_BOUNDARIES} from '../../lib/special-territory-boundaries.ts';
import {researchFallback} from './geoapify-fallback-experiment.mjs';

export function planFallbackBudget({enabled=false,hasCredentials=false,deadline,now=Date.now()}={}) {
  const remaining=Math.min(20_000,Math.floor(deadline-now));
  if(!Number.isFinite(remaining)||remaining<=0)return {status:'budget-exhausted',primaryMs:0,fallbackMs:0};
  if(!enabled||!hasCredentials)return {status:'primary-only',primaryMs:remaining,fallbackMs:0};
  if(remaining<=2000)return {status:'insufficient-reserve',primaryMs:0,fallbackMs:0};
  return {status:'review-plan-only',primaryMs:remaining-2000,fallbackMs:2000};
}

/** Compatibility shape is private to the existing ranker. geoapify-* IDs are
 * explicitly NOT OSM identities. No raw provider record becomes public here. */
export function normalizeFallbackForReview(result,query) {
  const stop=reason=>({status:reason,reviewItems:[],publicUseApproved:false});
  if(result?.status!=='unreviewed-candidates'||result.publicUseApproved!==false||!Array.isArray(result.candidates)||result.candidates.length>5)return stop('not-reviewable');
  const candidates=result.candidates.filter(c=>c?.provider==='geoapify'&&typeof c.id==='string'&&c.id&&c.id.length<=2048
    &&c.reviewRequired===true&&c.precision==='provider-reported-city-center'
    &&[c.city,c.state,c.country].every(s=>typeof s==='string'&&s.trim()&&s.length<=1000)
    &&Number.isFinite(c.position?.lat)&&Math.abs(c.position.lat)<=90
    &&Number.isFinite(c.position?.lng)&&Math.abs(c.position.lng)<=180);
  const features=candidates.map(c=>({geometry:{coordinates:[c.position.lng,c.position.lat]},properties:{
    osm_type:'geoapify',osm_id:c.id,osm_key:'place',osm_value:'city',
    name:c.city,city:c.city,state:c.state,country:c.country,
  }}));
  const ranked=rankPhotonFeatures(features,SPECIAL_TERRITORY_BOUNDARIES,query);
  return {status:'review-only',publicUseApproved:false,reviewItems:ranked.map(item=>{
    const candidate=candidates.find(c=>item.id===`geoapify-${c.id}`);
    return {...item,source:{provider:'geoapify',recordId:candidate.id,
      precision:candidate.precision,administrativeLabel:candidate.state,
      coordinateAuthenticityVerified:false,administrativeConsistencyVerified:false,
      reviewRequired:true,datasource:candidate.datasource??null}};
  })};
}

/** At most four calls, <=2s each and <=10s total. Explicit opt-in/key only.
 * Simulated primary outage is labelled; this does not prove live failover. */
export async function runFallbackAdmissionReview({enabled=false,apiKey,signal,
  now=Date.now,research=researchFallback}={}) {
  const rows=[];const base={schemaVersion:1,mode:'candidate-review-with-injected-primary-outage',rows,
    publicUseApproved:false,executionEnvironment:process.env.VERCEL_ENV??'local',
    sourceSha:process.env.VERCEL_GIT_COMMIT_SHA??null};
  if(!enabled)return {...base,status:'DISABLED',reviewAttempts:0};
  if(typeof apiKey!=='string'||!apiKey.trim())return {...base,status:'BLOCKED_NO_CREDENTIALS',reviewAttempts:0};
  const deadline=now()+10_000;let reviewAttempts=0;
  for(const query of ['Донецк','Донецк Ростовская область','Волноваха','Краснодар']) {
    if(signal?.aborted||now()>=deadline)break;
    reviewAttempts++;
    const result=await research({enabled:true,apiKey,query,signal,now,
      deadline:Math.min(deadline,now()+2000),photon:{unavailable:true}});
    rows.push({query,providerStatus:result.status,...normalizeFallbackForReview(result,query)});
    if(result.status==='provider-http-429')break; // no immediate quota retries
  }
  return {...base,status:signal?.aborted?'CANCELLED':rows.length===4?'REVIEW_REQUIRED':'INCOMPLETE',reviewAttempts};
}
