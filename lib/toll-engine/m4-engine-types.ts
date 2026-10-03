import type { PlazaNodeVerification } from "./m4-plaza-nodes";

export type PricingStatus = "priced" | "partial" | "unresolved" | "none";
export type PricingConfidence = "high" | "medium" | "low" | "none";

export type M4PricedPlaza = {
  km: number;
  weekday: number;
  weekend: number;
  verification: PlazaNodeVerification;
  matchedNodeIds: string[];
  source: string;
};

export type M4UnresolvedItem = {
  code: "mixed_zone" | "ambiguous_545" | "alternative_corridor" | "missing_tariff" | "incomplete_validation";
  kms: number[];
  message: string;
};

export type M4PricingResult = {
  road: "М-4 Дон";
  status: PricingStatus;
  confidence: PricingConfidence;
  amount: number | null;
  weekdayAmount: number;
  weekendAmount: number;
  period: "понедельник–четверг" | "пятница–воскресенье";
  pricedPlazas: M4PricedPlaza[];
  unresolved: M4UnresolvedItem[];
  recognizedEventCount: number;
  unrecognizedEventCount: number;
  evidence: "osm_toll_booth_node";
  inputComplete: boolean | null;
  checkedChunkCount: number | null;
  chunkCount: number | null;
  message: string;
};
