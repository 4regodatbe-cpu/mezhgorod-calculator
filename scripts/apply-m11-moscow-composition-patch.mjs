import fs from "node:fs";
const path = "app/api/v2/calculate/route.ts";
let source = fs.readFileSync(path, "utf8");
const replace = (from, to, label) => {
  if (!source.includes(from)) throw new Error(`Patch anchor not found: ${label}`);
  source = source.replace(from, to);
};

replace(
  'import { calculateProductionCkadM4M11 } from "@/lib/toll-engine/ckad-production";\n',
  '',
  "remove CKAD production import",
);
replace(
  'import { calculateProductionM11 } from "@/lib/toll-engine/m11-production";',
  'import { calculateProductionM11 } from "@/lib/toll-engine/m11-production";\nimport { calculateM11MoscowToPetersburg } from "@/lib/toll-engine/m11-moscow-production";',
  "M11 Moscow production import",
);

replace(
`  const productionM11 = selectedFast.provider === "Valhalla" && valhallaEvidence?.m11RoadEvidence
    ? calculateProductionM11(
        valhallaEvidence.coordinates,
        valhallaEvidence.m11RoadEvidence,
        familySegments(geometricTolls.segments, "m11"),
        departureAt,
      )
    : null;`,
`  const productionM11Geometry = calculateM11MoscowToPetersburg(routeGeometry, selectedFast.route.seconds, departureAt);
  const productionM11 = selectedFast.provider === "Valhalla" && valhallaEvidence?.m11RoadEvidence
    ? calculateProductionM11(
        valhallaEvidence.coordinates,
        valhallaEvidence.m11RoadEvidence,
        familySegments(geometricTolls.segments, "m11"),
        departureAt,
      )
    : null;`,
  "M11 geometry production",
);

replace(
`  const productionCkad = selectedFast.provider === "Valhalla" && valhallaEvidence?.m11RoadEvidence
    ? calculateProductionCkadM4M11(valhallaEvidence.coordinates, valhallaEvidence.m11RoadEvidence)
    : null;

  const m4Detected = productionM4.candidate || legacyFamilies.has("m4_a289");
  const m11Detected = legacyFamilies.has("m11") || Boolean(valhallaEvidence?.m11RoadEvidence?.strictBlocks.length);
  const m12Detected = legacyFamilies.has("m12") || Boolean(valhallaEvidence?.m12StrictSpan);
  const m4M11ConnectorDetected = m4Detected && m11Detected;
  const ckadDetected = legacyFamilies.has("ckad") || Boolean(productionCkad?.candidate) || m4M11ConnectorDetected;`,
`  const m4Detected = productionM4.candidate || legacyFamilies.has("m4_a289");
  const m11Detected = productionM11Geometry.candidate || legacyFamilies.has("m11") || Boolean(valhallaEvidence?.m11RoadEvidence?.strictBlocks.length);
  const m12Detected = legacyFamilies.has("m12") || Boolean(valhallaEvidence?.m12StrictSpan);
  // M-4 → M-11 is not evidence of CKAD: real south→SPB routes use MKAD 28→76 km.
  // CKAD is a paid component only when route evidence explicitly identifies CKAD.
  const ckadDetected = legacyFamilies.has("ckad");`,
  "remove false CKAD inference",
);

replace(
`    { id: "m11", detected: m11Detected, tolls: productionM11?.tolls ?? null, reason: productionM11?.reason ?? "m11_not_priced" },`,
`    { id: "m11", detected: m11Detected, tolls: productionM11Geometry.tolls ?? productionM11?.tolls ?? null, reason: productionM11Geometry.exact ? productionM11Geometry.reason : productionM11?.reason ?? productionM11Geometry.reason },`,
  "M11 component composition",
);
replace(
`    { id: "ckad", detected: ckadDetected, tolls: productionCkad?.tolls ?? null, reason: productionCkad?.reason ?? (m4M11ConnectorDetected ? "m4_to_m11_connector_unverified" : "ckad_not_priced") },`,
`    { id: "ckad", detected: ckadDetected, tolls: null, reason: "ckad_explicit_route_evidence_not_priced" },`,
  "CKAD fail-closed component",
);

fs.writeFileSync(path, source);
console.log("M11 Moscow composition patch applied");
