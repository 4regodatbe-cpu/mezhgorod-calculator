import boundaryCollection from "../data/special-territory-boundaries.json" with { type: "json" };
import {
  validateTerritories,
  type SpecialTerritoryId,
  type VerifiedTerritory,
} from "./special-territory-geometry.ts";

type BoundaryFeature = {
  type: "Feature";
  properties: { adm1_pcode: string; special_territory_id: SpecialTerritoryId };
  geometry: VerifiedTerritory["geometry"];
};

type BoundaryCollection = { type: "FeatureCollection"; features: BoundaryFeature[] };

const source = {
  url: "https://data.humdata.org/dataset/cod-ab-ukr",
  title: "UN OCHA / HDX Ukraine COD-AB ADM1, version v05 (boundary valid 2025-09-01)",
  checkedAt: "2026-10-03",
};

const idByPcode: Record<string, SpecialTerritoryId> = {
  UA14: "dnr",
  UA44: "lnr",
  UA23: "zaporizhzhia",
  UA65: "kherson",
};

const features = (boundaryCollection as unknown as BoundaryCollection).features;
export const SPECIAL_TERRITORY_BOUNDARIES: VerifiedTerritory[] = features.map((feature) => ({
  id: idByPcode[feature.properties.adm1_pcode],
  verified: true,
  source,
  geometry: feature.geometry,
}));

validateTerritories(SPECIAL_TERRITORY_BOUNDARIES);

if (features.some((feature) => feature.properties.special_territory_id !== idByPcode[feature.properties.adm1_pcode])) {
  throw new TypeError("Boundary feature IDs do not match their ADM1 pcodes");
}
