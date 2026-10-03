export type Place = { label: string; position?: { lat: number; lng: number } };
export type Suggestion = Place & { id: string; title: string; region: string };
export type RouteQuality = { status: "verified" | "single" | "warning"; providers: string[]; distanceSpreadPercent: number | null; message: string };
export type TollValidationView = { status: "toll" | "free" | "unknown"; message?: string };
export type Trip = { meters: number; seconds: number; quality?: RouteQuality; tollValidation?: TollValidationView };
export type TollView = { amount: number | null; weekdayAmount: number | null; weekendAmount: number | null; period: string; segments: string[]; confidence: "matched" | "none"; pricingStatus: "priced" | "free" | "unknown" };
export type Leg = {
  from: string;
  to: string;
  fast: Trip & { tolls: TollView };
  free: Trip | null;
  freeCandidate?: Trip | null;
  freeError?: string;
};
export type Result = { legs: Leg[] };
