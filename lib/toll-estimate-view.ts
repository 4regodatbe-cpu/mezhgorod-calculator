/** Optional V3 toll-only overlay. Never part of kilometre/transfer pricing. */
export type TollEstimateView = {
  version: 1;
  status: "confirmed" | "estimated" | "unknown";
  totalRub: number | null;
  knownPartRub: number | null;
  confirmedPartRub: number | null;
  warnings: string[];
  reasons: string[];
};

export function tollEstimateText(view: TollEstimateView) {
  const money = (rub: number) => new Intl.NumberFormat("ru-RU").format(rub) + " ₽";
  const complete = view.status !== "unknown" && Number.isSafeInteger(view.totalRub) && view.totalRub! >= 0;
  return {
    label: complete ? `Платные дороги: ${money(view.totalRub!)}${view.status === "estimated" ? " (ориентировочно)" : ""}` : "Платные дороги: стоимость уточняется",
    partial: !complete && view.knownPartRub !== null && Number.isSafeInteger(view.knownPartRub) && view.knownPartRub >= 0
      ? `Известная часть: ${money(view.knownPartRub)}${view.knownPartRub !== view.confirmedPartRub ? " (включает оценку)" : ""}; это не полный итог.` : null,
  };
}

export function validTollEstimateView(value: unknown): value is TollEstimateView {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const money = (n: unknown) => n === null || typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
  const strings = (a: unknown) => Array.isArray(a) && a.length <= 64 && a.every(s => typeof s === "string" && s.length <= 1000);
  return v.version === 1 && ["confirmed", "estimated", "unknown"].includes(String(v.status))
    && money(v.totalRub) && money(v.knownPartRub) && money(v.confirmedPartRub)
    && (v.status === "unknown" ? v.totalRub === null : v.totalRub !== null)
    && (v.confirmedPartRub === null || v.knownPartRub !== null && Number(v.confirmedPartRub) <= Number(v.knownPartRub))
    && strings(v.warnings) && strings(v.reasons);
}
