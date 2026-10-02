import type { TariffSnapshotMetadata } from "./tariff-versioning";

export const TARIFF_SNAPSHOT_REGISTRY: readonly TariffSnapshotMetadata[] = [
  {
    id: "m12-2026-03-02-category1", systemId: "m12-east-avtodor",
    source: "Avtodor order 57 dated 2026-02-27; official tariff page re-verified 2026-10-02 (tariff still published as current)",
    observedAt: "2026-10-02", publishedAt: "2026-02-27", effectiveFrom: "2026-03-02", effectiveTo: null,
    tariffMode: "operator_default", vehicleCategory: "I", currency: "RUB", staleAfterDays: 45,
  },
  {
    id: "m11-58-679-2026-10-01-a1-current", systemId: "m11-58-679-avtodor",
    source: "Avtodor current order 274 dated 2026-09-03; partial A1 extraction; effective date not independently extracted",
    observedAt: "2026-10-01", publishedAt: "2026-09-03", effectiveFrom: null, effectiveTo: null,
    tariffMode: "operator_default", vehicleCategory: "I", currency: "RUB", staleAfterDays: 45,
  },
  {
    id: "avtodor-other-roads-2026-10-01-category1-transponder", systemId: "avtodor-other-roads",
    source: "Avtodor official tariff page snapshot observed 2026-10-01; exact effective-from not established by Segment 6 audit",
    observedAt: "2026-10-01", publishedAt: null, effectiveFrom: null, effectiveTo: null,
    tariffMode: "transponder", vehicleCategory: "I", currency: "RUB", staleAfterDays: 30,
  },
  {
    id: "avtodor-other-roads-2026-10-01-category1-no-transponder", systemId: "avtodor-other-roads",
    source: "Avtodor official tariff page snapshot observed 2026-10-01; exact effective-from not established by Segment 6 audit",
    observedAt: "2026-10-01", publishedAt: null, effectiveFrom: null, effectiveTo: null,
    tariffMode: "noTransponder", vehicleCategory: "I", currency: "RUB", staleAfterDays: 30,
  },
] as const;

export function tariffRegistryForSystem(systemId: string) {
  return TARIFF_SNAPSHOT_REGISTRY.filter((item) => item.systemId === systemId);
}
