import test from "node:test";
import assert from "node:assert/strict";
import { SPECIAL_TERRITORY_BOUNDARIES } from "../lib/special-territory-boundaries.ts";
import { photonSearchUrls, rankPhotonFeatures, type PhotonFeature } from "../lib/photon-address-search.ts";

const feature = (name: string, lng: number, lat: number, osmId: number, osmValue = "city"): PhotonFeature => ({
  geometry: { coordinates: [lng, lat] },
  properties: { name, city: name, state: name === "Донецк" ? (lng > 38 ? "Ростовская область" : "Донецкая область") : "Луганская область", country: lng > 38 ? "Россия" : "Украина", osm_type: "N", osm_id: osmId, osm_value: osmValue },
});

test("searches globally and separately within Ukraine without unsupported language parameter", () => {
  const urls = photonSearchUrls("Донецк").map((value) => new URL(value));
  assert.equal(urls.length, 2);
  assert.equal(urls[0].searchParams.get("q"), "Донецк");
  assert.equal(urls[0].searchParams.get("countrycode"), null);
  assert.equal(urls[0].searchParams.get("limit"), "20");
  assert.equal(urls[1].searchParams.get("countrycode"), "UA");
  assert.equal(urls[1].searchParams.get("lang"), null);
});

test("same-name city inside a special ADM1 polygon ranks above its Russian namesake by coordinates", () => {
  const rostovDonetsk = feature("Донецк", 39.7, 47.23, 1);
  const specialDonetsk = feature("Донецк", 37.8029, 48.0156, 2);
  const results = rankPhotonFeatures([rostovDonetsk, specialDonetsk], SPECIAL_TERRITORY_BOUNDARIES);
  assert.deepEqual(results.map((item) => item.id), ["N-2", "N-1"]);
  assert.equal(results[0].position.lng, 37.8029);
  assert.match(results[0].label, /Донецкая область/);
  assert.match(results[1].label, /Ростовская область/);
});

test("special place remains first when merged from the country-filtered query after global results", () => {
  const results = rankPhotonFeatures([
    feature("Макеевка", 39.0, 47.2, 10),
    feature("Макеевка", 37.99, 48.05, 11, "town"),
    feature("улица Макеевская", 38.0, 48.0, 12, "residential"),
  ], SPECIAL_TERRITORY_BOUNDARIES);
  assert.equal(results[0].id, "N-11");
  assert.equal(results[0].title, "Макеевка");
});

test("invalid provider coordinates are not exposed as selectable results", () => {
  const results = rankPhotonFeatures([
    feature("Москва", 37.6173, 55.7558, 1),
    { geometry: { coordinates: [999, 999] }, properties: { name: "invalid", osm_id: 2 } },
    { properties: { name: "missing coordinates", osm_id: 3 } },
  ], SPECIAL_TERRITORY_BOUNDARIES);
  assert.deepEqual(results.map((item) => item.id), ["N-1"]);
});
