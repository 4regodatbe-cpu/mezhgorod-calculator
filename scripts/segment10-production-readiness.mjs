import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const assert = (value, message) => {
  if (!value) throw new Error(`Production-readiness truth gate failed: ${message}`);
};

const root = read("app/page.tsx");
const v2Api = read("app/api/v2/calculate/route.ts");
const v3Api = read("app/api/v3/calculate/route.ts");
const routeInput = read("lib/route-input-validation.ts");
const requestBody = read("lib/limited-json-body.ts");
const tollTruth = read("lib/v2-calculation/free-route-selection.ts");
const routePricing = read("lib/v2-calculation/route-leg-pricing.ts");
const routeCard = read("app/v2/components/route-card.tsx");
const collect = read("app/api/collect/route.ts");
const envExample = read(".env.example");
const suggest = read("app/api/suggest/route.ts");
const debugRoutes = [
  ["route", read("app/api/v2/debug-route/route.ts")],
  ["M4", read("app/api/v2/debug-m4/route.ts")],
  ["PVP", read("app/api/v2/debug-pvp-node/route.ts")],
];

assert(root.includes('redirect("/v3")'), "public root points to current V3");
assert(fs.existsSync("app/v2/page.tsx"), "legacy V2 page has not been removed");
assert(v2Api.includes('body.mode !== undefined && body.mode !== "standard" && body.mode !== "dual"'), "legacy V2 mode is validated");
assert(v3Api.includes('body.mode !== undefined && body.mode !== "standard" && body.mode !== "dual"'), "V3 mode is validated");
assert(v2Api.includes("function validDepartureAt(value: unknown)") && v3Api.includes("function validDepartureAt(value: unknown)"), "both API versions validate departure dates");
assert(v2Api.includes("!validPoint(body.from) || !validPoint(body.to)") && v3Api.includes("!validPoint(body.from) || !validPoint(body.to)"), "both API versions validate points before route-provider calls");
assert(routeInput.includes('typeof point.label !== "string"') && routeInput.includes("Array.from(point.label).length > MAX_ROUTE_POINT_LABEL_CHARS"), "labels have type and length bounds");
assert(routeInput.includes("lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180"), "coordinates have geographic bounds");
assert(requestBody.includes("byteLength > maxBytes") && requestBody.includes("new TextDecoder(\"utf-8\", { fatal: true })"), "calculation and telemetry JSON is bounded and decoded strictly");

assert(tollTruth.includes('pricingStatus: "priced" | "free" | "unknown"'), "shared toll serializer exposes explicit truth status");
assert(tollTruth.includes("amount: null") && tollTruth.includes('pricingStatus: "unknown"'), "unknown toll price stays null in the shared serializer");
assert(tollTruth.includes('"confirmed_payment_point_avoiding"'), "a free alternative requires a confirmed payment-point-avoiding route");
assert(routePricing.includes("const composition = composeRouteTolls(components)"), "road-family composition is based on detected toll components");
assert(!routePricing.includes('compositionValidation(["m4_a289"]'), "route composition does not invent an M4 family for unrelated routes");
assert(routeCard.includes('toll?.pricingStatus === "unknown"') && routeCard.includes("Стоимость платных дорог неизвестна"), "shared V2/V3 card visibly distinguishes unknown toll pricing");
assert(!routeCard.includes("toll.amount ?? 0"), "unknown toll amount is not coerced to zero in the shared card");

assert(collect.includes('const invalidStatus = !["priced", "free", "unknown"].includes(pricingStatus ?? "")'), "route telemetry requires explicit toll truth");
assert(collect.includes('pricingStatus === "unknown"') && collect.includes("tollValues.some((value) => value !== null)"), "route telemetry preserves null for unknown tolls");
assert(collect.includes("function coarseRegion") && collect.includes("ADDRESS_PART"), "route telemetry removes address-level details");
assert(!collect.includes("{ ...body,"), "telemetry does not forward the full request object");
assert(suggest.includes("q.length > 200"), "suggestion query length is bounded");
assert(envExample.includes("CALCULATOR_DEBUG_TOKEN="), "debug access token configuration is documented without a secret");
for (const [name, source] of debugRoutes) {
  assert(source.includes('process.env.VERCEL !== "1"') && source.includes("CALCULATOR_DEBUG_TOKEN") && source.includes("x-calculator-debug-token"), `${name} diagnostics require local mode or an explicit protected token`);
}

for (const obsolete of [
  ".github/workflows/apply-ckad-composition-patch.yml",
  ".github/workflows/apply-fast-router-fallback-patch.yml",
  ".github/workflows/apply-m11-moscow-composition-patch.yml",
  "scripts/apply-ckad-composition-patch.mjs",
  "scripts/apply-fast-router-fallback-patch.mjs",
  "scripts/apply-m11-moscow-composition-patch.mjs",
]) assert(!fs.existsSync(obsolete), `obsolete self-patching hook is absent: ${obsolete}`);

console.log("Production-readiness truth gates GREEN: active V3, isolated legacy V2, fail-closed tolls, bounded diagnostics");
