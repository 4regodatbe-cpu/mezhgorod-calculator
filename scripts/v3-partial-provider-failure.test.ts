import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/v3/calculate/route";

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
