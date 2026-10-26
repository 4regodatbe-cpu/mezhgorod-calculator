import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { pathToFileURL } from "node:url";
import { CASES, DEFAULT_DEPARTURE, OUTPUT_ROOT, captureCase, replayCase } from "./v2-issue2-proxy-capture.mjs";

const ROUTERS = Object.freeze({
  valhalla: "valhalla1.openstreetmap.de",
  osrm: "router.project-osrm.org",
  brouter: "brouter.de",
});
const REQUIRED_CALLS = Object.freeze({ [ROUTERS.valhalla]: 3, [ROUTERS.osrm]: 1, [ROUTERS.brouter]: 1 });
const THURSDAY = "2026-10-22T09:00:00+03:00";
const SATURDAY = "2026-10-24T09:00:00+03:00";
const artifactRoot = process.env.B10_ARTIFACT_DIR ?? `b10-v2-issue2-${process.env.GITHUB_RUN_ID ?? "local"}`;
const runRoot = path.resolve(OUTPUT_ROOT);
const artifactPath = path.resolve(artifactRoot);

function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
function atomicWrite(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  fs.writeFileSync(temp, data);
  fs.renameSync(temp, file);
}
function jsonGzip(file, value) { atomicWrite(file, gzipSync(JSON.stringify(value))); }
function updateManifest(manifest) { atomicWrite(path.join(artifactPath, "execution.json"), `${JSON.stringify(manifest, null, 2)}\n`); }

function probeRequests() {
  const { from, to } = CASES["yeisk-to-moscow"];
  const a = from.position;
  const b = to.position;

  const valhallaUrl = new URL(`https://${ROUTERS.valhalla}/route`);
  valhallaUrl.searchParams.set("json", JSON.stringify({
    locations: [{ lat: a.lat, lon: a.lng, type: "break" }, { lat: b.lat, lon: b.lng, type: "break" }],
    costing: "auto", costing_options: { auto: { use_tolls: 1 } }, units: "kilometers", shape_format: "polyline6",
    directions_options: { language: "ru-RU", units: "kilometers" },
  }));

  const osrmUrl = new URL(`https://${ROUTERS.osrm}/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}`);
  osrmUrl.searchParams.set("overview", "false");
  osrmUrl.searchParams.set("steps", "false");

  const brouterUrl = new URL(`https://${ROUTERS.brouter}/brouter`);
  brouterUrl.searchParams.set("lonlats", `${a.lng},${a.lat}|${b.lng},${b.lat}`);
  brouterUrl.searchParams.set("profile", "car-vario");
  brouterUrl.searchParams.set("alternativeidx", "0");
  brouterUrl.searchParams.set("format", "geojson");

  return [
    { provider: "Valhalla", host: ROUTERS.valhalla, url: valhallaUrl.href, valid: (data) => Number(data?.trip?.summary?.length) > 0 && Number(data?.trip?.summary?.time) > 0 },
    { provider: "OSRM", host: ROUTERS.osrm, url: osrmUrl.href, valid: (data) => Number(data?.routes?.[0]?.distance) > 0 && Number(data?.routes?.[0]?.duration) > 0 },
    { provider: "BRouter", host: ROUTERS.brouter, url: brouterUrl.href, valid: (data) => Number(data?.features?.[0]?.properties?.["track-length"]) > 0 && Number(data?.features?.[0]?.properties?.["total-time"]) > 0 },
  ];
}

async function probeProviders() {
  const records = [];
  for (const item of probeRequests()) {
    const started = Date.now();
    const record = { provider: item.provider, host: item.host, requestUrl: item.url, method: "GET" };
    try {
      const response = await fetch(item.url, {
        headers: { Accept: item.provider === "BRouter" ? "application/geo+json" : "application/json", "User-Agent": "MezhgorodCalc/2.0 B10 bounded capture" },
        signal: AbortSignal.timeout(20_000),
      });
      const text = await response.text();
      let data = null;
      let parseError = null;
      try { data = JSON.parse(text); } catch (error) { parseError = String(error); }
      Object.assign(record, {
        status: response.status,
        responseUrl: response.url,
        redirected: response.redirected,
        contentType: response.headers.get("content-type"),
        responseBytes: Buffer.byteLength(text),
        responseSha256: sha256(text),
        responseText: text,
        validRouteData: response.status === 200 && data !== null && item.valid(data),
        ...(parseError ? { parseError } : {}),
      });
    } catch (error) {
      record.error = String(error);
    }
    record.elapsedMs = Date.now() - started;
    records.push(record);
    console.log(JSON.stringify({ phase: "provider-preflight", provider: record.provider, host: record.host, status: record.status ?? null, validRouteData: record.validRouteData ?? false, elapsedMs: record.elapsedMs, error: record.error ?? null }));
  }

  const summary = records.map(({ responseText, ...item }) => item);
  jsonGzip(path.join(artifactPath, "provider-preflight.json.gz"), { createdAt: new Date().toISOString(), caseId: "yeisk-to-moscow", requestLimit: 1, providers: records });
  atomicWrite(path.join(artifactPath, "provider-preflight-summary.json"), `${JSON.stringify({ caseId: "yeisk-to-moscow", requestLimit: 1, providers: summary }, null, 2)}\n`);
  const blocked = records.filter((record) => record.status !== 200 || record.validRouteData !== true || new URL(record.responseUrl ?? record.requestUrl).hostname !== record.host);
  if (blocked.length) throw new Error(`PROVIDER_PREFLIGHT_BLOCKED:${blocked.map((item) => `${item.provider}:${item.status ?? item.error ?? "invalid-route-data"}`).join(",")}`);
}

