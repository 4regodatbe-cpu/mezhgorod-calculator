export const SPECIAL_TERRITORY_IDS = ["dnr", "lnr", "zaporizhzhia", "kherson"] as const;
export type SpecialTerritoryId = typeof SPECIAL_TERRITORY_IDS[number];
export type Position = { lat: number; lng: number };
export type GeoPoint = [number, number];
type PolygonGeometry = { type: "Polygon"; coordinates: GeoPoint[][] } | { type: "MultiPolygon"; coordinates: GeoPoint[][][] };

export type VerifiedTerritory = {
  id: SpecialTerritoryId;
  verified: true;
  source: { url: string; title: string; checkedAt: string };
  geometry: PolygonGeometry;
};

export type TerritorySplit = {
  verified: true;
  ordinaryKm: number;
  specialKm: number;
  territoryKm: Record<SpecialTerritoryId, number>;
  specialSeconds: number;
  territorySeconds: Record<SpecialTerritoryId, number>;
  timeIsEstimated: true;
  pieces: TerritoryPiece[];
};

export type TerritoryPiece = { territory: SpecialTerritoryId | null; coordinates: GeoPoint[]; meters: number };
type Edge = { a: GeoPoint; b: GeoPoint; minX: number; maxX: number; minY: number; maxY: number };
const prepared = new WeakMap<VerifiedTerritory[], { edges: Map<string, Edge[]>; bounds: Map<VerifiedTerritory, number[]> }>();
function prepare(zones: VerifiedTerritory[]) {
  const cached = prepared.get(zones);
  if (cached) return cached;
  validateTerritories(zones);
  const edges = new Map<string, Edge[]>();
  const bounds = new Map<VerifiedTerritory, number[]>();
  for (const zone of zones) {
    const box = [Infinity, Infinity, -Infinity, -Infinity];
    for (const polygon of polygons(zone.geometry)) for (const ring of polygon) {
      for (let i = 1; i < ring.length; i++) {
        const a = ring[i - 1], b = ring[i];
        const edge = { a, b, minX: Math.min(a[0], b[0]), maxX: Math.max(a[0], b[0]), minY: Math.min(a[1], b[1]), maxY: Math.max(a[1], b[1]) };
        box[0] = Math.min(box[0], edge.minX); box[1] = Math.min(box[1], edge.minY);
        box[2] = Math.max(box[2], edge.maxX); box[3] = Math.max(box[3], edge.maxY);
        for (let x = Math.floor(edge.minX); x <= Math.floor(edge.maxX); x++) for (let y = Math.floor(edge.minY); y <= Math.floor(edge.maxY); y++) {
          const key = `${x}:${y}`; const bucket = edges.get(key) ?? []; bucket.push(edge); edges.set(key, bucket);
        }
      }
    }
    bounds.set(zone, box);
  }
  const result = { edges, bounds }; prepared.set(zones, result); return result;
}

const EPSILON = 1e-10;
const EARTH_RADIUS_METERS = 6_371_008.8;

function validPoint(point: unknown): point is GeoPoint {
  return Array.isArray(point) && point.length >= 2 && Number.isFinite(point[0]) && Number.isFinite(point[1]) &&
    point[0] >= -180 && point[0] <= 180 && point[1] >= -90 && point[1] <= 90;
}

