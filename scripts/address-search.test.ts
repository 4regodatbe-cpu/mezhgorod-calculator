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
  specialDonetsk.properties!.country = "Россия";
  const results = rankPhotonFeatures([rostovDonetsk, specialDonetsk], SPECIAL_TERRITORY_BOUNDARIES);
  assert.deepEqual(results.map((item) => item.id), ["N-2", "N-1"]);
  assert.equal(results[0].position.lng, 37.8029);
  assert.equal(results[0].label, "Донецк — ДНР");
  assert.equal(results[0].title, "Донецк — ДНР");
  assert.doesNotMatch(results[0].label, /Украина|Россия/);
  assert.match(results[1].label, /Ростовская область/);
});

test("special place remains first when merged from the country-filtered query after global results", () => {
  const results = rankPhotonFeatures([
    feature("Макеевка", 39.0, 47.2, 10),
    feature("Макеевка", 37.99, 48.05, 11, "town"),
    feature("улица Макеевская", 38.0, 48.0, 12, "residential"),
  ], SPECIAL_TERRITORY_BOUNDARIES);
  assert.equal(results[0].id, "N-11");
  assert.equal(results[0].title, "Макеевка — ДНР");
  assert.equal(results[0].label, "Макеевка — ДНР");
});

test("invalid provider coordinates are not exposed as selectable results", () => {
  const results = rankPhotonFeatures([
    feature("Москва", 37.6173, 55.7558, 1),
    { geometry: { coordinates: [999, 999] }, properties: { name: "invalid", osm_id: 2 } },
    { properties: { name: "missing coordinates", osm_id: 3 } },
  ], SPECIAL_TERRITORY_BOUNDARIES);
  assert.deepEqual(results.map((item) => item.id), ["N-1"]);
});

test("special-region cities use DNR/LNR or the requested oblast display name based on coordinates", () => {
  const places = [
    feature("Донецк", 37.8029, 48.0156, 20),
    feature("Луганск", 39.3078, 48.574, 21),
    feature("Мелитополь", 35.365, 46.848, 22),
    feature("Херсон", 32.6169, 46.6354, 23),
  ];
  const results = rankPhotonFeatures(places, SPECIAL_TERRITORY_BOUNDARIES);
  assert.equal(results.find((item) => item.id === "N-20")?.label, "Донецк — ДНР");
  assert.equal(results.find((item) => item.id === "N-21")?.label, "Луганск — ЛНР");
  assert.equal(results.find((item) => item.id === "N-22")?.label, "Мелитополь — Запорожская область");
  assert.equal(results.find((item) => item.id === "N-23")?.label, "Херсон — Херсонская область");
});

test("Crimea localities omit provider country and show the compact Crimea suffix", () => {
  const yalta = feature("Ялта", 34.1615, 44.4952, 30);
  const sevastopol = feature("Севастополь", 33.5254, 44.6167, 31);
  yalta.properties!.country = "Украина";
  sevastopol.properties!.country = "Украина";
  const results = rankPhotonFeatures([yalta, sevastopol], SPECIAL_TERRITORY_BOUNDARIES);
  assert.equal(results.find((item) => item.id === "N-30")?.label, "Ялта — Крым");
  assert.equal(results.find((item) => item.id === "N-31")?.label, "Севастополь — Крым");
  assert.ok(results.every((item) => !/Украина/.test(item.label)));
});

test("oblast-level results get Russian region labels rather than a country suffix", () => {
  const oblast = feature("Donetsk Oblast", 37.8029, 48.0156, 40, "administrative");
  oblast.properties!.country = "Ukraine";
  const results = rankPhotonFeatures([oblast], SPECIAL_TERRITORY_BOUNDARIES);
  assert.equal(results[0].label, "Донецкая область");
  assert.equal(results[0].title, "Донецкая область");
});