function checkCapture(caseId, summary) {
  const capturePath = path.join(runRoot, caseId, "capture.json.gz");
  const bytes = fs.readFileSync(capturePath);
  const capture = JSON.parse(gunzipSync(bytes));
  const callReport = capture.calls.map((call) => {
    const host = new URL(call.url).hostname;
    return { host, url: call.url, method: call.method, status: call.status ?? null, error: call.error ?? null, elapsedMs: call.elapsedMs ?? null, responseBytes: call.text == null ? null : Buffer.byteLength(call.text), responseSha256: call.text == null ? null : sha256(call.text) };
  });
  const counts = Object.fromEntries(Object.keys(REQUIRED_CALLS).map((host) => [host, callReport.filter((call) => call.host === host).length]));
  const failures = callReport.filter((call) => call.status !== 200 || call.error || call.responseSha256 === null);
  const routeResponse = capture.response?.json;
  const fast = routeResponse?.legs?.[0]?.fast;
  const errors = [];
  if (capture.response?.status !== 200) errors.push(`API_STATUS_${capture.response?.status}`);
  if (capture.caseId !== caseId) errors.push("CASE_ID_MISMATCH");
  if (callReport.length !== Object.values(REQUIRED_CALLS).reduce((a, b) => a + b, 0)) errors.push(`CALL_COUNT_${callReport.length}`);
  for (const [host, expected] of Object.entries(REQUIRED_CALLS)) if (counts[host] !== expected) errors.push(`HOST_CALL_COUNT_${host}_${counts[host]}_EXPECTED_${expected}`);
  if (failures.length) errors.push(`HTTP_OR_FETCH_FAILURES_${failures.length}`);
  if (!(Number(fast?.meters) > 0 && Number(fast?.seconds) > 0)) errors.push("API_ROUTE_RESULT_MISSING");
  const report = { caseId, passed: errors.length === 0, responseStatus: capture.response?.status, providerCalls: callReport.length, counts, calls: callReport, capture: { path: capturePath, bytes: bytes.length, sha256: sha256(bytes), declaredSha256: summary.captureSha256 }, errors };
  atomicWrite(path.join(artifactPath, `${caseId}-capture-validation.json`), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ phase: "capture-validation", caseId, passed: report.passed, responseStatus: report.responseStatus, providerCalls: report.providerCalls, counts, errors }));
  if (!report.passed) throw new Error(`CAPTURE_INCOMPLETE:${caseId}:${errors.join(";")}`);
  return { capturePath, capture, report };
}

function resultSummary(response) {
  const fast = response?.legs?.[0]?.fast;
  return {
    responseStatus: response?.responseStatus ?? 200,
    routeMeters: fast?.meters ?? null,
    routeSeconds: fast?.seconds ?? null,
    provider: fast?.quality?.providers ?? null,
    tollPricingStatus: fast?.tolls?.pricingStatus ?? null,
    tollAmount: Number.isFinite(fast?.tolls?.amount) ? fast.tolls.amount : null,
    weekdayAmount: Number.isFinite(fast?.tolls?.weekdayAmount) ? fast.tolls.weekdayAmount : null,
    weekendAmount: Number.isFinite(fast?.tolls?.weekendAmount) ? fast.tolls.weekendAmount : null,
    tollValidation: fast?.tollValidation?.status ?? null,
  };
}

function v3SummaryFromText(text) { return resultSummary({ responseStatus: 200, ...JSON.parse(text) }); }

