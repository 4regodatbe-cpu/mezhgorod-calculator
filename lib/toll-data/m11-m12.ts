import type { TollSegment } from "./types";

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
