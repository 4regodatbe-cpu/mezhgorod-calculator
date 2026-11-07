import test from "node:test";
import assert from "node:assert/strict";
import { routingFetch, routingFailure, RoutingProviderError } from "../lib/routing-attempt";
import { osrmRoute } from "../lib/route-providers";
import { createCalculationTiming } from "../lib/calculation-timing";

test("provider outcomes preserve upstream status without leaking response bodies or URLs", async () => {
  const original = globalThis.fetch;
  try {
    for (const status of [429, 500, 502, 503, 504]) {
      globalThis.fetch = async () => new Response("secret provider body", { status });
      await assert.rejects(routingFetch(new URL("https://example.test/private?key=secret"), {}), error => {
        assert.deepEqual(routingFailure(error), { failure: status === 429 ? "rate_limited" : "upstream_http", httpStatus: status });
        assert.equal((error as Error).message, "ROUTE_UNAVAILABLE"); return true;
      });
    }
    globalThis.fetch = async () => { throw new TypeError("private DNS hostname"); };
    await assert.rejects(routingFetch(new URL("https://example.test"), {}), error => routingFailure(error).failure === "network");
    for (const name of ["TimeoutError", "AbortError"]) {
      const controller = new AbortController(); controller.abort(new DOMException("private reason", name));
      await assert.rejects(routingFetch(new URL("https://example.test"), { signal: controller.signal }), error => routingFailure(error).failure === (name === "TimeoutError" ? "timeout" : "cancelled"));
    }
  } finally { globalThis.fetch = original; }
});

test("OSRM malformed JSON, absent route and insufficient geometry remain distinct", async () => {
  const original = globalThis.fetch;
  const from = { label: "A", position: { lng: 37, lat: 55 } };
  const to = { label: "B", position: { lng: 38, lat: 56 } };
  try {
    for (const [body, failure] of [["{", "invalid_json"], ["{}", "invalid_response"], [JSON.stringify({code:"NoRoute",routes:[]}), "no_route"], [JSON.stringify({routes:[{distance:100,time:1,duration:10,geometry:{coordinates:[]}}]}), "insufficient_geometry"]]) {
      globalThis.fetch = async () => new Response(body);
      await assert.rejects(osrmRoute(from, to), error => { assert.equal(routingFailure(error).failure, failure); return true; });
    }
  } finally { globalThis.fetch = original; }
});

test("safe request-local summary retains selection and validation independently", () => {
  const timing = createCalculationTiming({ enabled: true, logger: () => undefined });
  timing.recordRoutingAttempt({ provider: "OSRM", kind: "primary", status: "accepted", failure: null, httpStatus: 200, elapsedMs: 5, geometryUsable: true, validator: "accepted", selected: true });
  assert.equal(timing.finish(200)?.summary.routingAttempts?.[0].selected, true);
  assert.deepEqual(routingFailure(new Error("ROUTE_CONTROLS_MISSED")), {failure:"corridor_rejected",httpStatus:null});
  assert.equal(routingFailure(new RoutingProviderError("timeout")).failure, "timeout");
});
