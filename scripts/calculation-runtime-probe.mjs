import { spawn } from "node:child_process";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { performance } from "node:perf_hooks";

export const calculationProbeRequest = {
  from: { label: "Анапа", position: { lng: 37.32, lat: 44.90 } },
  to: { label: "Краснодар", position: { lng: 38.98, lat: 45.04 } },
  departureAt: "2026-10-13T09:00:00+03:00",
};
const specialRequest = {
  from: { label: "Донецк — ДНР", position: { lng: 37.8029, lat: 48.0156 } },
  to: { label: "Москва", position: { lng: 37.6174782, lat: 55.7505412 } },
  departureAt: calculationProbeRequest.departureAt,
};
export function calculationProbeCase(caseId = "anapa-krasnodar") {
  if (caseId !== "anapa-krasnodar" && caseId !== "donetsk-moscow") throw new RangeError("Unknown calculation probe case");
  return { caseId, request: structuredClone(caseId === "donetsk-moscow" ? specialRequest : calculationProbeRequest) };
}
export async function saveProbeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(value, null, 2) + "\n");
  await rename(temporary, path);
}

export function summarizeCalculation({ httpStatus, body, serverTiming, elapsedMs, expectedSpecial = false }) {
  const fast = body?.legs?.[0]?.fast;
  const totals = [...String(serverTiming ?? "").matchAll(/(?:^|,\s*)calc_total;dur=([\d.]+)(?=,|$)/gu)];
  const handlerElapsedMs = totals.length === 1 ? Number(totals[0][1]) : null;
  const requiredStages = ["special_options", "routing", "provider_valhalla", "provider_osrm", "toll_matching", "toll_pricing"];
  const validTiming = handlerElapsedMs !== null && Number.isFinite(handlerElapsedMs) && handlerElapsedMs >= 0
    && (!expectedSpecial || requiredStages.every(stage => new RegExp(`(?:^|,\\s*)${stage};dur=[\\d.]+(?=,|$)`, "u").test(serverTiming)));
  const validRoute = Number.isFinite(fast?.meters) && fast.meters > 0 && Number.isFinite(fast?.seconds) && fast.seconds > 0;
  const tolls = fast?.tolls;
  const amount = tolls?.amount;
  const validPrice = tolls && ["priced", "unknown", "incomplete", "free"].includes(tolls.pricingStatus)
    && (tolls.pricingStatus === "priced" || tolls.pricingStatus === "free"
      ? Number.isFinite(amount) && amount >= 0 : amount === null);
  const validElapsed = Number.isFinite(elapsedMs) && elapsedMs >= 0;
  const overTarget = validTiming && validElapsed ? handlerElapsedMs > 10_000 || elapsedMs > 10_000 : null;
  const status = httpStatus !== 200 ? "API_ERROR" : !validRoute ? "INVALID_RESPONSE"
    : expectedSpecial && body.specialEndpoint !== true ? "ROUTE_POLICY_MISMATCH"
    : !validTiming || !validElapsed ? "TIMING_INVALID" : !validPrice ? "PRICE_INTEGRITY_ERROR"
    : overTarget ? "OVER_TARGET" : "PASS";
  return { status, httpStatus, elapsedMs, handlerElapsedMs, targetMs: 10_000, overTarget,
    meters: fast?.meters ?? null, seconds: fast?.seconds ?? null,
    tollPricingStatus: tolls?.pricingStatus ?? null, tollAmount: amount ?? null,
    tariffIndependentlyVerified: false, deployedBrowserEndToEnd: false };
}

