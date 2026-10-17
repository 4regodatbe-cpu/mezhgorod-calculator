import { writeFile, rename } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";
import { fetchJsonWithin } from "./bounded-json-fetch.mjs";
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "../lib/special-territory-boundaries.ts";
import { photonSearchUrls, rankPhotonFeatures } from "../lib/photon-address-search.ts";
import { classifyTerritory } from "../lib/special-territory-geometry.ts";
import { inCrimea } from "../lib/special-territory-policy.ts";

const defaultQueries = ["Донецк", "Донецкая область", "Макеевка", "Луганск", "Ялта", "Изюм", "Ялта ДНР", "Ялта Крым", "Севастополь", "Краснодар", "Москва", "Запорожье", "Харьков, Украина"];

async function saveJson(path, value) {
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(value, null, 2) + "\n");
  await rename(temporary, path);
}

export async function runAddressSearchProbe({
  queries = defaultQueries,
  queryUrls = photonSearchUrls,
  fetchImpl = globalThis.fetch,
  requestTimeoutMs = 10_000,
  totalTimeoutMs = 90_000,
  outputPath = "address-search-live-probe.json",
  progressPath = outputPath.replace(/\.json$/u, "") + "-progress.json",
  report = (value) => console.log(JSON.stringify(value)),
} = {}) {
if (!Number.isFinite(totalTimeoutMs) || totalTimeoutMs <= 0
  || !Number.isFinite(requestTimeoutMs) || requestTimeoutMs <= 0) throw new RangeError("Probe time limits must be positive and finite");
const started = performance.now();
const deadlineAt = started + totalTimeoutMs;
const reports = [];
let budgetExhausted = false;
async function saveProgress(status) {
  const progress = { status, completed: reports.length, planned: queries.length,
    remainingQueries: queries.slice(reports.length), elapsedMs: Math.round(performance.now() - started),
    requestTimeoutMs, totalTimeoutMs,
    failedSources: reports.reduce((sum, row) => sum + row.failedSources, 0) };
  // Preserve the original array contract; progress is a separate artifact.
  await saveJson(outputPath, reports);
  await saveJson(progressPath, progress);
  return progress;
}
await saveProgress("IN_PROGRESS");
for (const query of queries) {
  if (performance.now() >= deadlineAt) { budgetExhausted = true; break; }
  const outcomes = await Promise.allSettled(queryUrls(query).map(async (url) => {
    const payload = await fetchJsonWithin(url, { fetchImpl, timeoutMs: requestTimeoutMs, deadlineAt });
    if (!Array.isArray(payload.features)) throw new Error("Photon response has no features array");
    return payload.features;
  }));
  if (outcomes.some((outcome) => outcome.status === "rejected" && outcome.reason?.name === "ProbeBudgetError")) budgetExhausted = true;
  const features = outcomes.flatMap((outcome) => outcome.status === "fulfilled" ? outcome.value : []);
  const items = rankPhotonFeatures(features, zones, query);
  const rankingChecks = {
    donetskDnrFirst: query === "Донецк" ? items[0]?.label === "Донецк — ДНР" : undefined,
    donetskRostovSecond: query === "Донецк" ? /Ростовская область/u.test(items[1]?.label ?? "") : undefined,
    moscowFirst: query === "Москва" ? items[0]?.label === "Москва, Россия" : undefined,
    makeyevkaDnrPresent: query === "Макеевка" ? items.some((item) => item.label === "Макеевка — ДНР") : undefined,
    yaltaPriorityTerritoryFirst: query === "Ялта" ? items[0]?.label === "Ялта — ДНР" : undefined,
    yaltaDnrFirst: query === "Ялта ДНР" ? items[0]?.label === "Ялта — ДНР" : undefined,
    yaltaCrimeaQualifiedFirst: query === "Ялта Крым" ? items[0]?.label === "Ялта — Крым" : undefined,
    izyumPriorityTerritoryFirst: query === "Изюм" ? items[0]?.label === "Изюм — ДНР" : undefined,
    izyumUkraineCityWithinFirstEight: query === "Изюм" ? items.some((item) => item.label === "Ізюм" || /Ізюм/u.test(item.label)) : undefined,
  };
  const rendered = items.slice(0, 8).map((item) => ({
    title: item.title,
    label: item.label,
    position: item.position,
    territory: classifyTerritory(item.position, zones),
    crimea: inCrimea(item.position),
  }));
  reports.push({
    query,
    globalStatus: outcomes[0].status,
    ukraineStatus: outcomes[1].status,
    featureCount: features.length,
    failedSources: outcomes.filter((outcome) => outcome.status === "rejected").length,
    sourceErrors: outcomes.map((outcome, sourceIndex) => outcome.status === "rejected"
      ? { sourceIndex, name: outcome.reason?.name ?? "Error", message: String(outcome.reason?.message ?? outcome.reason).slice(0, 200) }
      : null).filter(Boolean),
    rankingChecks,
    topSuggestions: rendered,
    specialMatchFound: rendered.some((item) => item.territory !== null),
    crimeaLabelFound: rendered.some((item) => item.crimea && item.label.endsWith("— Крым")),
  });
  await saveProgress("IN_PROGRESS");
  report(reports.at(-1));
  if (budgetExhausted) break;
}
const progress = await saveProgress(!budgetExhausted && reports.length === queries.length ? "DONE" : "BUDGET_EXHAUSTED");
report({ type: "address-search-live-summary", ...progress,
  checks: reports.map(({query,rankingChecks,featureCount,failedSources})=>({query,rankingChecks,featureCount,failedSources})) });
return { reports, progress };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { progress } = await runAddressSearchProbe();
  if (progress.status !== "DONE") process.exitCode = 1;
}
