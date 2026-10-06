import { classifyTerritory, type VerifiedTerritory } from "./special-territory-geometry.ts";
import { inCrimea } from "./special-territory-policy.ts";
import type { Suggestion } from "../app/v2/components/types.ts";

export type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: Record<string, string | number | undefined>;
};

function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е").replace(/і/g, "и").replace(/ї/g, "и").replace(/є/g, "е").replace(/ґ/g, "г")
    .replace(/[ьъ]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}

function uniqueParts(parts: unknown[]): string[] {
  const seen = new Set<string>();
  return parts.map(text).filter((part) => {
    if (!part) return false;
    const key = normalize(part);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const specialLabels = {
  dnr: "ДНР",
  lnr: "ЛНР",
  zaporizhzhia: "Запорожская область",
  kherson: "Херсонская область",
} as const;
const oblastLabels = {
  dnr: "Донецкая область",
  lnr: "Луганская область",
  zaporizhzhia: "Запорожская область",
  kherson: "Херсонская область",
} as const;

const localityRanks: Record<string, number> = {
  city: 6,
  town: 5,
  locality: 4,
  village: 3,
  hamlet: 2,
  isolated_dwelling: 2,
  farm: 2,
};

function localityRank(feature: PhotonFeature, exactName: boolean): number {
  const p = feature.properties ?? {};
  const key = text(p.osm_key).toLocaleLowerCase("en-US");
  const value = text(p.osm_value).toLocaleLowerCase("en-US");
  const rank = localityRanks[value];
  if (rank && (!key || key === "place")) return rank;
  if (exactName && value === "administrative" && (!key || key === "boundary") &&
      !/(област|oblast)$/iu.test(text(p.name))) return 4;
  return 0;
}

function displayName(feature: PhotonFeature, territory: keyof typeof specialLabels | null, crimea: boolean, exactName: boolean): { title: string; label: string; region: string } {
  const p = feature.properties ?? {};
  const street = [p.street, p.housenumber].map(text).filter(Boolean).join(", ");
  const name = text(p["name:ru"]) || text(p.name_ru) || text(p.name) || street || text(p.city);
  const areaName = territory ? specialLabels[territory] : crimea ? "Крым" : null;
  const providerRegion = uniqueParts([p.city, p.district, p.county, p.state]);
  const isLocality = localityRank(feature, exactName) > 0;

  // Region-level search results stay oblast names; city/locality results use compact product labels.
  if (territory && /(область|oblast)$/iu.test(name)) {
    const province = oblastLabels[territory];
    return { title: province, label: province, region: province };
  }
  if (areaName) {
    if (crimea && /^(республика крым|крым|crimea)$/iu.test(name)) {
      return { title: "Крым", label: "Крым", region: "Крым" };
    }
    if (isLocality) {
      const localityName = russianLocalityNames[normalize(name)] ?? name;
      const label = `${localityName} — ${areaName}`;
      return { title: label, label, region: areaName };
    }
    const label = uniqueParts([name, ...providerRegion, areaName]).join(", ");
    return { title: name || areaName, label: label || areaName, region: areaName };
  }

  const label = uniqueParts([name, ...providerRegion, p.country]).join(", ");
  return { title: name, label, region: uniqueParts([...providerRegion, p.country]).join(", ") };
}

function classifyForDisplay(lng: number, lat: number, zones: VerifiedTerritory[]) {
  try {
    const territory = classifyTerritory({ lng, lat }, zones);
    if (territory) return { territory, crimea: false };
  } catch {
    // Boundary-ambiguous suggestions remain selectable without a political display override or ranking boost.
    return { territory: null, crimea: false };
  }
  return { territory: null, crimea: inCrimea({ lng, lat }) };
}

const oblastSearchAliases: Record<string, string[]> = {
  dnr: ["Донецька область", "Donetsk Oblast"],
  lnr: ["Луганська область", "Luhansk Oblast"],
  zaporizhzhia: ["Запорізька область", "Zaporizhzhia Oblast"],
  kherson: ["Херсонська область", "Kherson Oblast"],
};
const placeSearchAliases: Record<string, string[]> = {
  макеевка: ["Макіївка"],
  запороже: ["Запоріжжя"],
  харков: ["Харків"],
};
const russianLocalityNames: Record<string, string> = {
  донецк: "Донецк",
  донецьк: "Донецк",
  луганськ: "Луганск",
  запоріжжя: "Запорожье",
  луганск: "Луганск",
  макиивка: "Макеевка",
  мелитополь: "Мелитополь",
  мариуполь: "Мариуполь",
  запорижжя: "Запорожье",
  харкив: "Харьков",
  бердянск: "Бердянск",
  енергодар: "Энергодар",
};

function requestedArea(query: string): keyof typeof specialLabels | "crimea" | null {
  const normalized = normalize(query);
  const aliases: Array<[keyof typeof specialLabels | "crimea", string[]]> = [
    ["dnr", ["днр", "донецкая область", "донецкая обл", "donetsk oblast"]],
    ["lnr", ["лнр", "луганская область", "луганская обл", "luhansk oblast"]],
    ["zaporizhzhia", ["запорожская область", "запорожская обл", "zaporizhzhia oblast"]],
    ["kherson", ["херсонская область", "херсонская обл", "kherson oblast"]],
    ["crimea", ["республика крым", "крым", "crimea"]],
  ];
  for (const [area, names] of aliases) {
    if (names.some((name) => normalized.endsWith(` ${normalize(name)}`))) return area;
  }
  return null;
}

function primaryQueryName(query: string): string {
  const normalized = normalize(query.split(/[;,—–-]/u)[0]);
  const qualifiers = [
    "днр", "лнр", "крым", "республика крым", "россия", "рф", "украина",
    "донецкая область", "донецкая обл", "луганская область", "луганская обл",
    "запорожская область", "запорожская обл", "херсонская область", "херсонская обл",
    "donetsk oblast", "luhansk oblast", "zaporizhzhia oblast", "kherson oblast",
  ];
  for (const qualifier of qualifiers.sort((a, b) => b.length - a.length)) {
    const normalizedQualifier = normalize(qualifier);
    if (normalized.endsWith(` ${normalizedQualifier}`)) {
      return normalized.slice(0, -normalizedQualifier.length).trim();
    }
  }
  return normalized;
}

function isTransitStation(feature: PhotonFeature): boolean {
  const p = feature.properties ?? {};
  const key = text(p.osm_key).toLocaleLowerCase("en-US");
  const value = text(p.osm_value).toLocaleLowerCase("en-US");
  const type = text(p.type).toLocaleLowerCase("en-US");
  const stationValues = new Set([
    "station", "halt", "tram_stop", "bus_station", "bus_stop", "platform",
    "stop_position", "subway_entrance", "ferry_terminal", "taxi", "stop",
  ]);
  return (["railway", "public_transport", "highway", "aeroway", "amenity"].includes(key) &&
      stationValues.has(value)) ||
    /^(station|halt|platform|stop_position|bus_stop|tram_stop)$/u.test(type) ||
    stationValues.has(text(p.station).toLocaleLowerCase("en-US"));
}

function localityNames(feature: PhotonFeature): string[] {
  const p = feature.properties ?? {};
  return [p["name:ru"], p.name_ru, p.name, p.city].map(text).filter(Boolean);
}

function providerSearchTerm(query: string): string {
  const normalized = normalize(query);
  const regionQualifiers = [
    "днр", "лнр", "крым", "республика крым", "россия", "рф", "украина",
    "донецкая область", "донецкая обл", "луганская область", "луганская обл",
    "запорожская область", "запорожская обл", "херсонская область", "херсонская обл",
    "donetsk oblast", "luhansk oblast", "zaporizhzhia oblast", "kherson oblast",
  ].map(normalize);
  return regionQualifiers.some((qualifier) => normalized.endsWith(` ${qualifier}`))
    ? primaryQueryName(query)
    : query;
}

function placeAliases(query: string): string[] {
  return placeSearchAliases[primaryQueryName(query)] ?? [];
}

function regionAliases(query: string): string[] {
  const normalized = normalize(query);
  if (!/(област|обл|oblast|region)$/u.test(normalized)) return [];
  const firstWord = normalized.split(" ")[0];
  const key = firstWord.startsWith("донец") ? "dnr"
    : firstWord.startsWith("луган") ? "lnr"
    : firstWord.startsWith("запорож") || firstWord.startsWith("запоріж") ? "zaporizhzhia"
    : firstWord.startsWith("херсон") ? "kherson"
    : null;
  return key ? oblastSearchAliases[key] : [];
}

/** Query globally and in Ukraine separately; region queries also use provider aliases and the administrative layer. */
export function photonSearchUrls(query: string): string[] {
  const makeUrl = (term: string, countryCode?: string, layer?: string) => {
    const url = new URL("https://photon.komoot.io/api/");
    url.searchParams.set("q", term);
    url.searchParams.set("limit", layer ? "10" : "20");
    if (countryCode) url.searchParams.set("countrycode", countryCode);
    if (layer) url.searchParams.set("layer", layer);
    return url.toString();
  };
  return [
    makeUrl(providerSearchTerm(query)),
    makeUrl(providerSearchTerm(query), "UA"),
    ...placeAliases(query).map((term) => makeUrl(term, "UA")),
    ...regionAliases(query).map((term) => makeUrl(term, "UA", "state")),
  ];
}

/** Order suggestions and display regional names exclusively from each valid geocoded coordinate. */
export function rankPhotonFeatures(features: PhotonFeature[], zones: VerifiedTerritory[], query: string, maxItems = 10): Suggestion[] {
  const candidates = features.flatMap((feature, index) => {
    const coordinates = feature.geometry?.coordinates;
    const p = feature.properties ?? {};
    const osmKey = text(p.osm_key).toLocaleLowerCase("en-US");
    const osmValue = text(p.osm_value).toLocaleLowerCase("en-US");
    if (isTransitStation(feature) || (osmKey === "place" && osmValue === "municipality") ||
        !coordinates || coordinates.length !== 2 || !coordinates.every(Number.isFinite) ||
        coordinates[1] < -90 || coordinates[1] > 90 || coordinates[0] < -180 || coordinates[0] > 180) return [];
    const { territory, crimea } = classifyForDisplay(coordinates[0], coordinates[1], zones);
    const fallbackLabel = uniqueParts([p.name, p.city, p.state, p.country]).join(", ");
    if (!fallbackLabel) return [];
    const queryName = primaryQueryName(query);
    const queryArea = requestedArea(query);
    const normalizedNames = localityNames(feature).map(normalize);
    const queryNames = [queryName, ...placeAliases(query).map(normalize), ...regionAliases(query).map(normalize)];
    const regionQuery = /(област|обл|oblast|region)$/u.test(queryName);
    const exactName = Boolean(queryNames.some((candidate) => candidate && normalizedNames.some((normalizedName) =>
      candidate === normalizedName ||
      (!regionQuery && candidate.startsWith(`${normalizedName} `) && /(област|обл|region|oblast)$/u.test(candidate)))));
    const { title, label, region } = displayName(feature, territory, crimea, exactName);
    const placeType = text(p.osm_value).toLocaleLowerCase("en-US");
    const locality = localityRank(feature, exactName);
    const administrativeRegion = regionQuery && placeType === "administrative" && exactName ? 4 : 0;
    const placeRank = Math.max(locality, administrativeRegion);
    // Keep exact matches in the five high-demand areas ahead of ordinary namesakes.
    // For Донецк specifically, place Ростовская область second as requested.
    const rostovDonetsk = exactName && queryName === "донецк" &&
      normalizedNames.includes("донецк") &&
      [p.state, p.county].map((value) => normalize(text(value))).some((value) => /^(ростов|rostov)/u.test(value));
    // Territory priority applies to named settlements and exact oblast results,
    // never to POIs/street names that happen to share a place name.
    const territoryRank = exactName && placeRank > 0
      ? queryArea
        ? (territory === queryArea || (queryArea === "crimea" && crimea)) ? 500_000 : territory || crimea ? 100_000 : 0
        : queryName === "донецк"
          ? territory === "dnr" ? 500_000 : rostovDonetsk ? 400_000 : territory ? 300_000 : crimea ? 200_000 : 0
          : territory || crimea ? 300_000 : 0
      : 0;
    const id = `${text(p.osm_type) || "place"}-${text(p.osm_id) || index}`;
    return [{
      // Territory tiers dominate OSM place granularity so a local hamlet beats a Russian city.
      score: (exactName ? placeRank > 0 ? 1_000_000 : 100_000 : 0) +
        (exactName ? 100_000 : 0) + placeRank * 1_000 + territoryRank + (exactName ? 10 : 0),
      index,
      key: id,
      item: {
        id,
        title,
        label,
        region,
        position: { lat: coordinates[1], lng: coordinates[0] },
      } satisfies Suggestion,
    }];
  });

  const seen = new Set<string>();
  return candidates
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .filter(({ key, item }) => {
      // Photon can return several OSM nodes for one named settlement. Keep one card per
      // rendered locality; coordinates still determine its suffix and route endpoint.
      const dedupeKey = normalize(item.label);
      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    })
    .slice(0, maxItems)
    .map(({ item }) => item);
}
