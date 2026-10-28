import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { B11_API_FILE, B11_BEFORE_BLOB, B11_AFTER_BLOB, exactB11SourcePair } from './b11-exact-reuse-change.mjs';
import { classifyChangedPaths, classifyPullRequestDelta } from './classify-special-territory-live-push.mjs';
const before = fs.readFileSync(new URL('../experiments/address-search/checks/b11-reuse/api-before.txt', import.meta.url), 'utf8');
export const after = before.replace('(trip:T) => timing.measureSync("response_pricing"', '(trip:T, verifiedSplit?:ReturnType<typeof analyzeRoute>) => timing.measureSync("response_pricing"')
  .replace('const territorySplit = analyzeRoute(trip.coordinates,trip.meters,trip.seconds,from.position,to.position,zones);', 'const territorySplit = verifiedSplit ?? analyzeRoute(trip.coordinates,trip.meters,trip.seconds,from.position,to.position,zones);')
  .replace('fast:attachPricing(option.fast)', 'fast:attachPricing(option.fast,option.split)');
const proof = { before, after, beforeBlob: B11_BEFORE_BLOB, afterBlob: B11_AFTER_BLOB };
const base = '1'.repeat(40), head = '2'.repeat(40);
const file = { filename: B11_API_FILE, status: 'modified', sha: B11_AFTER_BLOB, patch: 'complete exact change verified by full source hashes' };
const compare = files => ({ status: 'ahead', files });
test('only full pinned transition receives exact B11 exception; path alone stays strict', () => {
  assert.equal(exactB11SourcePair(before, after), true);
  assert.equal(classifyChangedPaths([B11_API_FILE]).shouldRunLive, true);
  assert.equal(classifyPullRequestDelta(base,head,compare([file]),proof).reason, 'exact-authorized-b11-split-reuse');
  assert.equal(classifyPullRequestDelta(base,head,compare([file,{filename:'docs/WORK_STATE.md'}]),proof).shouldRunLive,false);
});
test('other API edits, missing bytes, reversed transition and whitespace change fail open', () => {
  for (const bad of [undefined, {}, {...proof,before:before+'\n'}, {...proof,after:after+'\n'}, {...proof,before:after,after:before}, {...proof,after:after.replace('option.split','undefined')}, {...proof,beforeBlob:'3'.repeat(40)}]) {
    assert.equal(classifyPullRequestDelta(base,head,compare([file]),bad).shouldRunLive,true);
  }
});
test('mixed accumulated routing/tariff/geometry/response/UI/dependency changes stay strict', () => {
  for (const filename of ['lib/v3-calculation/special-options.ts','data/tolls/m4-current.json','data/special-territory-boundaries.json','app/api/v2/calculate/route.ts','app/v2/components/address-field.tsx','app/v3/page.tsx','package.json','pnpm-lock.yaml','experiments/nationwide-tolls/engine/quote.mjs']) {
    assert.equal(classifyPullRequestDelta(base,head,compare([file,{filename,status:'modified'}]),proof).shouldRunLive,true,filename);
  }
});
test('missing/truncated/nonlinear diff, rename and wrong blob never get exception', () => {
  for(const c of [null,{status:'diverged',files:[file]},compare(Array(300).fill(file)),compare([{...file,status:'renamed',previous_filename:'lib/a.ts'}]),compare([{...file,patch:undefined}]),compare([{...file,sha:'4'.repeat(40)}]),compare([file,file]),compare([file,{filename:undefined}])]) {
    assert.equal(classifyPullRequestDelta(base,head,c,proof).shouldRunLive,true);
  }
});
