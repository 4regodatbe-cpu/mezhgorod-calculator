import test from 'node:test';
import assert from 'node:assert/strict';
import type { TollValidation } from '../lib/toll-validator.ts';
import { recoverCorridorTolls } from '../lib/toll-recovery.ts';
import { composeRouteTolls } from '../lib/toll-engine/route-toll-composition.ts';
import { tollsForApi } from '../lib/v2-calculation/free-route-selection.ts';

const routeGeometry: [number, number][] = [
  [38.94, 55.85],
  [39.46, 55.98],
  [40.41, 56.13],
];

function validation(complete: boolean): TollValidation {
  return {
    status: 'toll',
    source: 'Valhalla map matching',
    tollEdgeCount: 1,
    checkedEdgeCount: complete ? 2 : 1,
    wayIds: ['fixture-way'],
    roadNames: ['М-12 Восток'],
    message: complete ? 'complete saved fixture' : 'partial saved fixture',
    chunkCount: 2,
    checkedChunkCount: complete ? 2 : 1,
    failedChunkCount: complete ? 0 : 1,
    complete,
    boothEventCoverage: complete ? 'complete' : 'partial',
  };
}

async function calculate(validationResult: TollValidation) {
  const { calculateLegTolls } = await import('../lib/v2-calculation/route-leg-pricing.ts');
  const { tollsForApi } = await import('../lib/v2-calculation/free-route-selection.ts');
  const originalFetch = globalThis.fetch;
  let networkCalls = 0;
  globalThis.fetch = async () => {
    networkCalls += 1;
    throw new Error('unexpected network request in offline trace regression');
  };

  try {
    const result = await calculateLegTolls({
      routeGeometry,
      routeSeconds: 4_800,
      departureAt: '2026-10-13T12:00:00+03:00',
      selectedFastProvider: 'Valhalla',
      selectedFastRoute: { meters: 180_000, seconds: 4_800 },
      valhallaEvidence: null,
      confirmedFreeRoute: null,
      diagnosticFastValidation: validationResult,
    });

    return {
      amount: result.tolls.amount,
      api: tollsForApi(result.tolls, result.fastValidation),
      fastValidation: result.fastValidation,
      corridorRecoveryDiagnostic: result.corridorRecoveryDiagnostic,
      networkCalls,
    };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test('complete trace does not turn an approximate subtotal into a public full fare', async () => {
  const result = await calculate(validation(true));

  assert.equal(result.corridorRecoveryDiagnostic?.subtotal.amount, 995);
  assert.equal(result.corridorRecoveryDiagnostic?.subtotal.weekdayAmount, 995);
  assert.ok(result.corridorRecoveryDiagnostic?.subtotal.segments.some((segment: string) => segment.includes('М-12:')));
  assert.equal(result.amount, 0);
  assert.equal(result.api.amount, null);
  assert.equal(result.api.weekdayAmount, null);
  assert.equal(result.api.weekendAmount, null);
  assert.equal(result.api.pricingStatus, 'unknown');
  assert.equal(result.fastValidation.complete, true);
  assert.equal(result.networkCalls, 0);
});

test('incomplete trace cannot use the permissive map-matched recovery threshold', async () => {
  const result = await calculate(validation(false));

  assert.equal(recoverCorridorTolls(routeGeometry, validation(false), '2026-10-13T12:00:00+03:00'), null);
  assert.equal(result.amount, 0);
  assert.equal(result.api.amount, null);
  assert.equal(result.api.pricingStatus, 'unknown');
  assert.equal(result.corridorRecoveryDiagnostic, null);
  assert.equal(result.fastValidation.complete, false);
  assert.equal(result.fastValidation.boothEventCoverage, 'partial');
  assert.equal(result.networkCalls, 0);
});

test('independently composed full fare remains priced when the trace is incomplete', () => {
  const completeFare = composeRouteTolls([{
    id: 'm11',
    detected: true,
    tolls: {
      amount: 4200,
      weekdayAmount: 4200,
      weekendAmount: 4940,
      period: 'M11 current tariff profile',
      segments: ['M11 verified directed full-route matrix pair'],
      confidence: 'matched',
    },
  }]);

  assert.equal(completeFare.status, 'priced');
  assert.deepEqual(completeFare.missing, []);
  const api = tollsForApi(completeFare.tolls!, validation(false));
  assert.equal(api.amount, 4200);
  assert.equal(api.pricingStatus, 'priced');
});
