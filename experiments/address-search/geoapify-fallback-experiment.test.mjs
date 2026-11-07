import test from 'node:test';
import assert from 'node:assert/strict';
import { researchFallback } from './geoapify-fallback-experiment.mjs';
const row = (id, state) => ({ place_id: id, city: 'Test city', state, country: 'Test country',
  formatted: `Test city, ${state}`, lat: 1, lon: 2, result_type: 'city' });
const options = (extra = {}) => ({ enabled: true, photon: { unavailable: true }, query: 'Test city',
  apiKey: 'synthetic-test-key', deadline: Date.now() + 1000,
  fetchImpl: async () => Response.json({ results: [row('one', 'Region A'), row('two', 'Region B')] }), ...extra });
test('disabled default makes zero requests', async () => {
  let calls = 0;
  assert.equal((await researchFallback({ ...options(), enabled: undefined, fetchImpl: () => calls++ })).status, 'disabled');
  assert.equal(calls, 0);
});
test('full Photon 503 and 429 permit isolated candidate research without public admission', async () => {
  for (const code of [503, 429]) {
    const result = await researchFallback(options({ photon: { unavailable: true, failures: { [`http_${code}`]: 7 } } }));
    assert.equal(result.status, 'unreviewed-candidates');
    assert.equal(result.publicUseApproved, false);
    assert.equal(result.candidates.length, 2);
    assert.notEqual(result.candidates[0].id, result.candidates[1].id);
    assert.notEqual(result.candidates[0].label, result.candidates[1].label);
    assert.ok(result.candidates.every(x => x.reviewRequired && x.precision === 'provider-reported-city-center'));
  }
});
test('empty/partial successful primary and missing status never trigger fallback', async () => {
  for (const photon of [undefined, { unavailable: false, features: [] }, { unavailable: false, failures: { http_503: 3 } }]) {
    let calls = 0;
    assert.equal((await researchFallback(options({ photon, fetchImpl: () => calls++ }))).status, 'primary-not-unavailable');
    assert.equal(calls, 0);
  }
});
test('missing credentials and expired budget do not request provider', async () => {
  assert.equal((await researchFallback(options({ apiKey: '' }))).status, 'credentials-required');
  assert.equal((await researchFallback(options({ deadline: 0 }))).status, 'budget-exhausted');
});
test('cancellation before and during transport is propagated', async () => {
  const controller = new AbortController(); controller.abort();
  assert.equal((await researchFallback(options({ signal: controller.signal }))).status, 'cancelled');
  const active = new AbortController();
  const result = researchFallback(options({ signal: active.signal, fetchImpl: () => new Promise(() => {}) }));
  active.abort(); assert.equal((await result).status, 'cancelled');
});
test('HTTP failures and exception messages cannot leak credentials', async () => {
  assert.equal((await researchFallback(options({ fetchImpl: async () => new Response('', { status: 429 }) }))).status, 'provider-http-429');
  const result = await researchFallback(options({ fetchImpl: async () => { throw Error('synthetic-test-key'); } }));
  assert.equal(result.status, 'provider-error'); assert.ok(!JSON.stringify(result).includes('synthetic-test-key'));
});
test('invalid coordinates, missing administrative labels, wrong precision and duplicates rejected', async () => {
  const result = await researchFallback(options({ fetchImpl: async () => Response.json({ results: [row('one', 'Region'), row('one', 'Region'), { ...row('bad', 'Region'), lat: 91 }, row('missing', ''), { ...row('street', 'Region'), result_type: 'street' }] }) }));
  assert.deepEqual(result.candidates.map(x => x.id), ['one']);
});
test('request is one bounded city lookup, not a country-restricted approximate address', async () => {
  let calls = 0;
  await researchFallback(options({ fetchImpl: async (url, init) => {
    calls++; assert.equal(url.origin, 'https://api.geoapify.com');
    assert.equal(url.searchParams.get('type'), 'city'); assert.equal(url.searchParams.get('limit'), '5');
    assert.equal(url.searchParams.has('filter'), false); assert.ok(init.signal instanceof AbortSignal);
    return Response.json({ results: [] });
  } }));
  assert.equal(calls, 1);
});
test('deadline during body parsing cannot admit late coordinates', async () => {
  let time = 0;
  const result = await researchFallback(options({ now: () => time, deadline: 1000,
    fetchImpl: async () => ({ ok: true, json: async () => { time = 1000; return { results: [row('late', 'Region')] }; } }) }));
  assert.equal(result.status, 'budget-exhausted'); assert.deepEqual(result.candidates, []);
});
test('provider metadata cannot echo API key or credential-bearing URLs into research results', async () => {
  const key='synthetic-test-key';
  const result=await researchFallback(options({fetchImpl:async()=>Response.json({results:[{
    ...row('one','Region'),datasource:{sourcename:'openstreetmap',attribution:'OSM contributors',
      license:'ODbL',url:`https://example.invalid/?apiKey=${key}`,debug:{key}},
  }]})}));
  assert.ok(!JSON.stringify(result).includes(key));
  assert.equal(result.candidates[0].datasource.sourcename,'openstreetmap');
});
