import assert from "node:assert/strict";
import fs from "node:fs";

const tollData = fs.readFileSync("lib/toll-data/full-routes.ts", "utf8");
const estimator = fs.readFileSync("lib/tolls.ts", "utf8");
const integration = fs.readFileSync("lib/v2-calculation/route-leg-pricing.ts", "utf8");

assert.match(tollData, /М-4 \+ А-289 \+ М-11: Ялта — Санкт-Петербург/);
assert.match(tollData, /weekday: 11170,\s*weekend: 13480/);
assert.match(tollData, /expectedKm: 2555,\s*distanceTolerancePercent: 2,\s*strictExpectedKm: true/);
assert.match(tollData, /pricingAuthority: "official_operator_aggregate"/);
assert.match(estimator, /if \(item\.strictExpectedKm\) return false/);
assert.match(estimator, /export function isAuthoritativeFullRouteEstimate/);
assert.ok(
  integration.indexOf("isAuthoritativeFullRouteEstimate(geometricTolls)")
    < integration.indexOf('composition.status === "priced"'),
  "authoritative whole-route tariffs must take precedence over additive PVP composition",
);

const weekday = 5040 + 800 + 4200 + 1130;
const weekend = 6090 + 800 + 4940 + 1650;
assert.equal(weekday, 11170);
assert.equal(weekend, 13480);
assert.ok(Math.abs(weekend - 13360) / 13360 < 0.03, "Saturday operator tariff should remain within 3% of the Yandex control");

console.log("Known full-route toll override: GREEN");
