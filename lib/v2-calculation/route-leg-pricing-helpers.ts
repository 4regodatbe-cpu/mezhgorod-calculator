import { detectedFamiliesFromLegacySegments, type RouteTollComponentId } from "@/lib/toll-engine/route-toll-composition";
import { routeDifferenceEvidence, type TollEstimate } from "./free-route-selection";
import type { RouteSummary } from "@/lib/route-providers";
import type { TollValidation } from "@/lib/toll-validator";

export function mapMatchedTollFallback(current: TollEstimate, validation: TollValidation): TollEstimate {
  if (current.amount > 0 || validation.status !== "toll") return current;
  return {
    ...current,
    segments: [validation.roadNames.length > 0
      ? `Map matching: ${validation.roadNames.slice(0, 3).join(", ")}`
      : "Map matching: подтверждены платные дорожные рёбра"],
    confidence: "matched",
  };
}

export function routingDifferenceTollFallback(fast: RouteSummary, free: RouteSummary, current: TollEstimate): TollEstimate {
  if (current.segments.length > 0) return current;
  if (!routeDifferenceEvidence(fast, free)) return current;
  return {
    ...current,
    segments: ["Подтверждённый бесплатный маршрут существенно отличается от быстрого варианта"],
    confidence: "none",
  };
}

export function familySegments(segments: string[], family: RouteTollComponentId) {
  return segments.filter((segment) => detectedFamiliesFromLegacySegments([segment]).has(family));
}

