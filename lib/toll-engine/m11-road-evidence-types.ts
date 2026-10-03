export type M11Coordinate = [number, number];
export type M11EvidenceProvider = "valhalla" | "osrm";

export type M11RoadBlock = {
  provider: M11EvidenceProvider;
  legIndex: number;
  sourceStartIndex: number;
  sourceEndIndex: number;
  beginKm: number | null;
  endKm: number | null;
  lengthKm: number | null;
  beginCoordinate: M11Coordinate;
  endCoordinate: M11Coordinate;
  labels: string[];
};

export type M11CandidateClue = {
  provider: M11EvidenceProvider;
  legIndex: number;
  sourceIndex: number;
  reasons: Array<"destination_m11" | "neva_without_strict_ref">;
  beginKm: number | null;
  endKm: number | null;
  beginCoordinate: M11Coordinate | null;
  endCoordinate: M11Coordinate | null;
  labels: string[];
};

export type M11RoadEvidence = {
  provider: M11EvidenceProvider;
  strictBlocks: M11RoadBlock[];
  candidateClues: M11CandidateClue[];
  malformedStrictCount: number;
};

export type M11ValhallaManeuver = {
  street_names?: string[];
  begin_street_names?: string[];
  begin_shape_index?: number;
  end_shape_index?: number;
  instruction?: string;
};

export type M11ValhallaLeg = {
  coordinates: M11Coordinate[];
  maneuvers?: M11ValhallaManeuver[];
};

export type M11OsrmStep = {
  distance?: number;
  name?: string;
  ref?: string;
  destinations?: string;
  geometry?: { coordinates?: M11Coordinate[] };
  maneuver?: { location?: M11Coordinate };
};

export type M11OsrmLeg = {
  steps?: M11OsrmStep[];
};
