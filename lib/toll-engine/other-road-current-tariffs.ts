import snapshot from "../../data/tolls/2026-10-01-avtodor-other-roads-category1.json" with { type: "json" };

export type OtherRoadId = "m1-33-66" | "m3" | "ckad" | "a289";
export type TariffMode = "transponder" | "noTransponder";
export type DayProfile = "monThu" | "friSun" | "allDays";
export type VerifiedSectionEvidence = { status: "verified"; roadId: OtherRoadId; sectionIds: readonly string[] };
export type UnresolvedSectionEvidence = { status: "unresolved"; roadId: OtherRoadId; reason: string };
export type OtherRoadSectionEvidence = VerifiedSectionEvidence | UnresolvedSectionEvidence;

export type OtherRoadTariffResult =
  | { status: "priced"; amountRub: number; roadId: OtherRoadId; sectionIds: readonly string[]; tariffMode: TariffMode; observedAt: string; source: string }
  | { status: "unknown"; amountRub: null; roadId: OtherRoadId; reason: string; tariffMode: TariffMode; observedAt: string; source: string };

export function priceOtherRoadVerifiedSections(evidence: OtherRoadSectionEvidence, tariffMode: TariffMode, dayProfile: DayProfile): OtherRoadTariffResult {
  const base = { roadId: evidence.roadId, tariffMode, observedAt: snapshot.observedAt, source: snapshot.source } as const;
  if (evidence.status !== "verified") return { status: "unknown", amountRub: null, ...base, reason: evidence.reason };
  if (evidence.sectionIds.length === 0) return { status: "unknown", amountRub: null, ...base, reason: "no_verified_sections" };
  const rows = snapshot.roads[evidence.roadId] as Array<Record<string, unknown>>;
  let amount = 0;
  for (const sectionId of evidence.sectionIds) {
    const row = rows.find((item) => item.id === sectionId) as Record<string, unknown> | undefined;
    if (!row) return { status: "unknown", amountRub: null, ...base, reason: `unknown_section:${sectionId}` };
    const profile = (row[dayProfile] ?? row.allDays) as Record<string, number> | undefined;
    const value = profile?.[tariffMode];
    if (!Number.isFinite(value) || value! <= 0) return { status: "unknown", amountRub: null, ...base, reason: `tariff_unavailable:${sectionId}:${dayProfile}` };
    amount += value!;
  }
  return { status: "priced", amountRub: amount, ...base, sectionIds: evidence.sectionIds };
}
