import fs from "node:fs";
const path = "app/api/v2/calculate/route.ts";
let source = fs.readFileSync(path, "utf8");
const replace = (from, to, label) => {
  if (!source.includes(from)) throw new Error(`Patch anchor not found: ${label}`);
  source = source.replace(from, to);
};

replace(
  'import { calculateProductionM4 } from "@/lib/toll-engine/m4-production";',
  'import { calculateProductionCkadM4M11 } from "@/lib/toll-engine/ckad-production";\nimport { calculateProductionM4 } from "@/lib/toll-engine/m4-production";',
  "CKAD import",
);

replace(
`  const productionM12 = selectedFast.provider === "Valhalla" && valhallaEvidence
    ? calculateProductionM12(
        valhallaEvidence.coordinates,
        valhallaEvidence.m12StrictSpan,
        familySegments(geometricTolls.segments, "m12"),
        departureAt,
      )
    : null;

  const m4Detected = productionM4.candidate || legacyFamilies.has("m4_a289");`,
`  const productionM12 = selectedFast.provider === "Valhalla" && valhallaEvidence
    ? calculateProductionM12(
        valhallaEvidence.coordinates,
        valhallaEvidence.m12StrictSpan,
        familySegments(geometricTolls.segments, "m12"),
        departureAt,
      )
    : null;
  const productionCkad = selectedFast.provider === "Valhalla" && valhallaEvidence?.m11RoadEvidence
    ? calculateProductionCkadM4M11(valhallaEvidence.coordinates, valhallaEvidence.m11RoadEvidence)
    : null;

  const m4Detected = productionM4.candidate || legacyFamilies.has("m4_a289");`,
  "CKAD calculation",
);

replace(
`  const m12Detected = legacyFamilies.has("m12") || Boolean(valhallaEvidence?.m12StrictSpan);
  const connectorUnknown = m4Detected && m11Detected && !legacyFamilies.has("ckad");

  const components: RouteTollComponent[] = [`,
`  const m12Detected = legacyFamilies.has("m12") || Boolean(valhallaEvidence?.m12StrictSpan);
  const m4M11ConnectorDetected = m4Detected && m11Detected;
  const ckadDetected = legacyFamilies.has("ckad") || Boolean(productionCkad?.candidate) || m4M11ConnectorDetected;

  const components: RouteTollComponent[] = [`,
  "CKAD detection",
);

replace(
`    { id: "ckad", detected: legacyFamilies.has("ckad") || connectorUnknown, tolls: null, reason: legacyFamilies.has("ckad") ? "ckad_engine_not_yet_composed" : "m4_to_m11_connector_unverified" },`,
`    { id: "ckad", detected: ckadDetected, tolls: productionCkad?.tolls ?? null, reason: productionCkad?.reason ?? (m4M11ConnectorDetected ? "m4_to_m11_connector_unverified" : "ckad_not_priced") },`,
  "CKAD component",
);

fs.writeFileSync(path, source);
console.log("CKAD composition patch applied");
