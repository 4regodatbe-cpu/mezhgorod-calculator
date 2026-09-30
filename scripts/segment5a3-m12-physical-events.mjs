import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const INPUT_PATH = "segment5a2c-m12-parity-fixture.json";
const OUTPUT_PATH = "segment5a3-m12-physical-events.json";
const EXPECTED_EVENT_COUNT = 11;
const MAX_CENTER_DISTANCE_KM = 0.10;
const MAX_NORMALIZED_CHAINAGE_RESIDUAL = 0.005;

function round(value, digits = 6) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const value = Math.sin(dLat / 2) ** 2
    + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function eventCenter(event) {
  const coordinates = event.coordinates ?? [];
  if (!coordinates.length) throw new Error(`event ${event.eventIndex} has no coordinates`);
  return [
    coordinates.reduce((sum, coordinate) => sum + coordinate[0], 0) / coordinates.length,
    coordinates.reduce((sum, coordinate) => sum + coordinate[1], 0) / coordinates.length,
  ];
}

const producer = spawnSync(process.execPath, ["scripts/segment5a2c-m12-parity-fixture.mjs"], {
  stdio: "inherit",
  timeout: 120_000,
});
if (producer.error) throw producer.error;
if (producer.status !== 0) throw new Error(`5A2c evidence producer exited with status ${producer.status}`);

const source = JSON.parse(await readFile(INPUT_PATH, "utf8"));
if (source.coverageAssessment?.status !== "informative_limited_fixture") {
  throw new Error(`5A2c coverage is not informative: ${source.coverageAssessment?.status}`);
}
if (!Array.isArray(source.routes) || source.routes.length !== 2) throw new Error("5A2c must contain exactly two route directions");

const forward = source.routes.find((route) => route.name === "moscow-kazan");
const reverse = source.routes.find((route) => route.name === "kazan-moscow");
if (!forward || !reverse) throw new Error("missing forward/reverse M-12 route evidence");
if (forward.eventCount !== EXPECTED_EVENT_COUNT || reverse.eventCount !== EXPECTED_EVENT_COUNT) {
  throw new Error(`unexpected event count: forward=${forward.eventCount}, reverse=${reverse.eventCount}, expected=${EXPECTED_EVENT_COUNT}`);
}
if (forward.events.length !== reverse.events.length) throw new Error("forward/reverse physical event counts differ");

const reversedEvents = [...reverse.events].reverse();
const pairs = forward.events.map((forwardEvent, index) => {
  const reverseEvent = reversedEvents[index];
  const forwardCenter = eventCenter(forwardEvent);
  const reverseCenter = eventCenter(reverseEvent);
  const centerDistanceKm = distanceKm(forwardCenter, reverseCenter);
  const forwardNormalized = forwardEvent.chainageKm / forward.geometryKm;
  const mirroredReverseNormalized = 1 - reverseEvent.chainageKm / reverse.geometryKm;
  const normalizedChainageResidual = Math.abs(forwardNormalized - mirroredReverseNormalized);
  return {
    pairIndex: index,
    forwardEventIndex: forwardEvent.eventIndex,
    reverseEventIndex: reverseEvent.eventIndex,
    forwardOsmIds: forwardEvent.osmIds,
    reverseOsmIds: reverseEvent.osmIds,
    forwardCenter: forwardCenter.map((value) => round(value)),
    reverseCenter: reverseCenter.map((value) => round(value)),
    centerDistanceKm: round(centerDistanceKm),
    forwardChainageKm: forwardEvent.chainageKm,
    reverseChainageKm: reverseEvent.chainageKm,
    normalizedChainageResidual: round(normalizedChainageResidual),
    geographicMatch: centerDistanceKm <= MAX_CENTER_DISTANCE_KM,
    chainageMatch: normalizedChainageResidual <= MAX_NORMALIZED_CHAINAGE_RESIDUAL,
  };
});

const failures = pairs.filter((pair) => !pair.geographicMatch || !pair.chainageMatch);
const maxCenterDistanceKm = Math.max(...pairs.map((pair) => pair.centerDistanceKm));
const maxNormalizedChainageResidual = Math.max(...pairs.map((pair) => pair.normalizedChainageResidual));

const report = {
  generatedAt: new Date().toISOString(),
  diagnosticOnly: true,
  source: {
    fixtureScope: source.fixture?.scope,
    fixtureProvenance: source.fixture?.provenance,
    sourceCoverage: source.coverageAssessment,
    overpassRequests: source.overpassRequests,
  },
  thresholds: {
    expectedEventCount: EXPECTED_EVENT_COUNT,
    maxCenterDistanceKm: MAX_CENTER_DISTANCE_KM,
    maxNormalizedChainageResidual: MAX_NORMALIZED_CHAINAGE_RESIDUAL,
  },
  routes: {
    forwardKm: forward.geometryKm,
    reverseKm: reverse.geometryKm,
    forwardEventCount: forward.eventCount,
    reverseEventCount: reverse.eventCount,
  },
  mirrorProof: {
    pairCount: pairs.length,
    maxCenterDistanceKm: round(maxCenterDistanceKm),
    maxNormalizedChainageResidual: round(maxNormalizedChainageResidual),
    allPairsMatch: failures.length === 0,
    failures,
    pairs,
  },
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`);
console.log(`physical-event mirror: pairs=${pairs.length} maxCenter=${report.mirrorProof.maxCenterDistanceKm}km maxNormalizedResidual=${report.mirrorProof.maxNormalizedChainageResidual}`);
if (failures.length) throw new Error(`${failures.length} physical event pair(s) failed mirror proof`);
