import type { TollSegment } from "./types";

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
