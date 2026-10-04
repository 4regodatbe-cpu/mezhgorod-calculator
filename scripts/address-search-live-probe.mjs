import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "../lib/special-territory-boundaries.ts";
import { photonSearchUrls, rankPhotonFeatures } from "../lib/photon-address-search.ts";
import { classifyTerritory } from "../lib/special-territory-geometry.ts";
import { inCrimea } from "../lib/special-territory-policy.ts";

const queries = ["Донецк", "Донецкая область", "Макеевка", "Луганск", "Ялта", "Севастополь", "Краснодар", "Москва"];
const reports = [];
for (const query of queries) {
  const outcomes = await Promise.allSettled(photonSearchUrls(query).map(async (url) => {
    const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "MezhgorodCalculator/1.0" } });
    if (!response.ok) throw new Error(`Photon HTTP ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload.features)) throw new Error("Photon response has no features array");
    return payload.features;
  }));
  const features = outcomes.flatMap((outcome) => outcome.status === "fulfilled" ? outcome.value : []);
  const items = rankPhotonFeatures(features, zones, query);
  if (query === "Донецк") {
    assert.equal(items[0]?.label, "Донецк — ДНР", "the DNR locality should use its Russian product label");
  }
  if (query === "Москва") {
    assert.equal(items[0]?.label, "Москва, Россия", "the Moscow city must outrank unrelated same-name objects in priority territories");
  }
  if (query === "Макеевка") {
    assert.equal(items[0]?.label, "Макеевка — ДНР", "the DNR namesake must be found through the Ukrainian provider spelling");
  }
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
    topSuggestions: rendered,
    specialMatchFound: rendered.some((item) => item.territory !== null),
    crimeaLabelFound: rendered.some((item) => item.crimea && item.label.endsWith("— Крым")),
  });
  console.log(JSON.stringify(reports.at(-1)));
}
await writeFile("address-search-live-probe.json", JSON.stringify(reports, null, 2) + "\n");
