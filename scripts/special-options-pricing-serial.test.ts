import test from "node:test";
import assert from "node:assert/strict";
import { M4_PLAZA_NODES } from "../lib/toll-engine/m4-plaza-nodes.ts";
import { calculateSpecialOptions } from "../lib/v2-calculation/special-options.ts";

const moscow = { lat: 55.7505412, lng: 37.6174782 };
const donetsk = { lat: 48.0156, lng: 37.8029 };
const routeShape = [
  [donetsk.lng, donetsk.lat],
  ...M4_PLAZA_NODES.filter((plaza) => plaza.km <= 911)
    .sort((a, b) => b.km - a.km)
    .map((plaza) => [plaza.anchors[0].lon, plaza.anchors[0].lat]),
  [moscow.lng, moscow.lat],
];

function encodePolyline(points: number[][]) {
  let previousLat = 0;
  let previousLng = 0;
  let encoded = "";
  const encode = (value: number) => {
    let next = value < 0 ? ~(value << 1) : value << 1;
    let result = "";
    while (next >= 0x20) {
      result += String.fromCharCode((0x20 | (next & 0x1f)) + 63);
      next >>= 5;
    }
    return result + String.fromCharCode(next + 63);
  };
  for (const [lng, lat] of points) {
    const scaledLat = Math.round(lat * 1e6);
    const scaledLng = Math.round(lng * 1e6);
    encoded += encode(scaledLat - previousLat) + encode(scaledLng - previousLng);
    previousLat = scaledLat;
    previousLng = scaledLng;
  }
  return encoded;
}

function distanceKm(point: number[], anchor: { lat: number; lon: number }) {
  return Math.hypot((point[0] - anchor.lon) * 111.32 * Math.cos(anchor.lat * Math.PI / 180), (point[1] - anchor.lat) * 110.574);
}

test("special route toll checks are serialized to avoid saturating Valhalla trace matching", async () => {
  const originalFetch = globalThis.fetch;
  let activeTraces = 0;
  let maxActiveTraces = 0;
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    if (url.hostname === "valhalla1.openstreetmap.de" && url.pathname === "/route") {
      return new Response(JSON.stringify({
        trip: {
          summary: { length: 1_276.3, time: 63_059 },
          legs: [{ shape: encodePolyline(routeShape), summary: { length: 1_276.3, time: 63_059 }, maneuvers: [] }],
        },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (url.hostname === "router.project-osrm.org") {
      return new Response(JSON.stringify({ routes: [{
        distance: 1_182_600,
        duration: 61_768,
        geometry: { coordinates: routeShape },
        legs: [{ distance: 1_182_600, duration: 61_768, steps: [{ geometry: { coordinates: routeShape } }] }],
      }] }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (url.pathname === "/trace_attributes") {
      activeTraces += 1;
      maxActiveTraces = Math.max(maxActiveTraces, activeTraces);
      await new Promise((resolve) => setTimeout(resolve, 5));
      const request = JSON.parse(String(init?.body ?? "{}"));
      const points = (request.shape ?? []).map((point: { lon: number; lat: number }) => [point.lon, point.lat]);
      const plaza = M4_PLAZA_NODES.map((candidate) => ({
        candidate,
        distance: Math.min(...points.map((point: number[]) => distanceKm(point, candidate.anchors[0]))),
      })).sort((a, b) => a.distance - b.distance)[0]?.candidate;
      activeTraces -= 1;
      return new Response(JSON.stringify({ edges: plaza ? [{
        toll: true,
        way_id: `m4-${plaza.km}`,
        names: ["М-4 Дон"],
        end_node: { type: "toll_booth", node_id: plaza.nodeIds[0] },
      }] : [] }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return new Response("{}", { status: 503 });
  };

  try {
    const result = await calculateSpecialOptions(
      { label: "Волноваха — ДНР", position: donetsk },
      { label: "Москва, Россия", position: moscow },
      "2026-10-08T10:00:00+03:00",
    );
    assert.equal(result.options.length, 2, "main and distinct alternative remain available");
    assert.ok(result.options.every((option) => option.fast.tolls.pricingStatus === "priced"));
    assert.ok(result.options.every((option) => (option.fast.tolls.weekdayAmount ?? 0) > 0));
    assert.equal(maxActiveTraces, 4, "only one four-request M-4 validator runs at a time");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
