export type Coordinate = [number, number];

type TollSegment = {
  name: string;
  start: Coordinate;
  end: Coordinate;
  via?: Coordinate;
  weekday: number;
  weekend: number;
  radius?: number;
};

// M-4 Don, category I, no transponder. Prices current from 02.03.2026.
const M4: TollSegment[] = [
  { name: "М-4: Дальний западный обход Краснодара", start: [38.98, 45.24], end: [38.68, 45.0], weekday: 410, weekend: 410, radius: 13 },
  { name: "М-4: 21–93 км", start: [37.72, 55.55], end: [38.08, 54.99], weekday: 210, weekend: 270 },
  { name: "М-4: 93–211 км", start: [38.08, 54.99], end: [38.16, 53.98], weekday: 320, weekend: 410 },
  { name: "М-4: 211–260 км", start: [38.16, 53.98], end: [38.0, 53.56], weekday: 190, weekend: 220 },
  { name: "М-4: 260–322 км", start: [38.0, 53.56], end: [38.12, 53.15], weekday: 160, weekend: 190 },
  { name: "М-4: 322–401 км", start: [38.12, 53.15], end: [38.5, 52.62], weekday: 300, weekend: 360 },
  { name: "М-4: 401–464 км", start: [38.5, 52.62], end: [39.16, 52.22], weekday: 290, weekend: 370 },
  { name: "М-4: 492–517 км", start: [39.19, 51.82], end: [39.21, 51.51], weekday: 140, weekend: 150 },
  { name: "М-4: 517–544 км", start: [39.21, 51.51], end: [39.18, 51.39], weekday: 140, weekend: 150 },
  { name: "М-4: 544–589 км", start: [39.18, 51.39], end: [39.75, 51.08], weekday: 170, weekend: 220 },
  { name: "М-4: 589–633 км", start: [39.75, 51.08], end: [40.2, 50.73], weekday: 140, weekend: 150 },
  { name: "М-4: 633–741 км", start: [40.2, 50.73], end: [40.55, 49.94], weekday: 250, weekend: 290 },
  { name: "М-4: 741–893 км", start: [40.55, 49.94], end: [40.27, 48.32], weekday: 370, weekend: 430 },
  { name: "М-4: 893–933 км", start: [40.27, 48.32], end: [40.1, 48.18], weekday: 200, weekend: 250 },
  { name: "М-4: 1024–1091 км", start: [39.9, 47.5], end: [39.75, 46.9], weekday: 450, weekend: 500 },
  { name: "М-4: 1091–1119 км", start: [39.75, 46.9], end: [39.73, 46.51], weekday: 220, weekend: 250 },
  { name: "М-4: 1119–1195 км", start: [39.73, 46.51], end: [39.79, 46.13], weekday: 320, weekend: 370 },
  { name: "М-4: 1195–1319 км", start: [39.79, 46.13], end: [39.03, 45.07], weekday: 600, weekend: 760 },
];

// A-289 Krasnodar — Slavyansk-na-Kubani — Temryuk, category I.
// The whole paid direction costs 800 rubles from 02.03.2026.
const A289: TollSegment[] = [
  { name: "А-289: Марьянская — Славянск-на-Кубани", start: [38.62, 45.09], end: [38.14, 45.24], weekday: 415, weekend: 415, radius: 16 },
  { name: "А-289: Славянск-на-Кубани — Варениковская", start: [38.14, 45.24], end: [37.64, 45.14], weekday: 205, weekend: 205, radius: 16 },
  { name: "А-289: Варениковская — Темрюк", start: [37.64, 45.14], end: [37.42, 45.25], weekday: 180, weekend: 180, radius: 16 },
];

const M1: TollSegment[] = [
  { name: "Северный обход Одинцова", start: [37.38, 55.72], via: [37.19, 55.72], end: [37.02, 55.66], weekday: 650, weekend: 650, radius: 9 },
  { name: "М-1: 33–66 км", start: [36.96, 55.59], end: [36.66, 55.57], weekday: 250, weekend: 250, radius: 12 },
];

