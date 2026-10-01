export type TariffModeMetadata = "transponder" | "noTransponder" | "operator_default" | "not_applicable";

export type TariffSnapshotMetadata = {
  id: string;
  systemId: string;
  source: string;
  observedAt: string;
  publishedAt?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  tariffMode: TariffModeMetadata;
  vehicleCategory: string;
  currency: string;
  staleAfterDays: number;
};

export type TariffFreshness = {
  status: "fresh" | "stale" | "future_observation" | "invalid";
  ageDays: number | null;
  message: string;
};

export type TariffSelection<T> =
  | { status: "selected"; snapshot: T; metadata: TariffSnapshotMetadata }
  | { status: "unknown"; snapshot: null; metadata: null; reason: "no_effective_snapshot" | "ambiguous_effective_snapshots" | "invalid_as_of" };

const DAY_MS = 86_400_000;

function parseDay(value: string) {
  const parsed = Date.parse(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateTariffMetadata(metadata: TariffSnapshotMetadata): string[] {
  const errors: string[] = [];
  if (!metadata.id.trim()) errors.push("missing_id");
  if (!metadata.systemId.trim()) errors.push("missing_system_id");
  if (!metadata.source.trim()) errors.push("missing_source");
  if (!metadata.vehicleCategory.trim()) errors.push("missing_vehicle_category");
  if (metadata.currency !== "RUB") errors.push("unsupported_currency");
  if (!Number.isFinite(metadata.staleAfterDays) || metadata.staleAfterDays <= 0) errors.push("invalid_stale_after_days");
  const observed = parseDay(metadata.observedAt);
  const effectiveFrom = parseDay(metadata.effectiveFrom);
  const effectiveTo = metadata.effectiveTo ? parseDay(metadata.effectiveTo) : null;
  if (observed == null) errors.push("invalid_observed_at");
  if (effectiveFrom == null) errors.push("invalid_effective_from");
  if (metadata.effectiveTo && effectiveTo == null) errors.push("invalid_effective_to");
  if (effectiveFrom != null && effectiveTo != null && effectiveTo < effectiveFrom) errors.push("effective_interval_reversed");
  return errors;
}

export function tariffFreshness(metadata: TariffSnapshotMetadata, asOf: string): TariffFreshness {
  const errors = validateTariffMetadata(metadata);
  const asOfMs = parseDay(asOf);
  const observedMs = parseDay(metadata.observedAt);
  if (errors.length > 0 || asOfMs == null || observedMs == null) {
    return { status: "invalid", ageDays: null, message: errors.length ? errors.join(",") : "invalid_as_of" };
  }
  const ageDays = Math.floor((asOfMs - observedMs) / DAY_MS);
  if (ageDays < 0) return { status: "future_observation", ageDays, message: "snapshot observation is after asOf" };
  if (ageDays > metadata.staleAfterDays) return { status: "stale", ageDays, message: `snapshot age ${ageDays}d exceeds ${metadata.staleAfterDays}d threshold` };
  return { status: "fresh", ageDays, message: `snapshot age ${ageDays}d within ${metadata.staleAfterDays}d threshold` };
}

export function selectEffectiveTariffSnapshot<T>(
  snapshots: readonly T[],
  metadataOf: (snapshot: T) => TariffSnapshotMetadata,
  asOf: string,
): TariffSelection<T> {
  const asOfMs = parseDay(asOf);
  if (asOfMs == null) return { status: "unknown", snapshot: null, metadata: null, reason: "invalid_as_of" };

  const eligible = snapshots
    .map((snapshot) => ({ snapshot, metadata: metadataOf(snapshot) }))
    .filter(({ metadata }) => validateTariffMetadata(metadata).length === 0)
    .filter(({ metadata }) => {
      const from = parseDay(metadata.effectiveFrom)!;
      const to = metadata.effectiveTo ? parseDay(metadata.effectiveTo)! : Number.POSITIVE_INFINITY;
      return from <= asOfMs && asOfMs <= to;
    })
    .sort((a, b) => parseDay(b.metadata.effectiveFrom)! - parseDay(a.metadata.effectiveFrom)!);

  if (eligible.length === 0) return { status: "unknown", snapshot: null, metadata: null, reason: "no_effective_snapshot" };
  const latestFrom = parseDay(eligible[0].metadata.effectiveFrom)!;
  const latest = eligible.filter((item) => parseDay(item.metadata.effectiveFrom)! === latestFrom);
  if (latest.length !== 1) return { status: "unknown", snapshot: null, metadata: null, reason: "ambiguous_effective_snapshots" };
  return { status: "selected", snapshot: latest[0].snapshot, metadata: latest[0].metadata };
}
