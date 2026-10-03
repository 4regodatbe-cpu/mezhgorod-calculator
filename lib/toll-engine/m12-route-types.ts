export type M12Coordinate = [number, number];

export type M12StrictSpan = {
  beginKm: number;
  endKm: number;
};

export type M12Projection = {
  rvpKm: number;
  nearestDistanceKm: number;
  chainageKm: number;
};

export type M12BoundaryCheck = {
  status: "proven" | "unknown";
  direction: "forward" | "reverse" | null;
  firstRvpKm: number | null;
  lastRvpKm: number | null;
  entryOutsideRvpKm: number | null;
  exitOutsideRvpKm: number | null;
  entryRouteGapKm: number | null;
  exitRouteGapKm: number | null;
  entryOfficialGapKm: number | null;
  exitOfficialGapKm: number | null;
  calibrationMarginKm: number;
  reason: string | null;
};

export type M12ContinuityInterval = {
  fromRvpKm: number;
  toRvpKm: number;
  routeDeltaKm: number;
  officialDeltaKm: number;
  errorKm: number;
  toleranceKm: number;
  continuous: boolean;
  inferredMarkers: number[];
};

export type M12RouteResult = {
  status: "priced" | "unknown";
  amountRub: number | null;
  directMarkers: number[];
  inferredMarkers: number[];
  finalMarkers: number[];
  directCrossings: Array<M12Projection & { crossed: true }>;
  continuity: M12ContinuityInterval[];
  boundary: M12BoundaryCheck;
  effectiveFrom: string;
  sourceOrder: string;
  evidenceDate: string;
  reason: string | null;
};

export type M12EvaluationInput = {
  projections: M12Projection[];
  strictM12Span?: M12StrictSpan | null;
};
