import type { TollBoothEvent } from "@/lib/toll-validator";
import type { M4PlazaNodeGroup } from "@/lib/toll-engine/m4-plaza-nodes";

export type M4LocalPlazaCheck = {
  km: number;
  model: M4PlazaNodeGroup["model"];
  status: "confirmed" | "rejected" | "unknown";
  evidence: "map_matching" | "route_traversal" | "none";
  nearestDistanceKm: number;
  matchedNodeIds: string[];
  expectedNodeIds: string[];
  windowPointCount: number;
  message: string;
};

export type M4RoutePlazaValidation = {
  source: "Valhalla local PVP map matching + strict route traversal fallback";
  candidateRadiusKm: number;
  windowHalfKm: number;
  candidateCount: number;
  checkedCandidateCount: number;
  confirmedCount: number;
  rejectedCount: number;
  unknownCount: number;
  complete: boolean;
  events: TollBoothEvent[];
  checks: M4LocalPlazaCheck[];
  elapsedMs: number;
  message: string;
};
