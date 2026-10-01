import fs from "node:fs";

const path = "app/api/v2/calculate/route.ts";
let s = fs.readFileSync(path, "utf8");
const original = s;

s = s.replace(
  'import { findVerifiedRoute, tollPeriodsForRoute } from "@/lib/verified-routes";',
  'import { findVerifiedRoute, goldenRouteReference, tollPeriodsForRoute } from "@/lib/verified-routes";\nimport { selectLiveRoute, type GoldenRouteReference, type RouteQuality } from "@/lib/route-quality";',
);

s = s.replace(/type RouteQuality = \{[\s\S]*?\};\ntype KnownRoute = \{[\s\S]*?\};\n/, "");
s = s.replace('const MAX_VERIFIED_SPREAD_PERCENT = 7;\n', "");
s = s.replace(/const KNOWN_FAST_ROUTES:[\s\S]*?\n\];\n\nconst KNOWN_FREE_ROUTES:[\s\S]*?\n\];\n\n/, "");
s = s.replace(/function distanceKm\([\s\S]*?\nfunction knownFastRoute\([\s\S]*?\n\}\n\n/, "");
s = s.replace(/function selectRoute\([\s\S]*?\n\}\n\nfunction qualityForCandidate/, "function qualityForCandidate");

s = s.replace(/selectRoute\(/g, "selectLiveRoute(");
s = s.replace('knownFastRoute(from, to)', 'goldenRouteReference(from.label, to.label, "fast")');
s = s.replace('knownFreeRoute(from, to)', 'goldenRouteReference(from.label, to.label, "free")');
s = s.replace('  known?: RouteSummary,\n): Promise<SelectedFree | null> {', '  known?: GoldenRouteReference,\n): Promise<SelectedFree | null> {');

if (s === original) throw new Error("Segment 8 migration made no changes");
for (const forbidden of ["KNOWN_FAST_ROUTES", "KNOWN_FREE_ROUTES", "knownFastRoute(", "knownFreeRoute(", "function selectRoute("]) {
  if (s.includes(forbidden)) throw new Error(`Legacy hidden substitution remains: ${forbidden}`);
}
if (!s.includes('goldenRouteReference(from.label, to.label, "fast")')) throw new Error("Fast golden reference not integrated");
if (!s.includes('goldenRouteReference(from.label, to.label, "free")')) throw new Error("Free golden reference not integrated");
fs.writeFileSync(path, s);
console.log("Segment 8 route integration migration applied");
