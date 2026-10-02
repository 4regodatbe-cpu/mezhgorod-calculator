import fs from "node:fs";
import path from "node:path";

const root = "benchmarks/routes/yandex-2026-10-02";
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const expectedPackages = ["routes-001-016.json", "routes-017-032.json", "routes-033-048.json", "routes-049-061.json"];
const routes = expectedPackages.flatMap((file) => {
  const pack = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  if (!Array.isArray(pack.routes)) throw new Error(`${file}: routes must be an array`);
  return pack.routes;
});
const fail = (message) => { throw new Error(`Yandex route benchmark integrity failed: ${message}`); };
if (manifest.snapshotDate !== "2026-10-02") fail("unexpected snapshot date");
if (routes.length !== 61 || manifest.counts.total !== 61) fail("expected all 61 preserved records");
if (routes.filter((route) => route.source.startsWith("Яндекс Карты")).length !== 60) fail("expected 60 Yandex-sourced records");
const ids = routes.map((route) => route.id);
if (new Set(ids).size !== 61) fail("route IDs must be unique");
for (const route of routes) {
  if (!route.from || !route.to || route.from === route.to) fail(`${route.id}: invalid endpoints`);
  for (const field of ["fastKm", "fastMinutes", "freeKm", "freeMinutes"]) {
    if (!Number.isFinite(route[field]) || route[field] <= 0) fail(`${route.id}: invalid ${field}`);
  }
  if (!Number.isFinite(route.tollRub) || route.tollRub < 0) fail(`${route.id}: invalid tollRub`);
  if (!route.verifiedAt || !route.source) fail(`${route.id}: missing provenance`);
}
const indexRows = fs.readFileSync(path.join(root, "routes-index.csv"), "utf8").trim().split(/\r?\n/);
if (indexRows.length !== 62) fail("route index must contain 61 records plus header");
const sourceRows = fs.readFileSync(path.join(root, "exports/verified-routes.csv"), "utf8").trim().split(/\r?\n/);
if (sourceRows.length !== 62) fail("source CSV export must contain 61 records plus header");
const tollPeriods = JSON.parse(fs.readFileSync(path.join(root, "toll-periods.json"), "utf8"));
if (!Array.isArray(tollPeriods.records) || tollPeriods.records.length !== 9) fail("expected 9 preserved toll-period records");
console.log("Yandex route benchmark integrity GREEN: 61 records, 60 Yandex-sourced, 9 toll-period rows.");
