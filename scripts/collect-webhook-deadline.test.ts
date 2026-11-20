import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/collect/route.ts";

const request = () => new NextRequest("http://localhost/api/collect", {
  method: "POST",
  body: JSON.stringify({ type: "visit", visitorId: "0123456789abcdef", version: "3.0" }),
});

test("collection webhook has one bounded request and returns a safe timeout failure", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const originalToken = process.env.GOOGLE_SHEETS_TOKEN;
  const timeoutDescriptor = Object.getOwnPropertyDescriptor(AbortSignal, "timeout");
  const timeoutController = new AbortController();
  let timeoutMs: number | undefined;
  let receivedSignal: AbortSignal | undefined;
  let calls = 0;
  process.env.GOOGLE_SHEETS_WEBHOOK_URL = "https://example.invalid/webhook";
  process.env.GOOGLE_SHEETS_TOKEN = "test-token";
  Object.defineProperty(AbortSignal, "timeout", {
    configurable: true,
    value: (ms: number) => { timeoutMs = ms; return timeoutController.signal; },
  });
  globalThis.fetch = async (_url, init) => {
    calls += 1;
    receivedSignal = init?.signal as AbortSignal | undefined;
    if (!receivedSignal) throw new Error("missing deadline signal");
    return new Promise((_resolve, reject) => {
      receivedSignal!.addEventListener("abort", () => reject(receivedSignal!.reason), { once: true });
      timeoutController.abort(new DOMException("request timed out", "TimeoutError"));
    });
  };
  try {
    const response = await POST(request());
    assert.equal(timeoutMs, 8_000);
    assert.equal(receivedSignal, timeoutController.signal);
    assert.equal(calls, 1, "timeout is not retried");
    assert.equal(response.status, 502);
    const body = await response.json();
    assert.equal(body.error, "Не удалось сохранить данные. Попробуйте позже.");
    assert.doesNotMatch(JSON.stringify(body), /timed out|TimeoutError/);
  } finally {
    globalThis.fetch = originalFetch;
    if (timeoutDescriptor) Object.defineProperty(AbortSignal, "timeout", timeoutDescriptor);
    if (originalUrl === undefined) delete process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    else process.env.GOOGLE_SHEETS_WEBHOOK_URL = originalUrl;
    if (originalToken === undefined) delete process.env.GOOGLE_SHEETS_TOKEN;
    else process.env.GOOGLE_SHEETS_TOKEN = originalToken;
  }
});
