import switches from "../data/toll-feature-switches.json";
import { setMaxListeners } from "node:events";
import { photonSearchUrls, type PhotonFeature } from "./photon-address-search";
import { fetchPhotonFeatures, photonFailureReason } from "./photon-fetch";
import { createPhotonRequestPool } from "./photon-request-pool";

export const ADDRESS_SEARCH_BUDGET_MS = 20_000;
const pool = createPhotonRequestPool();
type FeaturesFetch = (url: string, options: { signal?: AbortSignal }) => Promise<PhotonFeature[]>;
const optionalFetch: FeaturesFetch = (url, options) => switches.addressRequestPool
  ? pool.get(url, options) : fetchPhotonFeatures(url, options);

/** Same URL coverage and ranking inputs, bounded including time in the queue.
 * Partial provider failures retain completed positive results. */
export async function collectAddressFeatures(query: string, { signal, fetchFeatures = optionalFetch,
  budgetMs = ADDRESS_SEARCH_BUDGET_MS }: { signal?: AbortSignal; fetchFeatures?: FeaturesFetch; budgetMs?: number } = {}) {
  if (!Number.isFinite(budgetMs) || budgetMs <= 0) throw new RangeError("Address budget must be positive and finite");
  const urls = photonSearchUrls(query);
  const controller = new AbortController();
  // Two bounded listeners per variant: collector + shared-pool subscriber.
  setMaxListeners(Math.max(10, urls.length * 3), controller.signal);
  const cancel = () => controller.abort();
  let budgetExpired = false;
  if (signal?.aborted) cancel(); else signal?.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(() => { budgetExpired = true; controller.abort(); }, budgetMs);
  try {
    const outcomes = await Promise.allSettled(urls.map(url => {
      // Bound also injected/non-cooperative fetches without awaiting their body
      // after the caller/query deadline. The production fetch has its own bound.
      return new Promise<PhotonFeature[]>((resolve, reject) => {
        const abort = () => reject(new Error("Photon request cancelled"));
        if (controller.signal.aborted) { abort(); return; }
        controller.signal.addEventListener("abort", abort, { once: true });
        void Promise.resolve().then(() => {
          if (controller.signal.aborted) throw new Error("Photon request cancelled");
          return fetchFeatures(url, { signal: controller.signal });
        }).then(resolve, reject).finally(() => controller.signal.removeEventListener("abort", abort));
      });
    }));
    const features = outcomes.flatMap(outcome => outcome.status === "fulfilled" ? outcome.value : []);
    const failures: Record<string, number> = {};
    for (const outcome of outcomes) if (outcome.status === "rejected") {
      const reason = budgetExpired && photonFailureReason(outcome.reason) === "cancelled" ? "budget" : photonFailureReason(outcome.reason);
      failures[reason] = (failures[reason] ?? 0) + 1;
    }
    return { features, sourceCount: urls.length, failures, budgetExpired,
      unavailable: outcomes.every(outcome => outcome.status === "rejected") };
  } finally { clearTimeout(timer); signal?.removeEventListener("abort", cancel); }
}
