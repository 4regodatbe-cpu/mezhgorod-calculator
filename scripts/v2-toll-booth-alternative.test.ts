import test from "node:test";
import assert from "node:assert/strict";
import { selectFreeRoute, routeDifferenceEvidence, withinDetourLimits } from "../lib/v2-calculation/free-route-selection.ts";
import { routingDifferenceTollFallback } from "../lib/v2-calculation/route-leg-pricing-helpers.ts";
import type { TollEstimate } from "../lib/v2-calculation/free-route-selection.ts";
import type { RouteWithGeometry } from "../lib/route-providers.ts";

const candidate: RouteWithGeometry = {
  meters: 12_000,
  seconds: 900,
  coordinates: [[37, 55], [37.05, 55.05], [37.1, 55.1]],
};

async function withTraceEdges<T>(edges: unknown[] | Error, action: () => Promise<T>): Promise<T> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    assert.equal(init?.method, "POST");
    assert.equal(new Headers(init?.headers).get("Content-Type"), "application/json");
    const request = JSON.parse(String(init?.body));
    assert.equal(request.costing, "auto");
    assert.equal(request.shape_match, "walk_or_snap");
    assert.ok(Array.isArray(request.shape) && request.shape.length >= 2);
    if (edges instanceof Error) throw edges;
    return new Response(JSON.stringify({ edges }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  try {
    return await action();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("payment-point alternative may retain tolled road edges when no toll booth is found", async () => {
  const selected = await withTraceEdges(
    [{ toll: true, way_id: 41, names: ["М-4"], end_node: { type: "intersection", node_id: 9 } }],
    () => selectFreeRoute({ meters: 100_000, seconds: 3_600 }, [{ name: "candidate", result: { status: "fulfilled", value: candidate } }, { name: "unused", result: { status: "rejected", reason: new Error("not used") } }]),
  );
  assert.equal(selected?.truth, "confirmed_payment_point_avoiding");
  assert.equal(selected?.validation.status, "toll");
  assert.equal(selected?.validation.tollBoothCount, 0);
  assert.match(selected?.quality.message ?? "", /платным участкам/);
});

test("a route with a toll booth is rejected as the payment-point alternative", async () => {
  const selected = await withTraceEdges(
    [{ toll: true, way_id: 41, names: ["М-4"], end_node: { type: "toll_booth", node_id: 99 } }],
    () => selectFreeRoute({ meters: 100_000, seconds: 3_600 }, [{ name: "candidate", result: { status: "fulfilled", value: candidate } }, { name: "unused", result: { status: "rejected", reason: new Error("not used") } }]),
  );
  assert.equal(selected, null);
});

test("an incomplete booth trace is rejected because payment-point avoidance is unproven", async () => {
  const selected = await withTraceEdges(
    new Error("trace unavailable"),
    () => selectFreeRoute({ meters: 100_000, seconds: 3_600 }, [{ name: "candidate", result: { status: "fulfilled", value: candidate } }, { name: "unused", result: { status: "rejected", reason: new Error("not used") } }]),
  );
  assert.equal(selected, null);
});

test("a candidate without route geometry is never offered as an unverified detour", async () => {
  const noGeometry = { ...candidate, coordinates: [[37, 55], [37.1, 55.1]] };
  const selected = await selectFreeRoute(
    { meters: 100_000, seconds: 3_600 },
    [{ name: "candidate", result: { status: "fulfilled", value: noGeometry } }],
  );
  assert.equal(selected, null);
});

test("a route within detour bounds can be shown even if it is not faster or shorter", async () => {
  const selected = await withTraceEdges(
    [{ toll: false, way_id: 41, names: ["М-4"], end_node: { type: "intersection", node_id: 9 } }],
    () => selectFreeRoute(candidate, [{ name: "candidate", result: { status: "fulfilled", value: candidate } }, { name: "unused", result: { status: "rejected", reason: new Error("not used") } }]),
  );
  assert.equal(selected?.route, candidate);
});

test("a payment-point-avoiding route beyond the distance or time detour limit is not offered", async () => {
  const worseOnBoth = { ...candidate, meters: 130_000, seconds: 6_000 };
  let traceCount = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    traceCount++;
    return new Response(JSON.stringify({ edges: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  try {
    const selected = await selectFreeRoute(
      { meters: 100_000, seconds: 3_600 },
      [{ name: "worse route", result: { status: "fulfilled", value: worseOnBoth } }],
    );
    assert.equal(selected, null);
    assert.equal(traceCount, 0, "skip expensive map matching beyond the detour limit");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("detour limits permit moderately longer/slower routes but reject extreme outliers", () => {
  const main = { meters: 100_000, seconds: 3_600 };
  assert.equal(withinDetourLimits(main, { meters: 124_000, seconds: 5_300 }), true);
  assert.equal(withinDetourLimits(main, { meters: 125_100, seconds: 4_000 }), false);
  assert.equal(withinDetourLimits(main, { meters: 110_000, seconds: 5_401 }), false);
  assert.equal(withinDetourLimits(main, { meters: 0, seconds: 0 }), false);
});

test("a route that saves time may be longer, and a route that saves distance may be slower", async () => {
  const byTime = { ...candidate, meters: 120_000, seconds: 2_000 };
  const byDistance = { ...candidate, meters: 80_000, seconds: 5_000 };
  const main = { meters: 100_000, seconds: 3_600 };
  for (const route of [byTime, byDistance]) {
    const selected = await withTraceEdges(
      [{ toll: true, way_id: 41, names: ["М-4"], end_node: { type: "intersection", node_id: 9 } }],
      () => selectFreeRoute(main, [{ name: "beneficial route", result: { status: "fulfilled", value: route } }]),
    );
    assert.equal(selected?.route, route);
  }
});

test("toll fallback evidence uses real savings, not a larger regression", () => {
  const main = { meters: 100_000, seconds: 3_600 };
  const withinLimit = { meters: 120_000, seconds: 4_000 };
  const excessive = { meters: 130_000, seconds: 4_000 };
  assert.equal(routeDifferenceEvidence(main, withinLimit), true);
  assert.equal(routeDifferenceEvidence(main, excessive), false);
  const current: TollEstimate = { amount: 0, weekdayAmount: 0, weekendAmount: 0, period: "пн-чт", segments: [], confidence: "none" };
  assert.notDeepEqual(routingDifferenceTollFallback(main, withinLimit, current), current);
  assert.deepEqual(routingDifferenceTollFallback(main, excessive, current), current);
});

test("candidate search falls back from a route with booths to a verified partial M-4 bypass", async () => {
  const originalFetch = globalThis.fetch;
  let traceCount = 0;
  globalThis.fetch = async (_input, init) => {
    assert.equal(init?.method, "POST");
    const edges = traceCount++ === 0
      ? [{ toll: true, way_id: 41, names: ["М-4"], end_node: { type: "toll_booth", node_id: 99 } }]
      : [{ toll: true, way_id: 42, names: ["М-4"], end_node: { type: "intersection", node_id: 10 } }];
    return new Response(JSON.stringify({ edges }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  try {
    const partialM4 = { ...candidate, meters: 15_000, seconds: 1_080 };
    const selected = await selectFreeRoute(
      { meters: 100_000, seconds: 3_600 },
      [
        { name: "900-second candidate", result: { status: "fulfilled", value: candidate } },
        { name: "1,200-second partial M-4 candidate", result: { status: "fulfilled", value: partialM4 } },
      ],
    );
    assert.equal(selected?.route, partialM4);
    assert.equal(selected?.validation.tollEdgeCount, 1);
    assert.equal(selected?.validation.tollBoothCount, 0);
    assert.equal(traceCount, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
