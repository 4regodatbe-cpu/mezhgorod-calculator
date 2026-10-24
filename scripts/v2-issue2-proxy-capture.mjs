import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import { pathToFileURL } from "node:url";
import { NextRequest } from "next/server";
import { POST } from "../app/api/v2/calculate/route.ts";
import { recordingFetch, requestKey } from "../experiments/nationwide-tolls/scripts/systemic-audit-io.mjs";

export const CASES = Object.freeze({
  "yeisk-to-moscow": {
    from: { label: "Ейск", position: { lat: 46.711524, lng: 38.276451 } },
    to: { label: "Москва", position: { lat: 55.755819, lng: 37.617644 } },
  },
  "maykop-to-moscow": {
    from: { label: "Майкоп", position: { lat: 44.609826, lng: 40.100653 } },
    to: { label: "Москва", position: { lat: 55.755819, lng: 37.617644 } },
  },
});

export const DEFAULT_DEPARTURE = "2026-10-22T09:00:00+03:00";
export const OUTPUT_ROOT = "experiments/nationwide-tolls/source-snapshots/issue2-yeysk-maykop/v2-2026-10-24";

export function buildCaseRequest(caseId, departureAt = DEFAULT_DEPARTURE) {
  const route = CASES[caseId];
  if (!route) throw new Error(`CASE_NOT_ALLOWED:${caseId}`);
  if (Number.isNaN(new Date(departureAt).getTime())) throw new Error(`INVALID_DEPARTURE:${departureAt}`);
  return { mode: "standard", from: route.from, to: route.to, departureAt };
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function atomicWrite(file, bytes) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp`;
  fs.writeFileSync(temporary, bytes);
  fs.renameSync(temporary, file);
}

async function callHandler(body) {
  const request = new NextRequest("http://local.test/api/v2/calculate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const response = await POST(request);
  const text = await response.text();
  return {
    status: response.status,
    contentType: response.headers.get("content-type"),
    text,
    json: JSON.parse(text),
  };
}

function createAuditedReplay(calls) {
  const queues = new Map();
  for (const call of calls) {
    const queue = queues.get(call.key) ?? [];
    queue.push(call);
    queues.set(call.key, queue);
  }
  const misses = [];
  let consumed = 0;
  const fetch = async (url, init) => {
    const key = requestKey(url, init);
    const item = queues.get(key)?.shift();
    if (!item) {
      misses.push({ key, url: String(url) });
      throw new Error(`REPLAY_RESPONSE_MISSING:${key}`);
    }
    consumed += 1;
    if (item.error) throw new Error(item.error);
    const headers = { "content-type": item.contentType ?? "application/json" };
    if (item.retryAfter != null) headers["retry-after"] = item.retryAfter;
    return new Response([204, 205, 304].includes(item.status) ? null : item.text, { status: item.status, headers });
  };
  const remaining = () => [...queues.values()].reduce((total, queue) => total + queue.length, 0);
  return { fetch, misses, remaining, get consumed() { return consumed; } };
}

export async function captureCase(caseId, departureAt = DEFAULT_DEPARTURE) {
  const body = buildCaseRequest(caseId, departureAt);
  const calls = [];
  const originalFetch = globalThis.fetch;
  const directory = path.join(OUTPUT_ROOT, caseId);
  const progressPath = path.join(directory, "progress.json.gz");
  try {
    globalThis.fetch = recordingFetch(originalFetch, calls, () => {
      atomicWrite(progressPath, gzipSync(JSON.stringify({ complete: false, caseId, request: body, calls })));
    });
    const response = await callHandler(body);
    const capture = { schemaVersion: 1, caseId, capturedAt: new Date().toISOString(), request: body, response, calls };
    const bytes = gzipSync(JSON.stringify(capture));
    const capturePath = path.join(directory, "capture.json.gz");
    atomicWrite(capturePath, bytes);
    const summary = {
      caseId,
      request: body,
      responseStatus: response.status,
      providerCalls: calls.length,
      capturePath,
      captureBytes: bytes.length,
      captureSha256: sha256(bytes),
    };
    atomicWrite(path.join(directory, "capture-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
    return summary;
  } finally {
    globalThis.fetch = originalFetch;
  }
}

export async function replayCase(capturePath, departureAt) {
  const capture = JSON.parse(gunzipSync(fs.readFileSync(capturePath)));
  const body = buildCaseRequest(capture.caseId, departureAt);
  const replay = createAuditedReplay(capture.calls);
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = replay.fetch;
    const response = await callHandler(body);
    const result = {
      caseId: capture.caseId,
      departureAt,
      responseStatus: response.status,
      response: response.json,
      replayIntegrity: {
        liveNetworkRequests: 0,
        capturedCalls: capture.calls.length,
        consumedCalls: replay.consumed,
        missingResponses: replay.misses,
        unusedResponses: replay.remaining(),
      },
    };
    const output = path.join(path.dirname(capturePath), `replay-${departureAt.replace(/[:+]/g, "-")}.json`);
    atomicWrite(output, `${JSON.stringify(result, null, 2)}\n`);
    return { output, ...result };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

export async function preflight() {
  const requests = Object.fromEntries(Object.keys(CASES).map((caseId) => [caseId, buildCaseRequest(caseId)]));
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  try {
    globalThis.fetch = async () => {
      fetchCalls += 1;
      throw new Error("PREFLIGHT_NETWORK_FORBIDDEN");
    };
    const invalidResponse = await callHandler({ mode: "standard", from: null, to: null, departureAt: DEFAULT_DEPARTURE });
    if (invalidResponse.status !== 400 || fetchCalls !== 0) throw new Error("PREFLIGHT_HANDLER_GUARD_FAILED");
    return { status: "PASS", caseIds: Object.keys(CASES), requests, invalidStatus: invalidResponse.status, fetchCalls };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function main() {
  const [mode, first, second] = process.argv.slice(2);
  if (mode === "--preflight") return console.log(JSON.stringify(await preflight()));
  if (mode === "--capture") return console.log(JSON.stringify(await captureCase(first, second ?? DEFAULT_DEPARTURE)));
  if (mode === "--replay") return console.log(JSON.stringify(await replayCase(first, second)));
  throw new Error("Usage: --preflight | --capture <case-id> [departureAt] | --replay <capture.json.gz> <departureAt>");
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