const M3: TollSegment[] = [
  { name: "М-3: 65–86 км", start: [37.05, 55.45], end: [36.86, 55.31], weekday: 100, weekend: 100, radius: 12 },
  { name: "М-3: 112–150 км", start: [36.47, 55.02], end: [36.19, 54.76], weekday: 190, weekend: 190, radius: 12 },
  { name: "М-3: 150–194 км", start: [36.19, 54.76], end: [35.76, 54.39], weekday: 190, weekend: 230, radius: 12 },
];

// The first concession section has a time-dependent tariff. The values below
// are conservative daytime estimates for a category I car without a pass.
const M11: TollSegment[] = [
  { name: "М-11: Москва — Солнечногорск", start: [37.41, 55.94], end: [36.98, 56.18], weekday: 1000, weekend: 1100, radius: 15 },
  { name: "М-11: Солнечногорск — Тверь", start: [36.98, 56.18], end: [35.89, 56.77], weekday: 620, weekend: 660, radius: 18 },
  { name: "М-11: Тверь — Вышний Волочёк", start: [35.89, 56.77], end: [34.56, 57.58], weekday: 760, weekend: 800, radius: 20 },
  { name: "М-11: Вышний Волочёк — Великий Новгород", start: [34.56, 57.58], end: [31.28, 58.52], weekday: 1350, weekend: 1400, radius: 24 },
  { name: "М-11: Великий Новгород — Санкт-Петербург", start: [31.28, 58.52], end: [30.29, 59.79], weekday: 850, weekend: 900, radius: 20 },
];

// M-12 current official consecutive-route tariffs, category I, 02.03.2026.
const M12: TollSegment[] = [
  { name: "М-12: Москва — Электроугли", start: [37.87, 55.75], end: [38.22, 55.72], weekday: 176, weekend: 176, radius: 18 },
  { name: "М-12: Электроугли — ЦКАД", start: [38.22, 55.72], end: [38.46, 55.72], weekday: 322, weekend: 322, radius: 18 },
  { name: "М-12: ЦКАД — Орехово-Зуево", start: [38.46, 55.72], end: [38.94, 55.8], weekday: 244, weekend: 244, radius: 20 },
  { name: "М-12: Орехово-Зуево — Петушки", start: [38.94, 55.8], end: [39.46, 55.93], weekday: 359, weekend: 359, radius: 22 },
  { name: "М-12: Петушки — Владимир", start: [39.46, 55.93], end: [40.41, 56.08], weekday: 636, weekend: 636, radius: 24 },
  { name: "М-12: Владимир — Гусь-Хрустальный", start: [40.41, 56.08], end: [40.65, 55.62], weekday: 165, weekend: 165, radius: 24 },
  { name: "М-12: Гусь-Хрустальный — Меленки", start: [40.65, 55.62], end: [41.63, 55.34], weekday: 522, weekend: 522, radius: 24 },
  { name: "М-12: Меленки — Муром", start: [41.63, 55.34], end: [42.04, 55.58], weekday: 205, weekend: 205, radius: 24 },
  { name: "М-12: Муром — Дивеево", start: [42.04, 55.58], end: [43.24, 55.04], weekday: 510, weekend: 510, radius: 26 },
  { name: "М-12: Дивеево — Арзамас", start: [43.24, 55.04], end: [43.84, 55.39], weekday: 311, weekend: 311, radius: 24 },
  { name: "М-12: Арзамас — Сергач", start: [43.84, 55.39], end: [45.47, 55.52], weekday: 602, weekend: 602, radius: 28 },
  { name: "М-12: Сергач — Шумерля", start: [45.47, 55.52], end: [46.42, 55.5], weekday: 348, weekend: 348, radius: 25 },
  { name: "М-12: Шумерля — Канаш", start: [46.42, 55.5], end: [47.5, 55.5], weekday: 392, weekend: 392, radius: 25 },
  { name: "М-12: Канаш — Большие Кайбицы", start: [47.5, 55.5], end: [48.17, 55.4], weekday: 215, weekend: 215, radius: 24 },
  { name: "М-12: Большие Кайбицы — Иннополис", start: [48.17, 55.4], end: [48.75, 55.75], weekday: 243, weekend: 243, radius: 24 },
  { name: "М-12: Иннополис — Тетюши", start: [48.75, 55.75], end: [48.84, 54.94], weekday: 155, weekend: 155, radius: 30 },
  { name: "М-12: Тетюши — аэропорт Казань", start: [48.84, 54.94], end: [49.28, 55.61], weekday: 280, weekend: 280, radius: 30 },
  { name: "М-12: аэропорт Казань — Казань", start: [49.28, 55.61], end: [49.12, 55.78], weekday: 162, weekend: 162, radius: 20 },
  { name: "М-12: Казань — Шали", start: [49.12, 55.78], end: [49.66, 55.51], weekday: 62, weekend: 62, radius: 24 },
  { name: "М-12: Нижнекамск — аэропорт Бегишево", start: [51.82, 55.64], end: [52.1, 55.56], weekday: 278, weekend: 278, radius: 22 },
  { name: "М-12: Бегишево — Набережные Челны", start: [52.1, 55.56], end: [52.4, 55.73], weekday: 208, weekend: 208, radius: 22 },
  { name: "М-12: Исаметово — Асяново", start: [54.35, 55.76], end: [54.72, 55.82], weekday: 325, weekend: 325, radius: 24 },
  { name: "М-12: Дюртюли — Бураево", start: [54.87, 55.49], end: [55.41, 55.84], weekday: 440, weekend: 440, radius: 28 },
  { name: "М-12: Бураево — Октябрьский", start: [55.41, 55.84], end: [56.75, 56.18], weekday: 960, weekend: 960, radius: 32 },
  { name: "М-12: Октябрьский — Ачит", start: [56.75, 56.18], end: [57.9, 56.8], weekday: 460, weekend: 460, radius: 34 },
];

