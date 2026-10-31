// Research only: never imported by app/lib; disabled unless explicitly enabled.
// Results are review candidates, NOT public address suggestions or precise fixes.
function reviewedSourceMetadata(source, apiKey) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null;
  const result = {};
  // Provider debug/raw request metadata is not safe provenance for export.
  for (const field of ['sourcename', 'attribution', 'license', 'url']) {
    const value = source[field];
    if (typeof value !== 'string' || !value.trim() || value.length > 2048 || value.includes(apiKey)) continue;
    if (field === 'url') {
      try { const url = new URL(value); if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) continue; }
      catch { continue; }
    }
    result[field] = value;
  }
  return Object.keys(result).length ? result : null;
}
export async function researchFallback({ enabled = false, photon, query, apiKey,
  deadline, signal, fetchImpl = globalThis.fetch, now = Date.now } = {}) {
  const stop = (reason) => ({ status: reason, candidates: [] });
  if (!enabled) return stop('disabled');
  // Empty success and partial success MUST NOT cause a second-provider lookup.
  if (photon?.unavailable !== true) return stop('primary-not-unavailable');
  if (signal?.aborted) return stop('cancelled');
  if (!Number.isFinite(deadline) || deadline <= now()) return stop('budget-exhausted');
  if (typeof apiKey !== 'string' || !apiKey.trim()) return stop('credentials-required');
  if (typeof query !== 'string' || query.trim().length < 3 || query.length > 200) return stop('invalid-query');
  const timeout = AbortSignal.timeout(Math.max(1, Math.min(2000, Math.floor(deadline - now()))));
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete');
  // Do not force countrycode:ru: disputed/regional coverage needs explicit review.
  for (const [key, value] of Object.entries({ text: query.trim(), type: 'city', lang: 'ru', limit: '5', format: 'json', apiKey })) url.searchParams.set(key, value);
  try {
    // Race even a non-cooperative test transport; production fetch also gets signal.
    let abort;
    const cancelled = new Promise((_, reject) => {
      abort = () => reject(new Error('cancelled'));
      if (combined.aborted) abort(); else combined.addEventListener('abort', abort, { once: true });
    });
    try {
      const response = await Promise.race([fetchImpl(url, { signal: combined }), cancelled]);
      if (!response.ok) return stop(`provider-http-${response.status}`);
      const body = await Promise.race([response.json(), cancelled]);
      if (combined.aborted || now() >= deadline) return stop('budget-exhausted');
      if (!Array.isArray(body?.results) || body.results.length > 5) return stop('invalid-response');
      const candidates = [];
      const ids = new Set();
      for (const row of body.results) {
        const { place_id: id, lat, lon, city, state, county, country, formatted } = row ?? {};
        if (typeof id !== 'string' || !id || ids.has(id) || ![lat, lon].every(Number.isFinite) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || row.result_type !== 'city' || ![city, state, country, formatted].every(value => typeof value === 'string' && value.trim().length > 0 && value.length <= 1000)) continue;
        if ([id, city, state, country, formatted].some(value => value.includes(apiKey))) continue;
        ids.add(id);
        candidates.push({ provider: 'geoapify', id, city, state,
          county: typeof county === 'string' && county.length <= 1000 && !county.includes(apiKey) ? county : null, country,
          label: formatted, position: { lat, lng: lon }, precision: 'provider-reported-city-center',
          reviewRequired: true, datasource: reviewedSourceMetadata(row.datasource, apiKey) });
      }
      return { status: candidates.length ? 'unreviewed-candidates' : 'no-admissible-candidates', candidates,
        attributionRequired: ['Geoapify', 'OpenStreetMap contributors'], publicUseApproved: false };
    } finally { combined.removeEventListener('abort', abort); }
  } catch {
    // Never expose request URLs/API keys or upstream exception bodies.
    return stop(signal?.aborted ? 'cancelled' : timeout.aborted ? 'budget-exhausted' : 'provider-error');
  }
}
