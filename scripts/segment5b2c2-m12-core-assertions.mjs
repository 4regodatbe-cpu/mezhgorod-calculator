import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import {
  evaluateM12Evidence,
  m12RouteCoreMetadata,
  projectM12Evidence,
} from "../lib/toll-engine/m12-route-core.ts";

const FIXTURE_PATH = "data/fixtures/m12-route-projections-2026-09-30.json";
const EVIDENCE_PATH = "data/tolls/m12-rvp-evidence-2026-09-30.json";
const OUTPUT_PATH = "segment5b2c2-m12-core-assertions.json";

const fixture = JSON.parse(await readFile(FIXTURE_PATH, "utf8"));
const evidence = JSON.parse(await readFile(EVIDENCE_PATH, "utf8"));
const results = [];

function record(name, fn) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (error) {
    results.push({ name, passed: false, error: error instanceof Error ? error.message : String(error) });
  }
}

for (const route of fixture.routes) {
  record(`fixture ${route.id}`, () => {
    const result = evaluateM12Evidence({
      projections: route.projections,
      strictM12Span: route.strictM12Span,
    });
    assert.equal(result.status, route.expected.status === "priced_supported" ? "priced" : "unknown");
    assert.deepEqual(result.finalMarkers, route.expected.finalMarkers);
    assert.equal(result.amountRub, route.expected.amountRub);
    if (result.status === "priced") {
      assert.equal(result.boundary.status, "proven");
      assert.equal(result.reason, null);
      assert.ok(result.amountRub > 0, "priced M-12 route must have positive amount");
    } else {
      assert.equal(result.amountRub, null, "unknown route must not become zero");
      assert.notEqual(result.reason, null);
    }
  });
}

const moscowKazan = fixture.routes.find((route) => route.id === "moscow->kazan");
assert.ok(moscowKazan, "moscow->kazan fixture missing");

record("mutation: missing strict span stays unknown", () => {
  const result = evaluateM12Evidence({ projections: moscowKazan.projections, strictM12Span: null });
  assert.equal(result.status, "unknown");
  assert.equal(result.amountRub, null);
  assert.match(result.reason, /span|boundar/i);
});

record("mutation: one direct RVP stays unknown", () => {
  const projections = moscowKazan.projections.map((item, index) => ({
    ...item,
    nearestDistanceKm: index === 0 ? item.nearestDistanceKm : 1,
  }));
  const result = evaluateM12Evidence({ projections, strictM12Span: moscowKazan.strictM12Span });
  assert.equal(result.status, "unknown");
  assert.equal(result.directMarkers.length, 1);
  assert.equal(result.amountRub, null);
});

record("mutation: no direct RVP stays unknown/null, never zero", () => {
  const projections = moscowKazan.projections.map((item) => ({ ...item, nearestDistanceKm: 1 }));
  const result = evaluateM12Evidence({ projections, strictM12Span: moscowKazan.strictM12Span });
  assert.equal(result.status, "unknown");
  assert.equal(result.directMarkers.length, 0);
  assert.equal(result.amountRub, null);
  assert.notEqual(result.amountRub, 0);
});

record("mutation: broken 591-635/635-764 continuity blocks inferred tariff", () => {
  const projections = moscowKazan.projections.map((item) => item.rvpKm === 635
    ? { ...item, chainageKm: item.chainageKm + 10 }
    : { ...item });
  const result = evaluateM12Evidence({ projections, strictM12Span: moscowKazan.strictM12Span });
  assert.equal(result.status, "unknown");
  assert.equal(result.amountRub, null);
  assert.match(result.reason, /continuity/i);
  assert.ok(result.continuity.some((interval) => !interval.continuous));
});

record("mutation: entry span extending across previous-RVP safety gap stays unknown", () => {
  const firstDirect = moscowKazan.projections.find((item) => item.rvpKm === 184);
  assert.ok(firstDirect);
  const strictM12Span = {
    ...moscowKazan.strictM12Span,
    beginKm: firstDirect.chainageKm - 8,
  };
  const result = evaluateM12Evidence({ projections: moscowKazan.projections, strictM12Span });
  assert.equal(result.status, "unknown");
  assert.equal(result.amountRub, null);
  assert.match(result.reason, /entry boundary/i);
});

record("mutation: exit span extending across next-RVP safety gap stays unknown", () => {
  const lastDirect = moscowKazan.projections.find((item) => item.rvpKm === 764);
  assert.ok(lastDirect);
  const strictM12Span = {
    ...moscowKazan.strictM12Span,
    endKm: lastDirect.chainageKm + 3,
  };
  const result = evaluateM12Evidence({ projections: moscowKazan.projections, strictM12Span });
  assert.equal(result.status, "unknown");
  assert.equal(result.amountRub, null);
  assert.match(result.reason, /exit boundary/i);
});

record("geometry helper projects known anchors exactly on synthetic route", () => {
  const rvp184 = evidence.anchors.find((anchor) => anchor.rvpKm === 184);
  const rvp281 = evidence.anchors.find((anchor) => anchor.rvpKm === 281);
  assert.ok(rvp184 && rvp281);
  const projections = projectM12Evidence([rvp184.center, rvp281.center]);
  const first = projections.find((item) => item.rvpKm === 184);
  const second = projections.find((item) => item.rvpKm === 281);
  assert.ok(first && second);
  assert.ok(first.nearestDistanceKm < 0.001);
  assert.ok(second.nearestDistanceKm < 0.001);
  assert.ok(second.chainageKm > first.chainageKm);
});

record("core metadata keeps strict safety thresholds", () => {
  const metadata = m12RouteCoreMetadata();
  assert.equal(metadata.directCrossingRadiusKm, 0.08);
  assert.equal(metadata.calibrationMarginKm, 2.5);
  assert.equal(metadata.maxAbsoluteContinuityErrorKm, 3);
  assert.equal(metadata.maxRelativeContinuityError, 0.025);
});

const failed = results.filter((result) => !result.passed);
const pricedFixtures = fixture.routes.filter((route) => route.expected.status === "priced_supported").length;
const unknownFixtures = fixture.routes.length - pricedFixtures;
const report = {
  generatedAt: new Date().toISOString(),
  networkRequests: 0,
  fixtureVersion: fixture.fixtureVersion,
  fixtureRoutes: fixture.routes.length,
  pricedFixtures,
  unknownFixtures,
  assertionCount: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  results,
};
await writeFile(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`);
console.log(`M12 pure-core assertions: ${report.passed}/${report.assertionCount} passed; fixtures=${fixture.routes.length}; priced=${pricedFixtures}; unknown=${unknownFixtures}; network=0`);
for (const failure of failed) console.error(`FAIL ${failure.name}: ${failure.error}`);
if (failed.length) process.exit(1);