/** Runs exactly one real production handler. Injection is only for offline contracts. */
export async function runCalculationHandlerProbe({ outputPath, handler, requestFactory, now = () => performance.now(), caseId = "anapa-krasnodar" }) {
  const { request } = calculationProbeCase(caseId);
  const importedAt = now();
  if (!handler) {
    const [{ POST }, { NextRequest }] = await Promise.all([
      import("../app/api/v3/calculate/route.ts"), import("next/server.js"),
    ]);
    handler = POST;
    requestFactory = () => new NextRequest("http://localhost/api/v3/calculate", {
      method: "POST", body: JSON.stringify(request),
    });
  }
  const importedMs = now() - importedAt;
  const started = now();
  const response = await handler(requestFactory(request));
  const body = await response.json();
  const elapsedMs = now() - started;
  const serverTiming = response.headers.get("Server-Timing");
  const summary = summarizeCalculation({ httpStatus: response.status, body, serverTiming, elapsedMs, expectedSpecial: caseId === "donetsk-moscow" });
  const result = { schemaVersion: 1, mode: "production-handler-with-network", caseId, request,
    importedMs, ...summary, serverTiming, body };
  await saveProbeJson(outputPath, result);
  console.log(JSON.stringify({ type: "calculation-runtime-summary", caseId, ...summary, importedMs, serverTiming }));
  return result;
}

/** A hard process deadline also bounds stuck imports, CPU work and ignored AbortSignals. */
export async function superviseCalculationProbe({ outputPath = "calculation-runtime-probe.json", timeoutMs = 60_000,
  command = process.execPath, args, quiet = false, caseId = "anapa-krasnodar" } = {}) {
  const { request } = calculationProbeCase(caseId);
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 60_000) throw new RangeError("Probe deadline must be1–60000ms");
  outputPath = resolve(outputPath);
  const started = performance.now();
  await saveProbeJson(outputPath, { schemaVersion: 1, status: "IN_PROGRESS", mode: "production-handler-with-network",
    caseId, request, timeoutMs, startedAt: new Date().toISOString() });
  const childArgs = args ?? ["--import", fileURLToPath(new URL("./register-ts-paths.mjs", import.meta.url)),
    fileURLToPath(import.meta.url), "--worker", outputPath, caseId];
  const outcome = await new Promise(resolveResult => {
    const child = spawn(command, childArgs, { shell: false, stdio: quiet ? "ignore" : "inherit", timeout: timeoutMs, killSignal: "SIGKILL" });
    child.once("error", () => resolveResult({ error: true }));
    child.once("close", (code, signal) => resolveResult({ code, signal }));
  });
  let result;
  try { result = JSON.parse(await readFile(outputPath, "utf8")); } catch { /* Missing output is an explicit failure. */ }
  const complete = result?.schemaVersion === 1 && result.caseId === caseId
    && JSON.stringify(result.request) === JSON.stringify(request)
    && ["PASS", "OVER_TARGET", "API_ERROR", "INVALID_RESPONSE", "TIMING_INVALID", "PRICE_INTEGRITY_ERROR", "ROUTE_POLICY_MISMATCH"].includes(result?.status);
  if (outcome.error || outcome.signal || outcome.code !== 0 || !complete) {
    result = { schemaVersion: 1, mode: "production-handler-with-network", caseId, request,
      status: outcome.signal === "SIGKILL" ? "PROCESS_TIMEOUT" : "WORKER_ERROR",
      childCode: outcome.code ?? null, childSignal: outcome.signal ?? null,
      partial: result ?? null, deployedBrowserEndToEnd: false };
  }
  result.supervisorElapsedMs = performance.now() - started;
  result.timeoutMs = timeoutMs;
  await saveProbeJson(outputPath, result);
  console.log(JSON.stringify({ type: "calculation-runtime-process", status: result.status, supervisorElapsedMs: result.supervisorElapsedMs }));
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === "--worker") {
    await runCalculationHandlerProbe({ outputPath: process.argv[3], caseId: process.argv[4] });
  } else {
    const result = await superviseCalculationProbe({ caseId: process.env.CALCULATION_PROBE_CASE ?? "anapa-krasnodar" });
    if (result.status !== "PASS") process.exitCode = 1;
  }
}
