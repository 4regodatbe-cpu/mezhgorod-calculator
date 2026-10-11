/**
 * Experimental selection contract for the next calculator version.
 * Route choice is based on travel time only. Toll data belongs to the chosen
 * candidate and must never cause a fallback to a slower route.
 */
export function selectFastestRoute(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error("ROUTE_UNAVAILABLE");
  }

  const valid = candidates.filter((candidate) =>
    candidate &&
    typeof candidate.id === "string" && candidate.id.length > 0 &&
    Number.isFinite(candidate.seconds) && candidate.seconds > 0 &&
    ["free", "priced", "unknown"].includes(candidate.tollStatus)
  );

  if (valid.length === 0) throw new Error("ROUTE_UNAVAILABLE");

  // Stable, deterministic tie-break: preserve provider order for equal times.
  const selected = valid.reduce((best, candidate) =>
    candidate.seconds < best.seconds ? candidate : best
  );

  return {
    route: selected,
    shownRouteCount: 1,
    tollStatus: selected.tollStatus,
    tollAmountRub: selected.tollStatus === "free"
      ? 0
      : selected.tollStatus === "priced" &&
        Number.isSafeInteger(selected.tollAmountRub) && selected.tollAmountRub >= 0
        ? selected.tollAmountRub
        : null,
  };
}
