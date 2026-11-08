import { withinRoutingSignal } from "./routing-deadline";
const responseStatuses = new WeakMap<object, number>();
export function withRoutingResponseStatus<T extends object>(route: T, status: number): T {
  responseStatuses.set(route, status); return route;
}
export function routingResponseStatus(route: object): number | null { return responseStatuses.get(route) ?? null; }
/** Safe request-local diagnostics. Never include URLs, coordinates or exception messages. */
export type RoutingFailure = "rate_limited" | "upstream_http" | "timeout" | "cancelled" | "network" | "invalid_json" | "invalid_response" | "no_route" | "insufficient_geometry" | "invalid_geometry" | "corridor_rejected" | "quality_rejected" | "internal";
export class RoutingProviderError extends Error {
  readonly failure: RoutingFailure;
  readonly httpStatus: number | null;
  constructor(failure: RoutingFailure, httpStatus: number | null = null, legacyCode = "ROUTE_UNAVAILABLE") {
    super(legacyCode);
    this.failure = failure; this.httpStatus = httpStatus;
  }
}
export type RoutingAttempt = {
  provider: string; kind: "primary" | "bypass"; status: "accepted" | "rejected";
  failure: RoutingFailure | null; httpStatus: number | null; elapsedMs: number;
  geometryUsable: boolean; validator: "accepted" | "rejected" | "not_run"; selected: boolean;
};
export function routingFailure(error: unknown): { failure: RoutingFailure; httpStatus: number | null } {
  if (error instanceof RoutingProviderError) return { failure: error.failure, httpStatus: error.httpStatus };
  if (error instanceof Error && error.cause instanceof Error && ["AbortError", "TimeoutError"].includes(error.cause.name)) return routingFailure(error.cause);
  const name = error instanceof Error ? error.name : "";
  const code = error instanceof Error ? error.message : "";
  const failure: RoutingFailure = name === "TimeoutError" ? "timeout" : name === "AbortError" ? "cancelled"
    : error instanceof SyntaxError || (error instanceof Error && error.cause instanceof SyntaxError) ? "invalid_json"
    : code === "ROUTE_NOT_FOUND" ? "no_route" : code === "INVALID_ROUTE_CANDIDATE" ? "invalid_geometry"
    : code === "ROUTE_CONTROLS_MISSED" ? "corridor_rejected"
    : code === "ROUTING_PLAN_LEG_STRETCH" || code === "SPECIAL_TRANSIT_EXCLUDED" ? "quality_rejected" : "internal";
  return { failure, httpStatus: null };
}
export async function routingFetch(url: URL, init: RequestInit & { next?: { revalidate: number } }): Promise<Response> {
  try {
    const response = await withinRoutingSignal(() => fetch(url, init), init.signal ?? undefined,
      late => { void late.body?.cancel().catch(() => undefined); });
    if (!response.ok) throw new RoutingProviderError(response.status === 429 ? "rate_limited" : "upstream_http", response.status);
    return response;
  } catch (error) {
    if (error instanceof RoutingProviderError) throw error;
    if (init.signal?.aborted) throw new RoutingProviderError(init.signal.reason?.name === "TimeoutError" ? "timeout" : "cancelled");
    throw new RoutingProviderError("network");
  }
}
