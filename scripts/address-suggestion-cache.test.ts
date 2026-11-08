import assert from "node:assert/strict";
import test from "node:test";
import { cacheAddressSuggestions, clearAddressSuggestionCache, getCachedAddressSuggestions } from "../lib/address-suggestion-cache.ts";
import type { Suggestion } from "../app/v2/components/types.ts";

const item: Suggestion = {
  id: "R-1",
  title: "Краснодар",
  label: "Краснодар, Россия",
  region: "Россия",
  position: { lat: 45.035, lng: 38.977 },
};

test("address cache shares exact query results across fields and normalizes case and whitespace", () => {
  clearAddressSuggestionCache();
  cacheAddressSuggestions("  Краснодар ", [item], { now: 100 });
  assert.deepEqual(getCachedAddressSuggestions("краснодар", 101), [item]);
  assert.deepEqual(getCachedAddressSuggestions("КРАСНОДАР", 101), [item]);
});

test("address cache expires entries and does not retain empty results", () => {
  clearAddressSuggestionCache();
  cacheAddressSuggestions("Москва", [item], { now: 100, ttlMs: 20 });
  assert.deepEqual(getCachedAddressSuggestions("Москва", 119), [item]);
  assert.equal(getCachedAddressSuggestions("Москва", 120), null);
  cacheAddressSuggestions("Неведомый адрес", [], { now: 100 });
  assert.equal(getCachedAddressSuggestions("Неведомый адрес", 101), null);
});

test("address cache evicts the least recently used entry when the bound is exceeded", () => {
  clearAddressSuggestionCache();
  for (let i = 0; i < 128; i++) cacheAddressSuggestions(`Город ${i}`, [item], { now: 1_000 });
  assert.deepEqual(getCachedAddressSuggestions("Город 0", 1_001), [item]);
  cacheAddressSuggestions("Город 128", [item], { now: 1_000 });
  assert.equal(getCachedAddressSuggestions("Город 1", 1_001), null);
  assert.deepEqual(getCachedAddressSuggestions("Город 0", 1_001), [item]);
});
