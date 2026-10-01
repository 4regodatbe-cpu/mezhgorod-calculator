import type { Coordinate } from "@/lib/tolls";

export type M11BoundarySpatialStatus =
  | "official_coordinate_backed"
  | "legacy_only"
  | "route_provider_derived"
  | "unresolved";

export type M11BoundarySpatialEvidence = {
  status: M11BoundarySpatialStatus;
  coordinate: Coordinate | null;
  source: string | null;
};

export type M11TariffBoundaryPoint = {
  systemId: string;
  pointId: string;
  label: string;
  order: number;
  routeKm: number | null;
  pvpKm: number | null;
  spatial: M11BoundarySpatialEvidence;
};

export type M11TariffBoundarySystem = {
  systemId: string;
  sectionKm: {
    from: number;
    to: number;
  };
  points: readonly M11TariffBoundaryPoint[];
};

export type M11BoundaryModel = {
  systems: readonly M11TariffBoundarySystem[];
};

type M11Section1558Snapshot = {
  systemId: "m11-15-58-ossp";
  sectionKm: { from: number; to: number };
  points: Record<string, string>;
};

type M11Section58679Point = {
  id: string;
  routeKm: number;
  pvpKm: number;
  label: string;
  corridorLabel?: string;
};

type M11Section58679Snapshot = {
  systemId: "m11-58-679-avtodor";
  sectionKm: { from: number; to: number };
  points: M11Section58679Point[];
};

function unresolvedSpatialEvidence(): M11BoundarySpatialEvidence {
  return {
    status: "unresolved",
    coordinate: null,
    source: null,
  };
}

function assertUniquePointIds(systemId: string, points: readonly M11TariffBoundaryPoint[]) {
  const ids = new Set<string>();
  for (const point of points) {
    if (ids.has(point.pointId)) {
      throw new Error(`M11_DUPLICATE_BOUNDARY_POINT:${systemId}:${point.pointId}`);
    }
    ids.add(point.pointId);
  }
}

function assertContiguousOrder(systemId: string, points: readonly M11TariffBoundaryPoint[]) {
  for (let index = 0; index < points.length; index += 1) {
    if (points[index].order !== index) {
      throw new Error(`M11_NON_CONTIGUOUS_BOUNDARY_ORDER:${systemId}:${points[index].pointId}`);
    }
  }
}

function buildSection1558(snapshot: M11Section1558Snapshot): M11TariffBoundarySystem {
  const points = Object.entries(snapshot.points).map(([pointId, label], order) => ({
    systemId: snapshot.systemId,
    pointId,
    label,
    order,
    routeKm: null,
    pvpKm: null,
    spatial: unresolvedSpatialEvidence(),
  } satisfies M11TariffBoundaryPoint));

  assertUniquePointIds(snapshot.systemId, points);
  assertContiguousOrder(snapshot.systemId, points);

  return {
    systemId: snapshot.systemId,
    sectionKm: { ...snapshot.sectionKm },
    points,
  };
}

function buildSection58679(snapshot: M11Section58679Snapshot): M11TariffBoundarySystem {
  const points = snapshot.points.map((point, order) => ({
    systemId: snapshot.systemId,
    pointId: point.id,
    label: point.label,
    order,
    routeKm: point.routeKm,
    pvpKm: point.pvpKm,
    spatial: unresolvedSpatialEvidence(),
  } satisfies M11TariffBoundaryPoint));

  assertUniquePointIds(snapshot.systemId, points);
  assertContiguousOrder(snapshot.systemId, points);

  return {
    systemId: snapshot.systemId,
    sectionKm: { ...snapshot.sectionKm },
    points,
  };
}

export function buildM11BoundaryModel(
  section1558: M11Section1558Snapshot,
  section58679: M11Section58679Snapshot,
): M11BoundaryModel {
  if (section1558.systemId !== "m11-15-58-ossp") {
    throw new Error(`M11_UNEXPECTED_SYSTEM:${section1558.systemId}`);
  }
  if (section58679.systemId !== "m11-58-679-avtodor") {
    throw new Error(`M11_UNEXPECTED_SYSTEM:${section58679.systemId}`);
  }

  return {
    systems: [buildSection1558(section1558), buildSection58679(section58679)],
  };
}
