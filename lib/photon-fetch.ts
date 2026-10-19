import type { PhotonFeature } from "./photon-address-search.ts";

export const PHOTON_REQUEST_TIMEOUT_MS = 10_000;

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
