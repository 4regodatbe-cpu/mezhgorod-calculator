import test from 'node:test';
import assert from 'node:assert/strict';
import {proposedTariffReleaseAssessment as assess} from '../experiments/tariff-freshness-policy-proposal.mjs';
import {freshnessExitCode} from './check-tariff-freshness.mjs';
test('isolated proposal distinguishes stale observation from unproven money/product and retains current CI block',()=>{
 const facts={observationStale:true,sourceIntegrity:true,matchingProduct:true,applicablePeriod:true,conflictingEdition:false};
 assert.equal(assess(facts).release,'ELIGIBLE_WITH_SOURCE_LIMITATIONS');
 assert.deepEqual(assess(facts).warnings,['observation_recheck_due']);
 for(const key of ['sourceIntegrity','matchingProduct','applicablePeriod'])assert.equal(assess({...facts,[key]:false}).release,'BLOCKED');
 assert.equal(assess({...facts,conflictingEdition:true}).release,'BLOCKED');
 assert.equal(freshnessExitCode({stale:2,invalid:0},true),2);
});
