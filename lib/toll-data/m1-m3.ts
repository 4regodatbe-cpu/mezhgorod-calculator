import type { TollSegment } from "./types";

export const M1: TollSegment[] = [
  { name: "Северный обход Одинцова", start: [37.38, 55.72], via: [37.19, 55.72], end: [37.02, 55.66], weekday: 650, weekend: 650, radius: 9 },
  { name: "М-1: 33–66 км", start: [36.96, 55.59], end: [36.66, 55.57], weekday: 250, weekend: 250, radius: 12 },
];

export const M3: TollSegment[] = [
  { name: "М-3: 65–86 км", start: [37.05, 55.45], end: [36.86, 55.31], weekday: 100, weekend: 100, radius: 12 },
  { name: "М-3: 112–150 км", start: [36.47, 55.02], end: [36.19, 54.76], weekday: 190, weekend: 190, radius: 12 },
  { name: "М-3: 150–194 км", start: [36.19, 54.76], end: [35.76, 54.39], weekday: 190, weekend: 230, radius: 12 },
];
