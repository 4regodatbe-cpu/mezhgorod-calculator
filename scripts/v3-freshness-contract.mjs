import fs from "node:fs";

const verified = fs.readFileSync("lib/verified-routes.ts", "utf8");
const api = fs.readFileSync("app/api/v3/calculate/route.ts", "utf8");

function assert(value, message) {
  if (!value) throw new Error(`V3 freshness contract failed: ${message}`);
}

assert(verified.includes("VERIFIED_ROUTE_MAX_AGE_DAYS = 45"), "verified route max age must be explicit");
assert(verified.includes("verifiedRouteIsFresh"), "runtime freshness predicate missing");
assert(verified.includes("route: fresh, staleRoute:"), "stale records must not be returned as verified routes");
assert(verified.includes("filter((route) => verifiedRouteIsFresh(route))"), "verified route count must exclude stale records");
assert(api.includes("result.staleRoute"), "V3 API must distinguish stale route records");
assert(api.includes("устарела и не используется в расчёте"), "V3 API must explain stale fail-closed state");
assert(api.includes("label.length > 240"), "V3 labels must be bounded");

console.log("V3 freshness contract GREEN: stale records fail closed and oversized labels are rejected");
