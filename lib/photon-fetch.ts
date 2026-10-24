import type { PhotonFeature } from "./photon-address-search.ts";

// A valid live prefix response took 11.27 s. Ten seconds rejected usable
// results; retain a finite deadline without retrying seven requests at once.
export const PHOTON_REQUEST_TIMEOUT_MS = 20_000;

/** Bounded diagnostic labels only: never log query text, URLs or raw errors. */
export function photonFailureReason(reason: unknown): string {
  if (!(reason instanceof Error)) return "unknown";
  if (reason.message === "Photon request timed out") return "deadline";
  if (reason.message === "Photon request cancelled") return "cancelled";
  if (reason.message === "Photon source cooling down") return "source_cooldown";
  if (reason.message === "Photon request queue full") return "queue_full";
  if (reason.message === "Photon returned invalid features") return "invalid_response";
  if (/^Photon [45]\d{2}$/u.test(reason.message)) return `http_${reason.message.slice(7)}`;
  const cause = reason.cause as { code?: unknown } | undefined;
  if (cause?.code === "UND_ERR_CONNECT_TIMEOUT") return "connect_timeout";
  return "network_error";
}

type PhotonFetchInit = RequestInit & { next: { revalidate: number } };
type PhotonFetch = (input: string | URL | Request, init?: PhotonFetchInit) => Promise<Response>;

/** Fetch one Photon response with a hard deadline and caller cancellation. */
export async function fetchPhotonFeatures(
  url: string,
  { signal, fetchImpl = fetch as PhotonFetch, timeoutMs = PHOTON_REQUEST_TIMEOUT_MS }: {
    signal?: AbortSignal;
    fetchImpl?: PhotonFetch;
    timeoutMs?: number;
  } = {},
): Promise<PhotonFeature[]> {
  if (signal?.aborted) throw new Error("Photon request cancelled");
  const controller = new AbortController();
  let rejectAbort!: (reason: Error) => void;
  const cancelled = new Promise<never>((_, reject) => { rejectAbort = reject; });
  const abortFromCaller = () => {
    controller.abort(signal?.reason);
    rejectAbort(new Error("Photon request cancelled"));
  };
  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener("abort", abortFromCaller, { once: true });

  const request = (async () => {
    const response = await fetchImpl(url, {
      headers: { Accept: "application/json", "User-Agent": "MezhgorodCalculator/1.0" },
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error(`Photon ${response.status}`);
    const data = (await response.json()) as { features?: PhotonFeature[] };
    if (!Array.isArray(data.features)) throw new Error("Photon returned invalid features");
    return data.features;
  })();
  const timeout = setTimeout(() => {
    controller.abort(new Error("Photon request timed out"));
    rejectAbort(new Error("Photon request timed out"));
  }, timeoutMs);

  try {
    return await Promise.race([request, cancelled]);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}
