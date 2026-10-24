import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import snapshot from "../data/address-city-snapshot.json";
import { searchCitySnapshot } from "../lib/address-city-snapshot";
const now = Date.parse(snapshot.reviewedAt) + 1000;
const options = { enabled: true, now, deadlineAt: now + 1000 };
const copy = () => structuredClone(snapshot);
const hash = (s: typeof snapshot) => { s.recordsSha256 = createHash("sha256").update(JSON.stringify(s.records)).digest("hex"); return s; };

test("snapshot contains only four exact successful live suggestions with source SHA and separate homonyms", () => {
  assert.equal(snapshot.records.length, 4);
  for (const r of snapshot.records) {
    const bytes = readFileSync(r.source.capturePath);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), r.source.sha256);
    const capture = JSON.parse(bytes.toString());
    assert.equal(capture.status, 200); assert.equal(capture.sourceCommit, r.source.sourceCommit);
    assert.deepEqual(capture.body.items.find((x: { id: string }) => x.id === r.suggestion.id), r.suggestion);
  }
  const result = searchCitySnapshot("ДОНЕЦК", options);
  assert.equal(result.status, "ready");
  if (result.status !== "ready") return;
  assert.deepEqual(result.items.map(x => x.id), ["R-1413957", "R-1517207"]);
  assert.match(result.items[0].label, /ДНР/); assert.match(result.items[1].label, /Ростовская/);
  assert.equal(result.meta.scope, "limited_settlements_only");
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
