import { createHash } from "node:crypto";
import type { Coordinate } from "@/lib/tolls";
import type { M11OsrmLeg, M11ValhallaLeg } from "./m11-road-evidence-types";

export type RoadIdentity = { refs: string[]; names: string[] };
export type RoadBoundary = {
  id: string;
  kind: "road-transition" | "route-endpoint";
  from: RoadIdentity | null;
  to: RoadIdentity | null;
  coordinate: Coordinate;
  legIndex: number;
  sourceIndex: number;
  connectorCount: number;
};
export type RoadBoundaryResolution = {
  provider: "osrm" | "valhalla";
  targetRef: string;
  routeSignature: string;
  // A maneuver boundary identifies the selected access, not an operator's
  // charging boundary or an OSM junction/node ID.
  precision: "route-maneuver";
  status: "resolved" | "partial" | "unknown" | "not-detected";
  reason: string;
  entry: RoadBoundary | null;
  exit: RoadBoundary | null;
};

type Section = {
  road: RoadIdentity;
  geometry: Coordinate[];
  legIndex: number;
  sourceIndex: number;
  valid: boolean;
};

const unique = (values: string[]) => [...new Set(values)].sort();
const coordinateValid = (p: Coordinate) => Array.isArray(p) && p.length === 2
  && Number.isFinite(p[0]) && Math.abs(p[0]) <= 180
  && Number.isFinite(p[1]) && Math.abs(p[1]) <= 90;

export function roadRouteSignature(route: readonly Coordinate[]) {
  return createHash("sha256").update(JSON.stringify(route)).digest("hex");
}

/** Normalize whole route-number labels only. A destination or prose mention
 * is never evidence that the selected route actually uses that road. */
export function normalizeRoadRef(value: string): string | null {
  const compact = value.normalize("NFKC").toUpperCase().replace(/[\s‐‑‒–—−-]+/gu, "");
  const match = /^([MМAАPРR]|E|AH)(\d+[А-ЯA-Z]?)$/u.exec(compact);
  if (!match) return null;
  const prefix = ({ M: "М", A: "А", P: "Р", R: "Р" } as Record<string, string>)[match[1]] ?? match[1];
  return `${prefix}-${match[2]}`;
}

function identity(labels: string[], explicitRefs: string[] = []): RoadIdentity {
  labels = labels.filter((value): value is string => typeof value === "string");
  explicitRefs = explicitRefs.filter((value): value is string => typeof value === "string");
  const refs = unique([...explicitRefs, ...labels].flatMap(value => value.split(";"))
    .map(normalizeRoadRef).filter((ref): ref is string => ref !== null));
  return { refs, names: unique(labels.map(value => value.trim()).filter(value => value && !normalizeRoadRef(value))) };
}

function distanceKm(a: Coordinate, b: Coordinate) {
  const rad = Math.PI / 180, lat = (a[1] + b[1]) / 2 * rad;
  return Math.hypot((a[0] - b[0]) * Math.cos(lat), a[1] - b[1]) * 111.32;
}
function roadKey(road: RoadIdentity | null) {
  return road === null ? null : road.refs.length ? road.refs : road.names.map(name => name.toLocaleLowerCase("ru-RU"));
}
function connected(a: Section, b: Section) {
  return a.valid && b.valid && distanceKm(a.geometry.at(-1)!, b.geometry[0]) <= 0.003;
}

function followsSelectedGeometry(sections: Section[], route: Coordinate[]) {
  // Both supported providers return the full shape. Match ordered section
  // endpoints against that shape, never against another candidate's line.
  let cursor = 0;
  for (const section of sections) {
    for (const point of [section.geometry[0], section.geometry.at(-1)!]) {
      while (cursor < route.length && distanceKm(point, route[cursor]) > 0.003) cursor++;
      if (cursor === route.length) return false;
    }
  }
  return true;
}

