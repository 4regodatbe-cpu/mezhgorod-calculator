import assert from "node:assert/strict";
import { priceOtherRoadVerifiedSections } from "../lib/toll-engine/other-road-current-tariffs.ts";

assert.equal(priceOtherRoadVerifiedSections({ status: "verified", roadId: "m1-33-66", sectionIds: ["m1-33-66"] }, "noTransponder", "allDays").amountRub, 250);
assert.equal(priceOtherRoadVerifiedSections({ status: "verified", roadId: "m3", sectionIds: ["m3-65-86","m3-112-150","m3-150-194"] }, "noTransponder", "friSun").amountRub, 800);
assert.equal(priceOtherRoadVerifiedSections({ status: "verified", roadId: "m3", sectionIds: ["m3-65-86","m3-112-150","m3-150-194"] }, "transponder", "friSun").amountRub, 680);
assert.equal(priceOtherRoadVerifiedSections({ status: "verified", roadId: "a289", sectionIds: ["a289-maryanskaya-temryuk"] }, "noTransponder", "allDays").amountRub, 1103);
assert.equal(priceOtherRoadVerifiedSections({ status: "verified", roadId: "a289", sectionIds: ["a289-maryanskaya-temryuk"] }, "transponder", "allDays").amountRub, 800);
assert.equal(priceOtherRoadVerifiedSections({ status: "verified", roadId: "ckad", sectionIds: ["ckad-m10-m11","ckad-m11-a107"] }, "noTransponder", "allDays").amountRub, 227);

const unresolved = priceOtherRoadVerifiedSections({ status: "unresolved", roadId: "ckad", reason: "route_rvp_evidence_missing" }, "noTransponder", "allDays");
assert.equal(unresolved.status, "unknown");
assert.equal(unresolved.amountRub, null);
const unknownSection = priceOtherRoadVerifiedSections({ status: "verified", roadId: "ckad", sectionIds: ["not-real"] }, "noTransponder", "allDays");
assert.equal(unknownSection.status, "unknown");
assert.equal(unknownSection.amountRub, null);

console.log("OTHER_ROAD_EVIDENCE_CONTRACT_GREEN pricedControls=6 failClosed=2 tariffModes=2");
