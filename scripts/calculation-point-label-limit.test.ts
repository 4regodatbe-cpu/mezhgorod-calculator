import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST as postV2 } from "../app/api/v2/calculate/route.ts";
import { POST as postV3 } from "../app/api/v3/calculate/route.ts";
import { MAX_ROUTE_POINT_LABEL_CHARS, validPoint } from "../lib/route-input-validation.ts";

const endpoints = [["V2", "/api/v2/calculate", postV2], ["V3", "/api/v3/calculate", postV3]] as const;
const request = (path: string, body: unknown) => new NextRequest(`http://localhost${path}`, {
  method: "POST",
  body: JSON.stringify(body),
});

test("route label bound counts Unicode code points and accepts the exact limit", () => {
  assert.equal(MAX_ROUTE_POINT_LABEL_CHARS, 256);
  assert.equal(validPoint({ label: "я".repeat(256) }), true);
  assert.equal(validPoint({ label: "я".repeat(257) }), false);
  assert.equal(validPoint({ label: "😀".repeat(256) }), true);
  assert.equal(validPoint({ label: "😀".repeat(257) }), false);
});

test("V2/V3 reject overlong address labels before external requests", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; return Response.json({}, { status: 503 }); };
  try {
    for (const [name, path, post] of endpoints) {
      const from = { label: "x".repeat(257), position: { lat: 48, lng: 37 } };
      const to = { label: "B", position: { lat: 49, lng: 38 } };
      const response = await post(request(path, { from, to }));
      assert.equal(response.status, 400, `${name} rejects 257 Unicode characters`);
      assert.equal(calls, 0, `${name} rejects before geocoding/routing`);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
