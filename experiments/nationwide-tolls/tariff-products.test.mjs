import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('./', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('tariff-products.json', root)));
const registry = JSON.parse(readFileSync(new URL('national-registry.json', root)));

test('each known network has a unique tariff product or an explicit unresolved aggregate', () => {
  const productIds = catalog.products.map(product => product.id);
  assert.equal(new Set(productIds).size, productIds.length);
  const networkIds = new Set(registry.networks.map(network => network.id));
  for (const product of catalog.products) {
    assert.ok(networkIds.has(product.registryId), product.id);
    for (const key of ['boundary', 'matrix', 'overlap']) assert.ok(product[key], `${product.id}: ${key}`);
  }
  const mapped = new Set([...catalog.products, ...catalog.unresolvedAggregates].map(item => item.registryId));
  assert.deepEqual([...networkIds].filter(id => !mapped.has(id)), []);
  assert.deepEqual(catalog.unresolvedAggregates.map(item => item.registryId), ['pskov']);
});

test('connected corridors and overlapping tariffs have distinct identities', () => {
  const ids = new Set(catalog.products.map(product => product.id));
  for (const id of ['m4', 'a289', 'krasnodar-west-bypass', 'm11-15-58', 'm11-58-679', 'm11-679-684', 'zsd', 'shmsd']) assert.ok(ids.has(id));
  assert.deepEqual(catalog.routeComponentKey, [
    'selectedRouteId', 'selectedGeometry', 'productId', 'firstPaymentBoundary',
    'lastPaymentBoundary', 'departureAt', 'vehicleCategory', 'paymentProfile',
  ]);
});
