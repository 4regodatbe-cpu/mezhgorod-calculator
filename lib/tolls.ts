export type Coordinate = [number, number];

type TollSegment = {
  name: string;
  start: Coordinate;
  end: Coordinate;
  weekday: number;
  weekend: number;
};

// M-4 Don, category I, no transponder. Prices current from 02.03.2026.
const M4: TollSegment[] = [
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

export function estimateTolls(route: Coordinate[], departureAt?: string) {
  const date = departureAt ? new Date(departureAt) : new Date();
  const day = Number.isNaN(date.getTime()) ? new Date().getDay() : date.getDay();
  const weekend = day === 0 || day === 5 || day === 6;
  const segments = M4.filter((segment) => nearRoute(route, segment.start) && nearRoute(route, segment.end));
  return {
    amount: segments.reduce((sum, segment) => sum + (weekend ? segment.weekend : segment.weekday), 0),
    period: weekend ? "пятница–воскресенье" : "понедельник–четверг",
    segments: segments.map((segment) => segment.name),
  };
}
