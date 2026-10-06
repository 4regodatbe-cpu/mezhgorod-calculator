import { writeFile } from "node:fs/promises";
import { SPECIAL_TERRITORY_BOUNDARIES as zones } from "../lib/special-territory-boundaries.ts";
import { photonSearchUrls, rankPhotonFeatures } from "../lib/photon-address-search.ts";
import { classifyTerritory } from "../lib/special-territory-geometry.ts";
import { inCrimea } from "../lib/special-territory-policy.ts";

const queries = ["Донецк", "Донецкая область", "Макеевка", "Луганск", "Ялта", "Севастополь", "Краснодар", "Москва", "Запорожье", "Харьков, Украина"];
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
    const rankingChecks = {
    donetskDnrFirst: query === "Донецк" ? items[0]?.label === "Донецк — ДНР" : undefined,
    donetskRostovSecond: query === "Донецк" ? /Ростовская область/u.test(items[1]?.label ?? "") : undefined,
    moscowFirst: query === "Москва" ? items[0]?.label === "Москва, Россия" : undefined,
    makeyevkaDnrPresent: query === "Макеевка" ? items.some((item) => item.label === "Макеевка — ДНР") : undefined,
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
    rankingChecks,
    topSuggestions: rendered,
    specialMatchFound: rendered.some((item) => item.territory !== null),
    crimeaLabelFound: rendered.some((item) => item.crimea && item.label.endsWith("— Крым")),
  });
  console.log(JSON.stringify(reports.at(-1)));
}
await writeFile("address-search-live-probe.json", JSON.stringify(reports, null, 2) + "\n");\nconsole.log(JSON.stringify({ type: "address-search-live-summary", checks: reports.map(({query,rankingChecks,featureCount,failedSources})=>({query,rankingChecks,featureCount,failedSources})) }));
