import { performance } from "node:perf_hooks";

function timeoutError(budget) {
  const error = new Error(budget ? "Address probe total time budget exhausted" : "Address source request/body timed out");
  error.name = budget ? "ProbeBudgetError" : "ProbeTimeoutError";
  return error;
}

// The race bounds both response headers and JSON consumption, even for a mock
// or source that ignores cancellation. Abort also closes a real fetch/socket.
export async function fetchJsonWithin(url, {
  fetchImpl = globalThis.fetch,
  timeoutMs = 10_000,
  deadlineAt = Infinity,
} = {}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || Number.isNaN(deadlineAt)) {
    throw new RangeError("A positive finite request timeout and valid deadline are required");
  }
  const remaining = deadlineAt - performance.now();
  if (remaining <= 0) throw timeoutError(true);
  const controller = new AbortController();
  let response;
  let timer;
  const expiry = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = timeoutError(remaining <= timeoutMs);
      reject(error);
      controller.abort(error);
      // A body already locked by json() is stopped by abort; unlocked bodies
      // can also be cancelled. Cancellation failure must not mask the timeout.
      if (response?.body) void response.body.cancel().catch(() => {});
    }, Math.min(timeoutMs, remaining));
  });
  try {
    return await Promise.race([
      (async () => {
        response = await fetchImpl(url, {
          headers: { Accept: "application/json", "User-Agent": "MezhgorodCalculator/1.0" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Photon HTTP ${response.status}`);
        return await response.json();
      })(),
      expiry,
    ]);
  } catch (error) {
    controller.abort(error);
    if (response?.body && !response.body.locked) void response.body.cancel().catch(() => {});
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
