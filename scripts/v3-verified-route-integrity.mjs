import fs from "node:fs";

const routes = JSON.parse(fs.readFileSync("data/verified-routes.json", "utf8"));
const asOf = new Date("2026-10-02T00:00:00Z");
const maxAgeDays = 45;

function fail(message) {
  throw new Error(`V3 verified-route integrity failed: ${message}`);
}

if (!Array.isArray(routes) || routes.length === 0) fail("verified route database is empty");

const pairs = new Set();
for (const [index, route] of routes.entries()) {
  const id = `${route.from ?? "?"}|${route.to ?? "?"}`;
  if (typeof route.from !== "string" || !route.from || typeof route.to !== "string" || !route.to) fail(`row ${index}: missing city key`);
  if (route.from === route.to) fail(`${id}: endpoints are identical`);
  const canonical = [route.from, route.to].sort().join("|");
  if (pairs.has(canonical)) fail(`${id}: duplicate/reversed duplicate pair`);
  pairs.add(canonical);

  for (const field of ["fastKm", "fastMinutes", "freeKm", "freeMinutes"]) {
    const value = route[field];
    if (!Number.isFinite(value) || value <= 0) fail(`${id}: ${field} must be a positive finite number`);
  }
  for (const field of ["tollRub", "tollWeekdayRub", "tollWeekendRub"]) {
    if (route[field] !== undefined && (!Number.isFinite(route[field]) || route[field] < 0)) fail(`${id}: ${field} must be a non-negative finite number`);
  }
  if (!Number.isFinite(route.accuracyPercent) || route.accuracyPercent < 0 || route.accuracyPercent > 3) fail(`${id}: accuracyPercent must stay within 0..3`);
  if (typeof route.source !== "string" || !route.source.trim()) fail(`${id}: source is required`);

  const verifiedAt = new Date(`${route.verifiedAt}T00:00:00Z`);
  if (Number.isNaN(verifiedAt.getTime())) fail(`${id}: invalid verifiedAt`);
  if (verifiedAt > asOf) fail(`${id}: verifiedAt is in the future`);
  const ageDays = Math.floor((asOf.getTime() - verifiedAt.getTime()) / 86_400_000);
  if (ageDays > maxAgeDays) fail(`${id}: verification is stale (${ageDays} days)`);

  const fastSpeed = route.fastKm / (route.fastMinutes / 60);
  const freeSpeed = route.freeKm / (route.freeMinutes / 60);
  if (fastSpeed < 15 || fastSpeed > 140) fail(`${id}: implausible fast average speed ${fastSpeed.toFixed(1)} km/h`);
  if (freeSpeed < 15 || freeSpeed > 140) fail(`${id}: implausible free average speed ${freeSpeed.toFixed(1)} km/h`);
}

console.log(`V3 verified-route integrity GREEN: ${routes.length} unique pairs; all values finite; accuracy <=3%; freshness <=${maxAgeDays}d`);
