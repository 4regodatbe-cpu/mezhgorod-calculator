import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { test } from "node:test";
import fixture from "@/experiments/road-ref-boundaries/fixtures/granitnoe-kazan-m4.json";
import { valhalla } from "@/lib/route-providers";
import { calculateLegTolls } from "@/lib/v3-calculation/route-leg-pricing";
import { tollsForApi } from "@/lib/v2-calculation/free-route-selection";
import type { TollValidation } from "@/lib/toll-validator";

test("full saved selected provider→M4 boundaries→V3 composer preserves unknown price in both profiles", async () => {
  const raw = readFileSync(fixture.provenance.capturePath);
  assert.equal(createHash("sha256").update(raw).digest("hex"), fixture.provenance.captureSha256);
  const capture = JSON.parse(gunzipSync(raw).toString("utf8"));
  const saved = capture.calls[0];
  const original = globalThis.fetch;
  let networkAttempts = 0, consumed = 0;
  try {
    globalThis.fetch = async input => {
      if (String(input) !== saved.url || consumed) { networkAttempts++; throw new Error("UNRECORDED_REQUEST_FORBIDDEN"); }
      consumed++;
      return new Response(saved.text, { status: saved.status, headers: { "Content-Type": "application/json" } });
    };
    const selected = await valhalla(capture.record.spec.from, capture.record.spec.to, 1,
      capture.record.routePlan[0].positions);
    assert.deepEqual(selected.coordinates, capture.record.route.coordinates);
    assert.equal(selected.m4RoadBoundaries!.status, "resolved");
    assert.deepEqual(selected.m4RoadBoundaries!.entry!.from!.names, ["Северный обход Ростова-на-Дону"]);
    assert.deepEqual(selected.m4RoadBoundaries!.exit!.to!.refs, ["Р-260"]);
    for (const departureAt of ["2026-10-15T09:00:00+03:00", "2026-10-17T09:00:00+03:00"]) {
      const result = await calculateLegTolls({ routeGeometry: selected.coordinates, routeSeconds: selected.seconds,
        departureAt, selectedFastProvider: "Valhalla", selectedFastRoute: selected, valhallaEvidence: selected,
        confirmedFreeRoute: null, diagnosticFastValidation: capture.record.validation as TollValidation });
      assert.equal(result.componentAudit.status, "unknown");
      assert.deepEqual(result.componentAudit.missing, ["m4"]);
      assert.equal(result.m4PvpPreview!.roadBoundaries!.status, "resolved");
      assert.equal(result.m4PvpPreview!.tariffVector!.priceStatus, "unknown");
      assert.equal(result.m4PvpPreview!.tariffVector!.from, selected.m4RoadBoundaries!.entry!.id);
      assert.equal(result.m4PvpPreview!.tariffVector!.to, selected.m4RoadBoundaries!.exit!.id);
      assert.match(result.componentAudit.components.find(c => c.id === "m4")!.reason!, /m4_road_vector_price_unknown/u);
      const api = tollsForApi(result.tolls, result.fastValidation);
      assert.equal(api.pricingStatus, "unknown");
      assert.equal(api.amount, null);
    }
    assert.equal(consumed, 1);
    assert.equal(networkAttempts, 0);
  } finally { globalThis.fetch = original; }
});
