import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import snapshot from "../data/address-city-snapshot.json";
import { searchCitySnapshot } from "../lib/address-city-snapshot";
import { readCities15000 } from "../experiments/address-search/stage-i-2026-11-07/read-geonames-archive.mjs";
import { classifyTerritory } from "../lib/special-territory-geometry";
import { SPECIAL_TERRITORY_BOUNDARIES } from "../lib/special-territory-boundaries";
const now = Date.parse(snapshot.reviewedAt) + 1000;
const options = { enabled: true, now, deadlineAt: now + 1000 };
const copy = () => structuredClone(snapshot);
const hash = (s: typeof snapshot) => { s.recordsSha256 = createHash("sha256").update(JSON.stringify(s.records)).digest("hex"); return s; };
const sourceManifest = JSON.parse(readFileSync("experiments/address-search/stage-i-2026-11-07/source/source-manifest.json", "utf8"));
const archiveBytes = readFileSync("experiments/address-search/stage-i-2026-11-07/source/cities15000.zip");
const archiveRows = readCities15000(archiveBytes);
const sourceRows = new Map(archiveRows.split(/\r?\n/).filter(Boolean).map(row => [Number(row.split("\t", 1)[0]), row]));
const expectedRows: Record<number, { country: string; admin1: string; admin2: string; nativeName: string; lat: number; lng: number; sha256: string }> = {
  709717: { country: "UA", admin1: "05", admin2: "1408", nativeName: "Донецк", lat: 48.023, lng: 37.80224, sha256: "b6b5ef07de9f0858a7e2a136e8a69a311e95683f1a54cac1c914febd988561d4" },
  565348: { country: "RU", admin1: "61", admin2: "", nativeName: "Донецк", lat: 48.33711, lng: 39.95229, sha256: "923a9db30fe7e9642e2b724b1b2bc49fa8d7a7bba4d60cfb100dbd97724638a0" },
  542420: { country: "RU", admin1: "38", admin2: "", nativeName: "Краснодар", lat: 45.04534, lng: 38.98178, sha256: "6da2f3167fcfc8734a6b020a1dfe329873490632a3bf7d4f14b0f89b5f46ca42" },
  501175: { country: "RU", admin1: "61", admin2: "", nativeName: "Ростов-на-Дону", lat: 47.21997, lng: 39.70769, sha256: "b8e68df254ac702afae7a3d3f559bc650149b38caf87efa2681e6d8ed550fb04" },
};

