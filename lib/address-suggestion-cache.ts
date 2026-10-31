import type { Suggestion } from "../app/v2/components/types.ts";

const MAX_ENTRIES = 128;
const DEFAULT_TTL_MS = 5 * 60 * 1000;
type Entry = { items: Suggestion[]; expiresAt: number };
const cache = new Map<string, Entry>();

function keyFor(query: string): string {
  return query.trim().toLocaleLowerCase("ru-RU").replace(/ё/gu, "е").replace(/\s+/gu, " ");
}

export function getCachedAddressSuggestions(query: string, now = Date.now()): Suggestion[] | null {
  const key = keyFor(query);
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= now) {
    cache.delete(key);
    return null;
  }
  cache.delete(key);
  cache.set(key, entry);
  return entry.items;
}

export function cacheAddressSuggestions(
  query: string,
  items: Suggestion[],
  { now = Date.now(), ttlMs = DEFAULT_TTL_MS, partial = false }: { now?: number; ttlMs?: number; partial?: boolean } = {},
): void {
  const key = keyFor(query);
  if (!key || !items.length || ttlMs <= 0 || partial) return;
  cache.delete(key);
  cache.set(key, { items, expiresAt: now + ttlMs });
  while (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value!);
}

export function clearAddressSuggestionCache(): void {
  cache.clear();
}
