import { writeFile } from "node:fs/promises";
import { summarizeRoute } from "./v3-live-route-contract.mjs";

const baseUrl = (process.env.CALCULATOR_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const reportPath = process.env.V3_LIVE_ROUTE_REPORT || "/tmp/v3-live-route-results.json";
const departureAt = process.env.V3_AUDIT_DEPARTURE_AT || "2026-10-02T09:00:00+03:00";
const timeoutMs = 90_000;
const cases = [
  ["yalta-krasnodar", "Ялта", [34.166301, 44.495205], "Краснодар", [38.975313, 45.035470]],
  ["yalta-moscow", "Ялта", [34.166301, 44.495205], "Москва", [37.617644, 55.755819]],
  ["donetsk-kazan", "Донецк", [37.8013407, 48.0158753], "Казань", [49.106405, 55.796127]],
  ["moscow-kazan", "Москва", [37.617644, 55.755819], "Казань", [49.106405, 55.796127]],
  ["tver-adler", "Тверь", [35.9176, 56.8587], "Адлер", [39.9180, 43.4382]],
  ["golubitskaya-petersburg", "Голубицкая", [37.2761, 45.3258], "Санкт-Петербург", [30.3351, 59.9343]],
];

function point(label, [lng, lat]) {
  return { label, position: { lng, lat } };
}

let version = { httpStatus: null, commit: null, matchesExpected: null };
try {
  const response = await fetch(`${baseUrl}/api/version`, { headers: { "cache-control": "no-cache" } });
  const body = await response.json().catch(() => null);
  const expectedCommit = process.env.EXPECTED_COMMIT || null;
  version = {
    httpStatus: response.status,
    commit: typeof body?.commit === "string" ? body.commit : null,
    matchesExpected: expectedCommit ? response.ok && body?.commit === expectedCommit : null,
  };
} catch {
  version = { httpStatus: null, commit: null, matchesExpected: false };
}

const results = [];
for (const [id, fromName, fromCoordinate, toName, toCoordinate] of cases) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}/api/v3/calculate`, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "MezhgorodV3FinalGate/1.0" },
      body: JSON.stringify({
        mode: "standard",
        vehicle: "standard",
        departureAt,
        from: point(fromName, fromCoordinate),
        to: point(toName, toCoordinate),
      }),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);
    const routes = (Array.isArray(body?.options) ? body.options : body?.legs ?? [])
      .map(summarizeRoute);
    const ok = response.ok && routes.length > 0 && routes.every((route) => route.ok);
    results.push({ id, httpStatus: response.status, elapsedMs: Date.now() - startedAt, mode: body?.mode ?? null, specialEndpoint: body?.specialEndpoint ?? null, preferredCorridor: body?.preferredCorridor ?? null, routes, ok, errorClass: response.ok ? null : response.status >= 500 ? "ROUTING_OR_SERVER_ERROR" : "CLIENT_ERROR" });
  } catch (error) {
    results.push({ id, httpStatus: null, elapsedMs: Date.now() - startedAt, routes: [], ok: false, errorClass: error?.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR" });
  } finally {
    clearTimeout(timeout);
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  baseUrl,
  apiPath: "/api/v3/calculate",
  expectedCommit: process.env.EXPECTED_COMMIT || null,
  version,
  departureAt,
  requestCount: results.length,
  results,
  passed: results.filter((result) => result.ok).length,
  failed: results.filter((result) => !result.ok).length,
  note: "Sanitized route summaries only; no provider responses, route geometry, user data, or control-band assertions are stored.",
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
for (const result of results) console.log(JSON.stringify(result));
console.log(`V3 live route audit: ${report.passed}/${report.requestCount} passed; report=${reportPath}`);
if (report.failed > 0 || version.httpStatus !== 200 || version.matchesExpected === false) process.exitCode = 1;
