import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST } from "../app/r/route.ts";

test("public proxy recovers each failed connection without returning 502 or mixing the Donetsk cities", async () => {
  const original = globalThis.fetch;
  const savedPilot = process.env.GEONAMES_LOCAL_PILOT;
  process.env.GEONAMES_LOCAL_PILOT = "0"; // This fixture tests Photon retries, not local-city admission.
  const counts = new Map<string, number>();
  const features = [
    { properties: { osm_type: "R", osm_id: 1413957, osm_key: "place", osm_value: "city", name: "Донецк", state: "Донецкая область" }, geometry: { coordinates: [37.8013407, 48.0158753] } },
    { properties: { osm_type: "R", osm_id: 1517207, osm_key: "place", osm_value: "city", name: "Донецк", state: "Ростовская область", country: "Россия" }, geometry: { coordinates: [39.9509488, 48.3382864] } },
  ];
  globalThis.fetch = async input => {
    const url = String(input); const count = (counts.get(url) ?? 0) + 1; counts.set(url, count);
    if (count === 1) throw new Error("fetch failed", { cause: { code: "UND_ERR_CONNECT_TIMEOUT" } });
    return new Response(JSON.stringify({ features }));
  };
  try {
    const response = await POST(new NextRequest("https://calculator.test/r", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: "Донецк" }),
    }));
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.items[0].id, "R-1413957");
    assert.equal(body.items[0].label, "Донецк — ДНР");
    assert.equal(body.items[1].id, "R-1517207");
    assert.equal(counts.size, 7);
    assert.ok([...counts.values()].every(count => count === 2));
  } finally { globalThis.fetch = original; if(savedPilot===undefined)delete process.env.GEONAMES_LOCAL_PILOT;else process.env.GEONAMES_LOCAL_PILOT=savedPilot; }
});
