import type { Coordinate } from "@/lib/tolls";
import { normalizeRoadRef, type RoadBoundary, type RoadBoundaryResolution } from "./road-boundaries";

/** Position evidence only. This module never chooses a fare or repairs a trace. */
export type KmAnchor = {
  roadRef: string; scaleId: string; branchId: string;
  osmNodeId?: string; transitionId?: string;
  km: number; uncertaintyKm: number; source: string; reviewed: boolean;
};
export type KmSection = {
  roadRef: string; scaleId: string; branchId: string; accessRoadRefs: string[];
  coordinates: Coordinate[]; startKm: number; endKm: number;
  uncertaintyKm: number; maxOffsetKm: number; source: string; reviewed: boolean;
};
export type KilometrageData = { anchors: KmAnchor[]; sections: KmSection[] };
export type KmPosition = {
  km: number; minKm: number; maxKm: number; roadRef: string;
  scaleId: string; branchId: string; source: string;
  method: "exact-transition" | "exact-node" | "calibrated-section";
};
export type KmLookup = { status: "known" | "unknown" | "ambiguous"; reason: string; position: KmPosition | null };
export type RoadKilometrage = {
  status: "resolved" | "partial" | "unknown" | "disabled";
  entry: KmLookup; exit: KmLookup;
  direction: "increasing-km" | "decreasing-km" | "unknown";
  stops: string[];
  diagnosticOnly: true;
};

export const KILOMETRAGE_LIMITS = { anchors: 5000, sections: 256, storedSegments: 20000, lookupSegments: 4096 } as const;
const unknown = (reason: string): KmLookup => ({ status: "unknown", reason, position: null });
const validCoordinate = (p: Coordinate) => Array.isArray(p) && p.length === 2
  && Number.isFinite(p[0]) && Math.abs(p[0]) <= 180 && Number.isFinite(p[1]) && Math.abs(p[1]) <= 85;
const validKm = (n: number) => Number.isFinite(n) && n >= 0 && n <= 100000;
const validUncertainty = (n: number) => Number.isFinite(n) && n >= 0 && n <= 3;
const validBase = (row: KmAnchor | KmSection) => row.reviewed === true && typeof row.source === "string" && !!row.source.trim()
  && typeof row.scaleId === "string" && !!row.scaleId.trim() && typeof row.branchId === "string" && !!row.branchId.trim()
  && typeof row.roadRef === "string" && normalizeRoadRef(row.roadRef) !== null
  && validUncertainty(row.uncertaintyKm);
const key = (road: string, id: string) => `${road}|${id}`;
const round = (n: number) => Math.round(n * 1e6) / 1e6;
function position(row: KmAnchor | KmSection, km: number, method: KmPosition["method"]): KmPosition {
  return { km: round(km), minKm: round(Math.max(0, km - row.uncertaintyKm)), maxKm: round(km + row.uncertaintyKm),
    roadRef: normalizeRoadRef(row.roadRef)!, scaleId: row.scaleId, branchId: row.branchId, source: row.source, method };
}
function choose(candidates: KmPosition[]): KmLookup {
  if (!candidates.length) return unknown("km_anchor_or_section_missing");
  if (candidates.length !== 1) return { status: "ambiguous", reason: "km_multiple_candidates", position: null };
  return { status: "known", reason: candidates[0].method, position: candidates[0] };
}

