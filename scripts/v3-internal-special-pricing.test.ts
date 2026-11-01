import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/v3/calculate/route.ts";
import { validV3Response } from "../app/v3/components/response-validation.ts";

const donetsk = { label: "Донецк, ДНР", position: { lng: 37.8029, lat: 48.0156 } };
const volnovakha = { label: "Волноваха, ДНР", position: { lng: 37.4968, lat: 47.6019 } };
const originalFetch = globalThis.fetch;
const route = {
  routes: [{ distance: 60_000, duration: 3_600,
    geometry: { coordinates: [[37.8029,48.0156],[37.4968,47.6019]] },
    legs: [],
  }],
};
const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), {status, headers: {"content-type":"application/json"}});
const request = (extra: Record<string, unknown> = {}) => new NextRequest("http://localhost/api/v3/calculate", {
  method: "POST", body: JSON.stringify({from:donetsk,to:volnovakha,departureAt:"2026-11-01", ...extra}),
});

test("V3 uses one special tariff for verified internal trip even with manual ordinary override", async () => {
  const requested: string[] = [];
  globalThis.fetch = async input => {
    const url = new URL(String(input));
    requested.push(url.hostname + url.pathname);
    if (url.hostname === "router.project-osrm.org") {
      const reverse=url.pathname.includes("37.4968,47.6019;37.8029,48.0156");
      return respond(reverse?{routes:[{...route.routes[0],geometry:{coordinates:[...route.routes[0].geometry.coordinates].reverse()}}]}:route);
    }
    return respond({}, 503);
  };
  try {
    for(const endpoints of [{from:donetsk,to:volnovakha},{from:volnovakha,to:donetsk}]) {
      const response = await POST(request({...endpoints,mode:"standard",modeOverride:true}));
      const body = await response.json();
      assert.equal(response.status, 200, JSON.stringify(body));
      assert.equal(body.mode, "dual");
      assert.equal(body.specialOnly, true);
      assert.equal(validV3Response(body), true, JSON.stringify(body));
      assert.equal(body.legs[0].fast.meters, 60_000);
      for (const [vehicle,rate] of Object.entries({standard:70,comfort:80,comfort_plus:90,minivan:110})) {
        const price=body.legs[0].fast.pricingByVehicle[vehicle];
        assert.equal(price.totalPrice, 60*rate);
        assert.equal(price.pricingSegments.length,1);
        assert.equal(price.pricingSegments[0].tariffType,"special");
      }
    }
    assert.ok(requested.some(url=>url.startsWith("router.project-osrm.org")));
    assert.equal(requested.some(url=>url.startsWith("photon.komoot.io")),false);
  } finally { globalThis.fetch = originalFetch; }
});
test("V3 does not relabel an outside detour as a fully internal route", async () => {
  globalThis.fetch = async input => {
    const url=new URL(String(input));
    if(url.hostname==="router.project-osrm.org")return respond({routes:[{
      distance:300_000,duration:20_000,
      geometry:{coordinates:[[37.8029,48.0156],[39.2,47.2],[37.4968,47.6019]]},legs:[],
    }]});
    return respond({},503);
  };
  try {
    const response=await POST(request());
    const body=await response.json();
    assert.notEqual(response.status,200);
    assert.equal(body.specialOnly,undefined);
    assert.equal(body.legs,undefined);
  } finally {globalThis.fetch=originalFetch;}
});
