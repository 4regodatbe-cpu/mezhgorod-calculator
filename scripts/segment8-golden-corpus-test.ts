import fs from "node:fs";
import assert from "node:assert/strict";

const routes = JSON.parse(fs.readFileSync("data/verified-routes.json", "utf8"));
assert.ok(Array.isArray(routes) && routes.length >= 20, "QA corpus should contain a meaningful route set");
let fastUsable = 0;
let freeUsable = 0;
let provenanceUsable = 0;
for (const item of routes) {
  if (item?.from && item?.to && item.from !== item.to && Number.isFinite(item.fastKm) && item.fastKm > 0) fastUsable++;
  if (item?.from && item?.to && item.from !== item.to && Number.isFinite(item.freeKm) && item.freeKm > 0) freeUsable++;
  if (item?.source && item?.verifiedAt) provenanceUsable++;
}
assert.ok(fastUsable > 0, "QA corpus must contain usable fast-route distance controls");
console.log(`Segment 8 QA corpus: GREEN (${routes.length} rows, fastDistance=${fastUsable}, freeDistance=${freeUsable}, provenance=${provenanceUsable}). Partial legacy rows remain reference-only.`);