function resolve(provider: RoadBoundaryResolution["provider"], sections: Section[],
  route: Coordinate[], target: string): RoadBoundaryResolution {
  const targetRef = normalizeRoadRef(target) ?? target;
  const result: RoadBoundaryResolution = { provider, targetRef, routeSignature: roadRouteSignature(route),
    precision: "route-maneuver", status: "not-detected", reason: "road_ref_not_detected", entry: null, exit: null };
  const targetIndices = sections.flatMap((s, i) => s.road.refs.includes(targetRef) ? [i] : []);
  if (!targetIndices.length) return result;
  result.status = "unknown";
  if (route.length < 2 || !route.every(coordinateValid) || sections.some(s => !s.valid)) {
    result.reason = "road_geometry_incomplete";
    return result;
  }
  const first = targetIndices[0], last = targetIndices.at(-1)!;
  // Do not collapse exit/re-entry into one tariff vector or bridge a named
  // other road merely because the same target ref appears later.
  if (sections.slice(first, last + 1).some(s => !s.road.refs.includes(targetRef))) {
    result.reason = "multiple_road_traversals";
    return result;
  }
  if (sections.slice(1).some((s, i) => !connected(sections[i], s))) {
    result.reason = "road_geometry_discontinuous";
    return result;
  }
  if (!followsSelectedGeometry(sections, route)) {
    result.reason = "road_steps_not_on_selected_geometry";
    return result;
  }

  function boundary(side: "entry" | "exit"): RoadBoundary | null {
    const step = sections[side === "entry" ? first : last];
    const increment = side === "entry" ? -1 : 1;
    let index = (side === "entry" ? first : last) + increment;
    let connectorCount = 0, connectorKm = 0;
    // Unnamed ramp instructions may separate two named roads. Retain the
    // directed transition only across a short, continuous unnamed connector.
    while (index >= 0 && index < sections.length
      && sections[index].road.refs.length === 0 && sections[index].road.names.length === 0) {
      const geometry = sections[index].geometry;
      for (let i = 1; i < geometry.length; i++) connectorKm += distanceKm(geometry[i - 1], geometry[i]);
      connectorCount++;
      if (connectorCount > 8 || connectorKm > 3) return null;
      index += increment;
    }
    const other = sections[index]?.road ?? null;
    const coordinate = side === "entry" ? step.geometry[0] : step.geometry.at(-1)!;
    const from = side === "entry" ? other : step.road;
    const to = side === "entry" ? step.road : other;
    // Include location and direction; a pair of road refs is not a unique
    // interchange. Provider is part of identity until an explicit crosswalk
    // proves that two providers describe the same physical access.
    const key = JSON.stringify([provider, roadKey(from), roadKey(to), coordinate.map(n => Number(n.toFixed(6)))]);
    return { id: `road-transition:${createHash("sha256").update(key).digest("hex").slice(0, 24)}`,
      kind: other ? "road-transition" : "route-endpoint", from, to, coordinate,
      legIndex: step.legIndex, sourceIndex: step.sourceIndex, connectorCount };
  }
  result.entry = boundary("entry");
  result.exit = boundary("exit");
  result.status = result.entry?.kind === "road-transition" && result.exit?.kind === "road-transition" ? "resolved" : "partial";
  result.reason = result.status === "resolved" ? "directed_road_transitions_resolved"
    : !result.entry || !result.exit ? "road_connector_unresolved" : "journey_endpoint_on_target_road";
  return result;
}

export function roadBoundariesFromValhalla(legs: M11ValhallaLeg[], target = "М-4") {
  const sections = legs.flatMap((leg, legIndex) => (leg.maneuvers ?? []).map((m, sourceIndex): Section => {
    const begin = m.begin_shape_index, end = m.end_shape_index;
    const valid = Number.isInteger(begin) && Number.isInteger(end) && begin! >= 0 && end! >= begin!
      && end! < leg.coordinates.length;
    const geometry = valid ? leg.coordinates.slice(begin!, end! + 1) : [];
    return { road: identity(m.street_names ?? []), geometry, legIndex, sourceIndex,
      valid: valid && geometry.length > 0 && geometry.every(coordinateValid) };
  }));
  return resolve("valhalla", sections, legs.flatMap(leg => leg.coordinates), target);
}

export function roadBoundariesFromOsrm(legs: M11OsrmLeg[], route: Coordinate[], target = "М-4") {
  const sections = legs.flatMap((leg, legIndex) => (leg.steps ?? []).map((step, sourceIndex): Section => {
    const geometry = step.geometry?.coordinates ?? [];
    return { road: identity(step.name ? [step.name] : [], step.ref ? [step.ref] : []), geometry, legIndex, sourceIndex,
      valid: geometry.length > 0 && geometry.every(coordinateValid) };
  }));
  return resolve("osrm", sections, route, target);
}
