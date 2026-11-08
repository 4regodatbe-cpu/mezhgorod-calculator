#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { readCities15000 } from "./read-geonames-archive.mjs";

const root = resolve(import.meta.dirname, "../../..");
const batch = resolve(root, "experiments/address-search/stage-i-2026-11-07");
const source = JSON.parse(readFileSync(resolve(batch, "source/source-manifest.json"), "utf8"));
const archivePath = resolve(batch, "source", source.artifact.path);
const archiveBytes = readFileSync(archivePath);
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
if (source.http.status !== 200 || source.url !== "https://download.geonames.org/export/dump/cities15000.zip" ||
    source.artifact.sha256 !== "37d3b39e88167155539dc4aaf93886527c5037b6a822087e48fe530baf8436b7" ||
    source.http.lastModified !== "2026-11-07T02:54:40Z" || sha256(archiveBytes) !== source.artifact.sha256) {
  throw new Error("GeoNames source manifest/archive identity check failed");
}
const retrievedAt = new Date(source.http.date).toISOString();
const expiresAt = new Date(Date.parse(retrievedAt) + 7 * 24 * 60 * 60 * 1000).toISOString();
const sourceCommit = "89eca232d8787788153daf5b2356f7f7fe76e822";
const tsv = readCities15000(archiveBytes);
const required = [
  { id: 709717, country: "UA", admin1: "05", admin2: "1408", lat: 48.023, lng: 37.80224, sourceName: "Donetsk", nativeName: "Донецк", title: "Донецк — ДНР", label: "Донецк — ДНР", region: "ДНР", searchNames: ["Донецк", "Донецк ДНР"], normalization: "Existing application region label; upstream GeoNames country/admin codes are retained unchanged." },
  { id: 565348, country: "RU", admin1: "61", admin2: "", lat: 48.33711, lng: 39.95229, sourceName: "Donetsk", nativeName: "Донецк", title: "Донецк", label: "Донецк, Ростовская область, Россия", region: "Ростовская область, Россия", searchNames: ["Донецк", "Донецк Ростовская область"], normalization: "GeoNames country/admin1 code retained; Russian-region display label follows its source administrative code." },
  { id: 542420, country: "RU", admin1: "38", admin2: "", lat: 45.04534, lng: 38.98178, sourceName: "Krasnodar", nativeName: "Краснодар", title: "Краснодар", label: "Краснодар, городской округ Краснодар, Краснодарский край, Россия", region: "городской округ Краснодар, Краснодарский край, Россия", searchNames: ["Краснодар"], normalization: "GeoNames country/admin1 code retained; display includes the established Russian region label." },
  { id: 501175, country: "RU", admin1: "61", admin2: "", lat: 47.21997, lng: 39.70769, sourceName: "Rostov-on-Don", nativeName: "Ростов-на-Дону", title: "Ростов-на-Дону", label: "Ростов-на-Дону, городской округ Ростов-на-Дону, Ростовская область, Россия", region: "городской округ Ростов-на-Дону, Ростовская область, Россия", searchNames: ["Ростов-на-Дону", "Ростов"], normalization: "GeoNames country/admin1 code retained; display includes the established Russian region label." },
];
const rows = new Map();
for (const line of tsv.split(/\r?\n/)) {
  if (!line) continue;
  const id = Number(line.split("\t", 1)[0]);
  if (required.some(record => record.id === id)) rows.set(id, line);
}
if (rows.size !== required.length) throw new Error(`Expected ${required.length} exact GeoNames rows, received ${rows.size}`);
mkdirSync(resolve(batch, "captures"), { recursive: true });
const records = [];
for (const target of required) {
  const rawRow = rows.get(target.id);
  const fields = rawRow.split("\t");
  const alternateNames = fields[3].split(",");
  const lat = Number(fields[4]), lng = Number(fields[5]);
  if (fields.length !== 19 || fields[1] !== target.sourceName || fields[6] !== "P" || !/^PPLA\d?$/.test(fields[7]) ||
      fields[8] !== target.country || fields[10] !== target.admin1 || fields[11] !== target.admin2 ||
      lat !== target.lat || lng !== target.lng || !alternateNames.includes(target.nativeName) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(fields[18])) throw new Error(`GeoNames source row failed exact field validation: ${target.id}`);
  const capture = {
    schemaVersion: 1,
    source: source.source,
    sourceUrl: source.url,
    sourceArchivePath: `experiments/address-search/stage-i-2026-11-07/source/${source.artifact.path}`,
    sourceArchiveSha256: source.artifact.sha256,
    retrievedAt,
    sourceLastModified: source.http.lastModified,
    sourceCommit,
    rawRow,
    rawRowSha256: sha256(Buffer.from(rawRow, "utf8")),
    sourceRecord: { geonameId: target.id, name: fields[1], asciiName: fields[2], alternateNames, latitude: lat, longitude: lng,
      featureClass: fields[6], featureCode: fields[7], countryCode: fields[8], admin1Code: fields[10], admin2Code: fields[11],
      population: Number(fields[14]), modificationDate: fields[18] },
    displayNormalization: { title: target.title, label: target.label, region: target.region, searchNames: target.searchNames, rationale: target.normalization },
    license: source.license,
  };
  const captureName = `capture-geonames-${target.id}.json`;
  const capturePath = resolve(batch, "captures", captureName);
  const captureBytes = Buffer.from(`${JSON.stringify(capture, null, 2)}\n`);
  writeFileSync(capturePath, captureBytes);
  records.push({
    searchNames: target.searchNames,
    suggestion: { id: `geonames-${target.id}`, title: target.title, label: target.label, region: target.region, position: { lat, lng } },
    source: { capturePath: `experiments/address-search/stage-i-2026-11-07/captures/${captureName}`, sha256: sha256(captureBytes),
      capturedAt: retrievedAt, sourceCommit, sourceId: `geonames-${target.id}` },
  });
}
const snapshot = {
  schemaVersion: 1,
  snapshotId: "geonames-cities15000-2026-11-07",
  reviewedAt: new Date().toISOString(),
  expiresAt,
  scope: "limited_settlements_only",
  license: source.license,
  records,
  recordsSha256: sha256(Buffer.from(JSON.stringify(records))),
};
if (Date.parse(snapshot.reviewedAt) < Date.parse(retrievedAt) || Date.parse(snapshot.reviewedAt) >= Date.parse(expiresAt)) {
  throw new Error("Review timestamp must fall between archive retrieval and expiry");
}
const snapshotPath = resolve(root, "data/address-city-snapshot.json");
writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(JSON.stringify({ snapshotId: snapshot.snapshotId, sourceArchiveSha256: source.artifact.sha256, retrievedAt, reviewedAt: snapshot.reviewedAt,
  expiresAt, records: records.map(record => ({ id: record.suggestion.id, sourceRowSha256: JSON.parse(readFileSync(resolve(root, record.source.capturePath), "utf8")).rawRowSha256,
    captureSha256: record.source.sha256 })), snapshotRecordsSha256: snapshot.recordsSha256 }, null, 2));