function polygons(geometry: PolygonGeometry): GeoPoint[][][] {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

export function validateTerritories(zones: unknown): asserts zones is VerifiedTerritory[] {
  if (!Array.isArray(zones) || zones.length !== SPECIAL_TERRITORY_IDS.length) {
    throw new TypeError("All four verified special-territory boundaries are required");
  }
  const ids = new Set<string>();
  for (const zone of zones as VerifiedTerritory[]) {
    if (!zone || !SPECIAL_TERRITORY_IDS.includes(zone.id) || ids.has(zone.id) || zone.verified !== true) {
      throw new TypeError("Every territory must have a unique supported id and verified=true");
    }
    ids.add(zone.id);
    if (!zone.source || !/^https:\/\//.test(zone.source.url) || !zone.source.title || Number.isNaN(Date.parse(zone.source.checkedAt))) {
      throw new TypeError(`Territory ${zone.id} must record its checked source and date`);
    }
    const geometry = zone.geometry;
    if (!geometry || !["Polygon", "MultiPolygon"].includes(geometry.type) || !polygons(geometry).length) {
      throw new TypeError(`Territory ${zone.id} requires Polygon or MultiPolygon geometry`);
    }
    for (const polygon of polygons(geometry)) {
      if (!Array.isArray(polygon) || !polygon.length) throw new TypeError(`Territory ${zone.id} has an empty polygon`);
      for (const ring of polygon) {
        if (!Array.isArray(ring) || ring.length < 4 || !ring.every(validPoint)) throw new TypeError(`Territory ${zone.id} has an invalid ring`);
        const first = ring[0]; const last = ring.at(-1)!;
        if (Math.abs(first[0] - last[0]) > EPSILON || Math.abs(first[1] - last[1]) > EPSILON) {
          throw new TypeError(`Territory ${zone.id} rings must be closed`);
        }
      }
    }
  }
  if (SPECIAL_TERRITORY_IDS.some((id) => !ids.has(id))) throw new TypeError("All four verified special-territory boundaries are required");
}

function onSegment(point: GeoPoint, a: GeoPoint, b: GeoPoint) {
  const cross = (point[0] - a[0]) * (b[1] - a[1]) - (point[1] - a[1]) * (b[0] - a[0]);
  if (Math.abs(cross) > EPSILON) return false;
  return point[0] >= Math.min(a[0], b[0]) - EPSILON && point[0] <= Math.max(a[0], b[0]) + EPSILON &&
    point[1] >= Math.min(a[1], b[1]) - EPSILON && point[1] <= Math.max(a[1], b[1]) + EPSILON;
}

function inRing(point: GeoPoint, ring: GeoPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[j]; const b = ring[i];
    if (onSegment(point, a, b)) throw new Error("TERRITORY_BOUNDARY_AMBIGUOUS");
    if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

function inPolygon(point: GeoPoint, polygon: GeoPoint[][]) {
  return inRing(point, polygon[0]) && !polygon.slice(1).some((hole) => inRing(point, hole));
}

export function classifyTerritory(position: Position, zones: VerifiedTerritory[]): SpecialTerritoryId | null {
  const index = prepare(zones);
  if (!Number.isFinite(position.lat) || !Number.isFinite(position.lng) || position.lat < -90 || position.lat > 90 || position.lng < -180 || position.lng > 180) {
    throw new TypeError("A valid geocoded coordinate is required");
  }
  const point: GeoPoint = [position.lng, position.lat];
  const matches = zones.filter((zone) => {
    const [minX, minY, maxX, maxY] = index.bounds.get(zone)!;
    return point[0] >= minX && point[0] <= maxX && point[1] >= minY && point[1] <= maxY && polygons(zone.geometry).some((polygon) => inPolygon(point, polygon));
  });
  if (matches.length > 1) throw new Error("TERRITORY_BOUNDARIES_OVERLAP");
  return matches[0]?.id ?? null;
}

function cross(a: GeoPoint, b: GeoPoint) { return a[0] * b[1] - a[1] * b[0]; }

function segmentCrossing(a: GeoPoint, b: GeoPoint, c: GeoPoint, d: GeoPoint): number | "overlap" | null {
  const r: GeoPoint = [b[0] - a[0], b[1] - a[1]];
  const s: GeoPoint = [d[0] - c[0], d[1] - c[1]];
  const denom = cross(r, s); const q: GeoPoint = [c[0] - a[0], c[1] - a[1]];
  if (Math.abs(denom) <= EPSILON) {
    if (Math.abs(cross(q, r)) <= EPSILON) {
      const length = r[0] ** 2 + r[1] ** 2;
      if (length > 0) {
        const t0 = (q[0] * r[0] + q[1] * r[1]) / length;
        const t1 = t0 + (s[0] * r[0] + s[1] * r[1]) / length;
        if (Math.max(Math.min(t0, t1), 0) <= Math.min(Math.max(t0, t1), 1)) return "overlap";
      }
    }
    return null;
  }
  const t = cross(q, s) / denom; const u = cross(q, r) / denom;
  return t >= -EPSILON && t <= 1 + EPSILON && u >= -EPSILON && u <= 1 + EPSILON ? Math.max(0, Math.min(1, t)) : null;
}

function interpolate(a: GeoPoint, b: GeoPoint, ratio: number): GeoPoint {
  return [a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio];
}

function distanceMeters(a: GeoPoint, b: GeoPoint) {
  const radians = Math.PI / 180; const lat1 = a[1] * radians; const lat2 = b[1] * radians;
  const dLat = (b[1] - a[1]) * radians; const dLng = (b[0] - a[0]) * radians;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

export function splitRouteByTerritory(input: {
  coordinates: GeoPoint[];
  routedDistanceMeters: number;
  routedDurationSeconds: number;
  zones: VerifiedTerritory[];
}): TerritorySplit {
  const preparedZones = prepare(input.zones);
  if (!Array.isArray(input.coordinates) || input.coordinates.length < 2 || !input.coordinates.every(validPoint) ||
      !Number.isFinite(input.routedDistanceMeters) || input.routedDistanceMeters <= 0 ||
      !Number.isFinite(input.routedDurationSeconds) || input.routedDurationSeconds <= 0) {
    throw new TypeError("Route geometry, distance and duration are required");
  }
  const lengthByTerritory = Object.fromEntries(SPECIAL_TERRITORY_IDS.map((id) => [id, 0])) as Record<SpecialTerritoryId, number>;
  const pieces: TerritoryPiece[] = [];
  let geometryMeters = 0; let specialGeometryMeters = 0;
  for (let index = 1; index < input.coordinates.length; index += 1) {
    const a = input.coordinates[index - 1]; const b = input.coordinates[index];
    const segmentMeters = distanceMeters(a, b);
    if (segmentMeters === 0) continue;
    const cuts = [0, 1];
    const edges = new Set<Edge>();
    for (let x = Math.floor(Math.min(a[0], b[0])); x <= Math.floor(Math.max(a[0], b[0])); x++)
      for (let y = Math.floor(Math.min(a[1], b[1])); y <= Math.floor(Math.max(a[1], b[1])); y++)
        for (const edge of preparedZones.edges.get(`${x}:${y}`) ?? []) edges.add(edge);
    for (const edge of edges) {
      if (edge.maxX < Math.min(a[0], b[0]) || edge.minX > Math.max(a[0], b[0]) || edge.maxY < Math.min(a[1], b[1]) || edge.minY > Math.max(a[1], b[1])) continue;
      const crossing = segmentCrossing(a, b, edge.a, edge.b);
      if (crossing === "overlap") throw new Error("TERRITORY_BORDER_OVERLAP");
      if (crossing !== null) cuts.push(crossing);
    }
    cuts.sort((x, y) => x - y);
    const unique = cuts.filter((value, cutIndex) => cutIndex === 0 || value - cuts[cutIndex - 1] > EPSILON);
    for (let cut = 1; cut < unique.length; cut += 1) {
      const start = unique[cut - 1]; const end = unique[cut];
      const middle = interpolate(a, b, (start + end) / 2);
      const pointTerritory = classifyTerritory({ lat: middle[1], lng: middle[0] }, input.zones);
      const meters = segmentMeters * (end - start);
      const startPoint = interpolate(a, b, start), endPoint = interpolate(a, b, end);
      const last = pieces.at(-1);
      if (last && last.territory === pointTerritory) { last.coordinates.push(endPoint); last.meters += meters; }
      else pieces.push({ territory: pointTerritory, coordinates: [startPoint, endPoint], meters });
      geometryMeters += meters;
      if (pointTerritory) { lengthByTerritory[pointTerritory] += meters; specialGeometryMeters += meters; }
    }
  }
  if (geometryMeters <= 0 || specialGeometryMeters > geometryMeters) throw new Error("TERRITORY_SPLIT_INVALID");
  const routedToGeometryRatio = input.routedDistanceMeters / geometryMeters;
  const territoryKm = Object.fromEntries(SPECIAL_TERRITORY_IDS.map((id) => [id, lengthByTerritory[id] * routedToGeometryRatio / 1000])) as Record<SpecialTerritoryId, number>;
  const specialKm = specialGeometryMeters * routedToGeometryRatio / 1000;
  const territorySeconds = Object.fromEntries(SPECIAL_TERRITORY_IDS.map((id) => [id, input.routedDurationSeconds * lengthByTerritory[id] / geometryMeters])) as Record<SpecialTerritoryId, number>;
  return {
    verified: true,
    ordinaryKm: input.routedDistanceMeters / 1000 - specialKm,
    specialKm,
    territoryKm,
    specialSeconds: Object.values(territorySeconds).reduce((sum, seconds) => sum + seconds, 0),
    territorySeconds,
    timeIsEstimated: true,
    pieces,
  };
}

export type CorridorRoute = { id: string; corridor: "mainland" | "crimea"; tollStatus: "paid" | "free" | "unknown"; meters: number; seconds: number };

export function chooseCorridorRoute(routes: CorridorRoute[], corridor: CorridorRoute["corridor"]): CorridorRoute | null {
  const available = routes.filter((route) => route.corridor === corridor && Number.isFinite(route.meters) && route.meters > 0 && Number.isFinite(route.seconds) && route.seconds > 0);
  return available.find((route) => route.tollStatus === "paid") ?? available.find((route) => route.tollStatus === "free") ??
    [...available].sort((a, b) => a.seconds - b.seconds)[0] ?? null;
}
