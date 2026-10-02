import routes from "@/data/verified-routes.json";
import type { GoldenRouteReference } from "@/lib/route-quality";

export type VerifiedRoute = {
  from: string; to: string; fastKm: number; fastMinutes: number; freeKm: number; freeMinutes: number;
  tollRub: number; tollWeekdayRub?: number; tollWeekendRub?: number; verifiedAt: string; source: string; accuracyPercent: number;
};

export const VERIFIED_ROUTE_MAX_AGE_DAYS = 45;

const CITIES: Record<string, { name: string; aliases: string[] }> = {
  anapa: { name: "Анапа", aliases: ["анапа", "анапск"] }, voronezh: { name: "Воронеж", aliases: ["воронеж"] },
  krasnodar: { name: "Краснодар", aliases: ["краснодар"] }, moscow: { name: "Москва", aliases: ["москва", "московск"] },
  sochi: { name: "Сочи", aliases: ["сочи"] }, "saint-petersburg": { name: "Санкт-Петербург", aliases: ["санкт-петербург", "петербург", "спб"] },
  gelendzhik: { name: "Геленджик", aliases: ["геленджик"] }, novorossiysk: { name: "Новороссийск", aliases: ["новороссийск"] },
  rostov: { name: "Ростов-на-Дону", aliases: ["ростов-на-дону", "ростов на дону"] }, stavropol: { name: "Ставрополь", aliases: ["ставрополь"] },
  maykop: { name: "Майкоп", aliases: ["майкоп"] }, "goryachiy-klyuch": { name: "Горячий Ключ", aliases: ["горячий ключ"] },
  simferopol: { name: "Симферополь", aliases: ["симферополь"] }, yalta: { name: "Ялта", aliases: ["ялта"] },
  sevastopol: { name: "Севастополь", aliases: ["севастополь"] }, kerch: { name: "Керчь", aliases: ["керчь", "керч"] },
  tuapse: { name: "Туапсе", aliases: ["туапсе"] }, adler: { name: "Адлер", aliases: ["адлер"] },
  "mineralnye-vody": { name: "Минеральные Воды", aliases: ["минеральные воды", "минводы", "мин воды"] },
  pyatigorsk: { name: "Пятигорск", aliases: ["пятигорск"] }, kislovodsk: { name: "Кисловодск", aliases: ["кисловодск"] },
  astrakhan: { name: "Астрахань", aliases: ["астрахань"] }, yeisk: { name: "Ейск", aliases: ["ейск"] }, armavir: { name: "Армавир", aliases: ["армавир"] },
  nalchik: { name: "Нальчик", aliases: ["нальчик"] }, volgograd: { name: "Волгоград", aliases: ["волгоград"] },
  vladikavkaz: { name: "Владикавказ", aliases: ["владикавказ"] },
};

const TOLL_PERIODS: Record<string, { weekday: number; weekend: number }> = {
  "anapa|voronezh": { weekday: 4090, weekend: 4930 }, "krasnodar|moscow": { weekday: 5040, weekend: 6090 },
  "moscow|sochi": { weekday: 5040, weekend: 6090 }, "moscow|saint-petersburg": { weekday: 4580, weekend: 4780 },
  "saint-petersburg|sochi": { weekday: 9620, weekend: 10870 }, "moscow|simferopol": { weekday: 5840, weekend: 6890 },
  "moscow|sevastopol": { weekday: 5840, weekend: 6890 }, "moscow|yalta": { weekday: 5840, weekend: 6890 }, "kerch|moscow": { weekday: 5840, weekend: 6890 },
};

export function tollPeriodsForRoute(route: VerifiedRoute) {
  const key = [route.from, route.to].sort().join("|"); const known = TOLL_PERIODS[key];
  return { weekday: route.tollWeekdayRub ?? known?.weekday ?? route.tollRub, weekend: route.tollWeekendRub ?? known?.weekend ?? route.tollRub };
}
function normalize(value: string) { return value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е").replace(/[^а-яa-z0-9-]+/g, " ").trim(); }
function findCityInText(text: string, exactOnly = false) {
  const normalized = normalize(text).replace(/^(город|г)\s+/, "");
  return Object.entries(CITIES).find(([, city]) => city.aliases.some((alias) => {
    const normalizedAlias = normalize(alias); if (normalized === normalizedAlias) return true; if (exactOnly) return false;
    return ` ${normalized.replace(/-/g, " ")} `.includes(` ${normalizedAlias.replace(/-/g, " ")} `);
  }));
}
export function resolveCity(label: string) {
  const firstPart = label.split(",")[0] ?? label; const primary = findCityInText(firstPart, true); const fallback = primary ?? findCityInText(label);
  return fallback ? { key: fallback[0], name: fallback[1].name } : null;
}
export function verifiedRouteIsFresh(route: VerifiedRoute, nowMs = Date.now()) {
  const verifiedAtMs = Date.parse(`${route.verifiedAt}T00:00:00Z`);
  if (!Number.isFinite(verifiedAtMs) || verifiedAtMs > nowMs) return false;
  return nowMs - verifiedAtMs <= VERIFIED_ROUTE_MAX_AGE_DAYS * 86_400_000;
}
export function findVerifiedRoute(fromLabel: string, toLabel: string) {
  const from = resolveCity(fromLabel); const to = resolveCity(toLabel); if (!from || !to) return { from, to, route: null, staleRoute: null };
  const matched = (routes as VerifiedRoute[]).find((item) => (item.from === from.key && item.to === to.key) || (item.from === to.key && item.to === from.key)) ?? null;
  const fresh = matched && verifiedRouteIsFresh(matched) ? matched : null;
  return { from, to, route: fresh, staleRoute: matched && !fresh ? matched : null };
}
export function goldenRouteReference(fromLabel: string, toLabel: string, variant: "fast" | "free"): GoldenRouteReference | undefined {
  const route = findVerifiedRoute(fromLabel, toLabel).route; if (!route) return undefined;
  const tolerance = Math.max(3, route.accuracyPercent || 0);
  return {
    meters: (variant === "fast" ? route.fastKm : route.freeKm) * 1000,
    seconds: (variant === "fast" ? route.fastMinutes : route.freeMinutes) * 60,
    distanceTolerancePercent: tolerance,
    source: route.source,
    verifiedAt: route.verifiedAt,
  };
}
export function verifiedRouteCount() { return (routes as VerifiedRoute[]).filter((route) => verifiedRouteIsFresh(route)).length; }
