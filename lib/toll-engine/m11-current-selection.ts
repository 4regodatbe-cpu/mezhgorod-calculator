import type { M11BoundaryResolution } from "./m11-boundary-resolver";
import { priceM11CurrentPartialCategory1, type M11CurrentTariffLookupResult } from "./m11-current-tariffs";

export type M11CurrentSelectionResult = M11CurrentTariffLookupResult | {
  status: "unknown";
  amountRub: null;
  fromPointId: null;
  toPointId: null;
  profile: string;
  systemId: "m11-58-679-avtodor";
  observedCurrentAt: null;
  sourceDocumentOrder: null;
  sourceDocumentDate: null;
  tariffEffectiveFrom: null;
  reason: "boundary_unresolved";
  boundaryReasons: readonly string[];
};

export function selectM11CurrentCategory1Tariff(
  resolution: M11BoundaryResolution,
  profile: string,
): M11CurrentSelectionResult {
  if (resolution.status !== "resolved") {
    return {
      status: "unknown",
      amountRub: null,
      fromPointId: null,
      toPointId: null,
      profile,
      systemId: "m11-58-679-avtodor",
      observedCurrentAt: null,
      sourceDocumentOrder: null,
      sourceDocumentDate: null,
      tariffEffectiveFrom: null,
      reason: "boundary_unresolved",
      boundaryReasons: resolution.unresolvedReasons,
    };
  }
  return priceM11CurrentPartialCategory1(resolution.entryPointId, resolution.exitPointId, profile);
}