test("snapshot contains four exact GeoNames source rows, archive provenance and distinct homonyms", () => {
  assert.equal(sourceManifest.http.status, 200);
  assert.equal(sourceManifest.url, "https://download.geonames.org/export/dump/cities15000.zip");
  assert.equal(sourceManifest.http.lastModified, "2026-11-07T02:54:40Z");
  assert.equal(sourceManifest.artifact.sha256, "37d3b39e88167155539dc4aaf93886527c5037b6a822087e48fe530baf8436b7");
  assert.equal(sourceManifest.http.date, "2026-11-07T23:18:22Z");
  assert.equal(createHash("sha256").update(archiveBytes).digest("hex"), sourceManifest.artifact.sha256);
  assert.equal(snapshot.records.length, 4);
  for (const r of snapshot.records) {
    const bytes = readFileSync(r.source.capturePath);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), r.source.sha256);
    const capture = JSON.parse(bytes.toString());
    const expected = expectedRows[capture.sourceRecord.geonameId] as (typeof expectedRows)[number];
    assert.ok(expected);
    assert.equal(capture.sourceCommit, r.source.sourceCommit);
    assert.equal(capture.sourceCommit, "89eca232d8787788153daf5b2356f7f7fe76e822");
    assert.equal(capture.sourceArchiveSha256, sourceManifest.artifact.sha256);
    assert.equal(capture.retrievedAt, r.source.capturedAt, "capture time must be the retained HTTP retrieval date");
    assert.equal(Date.parse(capture.retrievedAt), Date.parse(sourceManifest.http.date));
    assert.equal(capture.sourceLastModified, sourceManifest.http.lastModified);
    assert.equal(capture.rawRow, sourceRows.get(capture.sourceRecord.geonameId));
    assert.equal(createHash("sha256").update(capture.rawRow).digest("hex"), capture.rawRowSha256);
    assert.equal(capture.rawRowSha256, expected.sha256);
    const fields = capture.rawRow.split("\t");
    assert.equal(fields[0], String(capture.sourceRecord.geonameId));
    assert.equal(fields[1], capture.sourceRecord.name);
    assert.equal(Number(fields[4]), r.suggestion.position.lat);
    assert.equal(Number(fields[5]), r.suggestion.position.lng);
    assert.equal(fields[8], expected.country);
    assert.equal(fields[10], expected.admin1);
    assert.equal(fields[11], expected.admin2);
    assert.equal(Number(fields[4]), expected.lat);
    assert.equal(Number(fields[5]), expected.lng);
    const captureSource = capture.sourceRecord as { geonameId: number; name: string };
    assert.ok(fields[3].split(",").includes(r.suggestion.title === "Донецк — ДНР" || r.suggestion.title === "Донецк" ? "Донецк" : r.suggestion.title));
    assert.equal(fields[1], captureSource.name);
    assert.equal(capture.license.name, "CC BY 4.0");
    assert.equal(capture.license.url, "https://creativecommons.org/licenses/by/4.0/");
    assert.equal(r.source.sourceId, r.suggestion.id);
  }
  const result = searchCitySnapshot("ДОНЕЦК", options);
  assert.equal(result.status, "ready");
  if (result.status !== "ready") return;
  assert.deepEqual(result.items.map(x => x.id), ["geonames-709717", "geonames-565348"]);
  assert.match(result.items[0].label, /ДНР/); assert.match(result.items[1].label, /Ростовская/);
  assert.equal(result.meta.scope, "limited_settlements_only");
  assert.equal(result.meta.licenseName, "CC BY 4.0");
  assert.equal(result.meta.attribution, sourceManifest.license.attribution);
  assert.equal(snapshot.license.name, "CC BY 4.0");
  assert.equal(classifyTerritory(snapshot.records[0].suggestion.position, SPECIAL_TERRITORY_BOUNDARIES), "dnr",
    "the app's regional display normalization remains spatially within its independently sourced ADM1 polygon");
  assert.equal(Date.parse(snapshot.expiresAt) - Date.parse(snapshot.records[0].source.capturedAt), 7 * 24 * 60 * 60 * 1000);
});
test("bounded Cyrillic prefixes and reviewed qualifiers, no houses or unknown cities", () => {
  for (const q of ["Красн", "  ростов  ", "Ростов-на-Дону", "Донецк — ДНР"]) assert.equal(searchCitySnapshot(q, options).status, "ready", q);
  for (const q of ["Я", "Тарасовка", "Краснодар улица Ленина", "Донецк 12", "Krasnodar", "Краснодар, Ленина", " ".repeat(201)]) assert.equal(searchCitySnapshot(q, options).status, "no_match", q);
});
test("disabled default, abort and exhausted original budget do not return fallback", () => {
  assert.equal(searchCitySnapshot("Донецк", { now, deadlineAt: now + 1 }).status, "disabled");
  assert.equal(searchCitySnapshot("Донецк", { ...options, enabled: false }).status, "disabled");
  const c = new AbortController(); c.abort();
  assert.equal(searchCitySnapshot("Донецк", { ...options, signal: c.signal }).status, "cancelled");
  assert.equal(searchCitySnapshot("Донецк", { ...options, deadlineAt: now }).status, "budget");
  assert.equal(searchCitySnapshot("Донецк", { ...options, now: NaN }).status, "budget");
});
test("expired/future-reviewed/overlong validity and altered payload fail closed", () => {
  const expiry = Date.parse(snapshot.expiresAt);
  assert.equal(searchCitySnapshot("Донецк", { ...options, now: expiry, deadlineAt: expiry + 1000 }).status, "expired");
  const future = copy(); future.reviewedAt = new Date(now + 1).toISOString();
  assert.equal(searchCitySnapshot("Донецк", { ...options, snapshot: future }).status, "invalid_snapshot");
  const old = copy(); old.expiresAt = new Date(expiry + 1).toISOString();
  assert.equal(searchCitySnapshot("Донецк", { ...options, snapshot: old }).status, "invalid_snapshot");
  const changed = copy(); changed.records[0].suggestion.position.lat++;
  assert.equal(searchCitySnapshot("Донецк", { ...options, snapshot: changed }).status, "invalid_snapshot");
});
test("schema guards apply even to freshly hashed invalid records", () => {
  const bad: Array<(s: typeof snapshot) => void> = [
    s => { s.records[0].suggestion.position.lat = 91; },
    s => { s.records[1].suggestion.id = s.records[0].suggestion.id; s.records[1].source.sourceId = s.records[0].suggestion.id; },
    s => { s.records.push(s.records[0]); },
    s => { s.records[0].source.sha256 = ""; },
    s => { s.records[0].source.capturePath = "offline-benchmark.json"; },
    s => { s.records[0].source.sourceId = "R-0"; },
    s => { s.records[0].searchNames = ["улица 12"]; },
    s => { s.license.url = "https://example.test"; },
    s => { s.license.name = "ODbL-1.0"; },
  ];
  for (const change of bad) { const s = copy(); change(s); hash(s); assert.equal(searchCitySnapshot("Донецк", { ...options, snapshot: s }).status, "invalid_snapshot"); }
  assert.equal(searchCitySnapshot("Донецк", { ...options, snapshot: null }).status, "invalid_snapshot");
});
test("returned suggestions cannot mutate subsequent snapshot results", () => {
  const a = searchCitySnapshot("Донецк", options); assert.equal(a.status, "ready");
  if (a.status !== "ready") return;
  a.items[0].position!.lat = 0; a.items[0].label = "changed";
  const b = searchCitySnapshot("Донецк", options); assert.equal(b.status, "ready");
  if (b.status === "ready") { assert.equal(b.items[0].position!.lat, snapshot.records[0].suggestion.position.lat); assert.equal(b.items[0].label, "Донецк — ДНР"); }
});
