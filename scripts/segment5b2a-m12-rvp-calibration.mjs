import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const PHYSICAL_EVENTS_PATH = "segment5a3-m12-physical-events.json";
const TARIFF_PATH = "data/tolls/m12-2026-03-02-category1.json";
const OUTPUT_PATH = "segment5b2a-m12-rvp-calibration.json";
const MAX_RESIDUAL_KM = 2.5;
const MIN_MATCHES = 9;

function round(value, digits = 6) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function median(values) {
  if (!values.length) throw new Error("cannot take median of empty values");
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function better(a, b) {
  if (!a) return b;
  if (!b) return a;
  if (a.matches !== b.matches) return a.matches > b.matches ? a : b;
  if (Math.abs(a.sse - b.sse) > 1e-12) return a.sse < b.sse ? a : b;
  return a;
}

function align(events, markers, offsetKm) {
  const rows = events.length + 1;
  const cols = markers.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(null));
  dp[0][0] = { matches: 0, sse: 0, pairs: [] };

  for (let i = 0; i <= events.length; i += 1) {
    for (let j = 0; j <= markers.length; j += 1) {
      const current = dp[i][j];
      if (!current) continue;

      if (i < events.length) dp[i + 1][j] = better(dp[i + 1][j], current);
      if (j < markers.length) dp[i][j + 1] = better(dp[i][j + 1], current);

      if (i < events.length && j < markers.length) {
        const predictedKm = events[i].chainageKm + offsetKm;
        const residualKm = markers[j].rvpKm - predictedKm;
        if (Math.abs(residualKm) <= MAX_RESIDUAL_KM) {
          const matched = {
            matches: current.matches + 1,
            sse: current.sse + residualKm ** 2,
            pairs: [...current.pairs, {
              eventIndex: events[i].eventIndex,
              eventChainageKm: events[i].chainageKm,
              eventCenter: events[i].center,
              officialIndex: j,
              from: markers[j].from,
              to: markers[j].to,
              officialRvpKm: markers[j].rvpKm,
              category1Rub: markers[j].category1Rub,
              residualKm,
            }],
          };
          dp[i + 1][j + 1] = better(dp[i + 1][j + 1], matched);
        }
      }
    }
  }

  return dp[events.length][markers.length] ?? { matches: 0, sse: Infinity, pairs: [] };
}

function summarizeAlignment(result, offsetKm, events, markers) {
  const matchedEventIndexes = new Set(result.pairs.map((pair) => pair.eventIndex));
  const matchedOfficialIndexes = new Set(result.pairs.map((pair) => pair.officialIndex));
  const pairs = result.pairs.map((pair) => ({
    ...pair,
    residualKm: round(pair.residualKm),
    impliedOffsetKm: round(pair.officialRvpKm - pair.eventChainageKm),
  }));
  return {
    offsetKm: round(offsetKm),
    matches: result.matches,
    sse: round(result.sse),
    rmsResidualKm: result.matches ? round(Math.sqrt(result.sse / result.matches)) : null,
    maxAbsResidualKm: result.matches ? round(Math.max(...result.pairs.map((pair) => Math.abs(pair.residualKm)))) : null,
    pairs,
    unmatchedEvents: events.filter((event) => !matchedEventIndexes.has(event.eventIndex)),
    unmatchedOfficialMarkers: markers
      .map((marker, index) => ({ index, ...marker }))
      .filter((marker) => !matchedOfficialIndexes.has(marker.index)),
  };
}

const producer = spawnSync(process.execPath, ["scripts/segment5a3-m12-physical-events.mjs"], {
  stdio: "inherit",
  timeout: 180_000,
});
if (producer.error) throw producer.error;
if (producer.status !== 0) throw new Error(`5A3 evidence producer exited with status ${producer.status}`);

const physical = JSON.parse(await readFile(PHYSICAL_EVENTS_PATH, "utf8"));
const tariff = JSON.parse(await readFile(TARIFF_PATH, "utf8"));

