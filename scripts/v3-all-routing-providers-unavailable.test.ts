import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/v3/calculate/route.ts";

const point = (label: string, lat: number, lng: number) => ({ label, position: { lat, lng } });
const response = (status: number) => new Response(JSON.stringify({ error: "upstream unavailable" }), {
  status,
  headers: { "Content-Type": "application/json" },
});

test("V3 returns a truthful upstream error when all route candidates fail; it never manufactures a route", async () => {
  const originalFetch = globalThis.fetch;
  const requestedProviders: string[] = [];
  try {
    globalThis.fetch = async (input) => {
      const url = new URL(String(input));
      requestedProviders.push(url.hostname);
      return response(503);
    };

    const request = new NextRequest("http://localhost/api/v3/calculate", {
      method: "POST",
      body: JSON.stringify({
        from: point("Тверь", 56.8587, 35.9176),
        to: point("Адлер", 43.4382, 39.918),
        departureAt: "2026-10-02T09:00:00+03:00",
      }),
    });

    const result = await POST(request);
    const body = await result.json();
    assert.equal(result.status, 502);
    assert.equal(body.error, "Сервис маршрутов временно недоступен. Попробуйте позже.");
    assert.equal(body.legs, undefined);
    assert.equal(body.options, undefined);
    assert.deepEqual([...new Set(requestedProviders)].sort(), [
      "brouter.de",
      "router.project-osrm.org",
      "valhalla1.openstreetmap.de",
    ]);
    assert.equal(requestedProviders.length, 3, "V3 makes one bounded request to each configured route provider");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
