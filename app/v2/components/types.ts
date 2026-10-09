export type Place = { label: string; position?: { lat: number; lng: number } };
export type Suggestion = Place & { id: string; title: string; region: string };
export type RouteQuality = { status: "verified" | "single" | "warning"; providers: string[]; distanceSpreadPercent: number | null; message: string };
export type TollValidationView = { status: "toll" | "free" | "unknown"; message?: string };
export type PricingVehicle = "standard" | "comfort" | "comfort_plus" | "minivan";
export type PricedSegmentView = {
  distanceKm: number;
  tariffType: "normal" | "special";
  type: "normal" | "special";
  from: string;
  to: string;
  ratePerKm: number;
  amount: number;
  reason: string;
  reviewRequired: boolean;
};
export type PricingView = {
  corridor: { id: string };
  dualTariff: boolean;
  pricingSegments: PricedSegmentView[];
  totalPrice: number | null;
  reviewRequired: boolean;
  requiresSplit: boolean;
  multiplier: number;
};
export type M4PvpPreview = {
  status: string;
  reason: string | null;
  priceRub: number | null;
  verifiedPriceCells: number;
  candidateCount: number;
  confirmedPvps: string[];
  direction?: string;
  diagnosticOnly: boolean;
};
export type NationalTollCoverage = {
  catalogNetworkCount: number;
  catalogWithReferenceFares: number;
  exactCrossingVerified: boolean;
  newFareApplied: boolean;
  reason: string;
  candidateNetworks: Array<{ id: string; name: string; operator: string; status: string; hasReferenceFare: boolean }>;
};
export type Trip = { nationalTollCoverage?: NationalTollCoverage; m4PvpPreview?: M4PvpPreview; meters: number; seconds: number; quality?: RouteQuality; tollValidation?: TollValidationView; pricingByVehicle?: Record<PricingVehicle, PricingView> };
export type TollView = { amount: number | null; weekdayAmount: number | null; weekendAmount: number | null; period: string; segments: string[]; confidence: "matched" | "none"; pricingStatus: "priced" | "free" | "unknown" };
export type Leg = {
  from: string;
  to: string;
  fast: Trip & { tolls: TollView };
  free: Trip | null;
  freeCandidate?: Trip | null;
  freeError?: string;
};
export type Result = { legs: Leg[]; options?: Leg[]; mode?: "standard"|"dual"; specialEndpoint?:boolean; crimeaComparisonVerified?:boolean; crimeaAccepted?:boolean };
