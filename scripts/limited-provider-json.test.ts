import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readLimitedProviderJson } from "../lib/limited-provider-json.ts";

function responseFrom(chunks: Uint8Array[], afterChunks?: Error): Response {
  let index = 0;
  return new Response(new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index < chunks.length) controller.enqueue(chunks[index++]);
      else if (afterChunks) controller.error(afterChunks);
      else controller.close();
    },
  }));
}

describe("readLimitedProviderJson", () => {
  it("parses valid JSON split across chunks at the exact byte limit", async () => {
    const bytes = new TextEncoder().encode('{"ok":true}');
    const value = await readLimitedProviderJson<{ ok: boolean }>(responseFrom([bytes.slice(0, 4), bytes.slice(4)]), bytes.byteLength);
    assert.deepEqual(value, { ok: true });
  });

  it("rejects oversized actual streamed bytes and cancels the remaining body", async () => {
    let cancelled = false;
    const response = new Response(new ReadableStream<Uint8Array>({
      pull(controller) { controller.enqueue(new Uint8Array(5)); },
      cancel() { cancelled = true; },
    }));
    await assert.rejects(readLimitedProviderJson(response, 4), /ROUTE_UNAVAILABLE/);
    assert.equal(cancelled, true);
  });

  it("rejects empty, truncated, malformed, and invalid UTF-8 responses as upstream failures", async () => {
    for (const body of ["", "{\"route\":", "not-json"]) {
      await assert.rejects(readLimitedProviderJson(new Response(body)), /ROUTE_UNAVAILABLE/);
    }
    await assert.rejects(readLimitedProviderJson(responseFrom([new Uint8Array([0xff])])), /ROUTE_UNAVAILABLE/);
  });

  it("maps interrupted body reads to the same safe upstream failure", async () => {
    await assert.rejects(readLimitedProviderJson(responseFrom([new TextEncoder().encode("{")], new Error("connection reset"))), /ROUTE_UNAVAILABLE/);
  });
});
