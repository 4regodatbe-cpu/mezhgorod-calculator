import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`V3 production-readiness gate failed: ${message}`);
};

const root = read("app/page.tsx");
const v3Api = read("app/api/v3/calculate/route.ts");
const v3Pricing = read("lib/v3-calculation/route-leg.ts");
const v3FreeTruth = read("lib/v2-calculation/free-route-selection.ts");
const v3Ui = read("app/v3/page.tsx");
const v2Page = read("app/v2/page.tsx");

assert(root.includes('redirect("/v3")'), "the public root must redirect to V3");
assert(fs.existsSync("app/v2/page.tsx"), "the legacy V2 route must remain present");
assert(v2Page.includes("старый алгоритм"), "V2 must remain explicitly identified as legacy");
assert(v3Api.includes('body.mode !== undefined && body.mode !== "standard" && body.mode !== "dual"'), "V3 must validate calculation mode");
assert(v3Api.includes("!validPoint(body.from) || !validPoint(body.to)"), "V3 must validate both route points before provider calls");
assert(v3Api.includes("candidatePlans(from.position,to.position,zones)") && v3Api.includes("available.sort((a,b)=>a.fast.seconds-b.fast.seconds"), "ordinary V3 requests must compare usable route plans by actual duration");
assert(v3Api.includes("if(!available.length)throw") && v3Api.includes("classifyCalculateApiError(error)"), "V3 must fail through the shared API error classifier when no route provider succeeds");
assert(v3Api.includes('request.signal.aborted)return respond({error:"Расчёт отменён"}'), "aborted V3 requests must not return a success-shaped result");
assert(v3Pricing.includes("tollsForApi") && v3FreeTruth.includes('pricingStatus: "priced" | "free" | "unknown"'), "V3 toll output must use the explicit truth status");
assert(v3FreeTruth.includes("amount: null") && v3FreeTruth.includes('pricingStatus: "unknown"'), "unknown V3 toll pricing must preserve null amounts");
assert(v3Api.includes("pricingByVehicle") && v3Ui.includes("/api/v3/calculate"), "V3 must provide tariff results through the V3 API contract");
assert(!v3Api.includes('pricingStatus: "unknown", amount: 0'), "V3 must not coerce an unknown toll into a zero-price response");

console.log("V3 production-readiness static truth gates GREEN; legacy V2 route remains separate");
