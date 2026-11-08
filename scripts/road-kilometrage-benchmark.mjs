import { performance } from "node:perf_hooks";
import { writeFile } from "node:fs/promises";
import { createKilometrageResolver } from "../lib/toll-engine/road-kilometrage.ts";
import { optionalRoadKilometrage } from "../lib/toll-engine/optional-road-kilometrage.ts";

const boundary = (side, node, coordinate = null) => ({ id: `osm-transition:${node}:10>20`, kind: "road-transition",
  osmNodeId: node, coordinate, sourceIndex: 0, connectorCount: 0,
  from: { refs: [side === "entry" ? "А-1" : "М-4"], names: [] }, to: { refs: [side === "entry" ? "М-4" : "Р-2"], names: [] } });
const evidence = (entry, exit) => ({ provider: "valhalla-trace", targetRef: "М-4", precision: "matched-road-edge",
  routeSignature: "benchmark-synthetic", status: "resolved", reason: "benchmark", entry, exit });
function measure(name, action, iterations) {
  const coldAt = performance.now(); const first = action(); const firstMs = performance.now() - coldAt;
  const samples = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now(); action(); samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  return { name, iterations, firstCallMs: firstMs, p50Ms: samples[Math.floor(iterations * 0.5)],
    p95Ms: samples[Math.floor(iterations * 0.95)], maxMs: samples.at(-1), resultStatus: first.status };
}
const segments = 4096;
const sections = Array.from({ length: 64 }, (_, s) => ({ roadRef: "М-4", scaleId: "synthetic", branchId: `branch-${s}`,
  accessRoadRefs: ["А-1", "Р-2"], coordinates: Array.from({ length: 65 }, (_, i) => [10 + i * 0.0001, 10 + s * 0.000001]),
  startKm: 100, endKm: 100.7, uncertaintyKm: 0.1, maxOffsetKm: 0.05, source: "synthetic-benchmark-only", reviewed: true }));
const initAt = performance.now(); const resolve = createKilometrageResolver({ anchors: [], sections });
const indexBuildMs = performance.now() - initAt;
const output = { schemaVersion: 1, measuredAt: new Date().toISOString(), node: process.version, liveRequests: 0,
  scope: "Local module CPU only; no cold server startup, network, full route or end-to-end10s claim",
  indexBuildMs, syntheticStoredSegments: segments, syntheticLookupSegmentsPerBoundary: segments,
  measurements: [
    measure("actual-local-named-plaza-index", () => optionalRoadKilometrage(evidence(boundary("entry", "1755090321"), boundary("exit", "285903913"))), 10000),
    measure("retained-pending-nodes-no-anchors", () => optionalRoadKilometrage(evidence(boundary("entry", "4443232947"), boundary("exit", "358467208"))), 10000),
    measure("projection-at4096segment-budget-ambiguous", () => resolve(evidence(boundary("entry", "1", [10.003, 10]), boundary("exit", "2", [10.004, 10]))), 1000),
  ] };
const path = process.argv[2] ?? "experiments/road-ref-boundaries/checks/2026-10-24-kilometrage/performance.json";
await writeFile(path, JSON.stringify(output, null, 2) + "\n");
console.log(JSON.stringify(output, null, 2));
