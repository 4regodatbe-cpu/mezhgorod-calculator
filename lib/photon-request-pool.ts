import { fetchPhotonFeatures } from "./photon-fetch";
import type { PhotonFeature } from "./photon-address-search";

type FeaturesFetch = (url: string, options: { signal?: AbortSignal }) => Promise<PhotonFeature[]>;
type Subscriber = { resolve: (features: PhotonFeature[]) => void; reject: (error: unknown) => void; cleanup: () => void };
type Task = { url: string; origin: string; controller: AbortController; subscribers: Set<Subscriber>; started: boolean };
const cancelled = () => new Error("Photon request cancelled");

/** Process-local only. One user's cancellation never aborts another user's
 * identical request. No retries, new providers or background probes. */
export function createPhotonRequestPool({ fetchFeatures = fetchPhotonFeatures, concurrency = 2, maxQueued = 64,
  maxCacheEntries = 128, cacheTtlMs = 300_000, cooldownMs = 15_000, now = Date.now }: {
    fetchFeatures?: FeaturesFetch; concurrency?: number; maxQueued?: number;
    maxCacheEntries?: number; cacheTtlMs?: number; cooldownMs?: number; now?: () => number;
  } = {}) {
  for (const n of [concurrency, maxQueued, maxCacheEntries, cacheTtlMs, cooldownMs]) {
    if (!Number.isSafeInteger(n) || n <= 0) throw new RangeError("Photon pool limits must be positive integers");
  }
  const tasks = new Map<string, Task>(), queue: Task[] = [];
  const cache = new Map<string, { features: PhotonFeature[]; expiresAt: number }>();
  const pausedUntil = new Map<string, number>();
  let active = 0;
  const counts = { started: 0, sharedJoins: 0, cacheHits: 0, queueRejected: 0, circuitRejected: 0, cancelledSubscribers: 0 };

  function finish(task: Task, features: PhotonFeature[] | null, error?: unknown) {
    if (tasks.get(task.url) === task) tasks.delete(task.url);
    for (const sub of task.subscribers) {
      sub.cleanup();
      if (features) sub.resolve(features); else sub.reject(error);
    }
    task.subscribers.clear();
  }
  async function run(task: Task) {
    try {
      if (task.controller.signal.aborted || !task.subscribers.size) throw cancelled();
      counts.started++;
      const features = await fetchFeatures(task.url, { signal: task.controller.signal });
      if (features.length && task.subscribers.size && !task.controller.signal.aborted) {
        cache.delete(task.url);
        cache.set(task.url, { features, expiresAt: now() + cacheTtlMs });
        while (cache.size > maxCacheEntries) cache.delete(cache.keys().next().value!);
      }
      finish(task, features);
    } catch (error) {
      if (!task.controller.signal.aborted && error instanceof Error && /^Photon (429|503)$/u.test(error.message)) {
        pausedUntil.set(task.origin, now() + cooldownMs);
      }
      finish(task, null, error);
    } finally { active--; pump(); }
  }
  function pump() {
    while (active < concurrency && queue.length) {
      const task = queue.shift()!;
      if (!task.subscribers.size) continue;
      if ((pausedUntil.get(task.origin) ?? 0) > now()) {
        counts.circuitRejected++;
        finish(task, null, new Error("Photon source cooling down")); continue;
      }
      task.started = true; active++;
      // Defer actual fetch so cancellation in the same turn can still stop it.
      void Promise.resolve().then(() => run(task));
    }
  }
  function get(url: string, { signal }: { signal?: AbortSignal } = {}): Promise<PhotonFeature[]> {
    if (signal?.aborted) return Promise.reject(cancelled());
    const cached = cache.get(url);
    if (cached && cached.expiresAt > now()) {
      cache.delete(url); cache.set(url, cached); counts.cacheHits++;
      return Promise.resolve(cached.features);
    }
    cache.delete(url);
    const origin = new URL(url).origin;
    if ((pausedUntil.get(origin) ?? 0) > now()) {
      counts.circuitRejected++; return Promise.reject(new Error("Photon source cooling down"));
    }
    let task = tasks.get(url);
    const existing = Boolean(task);
    if (!task && queue.length >= maxQueued) {
      counts.queueRejected++; return Promise.reject(new Error("Photon request queue full"));
    }
    if (!task) {
      task = { url, origin, controller: new AbortController(), subscribers: new Set(), started: false };
      tasks.set(url, task);
    } else counts.sharedJoins++;
    const target = task;
    const pending = new Promise<PhotonFeature[]>((resolve, reject) => {
      const sub: Subscriber = { resolve, reject, cleanup: () => signal?.removeEventListener("abort", onAbort) };
      const onAbort = () => {
        if (!target.subscribers.delete(sub)) return;
        sub.cleanup(); counts.cancelledSubscribers++; reject(cancelled());
        if (!target.subscribers.size) {
          if (tasks.get(url) === target) tasks.delete(url);
          const index = queue.indexOf(target);
          if (index >= 0) queue.splice(index, 1);
          target.controller.abort();
        }
      };
      target.subscribers.add(sub);
      signal?.addEventListener("abort", onAbort, { once: true });
    });
    if (!existing) queue.push(target);
    pump();
    return pending;
  }
  return { get, stats: () => ({ ...counts, active, queued: queue.length, inFlight: tasks.size, cached: cache.size }) };
}
