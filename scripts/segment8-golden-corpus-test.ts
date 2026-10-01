import fs from "node:fs";
import assert from "node:assert/strict";

const routes = JSON.parse(fs.readFileSync("data/verified-routes.json", "utf8"));
assert.ok(Array.isArray(routes) && routes.length >= 30, "golden corpus should contain at least 30 route controls");
const keys = new Set();
for (const item of routes) {
  assert.ok(item.from && item.to && item.from !== item.to);
  assert.ok(Number.isFinite(item.fastKm) && item.fastKm > 0);
  assert.ok(Number.isFinite(item.fastMinutes) && item.fastMinutes > 0);
  assert.ok(Number.isFinite(item.freeKm) && item.freeKm > 0);
  assert.ok(Number.isFinite(item.freeMinutes) && item.freeMinutes > 0);
  assert.ok(item.source && item.verifiedAt);
  assert.ok(Number.isFinite(item.accuracyPercent) && item.accuracyPercent >= 0);
  const key = [item.from, item.to].sort().join("|");
  assert.ok(!keys.has(key), `duplicate golden route ${key}`);
  keys.add(key);
}
console.log(`Segment 8 golden corpus: GREEN (${routes.length} controls)`);
