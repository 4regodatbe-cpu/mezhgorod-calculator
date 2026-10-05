import test from "node:test";
import assert from "node:assert/strict";
import { selectFreeRoute } from "../lib/v2-calculation/free-route-selection.ts";
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
  assert.equal(selected?.truth, "confirmed_no_toll_booths");
  assert.equal(selected?.validation.status, "toll");
  assert.equal(selected?.validation.tollBoothCount, 0);
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

test("a route without a meaningful difference from the main route is not shown as an alternative", async () => {
  const selected = await withTraceEdges(
    [{ toll: false, way_id: 41, names: ["М-4"], end_node: { type: "intersection", node_id: 9 } }],
    () => selectFreeRoute(candidate, [{ name: "candidate", result: { status: "fulfilled", value: candidate } }, { name: "unused", result: { status: "rejected", reason: new Error("not used") } }]),
  );
  assert.equal(selected, null);
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
