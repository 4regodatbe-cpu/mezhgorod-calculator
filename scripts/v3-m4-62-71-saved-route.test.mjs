import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { test } from "node:test";
import { validateKnownM4Plazas } from "../lib/toll-engine/m4-route-validator.ts";
import { priceM4TollEvents, priceM4TollValidation } from "../lib/toll-engine/m4-engine.ts";
import { roadRouteSignature } from "../lib/toll-engine/road-boundaries.ts";

const root = "experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs";
function capture(run, file) {
  const path = `${root}/${run}/${file}`;
  return JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"));
}
const forward = capture("single-m4-moscow-to-voronezh", "2026-10-16T02-03-55-223Z-capture.json.gz");
const reverse = capture("single-m4-voronezh-to-moscow", "2026-10-16T02-05-46-824Z-capture.json.gz");
const exactIndex = (points, target) => points.findIndex(([lon, lat]) => Math.abs(lon - target[0]) < 1e-6 && Math.abs(lat - target[1]) < 1e-6);

test("saved 62–71 window crosses the directed PVP 71 mainline once, not PVP 62 exit ramps", async () => {
  const points = forward.record.route.coordinates;
  const start = exactIndex(points, [37.862552, 55.280674]);
  const end = exactIndex(points, [37.933973, 55.125436]);
  assert.ok(start >= 0 && end > start, "saved control endpoints must be present in independent route capture");
  const selectedValidation = { ...forward.record.validation, routeSignature: roadRouteSignature(points) };
  const result = await validateKnownM4Plazas(points, forward.record.route.seconds, false, selectedValidation);
  const pvp62 = result.checks.find((item) => item.km === 62);
  const pvp71 = result.checks.find((item) => item.km === 71);
  assert.ok(pvp62, "nearby PVP62 ramp must be checked");
  assert.ok(pvp71, "PVP71 mainline crossing must be checked");
  assert.equal(pvp62.status, "rejected", "complete trace contains no PVP62 toll-lane event");
  assert.equal(pvp71.status, "confirmed");
  const pvp71Event = result.events.find((item) => item.osmNodeId === "3036681112");
  assert.deepEqual([pvp71Event?.osmNodeId, pvp71Event?.wayId], ["3036681112", "523826063"]);
  assert.equal(result.events.some((item) => ["1755090321", "4598844673"].includes(item.osmNodeId)), false);

  const onePvp = { ...selectedValidation, tollBooths: pvp71Event ? [pvp71Event] : [] };
  const weekday = priceM4TollValidation(onePvp, "2026-10-08T10:00:00+03:00");
  const weekend = priceM4TollValidation(onePvp, "2026-10-09T10:00:00+03:00");
  assert.equal(weekday.amount, 310);
  assert.equal(weekend.amount, 400);
  assert.deepEqual(weekday.pricedPlazas.map((item) => item.km), [71], "never add PVP62 and PVP71 together");
});

test("complete selected-route evidence prevents charging when the route stops before or starts after PVP71", async () => {
  const points = forward.record.route.coordinates;
  const pvpIndex = exactIndex(points, [37.919022, 55.168346]);
  assert.ok(pvpIndex > 30);
  const noCrossing = { ...forward.record.validation, tollBooths: [], complete: true, boothEventCoverage: "complete" };
  for (const [label, slice] of [
    ["ends before", points.slice(pvpIndex - 30, pvpIndex)],
    ["starts after", points.slice(pvpIndex + 1, pvpIndex + 31)],
  ]) {
    const result = await validateKnownM4Plazas(slice, 5 * 60, false,
      { ...noCrossing, routeSignature: roadRouteSignature(slice) });
    const pvp71 = result.checks.find((item) => item.km === 71);
    assert.ok(pvp71, `${label} geometry remains close enough to be a PVP71 candidate`);
    assert.equal(pvp71.status, "rejected", `${label} must not be charged from proximity`);
    assert.equal(result.events.some((item) => item.osmNodeId === "3036681112"), false, `${label}: no PVP71 toll event`);
  }
});

test("saved reverse-direction M-4 route uses its own PVP71 toll lane and Order 58 category-I fare", async () => {
  const trace = reverse.record.validation;
  const event = trace.tollBooths.find((item) => item.osmNodeId === "285903913");
  assert.ok(event, "reverse route must contain its direction-specific PVP71 event");
  assert.equal(event.edgeToll, true);
  assert.equal(event.wayId, "523826061");
  const priced = priceM4TollValidation({ ...trace, tollBooths: [event] }, "2026-10-08T10:00:00+03:00");
  assert.equal(priced.amount, 310);
  assert.deepEqual(priced.pricedPlazas.map((item) => item.km), [71]);
});

test("complete no-PVP evidence stays distinct from incomplete geography and neither becomes zero", () => {
  const completeNoPvp = priceM4TollValidation({
    status: "free", source: "complete selected-route capture", complete: true,
    boothEventCoverage: "complete", tollEdgeCount: 0, checkedEdgeCount: 3,
    tollBoothCount: 0, tollBooths: [], wayIds: [], roadNames: [], message: "complete; no booths",
    chunkCount: 3, checkedChunkCount: 3, failedChunkCount: 0,
  }, "2026-10-08T10:00:00+03:00");
  assert.equal(completeNoPvp.status, "none");
  assert.equal(completeNoPvp.inputComplete, true);
  assert.equal(completeNoPvp.amount, null, "absence is not converted into a synthetic zero fare");

  const incomplete = priceM4TollValidation({
    status: "unknown", source: "partial selected-route capture", complete: false,
    boothEventCoverage: "partial", tollEdgeCount: 0, checkedEdgeCount: 1,
    tollBoothCount: 0, tollBooths: [], wayIds: [], roadNames: [], message: "one chunk unavailable",
    chunkCount: 3, checkedChunkCount: 1, failedChunkCount: 2,
  }, "2026-10-08T10:00:00+03:00");
  assert.equal(incomplete.status, "unresolved");
  assert.equal(incomplete.inputComplete, false);
  assert.equal(incomplete.amount, null, "missing geography remains unknown, never free");
  assert.ok(incomplete.unresolved.some((item) => item.code === "incomplete_validation"));
});

test("multiple directed toll events price distinct plazas once and deduplicate a repeated booth event", () => {
  const priced = priceM4TollEvents([
    { osmNodeId: "3036681112", wayId: "523826063", roadNames: ["М-4"], edgeIndex: 10, edgeToll: true },
    { osmNodeId: "4341143825", wayId: "m4-133", roadNames: ["М-4"], edgeIndex: 20, edgeToll: true },
    { osmNodeId: "3036681112", wayId: "523826063", roadNames: ["М-4"], edgeIndex: 11, edgeToll: true },
  ], "2026-10-08T10:00:00+03:00");
  assert.equal(priced.status, "priced");
  assert.deepEqual(priced.pricedPlazas.map((item) => item.km), [71, 133]);
  assert.equal(priced.amount, priced.pricedPlazas.reduce((sum, item) => sum + item.selectedAmount, 0));
});
