import switches from "@/data/toll-feature-switches.json";
import registry from "@/data/road-kilometrage.json";
import namedPlazas from "@/data/m4-pvp-osm-partial.json";
import { createKilometrageResolver, type KilometrageData, type RoadKilometrage } from "./road-kilometrage";
import type { RoadBoundaryResolution } from "./road-boundaries";

// Existing named inventory supplies NOMINAL plaza kilometre anchors only.
// ±1km is a conservative application tolerance, not measured source accuracy.
// Centroids are not inserted as road geometry and cannot prove a crossing.
// JSON coordinate arrays are validated by the resolver before any projection.
const localRegistry = registry as unknown as KilometrageData;
const data: KilometrageData = {
  anchors: [...(Array.isArray(localRegistry.anchors) ? localRegistry.anchors : []), ...namedPlazas.verifiedNamedPlazas.filter(p => p.status === "named_osm_match")
    .flatMap(p => p.laneNodes.map(node => ({ roadRef: "М-4", scaleId: "m4-official-km", branchId: "m4-mainline",
      osmNodeId: node.osmNodeId, km: p.km, uncertaintyKm: 1, reviewed: true,
      source: `data/m4-pvp-osm-partial.json#verifiedNamedPlazas/${p.km}/${node.osmNodeId}` })))],
  sections: localRegistry.sections,
};
const resolve = createKilometrageResolver(data);

/** The single optional integration point. Disabling cannot affect pricing. */
export function optionalRoadKilometrage(evidence?: RoadBoundaryResolution, enabled = switches.roadKilometrage): RoadKilometrage {
  try { return resolve(evidence, enabled); }
  catch {
    return { status: "unknown", direction: "unknown", diagnosticOnly: true, stops: ["km_module_error"],
      entry: { status: "unknown", reason: "km_module_error", position: null },
      exit: { status: "unknown", reason: "km_module_error", position: null } };
  }
}
