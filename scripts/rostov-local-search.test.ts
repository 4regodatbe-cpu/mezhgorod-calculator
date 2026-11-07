import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET } from "../app/api/suggest/route.ts";
import { POST } from "../app/r/route.ts";
import { geocode } from "../lib/route-providers.ts";
import { searchCitySnapshot } from "../lib/address-city-snapshot.ts";
import citySnapshot from "../data/address-city-snapshot.json";

test("admitted GeoNames identity displays Rostov-on-Don and keeps Yaroslavl Rostov distinct", async () => {
  const originalFetch=globalThis.fetch, oldPilot=process.env.GEONAMES_LOCAL_PILOT;
  process.env.GEONAMES_LOCAL_PILOT="1";
  let externalCalls=0;
  globalThis.fetch=async()=>{externalCalls++;throw new Error("Controlled Photon outage");};
  try {
    const lookup=async(q:string)=>{
      const response=await GET(new NextRequest("http://localhost/api/suggest?q="+encodeURIComponent(q)));
      assert.equal(response.status,200,q);
      return response.json();
    };
    const plain=await lookup("Ростов");
    assert.equal(plain.items[0].id,"geonames-501175");
    assert.equal(plain.items[0].title,"Ростов-на-Дону");
    assert.match(plain.items[0].region,/Ростовская Область/u);
    assert.deepEqual(plain.items[0].position,{lat:47.21997,lng:39.70769});
    assert.ok(plain.items.some((item:{id:string})=>item.id==="geonames-501183"));
    const qualified=await lookup("Ростов Ярославская область");
    assert.equal(qualified.items[0].id,"geonames-501183");
    assert.notEqual(qualified.items[0].position.lat,plain.items[0].position.lat);
    const exact=await lookup("Ростов-на-Дону");
    assert.equal(exact.items[0].id,"geonames-501175");
    assert.deepEqual((await geocode(plain.items[0])).position,plain.items[0].position);
    const forwarded=await POST(new NextRequest("http://localhost/r",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({query:"Ростов"})}));
    assert.equal(forwarded.status,200);
    assert.equal((await forwarded.json()).items[0].title,"Ростов-на-Дону");
    assert.equal(externalCalls,0);
  } finally {
    globalThis.fetch=originalFetch;
    if(oldPilot===undefined)delete process.env.GEONAMES_LOCAL_PILOT;else process.env.GEONAMES_LOCAL_PILOT=oldPilot;
  }
});

test("reviewed fallback keeps the full city label only within its dated validity",()=>{
  const now=Date.parse(citySnapshot.reviewedAt)+1000;
  const result=searchCitySnapshot("Ростов",{enabled:true,now,deadlineAt:now+1000});
  assert.equal(result.status,"ready");
  if(result.status!=="ready")return;
  assert.equal(result.items[0].title,"Ростов-на-Дону");
  assert.match(result.items[0].region,/Ростовская область/u);
  assert.equal(searchCitySnapshot("Ростов",{enabled:true,now:Date.parse(citySnapshot.expiresAt),deadlineAt:Date.parse(citySnapshot.expiresAt)+1000}).status,"expired");
});
