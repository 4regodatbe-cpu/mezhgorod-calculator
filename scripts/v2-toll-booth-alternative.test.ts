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
  globalThis.fetch = async () => {
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
    () => selectFreeRoute({ status: "fulfilled", value: candidate }, { status: "rejected", reason: new Error("not used") }),
  );
  assert.equal(selected?.truth, "confirmed_no_toll_booths");
  assert.equal(selected?.validation.status, "toll");
  assert.equal(selected?.validation.tollBoothCount, 0);
});

test("a route with a toll booth is rejected as the payment-point alternative", async () => {
  const selected = await withTraceEdges(
    [{ toll: true, way_id: 41, names: ["М-4"], end_node: { type: "toll_booth", node_id: 99 } }],
    () => selectFreeRoute({ status: "fulfilled", value: candidate }, { status: "rejected", reason: new Error("not used") }),
  );
  assert.equal(selected, null);
});

test("an incomplete booth trace is rejected because payment-point avoidance is unproven", async () => {
  const selected = await withTraceEdges(
    new Error("trace unavailable"),
    () => selectFreeRoute({ status: "fulfilled", value: candidate }, { status: "rejected", reason: new Error("not used") }),
  );
  assert.equal(selected, null);
});

test("a candidate without route geometry is never offered as an unverified detour", async () => {
  const noGeometry = { ...candidate, coordinates: [[37, 55], [37.1, 55.1]] };
  const selected = await selectFreeRoute(
    { status: "fulfilled", value: noGeometry },
    { status: "rejected", reason: new Error("not used") },
  );
  assert.equal(selected, null);
});
