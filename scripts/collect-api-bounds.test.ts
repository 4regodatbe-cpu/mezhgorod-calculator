import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/collect/route.ts";

const MAX_BYTES = 16 * 1024;
const request = (body: string) => new NextRequest("http://localhost/api/collect", { method: "POST", body });

test("collect rejects oversized, malformed and non-object JSON before webhook calls", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const originalToken = process.env.GOOGLE_SHEETS_TOKEN;
  let calls = 0;
  process.env.GOOGLE_SHEETS_WEBHOOK_URL = "https://example.invalid/webhook";
  process.env.GOOGLE_SHEETS_TOKEN = "test-token";
  globalThis.fetch = async () => { calls += 1; return Response.json({ ok: true }); };
  try {
    const prefix = JSON.stringify({ type: "visit", visitorId: "0123456789abcdef" });
    const oversized = prefix + " ".repeat(MAX_BYTES + 1 - new TextEncoder().encode(prefix).length);
    const largeResponse = await POST(request(oversized));
    assert.equal(largeResponse.status, 413);
    assert.equal(calls, 0);
    for (const body of ["{", "null", "[]"]) {
      const response = await POST(request(body));
      assert.equal(response.status, 400, body);
    }
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    else process.env.GOOGLE_SHEETS_WEBHOOK_URL = originalUrl;
    if (originalToken === undefined) delete process.env.GOOGLE_SHEETS_TOKEN;
    else process.env.GOOGLE_SHEETS_TOKEN = originalToken;
  }
});

test("collect preserves unknown toll nulls and sends only coarse regions to the webhook", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const originalToken = process.env.GOOGLE_SHEETS_TOKEN;
  let sent = "";
  let contentType = "";
  let calls = 0;
  process.env.GOOGLE_SHEETS_WEBHOOK_URL = "https://example.invalid/webhook";
  process.env.GOOGLE_SHEETS_TOKEN = "test-token";
  globalThis.fetch = async (_url, init) => {
    calls += 1;
    sent = String(init?.body ?? "");
    contentType = new Headers(init?.headers).get("Content-Type") ?? "";
    return Response.json({ ok: true });
  };
  try {
    const event = {
      type: "route_v2",
      version: "2.0",
      fromRegion: "Москва, ул. Секретная, дом 12, Московская область, Россия",
      toRegion: "Казань, ул. Частная, дом 9, Татарстан, Россия",
      distanceKm: 800,
      durationMin: 600,
      routeType: "Быстрый, цена дороги неизвестна",
      totals: { standard: 10_000, comfort: 12_000, comfortPlus: 14_000, minivan: 20_000 },
      tollWeekday: null,
      tollWeekend: null,
      tollPricingStatus: "unknown",
    };
    const invalidUnknown = await POST(request(JSON.stringify({ ...event, tollWeekday: 0 })));
    assert.equal(invalidUnknown.status, 400);
    assert.equal(calls, 0);
    const response = await POST(request(JSON.stringify(event)));
    assert.equal(response.status, 200);
    assert.equal(contentType, "text/plain;charset=utf-8");
    assert.doesNotMatch(sent, /Секретная|Частная|дом 12|дом 9/);
    assert.match(sent, /Москва, Московская область, Россия/);
    assert.match(sent, /Казань, Татарстан, Россия/);
    assert.doesNotMatch(sent, /tollWeekday|tollWeekend|unknown/);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    else process.env.GOOGLE_SHEETS_WEBHOOK_URL = originalUrl;
    if (originalToken === undefined) delete process.env.GOOGLE_SHEETS_TOKEN;
    else process.env.GOOGLE_SHEETS_TOKEN = originalToken;
  }
});
