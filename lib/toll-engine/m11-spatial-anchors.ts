export type M11SpatialAnchor = {
  anchorId: string;
  coordinate: { lat: number; lon: number };
  status: "independently_verified_infrastructure";
  source: string;
  sourceObjectId: string;
};

export type M11FacilitySpatialEvidence = {
  systemId: string;
  facilityId: string;
  tariffPointId: string;
  officialIdentitySource: string;
  anchors: readonly M11SpatialAnchor[];
};

type CurrentPointSnapshot = {
  systemId: string;
  points: Array<{ id: string }>;
};

type RawSpatialSnapshot = {
  systemId: string;
  source: {
    url: string;
    classification: string;
  };
  facilities: Array<{
    facilityId: string;
    tariffPointId: string;
    officialIdentitySource: string;
    anchors: Array<{
      anchorId: string;
      osmNodeId: number;
      lat: number;
      lon: number;
    }>;
  }>;
};

function assertCoordinate(lat: number, lon: number, anchorId: string) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new Error(`M11_INVALID_SPATIAL_ANCHOR_COORDINATE:${anchorId}`);
  }
}

export function buildM11FacilitySpatialEvidence(
  currentPoints: CurrentPointSnapshot,
  spatialSnapshot: RawSpatialSnapshot,
): readonly M11FacilitySpatialEvidence[] {
  if (currentPoints.systemId !== "m11-58-679-avtodor" || spatialSnapshot.systemId !== currentPoints.systemId) {
    throw new Error("M11_SPATIAL_SYSTEM_MISMATCH");
  }
  if (spatialSnapshot.source.classification !== "independently_verified_infrastructure") {
    throw new Error("M11_UNSUPPORTED_SPATIAL_EVIDENCE_CLASSIFICATION");
  }

  const pointIds = new Set(currentPoints.points.map((point) => point.id));
  const facilityIds = new Set<string>();
  const globalAnchorIds = new Set<string>();

  return spatialSnapshot.facilities.map((facility) => {
    if (!pointIds.has(facility.tariffPointId)) {
      throw new Error(`M11_SPATIAL_UNKNOWN_TARIFF_POINT:${facility.facilityId}:${facility.tariffPointId}`);
    }
    if (facilityIds.has(facility.facilityId)) {
      throw new Error(`M11_DUPLICATE_SPATIAL_FACILITY:${facility.facilityId}`);
    }
    facilityIds.add(facility.facilityId);
    if (!facility.officialIdentitySource) {
      throw new Error(`M11_SPATIAL_MISSING_OFFICIAL_IDENTITY_SOURCE:${facility.facilityId}`);
    }
    if (facility.anchors.length === 0) {
      throw new Error(`M11_SPATIAL_EMPTY_ANCHORS:${facility.facilityId}`);
    }

    const anchors = facility.anchors.map((anchor) => {
      if (globalAnchorIds.has(anchor.anchorId)) {
        throw new Error(`M11_DUPLICATE_SPATIAL_ANCHOR:${anchor.anchorId}`);
      }
      globalAnchorIds.add(anchor.anchorId);
      assertCoordinate(anchor.lat, anchor.lon, anchor.anchorId);
      if (!Number.isSafeInteger(anchor.osmNodeId) || anchor.osmNodeId <= 0) {
        throw new Error(`M11_INVALID_OSM_NODE_ID:${anchor.anchorId}`);
      }
      return {
        anchorId: anchor.anchorId,
        coordinate: { lat: anchor.lat, lon: anchor.lon },
        status: "independently_verified_infrastructure" as const,
        source: spatialSnapshot.source.url,
        sourceObjectId: `osm:node:${anchor.osmNodeId}`,
      };
    });

    return {
      systemId: spatialSnapshot.systemId,
      facilityId: facility.facilityId,
      tariffPointId: facility.tariffPointId,
      officialIdentitySource: facility.officialIdentitySource,
      anchors,
    };
  });
}
