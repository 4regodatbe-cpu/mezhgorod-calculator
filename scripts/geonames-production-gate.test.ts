import test from 'node:test';
import assert from 'node:assert/strict';
import {localPilotAllowed} from '../lib/local-settlement-search.ts';

const production={VERCEL:'1',VERCEL_ENV:'production',NODE_ENV:'production'};
const preview={VERCEL:'1',VERCEL_ENV:'preview',NODE_ENV:'production',VERCEL_GIT_COMMIT_REF:'fix/v3-missing-route-prices-2026-10-15'};

test('Production GeoNames defaults OFF even with the former pilot switch',()=>{
 assert.equal(localPilotAllowed(production),false);
 assert.equal(localPilotAllowed({...production,GEONAMES_LOCAL_PILOT:'1'}),false);
 assert.equal(localPilotAllowed({...production,GEONAMES_PRODUCTION_ENABLED:'1'}),false);
 assert.equal(localPilotAllowed({...production,GEONAMES_LOCAL_PILOT:'0',GEONAMES_PRODUCTION_ENABLED:'1'}),false);
});
test('Production GeoNames requires BOTH independently set server flags',()=>{
 assert.equal(localPilotAllowed({...production,GEONAMES_LOCAL_PILOT:'1',GEONAMES_PRODUCTION_ENABLED:'1'}),true);
 assert.equal(localPilotAllowed({...production,GEONAMES_LOCAL_PILOT:'1',GEONAMES_PRODUCTION_ENABLED:'true'}),false);
});
test('Preview GeoNames remains restricted to the approved feature branch',()=>{
 assert.equal(localPilotAllowed({...preview,GEONAMES_LOCAL_PILOT:'1'}),true);
 assert.equal(localPilotAllowed({...preview,GEONAMES_LOCAL_PILOT:'1',VERCEL_GIT_COMMIT_REF:'main'}),false);
 assert.equal(localPilotAllowed({...preview,GEONAMES_LOCAL_PILOT:'0'}),false);
});
test('Unknown Vercel environments and client-independent flags remain denied',()=>{
 assert.equal(localPilotAllowed({VERCEL:'1',GEONAMES_LOCAL_PILOT:'1',GEONAMES_PRODUCTION_ENABLED:'1'}),false);
 assert.equal(localPilotAllowed({VERCEL_ENV:'custom',GEONAMES_LOCAL_PILOT:'1',GEONAMES_PRODUCTION_ENABLED:'1'}),false);
});
