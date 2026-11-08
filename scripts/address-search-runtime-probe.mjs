import { writeFile, rename } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";
import { collectAddressFeatures } from "../lib/address-search-service.ts";
import { rankPhotonFeatures } from "../lib/photon-address-search.ts";
import { SPECIAL_TERRITORY_BOUNDARIES } from "../lib/special-territory-boundaries.ts";
import { photonFailureReason } from "../lib/photon-fetch.ts";

const defaultQueries = ["Ростов", "Красн", "Донецк"];
async function saveJson(path, value) {
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(value, null, 2) + "\n"); await rename(temporary, path);
}
function checksFor(query, items) {
  if (query === "Ростов") return { rostovOnDonWithinFirstEight: items.slice(0, 8).some(item => item.title === "Ростов-на-Дону") };
  if (query === "Красн") return { krasnodarFirst: items[0]?.title === "Краснодар" };
  if (query === "Донецк") return { donetskDnrFirst: items[0]?.label === "Донецк — ДНР",
    donetskRostovSecond: /Ростовская область/u.test(items[1]?.label ?? "") };
  return { nonempty: items.length > 0 };
}

/** The default is the production collector/pool, not the legacy raw fan-out.
 * A collector injection is used only by offline contracts. */
export async function runRuntimeAddressProbe({ queries = defaultQueries, collect = collectAddressFeatures,
  perQueryBudgetMs = 20_000, totalBudgetMs = 60_000, now = performance.now.bind(performance),
  outputPath = "address-search-runtime-probe.json", progressPath = outputPath.replace(/\.json$/u, "") + "-progress.json",
  report = value => console.log(JSON.stringify(value)),
} = {}) {
  if (!Array.isArray(queries) || !queries.length || queries.length > 3
    || queries.some(query => typeof query !== "string" || query.trim().length < 3 || query.length > 200)
    || !Number.isFinite(perQueryBudgetMs) || perQueryBudgetMs <= 0 || perQueryBudgetMs > 20_000
    || !Number.isFinite(totalBudgetMs) || totalBudgetMs <= 0 || totalBudgetMs > 60_000) {
    throw new RangeError("Runtime address probe requires1–3 queries, ≤20s each and ≤60s total");
  }
  const started = now(), deadline = started + totalBudgetMs, rows = [];
  let status = "IN_PROGRESS";
  async function save() {
    const progress = { status, completed: rows.length, planned: queries.length,
      remainingQueries: queries.slice(rows.length), elapsedMs: Math.round(now() - started), perQueryBudgetMs, totalBudgetMs };
    await saveJson(outputPath, { schemaVersion: 1, mode: "production-address-collector", ...progress, rows });
    await saveJson(progressPath, progress);
    return progress;
  }
  await save();
  for (const query of queries) {
    const remaining = deadline - now();
    if (remaining <= 0) { status = "BUDGET_EXHAUSTED"; break; }
    const at = now(), controller = new AbortController();
    let timer;
    try {
      const expiry = new Promise((_, reject) => { timer = setTimeout(() => {
        controller.abort(); const error = new Error("Runtime address probe deadline"); error.name = "ProbeTimeoutError"; reject(error);
      }, Math.min(perQueryBudgetMs, remaining)); });
      const result = await Promise.race([collect(query, { signal: controller.signal, budgetMs: Math.min(perQueryBudgetMs, remaining) }), expiry]);
      if (!Array.isArray(result?.features)) throw new Error("Invalid runtime collector response");
      const items = rankPhotonFeatures(result.features, SPECIAL_TERRITORY_BOUNDARIES, query);
      const checks = checksFor(query, items);
      const rowStatus = result.unavailable ? "SOURCE_UNAVAILABLE" : Object.values(checks).every(Boolean) ? "PASS" : "CHECK_FAILED";
      rows.push({ query, status: rowStatus, elapsedMs: Math.round(now() - at), sourceCount: result.sourceCount,
        failures: result.failures, budgetExpired: result.budgetExpired, featureCount: result.features.length,
        rawFeatures: result.features.slice(0, 500), rawFeaturesTruncated: result.features.length > 500, items, checks });
      report({ query, status: rowStatus, elapsedMs: rows.at(-1).elapsedMs, sourceCount: result.sourceCount,
        failures: result.failures, featureCount: result.features.length, checks });
      if (result.unavailable) { status = "SOURCE_UNAVAILABLE"; await save(); break; }
    } catch (error) {
      status = error?.name === "ProbeTimeoutError" ? "QUERY_TIMEOUT" : "PROBE_ERROR";
      rows.push({ query, status, elapsedMs: Math.round(now() - at), errorCode: error?.name === "ProbeTimeoutError" ? "deadline" : photonFailureReason(error) });
      report({ query, status, errorCode: rows.at(-1).errorCode });
      await save(); break;
    } finally { clearTimeout(timer); controller.abort(); }
    await save();
  }
  if (status === "IN_PROGRESS") status = rows.length === queries.length
    ? rows.every(row => row.status === "PASS") ? "PASS" : "CHECK_FAILED" : "BUDGET_EXHAUSTED";
  const progress = await save();
  report({ type: "address-runtime-probe-summary", mode: "production-address-collector", ...progress });
  return { rows, progress };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await runRuntimeAddressProbe();
  if (result.progress.status !== "PASS") process.exitCode = 1;
}
