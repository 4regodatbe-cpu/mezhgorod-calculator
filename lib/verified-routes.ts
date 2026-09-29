import routes from "@/data/verified-routes.json";

export type VerifiedRoute = {
  from: string;
  to: string;
  fastKm: number;
  fastMinutes: number;
  freeKm: number;
  freeMinutes: number;
  tollRub: number;
  tollWeekdayRub?: number;
  tollWeekendRub?: number;
  verifiedAt: string;
  source: string;
  accuracyPercent: number;
};

const CITIES: Record<string, { name: string; aliases: string[] }> = {
  anapa: { name: "Анапа", aliases: ["анапа", "анапск"] },
  voronezh: { name: "Воронеж", aliases: ["воронеж"] },
  krasnodar: { name: "Краснодар", aliases: ["краснодар"] },
  moscow: { name: "Москва", aliases: ["москва", "московск"] },
  sochi: { name: "Сочи", aliases: ["сочи"] },
  "saint-petersburg": { name: "Санкт-Петербург", aliases: ["санкт-петербург", "петербург", "спб"] },
  gelendzhik: { name: "Геленджик", aliases: ["геленджик"] },
  novorossiysk: { name: "Новороссийск", aliases: ["новороссийск"] },
  rostov: { name: "Ростов-на-Дону", aliases: ["ростов-на-дону", "ростов на дону"] },
  stavropol: { name: "Ставрополь", aliases: ["ставрополь"] },
  maykop: { name: "Майкоп", aliases: ["майкоп"] },
  "goryachiy-klyuch": { name: "Горячий Ключ", aliases: ["горячий ключ"] },
  simferopol: { name: "Симферополь", aliases: ["симферополь"] },
  yalta: { name: "Ялта", aliases: ["ялта"] },
  sevastopol: { name: "Севастополь", aliases: ["севастополь"] },
  kerch: { name: "Керчь", aliases: ["керчь", "керч"] },
  tuapse: { name: "Туапсе", aliases: ["туапсе"] },
  adler: { name: "Адлер", aliases: ["адлер"] },
  "mineralnye-vody": { name: "Минеральные Воды", aliases: ["минеральные воды", "минводы", "мин воды"] },
  pyatigorsk: { name: "Пятигорск", aliases: ["пятигорск"] },
  kislovodsk: { name: "Кисловодск", aliases: ["кисловодск"] },
  astrakhan: { name: "Астрахань", aliases: ["астрахань"] },
  yeisk: { name: "Ейск", aliases: ["ейск"] },
  armavir: { name: "Армавир", aliases: ["армавир"] },
  nalchik: { name: "Нальчик", aliases: ["нальчик"] },
};


const TOLL_PERIODS: Record<string, { weekday: number; weekend: number }> = {
  "anapa|voronezh": { weekday: 4090, weekend: 4930 },
  "krasnodar|moscow": { weekday: 5040, weekend: 6090 },
  "moscow|sochi": { weekday: 5040, weekend: 6090 },
  "moscow|saint-petersburg": { weekday: 4580, weekend: 4780 },
  "saint-petersburg|sochi": { weekday: 9620, weekend: 10870 },
};

export function tollPeriodsForRoute(route: VerifiedRoute) {
  const key = [route.from, route.to].sort().join("|");
  const known = TOLL_PERIODS[key];
  return {
    weekday: route.tollWeekdayRub ?? known?.weekday ?? route.tollRub,
    weekend: route.tollWeekendRub ?? known?.weekend ?? route.tollRub,
  };
}

function normalize(value: string) {
  return value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е").replace(/[^а-яa-z0-9-]+/g, " ").trim();
}

export function resolveCity(label: string) {
  const text = normalize(label);
  const match = Object.entries(CITIES).find(([, city]) => city.aliases.some((alias) => text.includes(normalize(alias))));
  return match ? { key: match[0], name: match[1].name } : null;
}

export function findVerifiedRoute(fromLabel: string, toLabel: string) {
  const from = resolveCity(fromLabel);
  const to = resolveCity(toLabel);
  if (!from || !to) return { from, to, route: null };
  const route = (routes as VerifiedRoute[]).find((item) =>
    (item.from === from.key && item.to === to.key) || (item.from === to.key && item.to === from.key),
  ) ?? null;
  return { from, to, route };
}

export function verifiedRouteCount() {
  return (routes as VerifiedRoute[]).length;
}
