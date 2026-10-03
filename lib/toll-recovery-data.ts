import type { Coordinate } from "@/lib/tolls";

export type RecoverySegment = {
  name: string;
  start: Coordinate;
  end: Coordinate;
  weekday: number;
  weekend: number;
};

export type RecoveryRoad = {
  id: "M4" | "M12";
  segments: RecoverySegment[];
  minRunWithMapMatch: number;
  minRunWithoutMapMatch: number;
  requiresRouteDifference: boolean;
};

const M4_RECOVERY: RecoverySegment[] = [
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

const M12_RECOVERY: RecoverySegment[] = [
  { name: "М-12: Москва — Электроугли", start: [37.87, 55.75], end: [38.22, 55.72], weekday: 176, weekend: 176 },
  { name: "М-12: Электроугли — ЦКАД", start: [38.22, 55.72], end: [38.46, 55.72], weekday: 322, weekend: 322 },
  { name: "М-12: ЦКАД — Орехово-Зуево", start: [38.46, 55.72], end: [38.94, 55.8], weekday: 244, weekend: 244 },
  { name: "М-12: Орехово-Зуево — Петушки", start: [38.94, 55.8], end: [39.46, 55.93], weekday: 359, weekend: 359 },
  { name: "М-12: Петушки — Владимир", start: [39.46, 55.93], end: [40.41, 56.08], weekday: 636, weekend: 636 },
  { name: "М-12: Владимир — Гусь-Хрустальный", start: [40.41, 56.08], end: [40.65, 55.62], weekday: 165, weekend: 165 },
  { name: "М-12: Гусь-Хрустальный — Меленки", start: [40.65, 55.62], end: [41.63, 55.34], weekday: 522, weekend: 522 },
  { name: "М-12: Меленки — Муром", start: [41.63, 55.34], end: [42.04, 55.58], weekday: 205, weekend: 205 },
  { name: "М-12: Муром — Дивеево", start: [42.04, 55.58], end: [43.24, 55.04], weekday: 510, weekend: 510 },
  { name: "М-12: Дивеево — Арзамас", start: [43.24, 55.04], end: [43.84, 55.39], weekday: 311, weekend: 311 },
  { name: "М-12: Арзамас — Сергач", start: [43.84, 55.39], end: [45.47, 55.52], weekday: 602, weekend: 602 },
  { name: "М-12: Сергач — Шумерля", start: [45.47, 55.52], end: [46.42, 55.5], weekday: 348, weekend: 348 },
  { name: "М-12: Шумерля — Канаш", start: [46.42, 55.5], end: [47.5, 55.5], weekday: 392, weekend: 392 },
  { name: "М-12: Канаш — Большие Кайбицы", start: [47.5, 55.5], end: [48.17, 55.4], weekday: 215, weekend: 215 },
  { name: "М-12: Большие Кайбицы — Иннополис", start: [48.17, 55.4], end: [48.75, 55.75], weekday: 243, weekend: 243 },
  { name: "М-12: Иннополис — Тетюши", start: [48.75, 55.75], end: [48.84, 54.94], weekday: 155, weekend: 155 },
  { name: "М-12: Тетюши — аэропорт Казань", start: [48.84, 54.94], end: [49.28, 55.61], weekday: 280, weekend: 280 },
  { name: "М-12: аэропорт Казань — Казань", start: [49.28, 55.61], end: [49.12, 55.78], weekday: 162, weekend: 162 },
  { name: "М-12: Казань — Шали", start: [49.12, 55.78], end: [49.66, 55.51], weekday: 62, weekend: 62 },
];

export const ROADS: RecoveryRoad[] = [
  { id: "M4", segments: M4_RECOVERY, minRunWithMapMatch: 2, minRunWithoutMapMatch: 4, requiresRouteDifference: true },
  { id: "M12", segments: M12_RECOVERY, minRunWithMapMatch: 2, minRunWithoutMapMatch: 5, requiresRouteDifference: false },
];

