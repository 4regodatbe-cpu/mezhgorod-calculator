import section15Snapshot from "../../data/tolls/m11/2026-04-24-section15-58-category1-no-transponder.json" with { type: "json" };

type Section15Profile = "monThu" | "friday" | "saturday" | "sunday";

function moscowParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric", month: "2-digit", day: "2-digit",
    weekday: "short", hour: "2-digit", hourCycle: "h23",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return { dateKey: `${parts.year}-${parts.month}-${parts.day}`, weekday: parts.weekday, hour: Number(parts.hour) };
}

function section15Profile(date: Date): Section15Profile {
  const parts = moscowParts(date);
  const special = (section15Snapshot.specialDayProfiles2026 as Record<string, Section15Profile>)[parts.dateKey];
  if (special) return special;
  if (parts.weekday === "Fri") return "friday";
  if (parts.weekday === "Sat") return "saturday";
  if (parts.weekday === "Sun") return "sunday";
  return "monThu";
}

export function section15Amount(date: Date) {
  const parts = moscowParts(date);
  const night = parts.hour >= 1 && parts.hour < 6;
  if (night) return { amount: section15Snapshot.tariffs.night0100to0600, profile: "night" };
  const profile = section15Profile(date);
  const amount = profile === "monThu"
    ? section15Snapshot.tariffs.monThuDay0600to0100
    : profile === "friday"
      ? section15Snapshot.tariffs.fridayDay0600to0100
      : profile === "saturday"
        ? section15Snapshot.tariffs.saturdayDay0600to0100
        : section15Snapshot.tariffs.sundayDay0600to0100;
  return { amount, profile };
}

export function p58Profile(date: Date) {
  const profile = section15Profile(date);
  return profile === "monThu" ? "monThu" : "friSun";
}

export function startDate(departureAt?: string) {
  const parsed = departureAt ? new Date(departureAt) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

