import { classifyTerritory, type VerifiedTerritory } from "./special-territory-geometry.ts";
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

function labelOf(feature: PhotonFeature): string {
  const p = feature.properties ?? {};
  const street = [p.street, p.housenumber].map(text).filter(Boolean).join(", ");
  const primary = text(p.name) || street || text(p.city);
  return uniqueParts([primary, p.city, p.district, p.county, p.state, p.country]).join(", ");
}

function regionOf(feature: PhotonFeature): string {
  const p = feature.properties ?? {};
  return uniqueParts([p.city, p.district, p.county, p.state, p.country]).join(", ");
}

function isInsideSpecialTerritory(lng: number, lat: number, zones: VerifiedTerritory[]): boolean {
  try {
    return classifyTerritory({ lng, lat }, zones) !== null;
  } catch {
    // A point exactly on an ambiguous boundary stays selectable but receives no ranking boost.
    return false;
  }
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

/** Keep Photon relevance order for ties, while lifting geocoded points inside the four tariff polygons. */
export function rankPhotonFeatures(features: PhotonFeature[], zones: VerifiedTerritory[], maxItems = 10): Suggestion[] {
  const candidates = features.flatMap((feature, index) => {
    const coordinates = feature.geometry?.coordinates;
    const p = feature.properties ?? {};
    const label = labelOf(feature);
    if (!coordinates || coordinates.length !== 2 || !coordinates.every(Number.isFinite) ||
        coordinates[1] < -90 || coordinates[1] > 90 || coordinates[0] < -180 || coordinates[0] > 180 || !label) return [];
    const name = text(p.name) || text(p.city) || label;
    const placeType = text(p.osm_value).toLocaleLowerCase("en-US");
    const placeRank = ["city", "town", "village", "hamlet", "locality", "municipality"].includes(placeType) ? 1 : 0;
    const specialRank = isInsideSpecialTerritory(coordinates[0], coordinates[1], zones) ? 1 : 0;
    const id = `${text(p.osm_type) || "place"}-${text(p.osm_id) || index}`;
    return [{
      score: specialRank * 4 + placeRank,
      index,
      key: id,
      item: {
        id,
        title: name,
        label,
        region: regionOf(feature),
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
