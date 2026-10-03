import type { FullRoute } from "./types";

const FULL_ROUTES: FullRoute[] = [
  { name: "М-4: Анапа — Воронеж", start: [37.316367, 44.894818], end: [39.200296, 51.660781], weekday: 4090, weekend: 4930, radius: 12, requirements: [{ prefix: "М-4:", min: 6 }], expectedKm: 990, distanceTolerancePercent: 6 },
  { name: "М-12: Москва — Екатеринбург", start: [37.62, 55.76], end: [60.61, 56.84], weekday: 8580, weekend: 8580, radius: 85, requirements: [{ prefix: "М-12:", min: 8 }] },
  { name: "М-12: Москва — Казань", start: [37.62, 55.76], end: [49.11, 55.8], weekday: 5909, weekend: 5909, radius: 55, requirements: [{ prefix: "М-12:", min: 7 }] },
  { name: "М-11: Москва — Санкт-Петербург", start: [37.62, 55.76], end: [30.34, 59.93], weekday: 4580, weekend: 4780, radius: 55, requirements: [{ prefix: "М-11:", min: 3 }], expectedKm: 708, distanceTolerancePercent: 6 },
  { name: "М-4 + М-11: Сочи — Санкт-Петербург", start: [39.72, 43.59], end: [30.34, 59.93], weekday: 9620, weekend: 10870, radius: 65, requirements: [{ prefix: "М-4:", min: 6 }, { prefix: "М-11:", min: 3 }], expectedKm: 2310, distanceTolerancePercent: 6 },
  { name: "М-4: Москва — Сочи", start: [37.62, 55.76], end: [39.72, 43.59], weekday: 5040, weekend: 6090, radius: 65, requirements: [{ prefix: "М-4:", min: 8 }], expectedKm: 1625, distanceTolerancePercent: 6 },
  { name: "М-4: Москва — Краснодар", start: [37.62, 55.76], end: [38.98, 45.04], weekday: 5040, weekend: 6090, radius: 55, requirements: [{ prefix: "М-4:", min: 8 }], expectedKm: 1352, distanceTolerancePercent: 6 },
];
