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
  return value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е").replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
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

function displayName(feature: PhotonFeature, territory: keyof typeof specialLabels | null, crimea: boolean): { title: string; label: string; region: string } {
  const p = feature.properties ?? {};
  const street = [p.street, p.housenumber].map(text).filter(Boolean).join(", ");
  const name = text(p.name) || street || text(p.city);
  const areaName = territory ? specialLabels[territory] : crimea ? "Крым" : null;
  const providerRegion = uniqueParts([p.city, p.district, p.county, p.state]);

  // Region-level search results stay oblast names; city/locality results use compact product labels.
  if (territory && /(область|oblast)$/iu.test(name)) {
    const province = oblastLabels[territory];
    return { title: province, label: province, region: province };
  }
  if (areaName) {
    if (crimea && /^(республика крым|крым|crimea)$/iu.test(name)) {
      return { title: "Крым", label: "Крым", region: "Крым" };
    }
    const locality = uniqueParts([name, p.city]).join(", ");
    const label = locality ? `${locality} — ${areaName}` : areaName;
    return { title: label, label, region: areaName };
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

/** Query globally and in Ukraine separately so global top-result ranking cannot hide places in the special ADM1 polygons. */
export function photonSearchUrls(query: string): string[] {
  const makeUrl = (countryCode?: string) => {
    const url = new URL("https://photon.komoot.io/api/");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "20");
    if (countryCode) url.searchParams.set("countrycode", countryCode);
    return url.toString();
  };
  return [makeUrl(), makeUrl("UA")];
}

/** Order suggestions and display regional names exclusively from each valid geocoded coordinate. */
export function rankPhotonFeatures(features: PhotonFeature[], zones: VerifiedTerritory[], maxItems = 10): Suggestion[] {
  const candidates = features.flatMap((feature, index) => {
    const coordinates = feature.geometry?.coordinates;
    const p = feature.properties ?? {};
    if (!coordinates || coordinates.length !== 2 || !coordinates.every(Number.isFinite) ||
        coordinates[1] < -90 || coordinates[1] > 90 || coordinates[0] < -180 || coordinates[0] > 180) return [];
    const { territory, crimea } = classifyForDisplay(coordinates[0], coordinates[1], zones);
    const fallbackLabel = uniqueParts([p.name, p.city, p.state, p.country]).join(", ");
    if (!fallbackLabel) return [];
    const { title, label, region } = displayName(feature, territory, crimea);
    const placeType = text(p.osm_value).toLocaleLowerCase("en-US");
    const placeRank = ["city", "town", "village", "hamlet", "locality", "municipality"].includes(placeType) ? 1 : 0;
    const zoneRank = territory || crimea ? 1 : 0;
    const id = `${text(p.osm_type) || "place"}-${text(p.osm_id) || index}`;
    return [{
      score: zoneRank * 4 + placeRank,
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
      const coordinateKey = `${normalize(item.label)}@${item.position.lat.toFixed(5)},${item.position.lng.toFixed(5)}`;
      const dedupeKey = key.startsWith("place-") ? coordinateKey : key;
      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    })
    .slice(0, maxItems)
    .map(({ item }) => item);
}
