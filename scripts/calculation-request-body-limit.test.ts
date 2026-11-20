import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST as postV2 } from "../app/api/v2/calculate/route.ts";
import { POST as postV3 } from "../app/api/v3/calculate/route.ts";

const MAX_BYTES = 16 * 1024;
const endpoints = [["V2", "/api/v2/calculate", postV2], ["V3", "/api/v3/calculate", postV3]] as const;
const request = (path: string, body: string, headers: HeadersInit = {}) => new NextRequest(`http://localhost${path}`, {
  method: "POST",
  headers,
  body,
});

test("V2/V3 reject oversized request JSON before calling external providers", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; return Response.json({ features: [] }); };
  try {
    for (const [name, path, post] of endpoints) {
      const prefix = JSON.stringify({ from: { label: "A" }, to: { label: "B" } });
      const oversized = prefix + " ".repeat(MAX_BYTES + 1 - new TextEncoder().encode(prefix).length);
      assert.ok(new TextEncoder().encode(oversized).length > MAX_BYTES);
      const response = await post(request(path, oversized, name === "V3" ? { "content-length": "1" } : {}));
      assert.equal(response.status, 413, `${name} oversized body`);
      assert.equal(calls, 0, `${name} rejects before external calls`);
      const declaredOversized = await post(request(path, prefix, { "content-length": String(MAX_BYTES + 1) }));
      assert.equal(declaredOversized.status, 413, `${name} declared oversized body`);
      assert.equal(calls, 0, `${name} declared size rejects before external calls`);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("V2/V3 report malformed JSON and non-object JSON as client input errors", async () => {
  for (const [name, path, post] of endpoints) {
    for (const body of ["{", "null", "[]"]) {
      const response = await post(request(path, body));
      assert.equal(response.status, 400, `${name} body=${body}`);
      assert.equal(typeof (await response.json()).error, "string");
    }
  }
});
