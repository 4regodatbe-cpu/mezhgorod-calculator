import type { Coordinate } from "@/lib/tolls";

export type M11BoundarySpatialStatus =
  | "official_coordinate_backed"
  | "independently_verified_infrastructure"
  | "legacy_only"
  | "route_provider_derived"
  | "unresolved";

export type M11BoundarySpatialEvidence = {
  status: M11BoundarySpatialStatus;
  coordinate: Coordinate | null;
  source: string | null;
};

export type M11BoundaryFacility = {
  systemId: string;
  tariffPointId: string | null;
  facilityId: string;
  officialNumber: string | null;
  officialLabel: string;
  facilityKind: "mainline_pvp" | "interchange_pvp" | "pvp_unspecified" | "virtual_boundary" | "other";
  routeKm: number | null;
  accessRoadKm: number | null;
  directionText: string | null;
  identitySource: string;
  note: string | null;
  spatial: M11BoundarySpatialEvidence;
};

export type M11TariffBoundaryPoint = {
  systemId: string;
  pointId: string;
  label: string;
  order: number;
  routeKm: number | null;
  pvpKm: number | null;
  facilities: readonly M11BoundaryFacility[];
};

export type M11TariffBoundarySystem = {
  systemId: string;
  sectionKm: {
    from: number;
    to: number;
  };
  points: readonly M11TariffBoundaryPoint[];
  unboundFacilities: readonly M11BoundaryFacility[];
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

type M11FacilityEvidenceItem = {
  facilityId: string;
  tariffPointId: string | null;
  officialNumber: string | null;
  officialLabel: string;
  facilityKind: M11BoundaryFacility["facilityKind"];
  routeKm: number | null;
  accessRoadKm: number | null;
  directionText: string | null;
  coordinate: Coordinate | null;
  spatialStatus: M11BoundarySpatialStatus;
  facilityOwnerOperatorNote?: string;
  note?: string;
};

type M11FacilityEvidenceSnapshot = {
  systemId: string;
  source: {
    url: string;
  };
  facilities: M11FacilityEvidenceItem[];
};

type M11SystemFacilityMap = {
  byPointId: Map<string, M11BoundaryFacility[]>;
  unbound: M11BoundaryFacility[];
};

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

function facilitiesForSystem(
  systemId: string,
  allowedPointIds: ReadonlySet<string>,
  evidenceSnapshots: readonly M11FacilityEvidenceSnapshot[],
): M11SystemFacilityMap {
  const byPointId = new Map<string, M11BoundaryFacility[]>();
  const unbound: M11BoundaryFacility[] = [];
  const facilityIds = new Set<string>();

  for (const snapshot of evidenceSnapshots.filter((item) => item.systemId === systemId)) {
    for (const facility of snapshot.facilities) {
      if (facility.tariffPointId !== null && !allowedPointIds.has(facility.tariffPointId)) {
        throw new Error(`M11_FACILITY_UNKNOWN_TARIFF_POINT:${systemId}:${facility.facilityId}:${facility.tariffPointId}`);
      }
      if (facilityIds.has(facility.facilityId)) {
        throw new Error(`M11_DUPLICATE_FACILITY:${systemId}:${facility.facilityId}`);
      }
      facilityIds.add(facility.facilityId);

      if (facility.coordinate === null && facility.spatialStatus !== "unresolved") {
        throw new Error(`M11_FACILITY_STATUS_WITHOUT_COORDINATE:${systemId}:${facility.facilityId}`);
      }
      if (facility.coordinate !== null && facility.spatialStatus === "unresolved") {
        throw new Error(`M11_FACILITY_COORDINATE_WITHOUT_STATUS:${systemId}:${facility.facilityId}`);
      }

      const value: M11BoundaryFacility = {
        systemId,
        tariffPointId: facility.tariffPointId,
        facilityId: facility.facilityId,
        officialNumber: facility.officialNumber,
        officialLabel: facility.officialLabel,
        facilityKind: facility.facilityKind,
        routeKm: facility.routeKm,
        accessRoadKm: facility.accessRoadKm,
        directionText: facility.directionText,
        identitySource: snapshot.source.url,
        note: facility.note ?? facility.facilityOwnerOperatorNote ?? null,
        spatial: {
          status: facility.spatialStatus,
          coordinate: facility.coordinate,
          source: facility.coordinate === null ? null : snapshot.source.url,
        },
      };

      if (facility.tariffPointId === null) {
        unbound.push(value);
        continue;
      }

      const existing = byPointId.get(facility.tariffPointId) ?? [];
      existing.push(value);
      byPointId.set(facility.tariffPointId, existing);
    }
  }

  return { byPointId, unbound };
}

function buildSection1558(
  snapshot: M11Section1558Snapshot,
  evidenceSnapshots: readonly M11FacilityEvidenceSnapshot[],
): M11TariffBoundarySystem {
  const pointEntries = Object.entries(snapshot.points);
  const pointIds = new Set(pointEntries.map(([pointId]) => pointId));
  const facilityMap = facilitiesForSystem(snapshot.systemId, pointIds, evidenceSnapshots);
  const points = pointEntries.map(([pointId, label], order) => ({
    systemId: snapshot.systemId,
    pointId,
    label,
    order,
    routeKm: null,
    pvpKm: null,
    facilities: facilityMap.byPointId.get(pointId) ?? [],
  } satisfies M11TariffBoundaryPoint));

  assertUniquePointIds(snapshot.systemId, points);
  assertContiguousOrder(snapshot.systemId, points);

  return {
    systemId: snapshot.systemId,
    sectionKm: { ...snapshot.sectionKm },
    points,
    unboundFacilities: facilityMap.unbound,
  };
}

function buildSection58679(
  snapshot: M11Section58679Snapshot,
  evidenceSnapshots: readonly M11FacilityEvidenceSnapshot[],
): M11TariffBoundarySystem {
  const pointIds = new Set(snapshot.points.map((point) => point.id));
  const facilityMap = facilitiesForSystem(snapshot.systemId, pointIds, evidenceSnapshots);
  const points = snapshot.points.map((point, order) => ({
    systemId: snapshot.systemId,
    pointId: point.id,
    label: point.label,
    order,
    routeKm: point.routeKm,
    pvpKm: point.pvpKm,
    facilities: facilityMap.byPointId.get(point.id) ?? [],
  } satisfies M11TariffBoundaryPoint));

  assertUniquePointIds(snapshot.systemId, points);
  assertContiguousOrder(snapshot.systemId, points);

  return {
    systemId: snapshot.systemId,
    sectionKm: { ...snapshot.sectionKm },
    points,
    unboundFacilities: facilityMap.unbound,
  };
}

export function buildM11BoundaryModel(
  section1558: M11Section1558Snapshot,
  section58679: M11Section58679Snapshot,
  facilityEvidence: readonly M11FacilityEvidenceSnapshot[] = [],
): M11BoundaryModel {
  if (section1558.systemId !== "m11-15-58-ossp") {
    throw new Error(`M11_UNEXPECTED_SYSTEM:${section1558.systemId}`);
  }
  if (section58679.systemId !== "m11-58-679-avtodor") {
    throw new Error(`M11_UNEXPECTED_SYSTEM:${section58679.systemId}`);
  }

  return {
    systems: [
      buildSection1558(section1558, facilityEvidence),
      buildSection58679(section58679, facilityEvidence),
    ],
  };
}
