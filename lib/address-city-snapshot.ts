import { createHash } from "node:crypto";
import defaultSnapshot from "../data/address-city-snapshot.json";
import switches from "../data/toll-feature-switches.json";
import type { Suggestion } from "../app/v2/components/types";

const MAX_RECORDS = 4;
const MAX_BYTES = 16_384;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const LICENSE_URL = "https://www.openstreetmap.org/copyright";
type CityRecord = { searchNames: string[]; suggestion: Suggestion; source: { capturePath: string; sha256: string; capturedAt: string; sourceCommit: string; sourceId: string } };
type Snapshot = { schemaVersion: 1; snapshotId: string; reviewedAt: string; expiresAt: string; scope: "limited_settlements_only";
  recordsSha256: string; license: { name: "ODbL-1.0"; url: string; attribution: string }; records: CityRecord[] };
type Reason = "disabled" | "cancelled" | "budget" | "invalid_snapshot" | "expired" | "no_match";
export type CitySnapshotResult = { status: "ready"; items: Suggestion[]; meta: { source: "reviewed_city_snapshot"; snapshotId: string;
  scope: "limited_settlements_only"; expiresAt: string; attribution: string; licenseUrl: string } } | { status: Reason };

function normalize(value: string) {
  return value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е").replace(/[—–-]/g, " ").replace(/\s+/g, " ").trim();
}
function nonempty(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0 && value.length <= 300; }
function validSnapshot(value: unknown, now: number): value is Snapshot {
  try {
    if (!value || typeof value !== "object" || Buffer.byteLength(JSON.stringify(value)) > MAX_BYTES) return false;
    const s = value as Snapshot;
    if (s.schemaVersion !== 1 || !nonempty(s.snapshotId) || s.scope !== "limited_settlements_only" ||
        s.license?.name !== "ODbL-1.0" || s.license.url !== LICENSE_URL || s.license.attribution !== "© OpenStreetMap contributors" ||
        !Array.isArray(s.records) || s.records.length < 1 || s.records.length > MAX_RECORDS ||
        !/^[a-f0-9]{64}$/.test(s.recordsSha256) || createHash("sha256").update(JSON.stringify(s.records)).digest("hex") !== s.recordsSha256) return false;
    const reviewed = Date.parse(s.reviewedAt), expires = Date.parse(s.expiresAt);
    if (!Number.isFinite(reviewed) || !Number.isFinite(expires) || reviewed > now || expires <= reviewed) return false;
    const ids = new Set<string>();
    for (const record of s.records) {
      const item = record.suggestion, source = record.source, captured = Date.parse(source?.capturedAt);
      if (!item || !/^R-\d+$/.test(item.id) || ids.has(item.id) || !nonempty(item.title) || !nonempty(item.label) || !nonempty(item.region) ||
          !item.position || !Number.isFinite(item.position.lat) || !Number.isFinite(item.position.lng) ||
          Math.abs(item.position.lat) > 90 || Math.abs(item.position.lng) > 180 ||
          !Array.isArray(record.searchNames) || record.searchNames.length < 1 || record.searchNames.length > 3 ||
          !record.searchNames.every(name => nonempty(name) && /^[А-Яа-яЁё\s—–-]+$/u.test(name)) ||
          !source || !nonempty(source.capturePath) || source.capturePath.includes("benchmark") ||
          !/^[a-f0-9]{64}$/.test(source.sha256) || !/^[a-f0-9]{40}$/.test(source.sourceCommit) || source.sourceId !== item.id ||
          !Number.isFinite(captured) || captured > reviewed || expires - captured > MAX_AGE_MS || expires <= captured) return false;
      ids.add(item.id);
    }
    return true;
  } catch { return false; }
}

/** Exact reviewed positive suggestions, not a general gazetteer or a Photon feature adapter. No I/O. */
export function searchCitySnapshot(query: string, { enabled = switches.addressCitySnapshot, signal, now = Date.now(),
  deadlineAt, snapshot = defaultSnapshot }: { enabled?: boolean; signal?: AbortSignal; now?: number; deadlineAt: number; snapshot?: unknown }): CitySnapshotResult {
  if (!enabled) return { status: "disabled" };
  if (signal?.aborted) return { status: "cancelled" };
  if (!Number.isFinite(now) || !Number.isFinite(deadlineAt) || now >= deadlineAt) return { status: "budget" };
  if (!validSnapshot(snapshot, now)) return { status: "invalid_snapshot" };
  if (now >= Date.parse(snapshot.expiresAt)) return { status: "expired" };
  const key = normalize(query);
  if (key.length < 3 || key.length > 200 || !/^[а-яё\s]+$/u.test(key)) return { status: "no_match" };
  const items = snapshot.records.filter(record => record.searchNames.some(name => normalize(name).startsWith(key)))
    .map(record => ({ ...record.suggestion, position: { ...record.suggestion.position! } }));
  if (!items.length) return { status: "no_match" };
  return { status: "ready", items, meta: { source: "reviewed_city_snapshot", snapshotId: snapshot.snapshotId,
    scope: snapshot.scope, expiresAt: snapshot.expiresAt, attribution: snapshot.license.attribution, licenseUrl: snapshot.license.url } };
}
