import test from 'node:test';
import assert from 'node:assert/strict';
import type { TollValidation } from '../lib/toll-validator.ts';

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
      selectedFastRoute: { coordinates: routeGeometry, meters: 180_000, seconds: 4_800 },
      valhallaEvidence: null,
      confirmedFreeRoute: null,
      diagnosticFastValidation: validationResult,
    });

    return {
      amount: result.tolls.amount,
      api: tollsForApi(result.tolls, result.fastValidation),
      fastValidation: result.fastValidation,
      networkCalls,
    };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test('complete saved trace fixture characterizes V2 recovery and public pricing', async () => {
  const result = await calculate(validation(true));

  assert.equal(result.amount, 995);
  assert.equal(result.api.pricingStatus, 'priced');
  assert.equal(result.fastValidation.complete, true);
  assert.equal(result.networkCalls, 0);
});

test('incomplete saved trace fixture reproduces positive V2 recovery exposed as priced', async () => {
  const result = await calculate(validation(false));

  assert.equal(result.amount, 995);
  assert.equal(result.api.pricingStatus, 'priced');
  assert.equal(result.fastValidation.complete, false);
  assert.equal(result.fastValidation.boothEventCoverage, 'partial');
  assert.equal(result.networkCalls, 0);
});
