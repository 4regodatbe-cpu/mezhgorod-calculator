import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasValidProviderRouteGeometry, requireProviderRouteGeometry } from "../lib/provider-route-geometry.ts";

describe("provider route geometry validation", () => {
  it("accepts route coordinates with at least two valid WGS84 points", () => {
    assert.equal(hasValidProviderRouteGeometry([[37.6, 55.7], [38, 56]]), true);
  });

  it("rejects missing, empty, single-point, malformed, and out-of-range geometry", () => {
    for (const geometry of [undefined, null, [], [[37.6, 55.7]], [[37.6, 55.7], [181, 56]], [[37.6, 55.7], [38, Number.NaN]], [[37.6], [38, 56]]]) {
      assert.equal(hasValidProviderRouteGeometry(geometry), false);
      assert.throws(() => requireProviderRouteGeometry(geometry), /ROUTE_UNAVAILABLE/);
    }
  });
});