type PreparedSection = { row: KmSection; lengths: number[]; total: number };
// Small local sections only: use a fixed local metric for both lengths and
// projection. Official chainage is calibrated by the section's TWO endpoints.
function metric(a: Coordinate, b: Coordinate, latitude: number): Coordinate {
  return [(a[0] - b[0]) * Math.cos(latitude * Math.PI / 180) * 111.32, (a[1] - b[1]) * 111.32];
}
function prepare(row: KmSection): PreparedSection | null {
  const lengths: number[] = [0];
  for (let i = 1; i < row.coordinates.length; i++) {
    const delta = metric(row.coordinates[i], row.coordinates[i - 1], row.coordinates[0][1]);
    const distance = Math.hypot(...delta);
    if (distance <= 0 || distance > 5) return null;
    lengths.push(lengths[i - 1] + distance);
  }
  const total = lengths.at(-1)!;
  if (total <= 0 || total > 20 || Math.abs(row.endKm - row.startKm) / total < 0.5
    || Math.abs(row.endKm - row.startKm) / total > 2) return null;
  return { row, lengths, total };
}
function project(p: Coordinate, section: PreparedSection): number | null {
  const { row, lengths, total } = section;
  let best = Infinity, progress = 0, tied = false;
  for (let i = 1; i < row.coordinates.length; i++) {
    const a = row.coordinates[i - 1], b = row.coordinates[i];
    const vector = metric(b, a, row.coordinates[0][1]), offset = metric(p, a, row.coordinates[0][1]);
    const rawT = (offset[0] * vector[0] + offset[1] * vector[1]) / (vector[0] ** 2 + vector[1] ** 2);
    if ((i === 1 && rawT < 0) || (i === row.coordinates.length - 1 && rawT > 1)) continue;
    const t = Math.max(0, Math.min(1, rawT));
    const distance = Math.hypot(offset[0] - t * vector[0], offset[1] - t * vector[1]);
    const nextProgress = lengths[i - 1] + t * (lengths[i] - lengths[i - 1]);
    if (distance < best - 1e-8) { best = distance; progress = nextProgress; tied = false; }
    else if (Math.abs(distance - best) <= 1e-8 && Math.abs(nextProgress - progress) > 0.001) tied = true;
  }
  // Multiple equally close positions on a folded section cannot bind chainage.
  return best <= row.maxOffsetKm && !tied ? row.startKm + progress / total * (row.endKm - row.startKm) : null;
}

/** Build once at module load, not once per route. Input is local reviewed data;
 * invalid rows are logged as stops and do not suppress independent valid rows. */
