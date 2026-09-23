import routes from "@/data/verified-routes.json";

export type VerifiedRoute = {
  from: string;
  to: string;
  fastKm: number;
  fastMinutes: number;
  freeKm: number;
  freeMinutes: number;
  tollRub: number;
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
};

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