const REGIONAL: TollSegment[] = [
  { name: "Восточный выезд Уфы", start: [56.07, 54.75], end: [56.3, 54.75], weekday: 150, weekend: 150, radius: 13 },
  { name: "Обход Тольятти", start: [49.09, 53.56], end: [49.48, 53.45], weekday: 650, weekend: 650, radius: 18 },
];

const CKAD: TollSegment[] = [
  { name: "ЦКАД: М-10 — Дмитровское шоссе", start: [37.3, 56.13], via: [37.42, 56.17], end: [37.55, 56.18], weekday: 120, weekend: 120, radius: 9 },
  { name: "ЦКАД: Дмитровское шоссе — М-8", start: [37.55, 56.18], via: [37.73, 56.17], end: [37.92, 56.13], weekday: 241, weekend: 241, radius: 9 },
  { name: "ЦКАД: М-8 — М-7", start: [37.92, 56.13], via: [38.23, 56.03], end: [38.5, 55.9], weekday: 461, weekend: 461, radius: 10 },
  { name: "ЦКАД: М-7 — М-12", start: [38.5, 55.9], via: [38.49, 55.81], end: [38.46, 55.72], weekday: 40, weekend: 40, radius: 8 },
  { name: "ЦКАД: М-12 — Носовихинское шоссе", start: [38.46, 55.72], via: [38.41, 55.68], end: [38.35, 55.65], weekday: 156, weekend: 156, radius: 8 },
  { name: "ЦКАД: Носовихинское — Егорьевское шоссе", start: [38.35, 55.65], via: [38.36, 55.59], end: [38.34, 55.53], weekday: 81, weekend: 81, radius: 8 },
  { name: "ЦКАД: Егорьевское шоссе — М-5", start: [38.34, 55.53], via: [38.2, 55.46], end: [38.05, 55.39], weekday: 271, weekend: 271, radius: 9 },
  { name: "ЦКАД: М-5 — Домодедово", start: [38.05, 55.39], via: [37.93, 55.36], end: [37.8, 55.35], weekday: 248, weekend: 248, radius: 8 },
  { name: "ЦКАД: М-4 — М-2", start: [37.75, 55.32], via: [37.65, 55.29], end: [37.55, 55.28], weekday: 140, weekend: 140, radius: 8 },
  { name: "ЦКАД: М-2 — Калужское шоссе", start: [37.55, 55.28], via: [37.4, 55.28], end: [37.25, 55.31], weekday: 204, weekend: 204, radius: 9 },
  { name: "ЦКАД: Калужское шоссе — западный участок", start: [37.25, 55.31], via: [37.08, 55.39], end: [36.95, 55.5], weekday: 92, weekend: 92, radius: 9 },
];

