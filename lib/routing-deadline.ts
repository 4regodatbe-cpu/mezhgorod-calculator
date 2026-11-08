/** Bounds even non-cooperative transports; late settlements cannot update the caller. */
export function withinRoutingSignal<T>(operation: () => Promise<T>, signal?: AbortSignal, discard?: (value: T) => void): Promise<T> {
  if (!signal) return operation();
  return new Promise<T>((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const abort = () => reject(signal.reason);
    signal.addEventListener("abort", abort, { once: true });
    void Promise.resolve().then(() => {
      signal.throwIfAborted();
      return operation();
    }).then(value => { if (signal.aborted) discard?.(value); else resolve(value); }, reject).finally(() => signal.removeEventListener("abort", abort));
  });
}

export const V3_CALCULATION_BUDGET_MS = 90_000;
export function calculationSignal(caller: AbortSignal, budgetMs = V3_CALCULATION_BUDGET_MS) {
  return AbortSignal.any([caller, AbortSignal.timeout(budgetMs)]);
}