if (physical.source?.overpassRequests !== 0) throw new Error(`5B2A requires frozen-fixture evidence; overpassRequests=${physical.source?.overpassRequests}`);
if (!physical.mirrorProof?.allPairsMatch || physical.mirrorProof?.pairCount !== 11) {
  throw new Error(`5A3 mirror proof not green: pairs=${physical.mirrorProof?.pairCount}, allPairsMatch=${physical.mirrorProof?.allPairsMatch}`);
}
if (tariff.schemaVersion < 2 || !Array.isArray(tariff.sections) || tariff.sections.length !== 19) {
  throw new Error(`official tariff snapshot lacks 19 versioned RVP sections`);
}

const events = physical.mirrorProof.pairs
  .map((pair) => ({
    eventIndex: pair.forwardEventIndex,
    chainageKm: pair.forwardChainageKm,
    center: pair.forwardCenter,
    osmIds: pair.forwardOsmIds,
  }))
  .sort((a, b) => a.chainageKm - b.chainageKm);
const markers = tariff.sections.map((section) => ({
  from: section.from,
  to: section.to,
  rvpKm: section.rvpKm,
  category1Rub: section.category1Rub,
}));

const candidateOffsets = [];
for (const event of events) {
  for (const marker of markers) candidateOffsets.push(marker.rvpKm - event.chainageKm);
}

let best = null;
for (const offsetKm of candidateOffsets) {
  const result = align(events, markers, offsetKm);
  if (!best || result.matches > best.result.matches || (result.matches === best.result.matches && result.sse < best.result.sse)) {
    best = { offsetKm, result };
  }
}
if (!best || best.result.matches === 0) throw new Error("no event/RVP alignment found");

const refinedOffsetKm = median(best.result.pairs.map((pair) => pair.officialRvpKm - pair.eventChainageKm));
const refined = align(events, markers, refinedOffsetKm);
const summary = summarizeAlignment(refined, refinedOffsetKm, events, markers);
const monotonic = summary.pairs.every((pair, index, pairs) => index === 0 || (
  pair.eventIndex > pairs[index - 1].eventIndex && pair.officialIndex > pairs[index - 1].officialIndex
));
const success = summary.matches >= MIN_MATCHES
  && (summary.maxAbsResidualKm ?? Infinity) <= MAX_RESIDUAL_KM
  && monotonic;

const report = {
  generatedAt: new Date().toISOString(),
  diagnosticOnly: true,
  source: {
    physicalEventProof: "Segment 5A3",
    physicalEventCount: events.length,
    overpassRequests: physical.source.overpassRequests,
    fixtureScope: physical.source.fixtureScope,
    fixtureProvenance: physical.source.fixtureProvenance,
    tariffRoad: tariff.road,
    tariffSchemaVersion: tariff.schemaVersion,
    tariffEffectiveFrom: tariff.order?.effectiveFrom,
    tariffOrder: tariff.order?.number,
  },
  thresholds: {
    maxResidualKm: MAX_RESIDUAL_KM,
    minMatches: MIN_MATCHES,
  },
  seed: {
    candidateOffsetCount: candidateOffsets.length,
    bestRawOffsetKm: round(best.offsetKm),
    bestRawMatches: best.result.matches,
    bestRawSse: round(best.result.sse),
  },
  alignment: {
    ...summary,
    monotonic,
    success,
  },
};

await writeFile(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`);
console.log(`M12 RVP calibration: matches=${summary.matches}/${events.length}; offset=${summary.offsetKm}km; maxResidual=${summary.maxAbsResidualKm}km; unmatchedEvents=${summary.unmatchedEvents.length}; monotonic=${monotonic}`);
for (const pair of summary.pairs) {
  console.log(`  event ${pair.eventIndex} @ ${pair.eventChainageKm}km -> RVP ${pair.officialRvpKm}km (${pair.from}->${pair.to}), residual=${pair.residualKm}km`);
}
if (summary.unmatchedEvents.length) {
  console.log(`  rejected event(s): ${summary.unmatchedEvents.map((event) => `${event.eventIndex}@${event.chainageKm}km`).join(", ")}`);
}
if (!success) {
  throw new Error(`5B2A calibration failed: matches=${summary.matches}, maxResidual=${summary.maxAbsResidualKm}, monotonic=${monotonic}`);
}