const FULL_ROUTES = [
  { name: "М-4: Анапа — Воронеж", start: [37.316367, 44.894818] as Coordinate, end: [39.200296, 51.660781] as Coordinate, weekday: 4090, weekend: 4930, radius: 12 },
  { name: "М-12: Москва — Екатеринбург", start: [37.62, 55.76] as Coordinate, end: [60.61, 56.84] as Coordinate, weekday: 8580, weekend: 8580, radius: 85 },
  { name: "М-12: Москва — Казань", start: [37.62, 55.76] as Coordinate, end: [49.11, 55.8] as Coordinate, weekday: 5909, weekend: 5909, radius: 55 },
  { name: "М-11: Москва — Санкт-Петербург", start: [37.62, 55.76] as Coordinate, end: [30.34, 59.93] as Coordinate, weekday: 4580, weekend: 4780, radius: 55 },
  { name: "М-4 + М-11: Сочи — Санкт-Петербург", start: [39.72, 43.59] as Coordinate, end: [30.34, 59.93] as Coordinate, weekday: 9620, weekend: 10870, radius: 65 },
  { name: "М-4: Москва — Сочи", start: [37.62, 55.76] as Coordinate, end: [39.72, 43.59] as Coordinate, weekday: 5040, weekend: 6090, radius: 65 },
  { name: "М-4: Москва — Краснодар", start: [37.62, 55.76] as Coordinate, end: [38.98, 45.04] as Coordinate, weekday: 5040, weekend: 6090, radius: 55 },
];

function distanceKm(a: Coordinate, b: Coordinate) {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLng = (b[0] - a[0]) * rad;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function nearRoute(route: Coordinate[], point: Coordinate, radius = 16) {
  return route.some((coordinate) => distanceKm(coordinate, point) <= radius);
}

function matchesRouteEnds(route: Coordinate[], start: Coordinate, end: Coordinate, radius: number) {
  if (route.length < 2) return false;
  const first = route[0], last = route[route.length - 1];
  return (distanceKm(first, start) <= radius && distanceKm(last, end) <= radius)
    || (distanceKm(first, end) <= radius && distanceKm(last, start) <= radius);
}

export function estimateTolls(route: Coordinate[], departureAt?: string) {
  const date = departureAt ? new Date(departureAt) : new Date();
  const day = Number.isNaN(date.getTime()) ? new Date().getDay() : date.getDay();
  const weekend = day === 0 || day === 5 || day === 6;
  const completeRoute = FULL_ROUTES.find((item) => matchesRouteEnds(route, item.start, item.end, item.radius));
  if (completeRoute) return {
    amount: weekend ? completeRoute.weekend : completeRoute.weekday,
    period: weekend ? "пятница–воскресенье" : "понедельник–четверг",
    segments: [completeRoute.name],
  };
  const segments = [...M1, ...M3, ...M4, ...M11, ...M12, ...CKAD, ...A289, ...REGIONAL].filter((segment) => nearRoute(route, segment.start, segment.radius) && nearRoute(route, segment.end, segment.radius) && (!segment.via || nearRoute(route, segment.via, segment.radius)));
  return {
    amount: segments.reduce((sum, segment) => sum + (weekend ? segment.weekend : segment.weekday), 0),
    period: weekend ? "пятница–воскресенье" : "понедельник–четверг",
    segments: segments.map((segment) => segment.name),
  };
}
