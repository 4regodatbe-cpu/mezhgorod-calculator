export const HIGHWAY_TARIFF_TIME_ZONE = "Europe/Moscow";

export type HighwayTariffPeriod = {
  weekend: boolean;
  period: "пятница–воскресенье" | "понедельник–четверг";
};

/** Toll tariff periods for M-4/A-289 follow the roads' local Moscow time, not the Vercel host timezone. */
export function highwayTariffPeriod(departureAt?: string, now = new Date()): HighwayTariffPeriod {
  const parsed = departureAt ? new Date(departureAt) : now;
  const instant = Number.isNaN(parsed.getTime()) ? now : parsed;
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: HIGHWAY_TARIFF_TIME_ZONE,
    weekday: "short",
  }).format(instant);
  const weekend = weekday === "Fri" || weekday === "Sat" || weekday === "Sun";
  return {
    weekend,
    period: weekend ? "пятница–воскресенье" : "понедельник–четверг",
  };
}
