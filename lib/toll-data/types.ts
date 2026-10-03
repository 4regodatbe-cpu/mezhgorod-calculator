export type Coordinate = [number, number];

export type TollSegment = {
  name: string;
  start: Coordinate;
  end: Coordinate;
  via?: Coordinate;
  weekday: number;
  weekend: number;
  radius?: number;
};

export type FullRoute = {
  name: string;
  start: Coordinate;
  end: Coordinate;
  weekday: number;
  weekend: number;
  radius: number;
  requirements: Array<{ prefix: string; min: number }>;
  expectedKm?: number;
  distanceTolerancePercent?: number;
};
