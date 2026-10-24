// Test-only mutation hook; never imported by the app or a normal test run.
import {registerHooks} from 'node:module';
registerHooks({load(url, context, nextLoad) {
  if (url.endsWith('/lib/v3-calculation/zsd-reentry-policy.ts')) {
    return {format: 'module', source: 'export function hasReviewedZsdReentry() { return false; }', shortCircuit: true};
  }
  return nextLoad(url, context);
}});