export function createKilometrageResolver(data: KilometrageData) {
  const anchors = new Map<string, KmPosition[]>(), sections = new Map<string, PreparedSection[]>();
  const configurationStops: string[] = [];
  const add = (k: string, p: KmPosition) => anchors.set(k, [...(anchors.get(k) ?? []), p]);
  const rawAnchors = Array.isArray(data?.anchors) ? data.anchors : [];
  const rawSections = Array.isArray(data?.sections) ? data.sections : [];
  if (rawAnchors.length > KILOMETRAGE_LIMITS.anchors || rawSections.length > KILOMETRAGE_LIMITS.sections) {
    configurationStops.push("km_registry_limit_exceeded");
  } else {
    for (const [i, row] of rawAnchors.entries()) {
      if (!row || !validBase(row) || !validKm(row.km)
        || (row.transitionId !== undefined ? !/^osm-transition:[1-9]\d*:[1-9]\d*>[1-9]\d*$/u.test(row.transitionId)
          : !/^[1-9]\d*$/u.test(row.osmNodeId ?? ""))) {
        configurationStops.push(`km_invalid_anchor:${i}`); continue;
      }
      const road = normalizeRoadRef(row.roadRef)!;
      // A directed transition row must not leak to other approaches at its node.
      if (row.transitionId) add(key(road, row.transitionId), position(row, row.km, "exact-transition"));
      else add(key(road, `node:${row.osmNodeId}`), position(row, row.km, "exact-node"));
    }
    let segments = 0;
    for (const [i, row] of rawSections.entries()) {
      if (!row || !validBase(row) || !validKm(row.startKm) || !validKm(row.endKm) || row.startKm === row.endKm
        || !Number.isFinite(row.maxOffsetKm) || row.maxOffsetKm <= 0 || row.maxOffsetKm > 0.5
        || !Array.isArray(row.accessRoadRefs) || !row.accessRoadRefs.length || row.accessRoadRefs.some(ref => typeof ref !== "string" || normalizeRoadRef(ref) === null)
        || !Array.isArray(row.coordinates) || row.coordinates.length < 2 || row.coordinates.some(p => !validCoordinate(p))) {
        configurationStops.push(`km_invalid_section:${i}`); continue;
      }
      if (segments + row.coordinates.length - 1 > KILOMETRAGE_LIMITS.storedSegments) {
        configurationStops.push(`km_section_storage_limit:${i}`); continue;
      }
      const prepared = prepare(row);
      if (!prepared) { configurationStops.push(`km_uncalibrated_section:${i}`); continue; }
      segments += row.coordinates.length - 1;
      const road = normalizeRoadRef(row.roadRef)!;
      sections.set(road, [...(sections.get(road) ?? []), prepared]);
    }
  }

  function lookup(boundary: RoadBoundary | null, road: string, side: "entry" | "exit"): KmLookup {
    if (!boundary || boundary.kind !== "road-transition") return unknown("km_boundary_missing");
    const targetSide = side === "entry" ? boundary.to : boundary.from;
    if (!targetSide?.refs.some(ref => normalizeRoadRef(ref) === road)) return unknown("km_target_road_mismatch");
    // Exact directed identity has priority; duplicate evidence stays ambiguous.
    const exact = anchors.get(key(road, boundary.id)) ?? anchors.get(key(road, `node:${boundary.osmNodeId}`));
    if (exact?.length) return choose(exact);
    if (!boundary.coordinate || !validCoordinate(boundary.coordinate)) return unknown("km_coordinate_and_anchor_missing");
    const access = (side === "entry" ? boundary.from : boundary.to)?.refs.map(normalizeRoadRef) ?? [];
    const candidates = (sections.get(road) ?? []).filter(s => s.row.accessRoadRefs.some(ref => access.includes(normalizeRoadRef(ref))));
    if (candidates.reduce((sum, s) => sum + s.row.coordinates.length - 1, 0) > KILOMETRAGE_LIMITS.lookupSegments) return unknown("km_lookup_budget_exceeded");
    return choose(candidates.flatMap(section => {
      const km = project(boundary.coordinate!, section);
      return km === null ? [] : [position(section.row, km, "calibrated-section")];
    }));
  }

  return (evidence?: RoadBoundaryResolution, enabled = true): RoadKilometrage => {
    const result: RoadKilometrage = { status: enabled ? "unknown" : "disabled", direction: "unknown", diagnosticOnly: true,
      entry: unknown(enabled ? "km_boundary_evidence_missing" : "km_module_disabled"),
      exit: unknown(enabled ? "km_boundary_evidence_missing" : "km_module_disabled"), stops: [] };
    if (!enabled) return result;
    result.stops.push(...configurationStops.slice(0, 16));
    if (configurationStops.length > 16) result.stops.push(`km_configuration_stops_truncated:${configurationStops.length}`);
    if (!evidence || (evidence.status !== "resolved" && evidence.status !== "partial")) {
      result.stops.push("km_boundary_evidence_unresolved"); return result;
    }
    const road = normalizeRoadRef(evidence.targetRef);
    if (!road) { result.stops.push("km_target_ref_invalid"); return result; }
    result.entry = lookup(evidence.entry, road, "entry"); result.exit = lookup(evidence.exit, road, "exit");
    for (const side of ["entry", "exit"] as const) if (result[side].status !== "known") result.stops.push(`${side}:${result[side].reason}`);
    const a = result.entry.position, b = result.exit.position;
    if (a && b && a.scaleId === b.scaleId && a.branchId === b.branchId && evidence.status === "resolved") {
      if (a.maxKm < b.minKm) result.direction = "increasing-km";
      else if (b.maxKm < a.minKm) result.direction = "decreasing-km";
      else result.stops.push("km_direction_intervals_overlap");
    } else if (a && b) result.stops.push("km_direction_scale_branch_or_trace_mismatch");
    result.status = a && b && result.direction !== "unknown" ? "resolved" : a || b ? "partial" : "unknown";
    return result;
  };
}
