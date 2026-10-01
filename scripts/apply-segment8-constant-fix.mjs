import fs from "node:fs";
const path = "app/api/v2/calculate/route.ts";
let s = fs.readFileSync(path, "utf8");
s = s.replace('import { selectLiveRoute, type GoldenRouteReference, type RouteQuality } from "@/lib/route-quality";', 'import { MAX_PROVIDER_DISTANCE_SPREAD_PERCENT, selectLiveRoute, type GoldenRouteReference, type RouteQuality } from "@/lib/route-quality";');
s = s.replace(/MAX_VERIFIED_SPREAD_PERCENT/g, "MAX_PROVIDER_DISTANCE_SPREAD_PERCENT");
fs.writeFileSync(path, s);
console.log("Segment 8 spread constant aligned");
