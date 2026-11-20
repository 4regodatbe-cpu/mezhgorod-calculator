import { CRIMEA_RING, inCrimea } from "../crimea-geography.ts";
import { BRIDGE } from "../special-territory-policy.ts";
import { routeFractionInRing, type GeoPoint, type Position, type TerritorySplit } from "../special-territory-geometry.ts";

// Existing Melitopol coordinate from the Crimea release probe.
const MELITOPOL = {lng: 35.365, lat: 46.848};

export function crimeaLandPositions(from: Position, to: Position, specialEndpoint: boolean): Position[] {
  return specialEndpoint ? [from, to] : [from, MELITOPOL, to];
}

export function avoidsCrimeaBridge(coordinates: GeoPoint[]) {
  const scale = Math.cos(BRIDGE.lat * Math.PI / 180);
  for (let i = 1; i < coordinates.length; i++) {
    const [a, b] = [coordinates[i - 1], coordinates[i]].map(([lng, lat]) => ({
      x: (lng - BRIDGE.lng) * scale, y: lat - BRIDGE.lat,
    }));
    const dx = b.x - a.x, dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;
    const fraction = lengthSquared ? Math.max(0, Math.min(1, -(a.x * dx + a.y * dy) / lengthSquared)) : 0;
    if (Math.hypot(a.x + fraction * dx, a.y + fraction * dy) < 0.025) return false;
  }
  return true;
}

export function crimeaLandMileage(split: TerritorySplit, routeKm: number) {
  let geometryMeters = 0, crimeaMeters = 0, specialMeters = 0;
  for (const piece of split.pieces) {
    const crimeaPart = piece.meters * routeFractionInRing(piece.coordinates, CRIMEA_RING, inCrimea);
    geometryMeters += piece.meters;
    crimeaMeters += crimeaPart;
    if (piece.territory) specialMeters += piece.meters - crimeaPart;
  }
  if (!(crimeaMeters > 0 && specialMeters > 0 && geometryMeters > 0)) throw new Error("ROUTE_CORRIDOR_UNCONFIRMED");
  const crimeaKm = crimeaMeters / geometryMeters * routeKm;
  const specialKm = specialMeters / geometryMeters * routeKm;
  return { crimeaKm, specialKm, ordinaryKm: Math.max(0, routeKm - crimeaKm - specialKm) };
}
