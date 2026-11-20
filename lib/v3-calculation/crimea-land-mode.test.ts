import assert from "node:assert/strict";
import { test } from "node:test";
import { avoidsCrimeaBridge, crimeaLandMileage, crimeaLandPositions } from "./crimea-land-mode.ts";
import { calculateRoutePricing, type PricingVehicle } from "../route-pricing-integration.ts";
import { BRIDGE } from "../special-territory-policy.ts";
import type { GeoPoint, TerritorySplit } from "../special-territory-geometry.ts";

test("bridge exclusion catches crossing between sparse vertices in both directions", () => {
  const crossing: GeoPoint[] = [[BRIDGE.lng - 0.1, BRIDGE.lat], [BRIDGE.lng + 0.1, BRIDGE.lat]];
  assert.equal(avoidsCrimeaBridge(crossing), false);
  assert.equal(avoidsCrimeaBridge(crossing.reverse()), false);
  assert.equal(avoidsCrimeaBridge([[34,45],[34,46],[35,47]]), true);
});

test("three tariff rates contribute to two visible groups and preserve distance", () => {
  const pieces = [
    {territory:null, coordinates:[[34,45],[34,45.5]], meters:100000},
    {territory:"zaporizhzhia", coordinates:[[35,46.5],[35,47]], meters:200000},
    {territory:null, coordinates:[[39,47],[39,48]], meters:600000},
  ] as TerritorySplit["pieces"];
  const split = {pieces} as TerritorySplit;
  const mileage = crimeaLandMileage(split, 900);
  assert.deepEqual(mileage,{crimeaKm:100,specialKm:200,ordinaryKm:600});
  const vehicles: PricingVehicle[] = ["standard","comfort","comfort_plus","minivan"];
  for (const [index, vehicle] of vehicles.entries()) {
    const pricing = calculateRoutePricing({
      from:"A", to:"B", vehicle, mode:"dual",
      legs:[{from:"A",to:"B",distanceKm:900,crimeaKm:100,territorySplit:{...split,ordinaryKm:700,specialKm:200}}],
    });
    assert.deepEqual(pricing.pricingSegments.map(({tariffType,distanceKm})=>[tariffType,distanceKm]), [["normal",700],["special",200]]);
    assert.equal(pricing.totalPrice,[35500,39500,43500,55000][index]);
  }
  assert.throws(()=>crimeaLandMileage({...split,pieces:pieces.slice(0,1)},100), /ROUTE_CORRIDOR_UNCONFIRMED/);
  const from={lng:34,lat:45}, to={lng:39,lat:47};
  assert.deepEqual(crimeaLandPositions(to,from,false),crimeaLandPositions(from,to,false).reverse());
});