async function compareWithV3(v2Captures) {
  const v3Root = "experiments/nationwide-tolls/source-snapshots/issue2-yeysk-maykop/2026-10-19";
  const v3ReplayPath = path.join(v3Root, "offline-replay.json.gz");
  const v3ReplayBytes = fs.readFileSync(v3ReplayPath);
  const v3Replay = JSON.parse(gunzipSync(v3ReplayBytes));
  const rows = [];
  for (const caseId of Object.keys(CASES)) {
    const v3CapturePath = path.join(v3Root, `${caseId}.json.gz`);
    const v3CaptureBytes = fs.readFileSync(v3CapturePath);
    const v3Capture = JSON.parse(gunzipSync(v3CaptureBytes));
    const v3Thursday = v3SummaryFromText(v3Capture.apiResponseText);
    const v3SaturdayRecord = v3Replay.results.find((row) => row.id === caseId && row.departureAt === SATURDAY);
    if (!v3SaturdayRecord || v3SaturdayRecord.apiStatus !== 200 || v3SaturdayRecord.thrown || v3SaturdayRecord.replayCalls !== v3SaturdayRecord.capturedCalls || v3SaturdayRecord.unusedResponses !== 0 || v3SaturdayRecord.misses?.length) {
      throw new Error(`V3_SATURDAY_REPLAY_NOT_COMPLETE:${caseId}`);
    }
    const v2CapturePath = v2Captures[caseId].capturePath;
    const v2Thursday = await replayCase(v2CapturePath, THURSDAY);
    const v2Saturday = await replayCase(v2CapturePath, SATURDAY);
    for (const [day, replay] of [[THURSDAY, v2Thursday], [SATURDAY, v2Saturday]]) {
      const integrity = replay.replayIntegrity;
      if (replay.responseStatus !== 200 || integrity.liveNetworkRequests !== 0 || integrity.missingResponses.length || integrity.unusedResponses !== 0 || integrity.capturedCalls !== integrity.consumedCalls) throw new Error(`V2_OFFLINE_REPLAY_INCOMPLETE:${caseId}:${day}`);
    }
    const cases = [
      { day: THURSDAY, v2: resultSummary(v2Thursday.response), v3: v3Thursday },
      { day: SATURDAY, v2: resultSummary(v2Saturday.response), v3: v3SummaryFromText(v3SaturdayRecord.apiResponseText) },
    ];
    rows.push({
      caseId,
      coordinates: CASES[caseId],
      v2Capture: { path: v2CapturePath, sha256: sha256(fs.readFileSync(v2CapturePath)) },
      v3Capture: { path: v3CapturePath, sha256: sha256(v3CaptureBytes), capturedAt: v3Capture.capturedAt },
      comparisons: cases.map((item) => ({
        day: item.day,
        v2: item.v2,
        v3: item.v3,
        difference: {
          routeMeters: Number.isFinite(item.v2.routeMeters) && Number.isFinite(item.v3.routeMeters) ? item.v2.routeMeters - item.v3.routeMeters : null,
          routeSeconds: Number.isFinite(item.v2.routeSeconds) && Number.isFinite(item.v3.routeSeconds) ? item.v2.routeSeconds - item.v3.routeSeconds : null,
          tollAmount: Number.isFinite(item.v2.tollAmount) && Number.isFinite(item.v3.tollAmount) ? item.v2.tollAmount - item.v3.tollAmount : null,
        },
      })),
    });
  }
  const report = { status: "COMPLETE_CONTROL_COMPARISON", departureThursday: THURSDAY, departureSaturday: SATURDAY, v3SourceReplaySha256: sha256(v3ReplayBytes), note: "Project proxy captures only; differences are not operator fare verification and unknown/null values are not zero.", results: rows };
  atomicWrite(path.join(artifactPath, "v2-v3-comparison.json"), `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

async function main() {
  fs.mkdirSync(artifactPath, { recursive: true });
  const manifest = {
    status: "STARTED",
    branch: "fix/v3-missing-route-prices-2026-10-15",
    sourceCommit: process.env.GITHUB_SHA ?? null,
    workflowRunId: process.env.GITHUB_RUN_ID ?? null,
    startedAt: new Date().toISOString(),
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    caseOrder: ["provider preflight (one request per router)", "yeisk-to-moscow capture", "maykop-to-moscow capture", "offline Thu/Sat replay and V2/V3 comparison"],
    casesCompleted: [],
  };
  updateManifest(manifest);
  try {
    await probeProviders();
    manifest.status = "PROVIDERS_AVAILABLE";
    updateManifest(manifest);
    const captures = {};
    for (const caseId of Object.keys(CASES)) {
      const summary = await captureCase(caseId, DEFAULT_DEPARTURE);
      const checked = checkCapture(caseId, summary);
      captures[caseId] = checked;
      manifest.casesCompleted.push({ caseId, responseStatus: summary.responseStatus, providerCalls: summary.providerCalls, captureSha256: summary.captureSha256 });
      manifest.status = caseId === "yeisk-to-moscow" ? "YEISK_CAPTURE_COMPLETE" : "MAYKOP_CAPTURE_COMPLETE";
      updateManifest(manifest);
    }
    const comparison = await compareWithV3(captures);
    manifest.status = comparison.status;
    manifest.completedAt = new Date().toISOString();
    updateManifest(manifest);
    console.log(JSON.stringify({ phase: "comparison", status: comparison.status, caseIds: comparison.results.map((row) => row.caseId), comparisonPath: path.join(artifactPath, "v2-v3-comparison.json") }));
  } catch (error) {
    manifest.status = "BLOCKED";
    manifest.error = String(error);
    manifest.completedAt = new Date().toISOString();
    updateManifest(manifest);
    console.error(JSON.stringify({ phase: "blocked", status: manifest.status, error: manifest.error, casesCompleted: manifest.casesCompleted }));
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) await main();
