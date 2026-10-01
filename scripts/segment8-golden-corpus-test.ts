import fs from "node:fs";
import assert from "node:assert/strict";

const routes = JSON.parse(fs.readFileSync("data/verified-routes.json", "utf8"));
assert.ok(Array.isArray(routes) && routes.length >= 20, "golden corpus should contain a meaningful route set");
const counts = new Map();
for (const item of routes) {
  assert.ok(item.from && item.to && item.from !== item.to);
  assert.ok(Number.isFinite(item.fastKm) && item.fastKm > 0);
  assert.ok(Number.isFinite(item.fastMinutes) && item.fastMinutes > 0);
  assert.ok(Number.isFinite(item.freeKm) && item.freeKm > 0);
  assert.ok(Number.isFinite(item.freeMinutes) && item.freeMinutes > 0);
  assert.ok(item.source && item.verifiedAt);
  if (item.accuracyPercent != null) assert.ok(Number.isFinite(item.accuracyPercent) && item.accuracyPercent >= 0);
  const key = [item.from, item.to].sort().join("|");
  counts.set(key, (counts.get(key) ?? 0) + 1);
}
const duplicates = [...counts.entries()].filter(([, count]) => count > 1);
console.log(`Segment 8 golden corpus: GREEN (${routes.length} controls, ${counts.size} unique pairs, ${duplicates.length} legacy duplicate pairs)`);
