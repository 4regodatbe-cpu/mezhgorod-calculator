import { createHash } from 'node:crypto';

export function requestKey(url, init) {
  return createHash('sha256').update(JSON.stringify([String(url), init?.method ?? 'GET', init?.body ?? null])).digest('hex');
}

export function recordingFetch(fetch, calls) {
  return async (url, init) => {
    // Reserve the slot before awaiting: retries must replay in request order.
    const item = { key: requestKey(url, init), url: String(url), method: init?.method ?? 'GET', body: init?.body ?? null };
    calls.push(item);
    const started = Date.now();
    try {
      const response = await fetch(url, init);
      Object.assign(item, { status: response.status, text: await response.clone().text(), contentType: response.headers.get('content-type'), retryAfter: response.headers.get('retry-after') });
      return response;
    } catch (error) {
      item.error = String(error);
      throw error;
    } finally { item.elapsedMs = Date.now() - started; }
  };
}

export function replayingFetch(calls) {
  const queues = new Map();
  for (const call of calls) {
    const queue = queues.get(call.key) ?? [];
    queue.push(call);
    queues.set(call.key, queue);
  }
  const misses = [];
  const fetch = async (url, init) => {
    const key = requestKey(url, init);
    const item = queues.get(key)?.shift();
    if (!item) {
      misses.push({ key, url: String(url) });
      throw new Error(`REPLAY_RESPONSE_MISSING:${key}`);
    }
    if (item.error) throw new Error(item.error);
    const headers = { 'content-type': item.contentType ?? 'application/json' };
    if (item.retryAfter != null) headers['retry-after'] = item.retryAfter;
    return new Response([204, 205, 304].includes(item.status) ? null : item.text, { status: item.status, headers });
  };
  return { fetch, misses };
}

export function pricingParity(live, replay) {
  const comparable = (output) => ({ traceComplete: output.traceComplete, tolls: output.tolls, audit: output.audit });
  return JSON.stringify(comparable(live)) === JSON.stringify(comparable(replay));
}

export function assessRoadCoverage(expectedRoads, evidence, traceComplete) {
  const proven = new Set(evidence.map(item => item.road));
  const missing = expectedRoads.filter(road => !proven.has(road));
  return { expectedRoads, provenRoads: [...proven], missingExpectedRoads: missing,
    status: !expectedRoads.length ? 'not-assigned' : !traceComplete ? 'trace-incomplete' : missing.length ? 'expected-road-not-proven' : 'traversal-proven' };
}

export function summarizePassageEvidence(evidence) {
  const counts = new Map();
  const samples = [];
  for (const item of evidence) {
    if (item.kind !== 'selected-paid-edge') { samples.push(item); continue; }
    if (!counts.has(item.road)) counts.set(item.road, { occurrences: 0, ways: new Set(), sampledWays: new Set() });
    const row = counts.get(item.road);
    row.occurrences++;
    if (item.wayId) row.ways.add(item.wayId);
    if (row.sampledWays.size < 3 && !row.sampledWays.has(item.wayId)) { samples.push(item); row.sampledWays.add(item.wayId); }
  }
  return { evidence: samples, counts: Object.fromEntries([...counts].map(([road, row]) => [road, { occurrences: row.occurrences, uniqueWays: row.ways.size }])) };
}
