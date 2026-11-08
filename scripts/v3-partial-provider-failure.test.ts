import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/v3/calculate/route";
import { RoutingProviderError } from "../lib/routing-attempt";

const coordinates = [[37.32,44.9],[37.8330177,45.1961096],[38.5327744,45.171408],[38.98,45.04]];
function polyline(points: number[][]) {
  let lat = 0, lng = 0, result = "";
  const encode = (delta: number) => {
    let value = delta < 0 ? ~(delta << 1) : delta << 1;
    while (value >= 32) { result += String.fromCharCode((32 | (value & 31)) + 63); value >>>= 5; }
    result += String.fromCharCode(value + 63);
  };
  for (const point of points) { const y = Math.round(point[1] * 1e6), x = Math.round(point[0] * 1e6); encode(y-lat); encode(x-lng); lat=y; lng=x; }
  return result;
}
const request = () => new NextRequest("http://localhost/api/v3/calculate", {method:"POST",body:JSON.stringify({from:{label:"Анапа",position:{lng:37.32,lat:44.9}},to:{label:"Краснодар",position:{lng:38.98,lat:45.04}},departureAt:"2026-10-15T09:00:00+03:00"})});
function payload(host: string, points = coordinates) {
  if (host === "valhalla1.openstreetmap.de") return {trip:{summary:{length:170,time:10000},legs:[{shape:polyline(points),summary:{length:170,time:10000}}]}};
  if (host === "brouter.de") return {features:[{properties:{"track-length":170000,"total-time":10000},geometry:{coordinates:points}}]};
  return {routes:[{distance:170000,duration:10000,geometry:{coordinates:points},legs:[]}]};
}

test("each provider can independently carry V3 through competing failures; rejected geometry cannot win", async () => {
  const original = globalThis.fetch;
  try {
    for (const winner of ["valhalla1.openstreetmap.de", "router.project-osrm.org", "brouter.de"]) {
      for (const failure of ["http", "timeout", "invalid", "slow"]) {
        globalThis.fetch = async input => {
          const url = new URL(String(input));
          if (url.pathname === "/trace_attributes") return Response.json({}, {status:503});
          if (url.hostname === winner) return Response.json(payload(winner));
          if (failure === "timeout") throw new RoutingProviderError("timeout");
          if (failure === "invalid") return Response.json(payload(url.hostname, [...coordinates].reverse()));
          if (failure === "slow") await new Promise(resolve => setTimeout(resolve, 15));
          return Response.json({}, {status:503});
        };
        const result = await POST(request());
        assert.equal(result.status, 200, `${winner}/${failure}`);
        const body = await result.json();
        assert.equal(body.legs[0].fast.meters, 170000);
        assert.equal(body.legs[0].fast.seconds, 10000);
        assert.deepEqual(body.legs[0].fast.quality.providers, [winner === "valhalla1.openstreetmap.de" ? "Valhalla" : winner === "brouter.de" ? "BRouter" : "OSRM"]);
      }
    }
    globalThis.fetch = async input => {
      const url = new URL(String(input));
      return Response.json(payload(url.hostname, [...coordinates].reverse()));
    };
    const rejected = await POST(request());
    assert.equal(rejected.status, 502);
    assert.equal((await rejected.json()).legs, undefined);
  } finally { globalThis.fetch = original; }
});

test("a usable OSRM candidate survives two failed providers and malformed competing geometry", async () => {
  const original = globalThis.fetch;
  try {
    for (const broken of [503, 200]) {
      globalThis.fetch = async (input) => {
        const url = new URL(String(input));
        if (url.hostname === "router.project-osrm.org") return Response.json({routes:[{distance:170000,duration:10000,geometry:{coordinates:[[37.32,44.9],[37.8330177,45.1961096],[38.5327744,45.171408],[38.98,45.04]]},legs:[]}]});
        return Response.json({}, {status:broken});
      };
      const response = await POST(new NextRequest("http://localhost/api/v3/calculate", {method:"POST",body:JSON.stringify({from:{label:"Анапа",position:{lng:37.32,lat:44.9}},to:{label:"Краснодар",position:{lng:38.98,lat:45.04}},departureAt:"2026-10-15T09:00:00+03:00"})}));
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.legs[0].fast.meters, 170000);
      assert.equal(body.legs[0].fast.seconds, 10000);
      assert.deepEqual(body.legs[0].fast.quality.providers,["OSRM"]);
    }
  } finally { globalThis.fetch = original; }
});
