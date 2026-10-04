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
  const results = rankPhotonFeatures([rostovDonetsk, specialDonetsk], SPECIAL_TERRITORY_BOUNDARIES, "Донецк");
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
  ], SPECIAL_TERRITORY_BOUNDARIES, "Макеевка");
  assert.equal(results[0].id, "N-11");
  assert.equal(results[0].title, "Макеевка — ДНР");
  assert.equal(results[0].label, "Макеевка — ДНР");
});

test("invalid provider coordinates are not exposed as selectable results", () => {
  const results = rankPhotonFeatures([
    feature("Москва", 37.6173, 55.7558, 1),
    { geometry: { coordinates: [999, 999] }, properties: { name: "invalid", osm_id: 2 } },
    { properties: { name: "missing coordinates", osm_id: 3 } },
  ], SPECIAL_TERRITORY_BOUNDARIES, "Москва");
  assert.deepEqual(results.map((item) => item.id), ["N-1"]);
});

test("special-region cities use DNR/LNR or the requested oblast display name based on coordinates", () => {
  const places = [
    feature("Донецк", 37.8029, 48.0156, 20),
    feature("Луганск", 39.3078, 48.574, 21),
    feature("Мелитополь", 35.365, 46.848, 22),
    feature("Херсон", 32.6169, 46.6354, 23),
  ];
  const results = rankPhotonFeatures(places, SPECIAL_TERRITORY_BOUNDARIES, "Луганск");
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
  const results = rankPhotonFeatures([yalta, sevastopol], SPECIAL_TERRITORY_BOUNDARIES, "Ялта Севастополь");
  assert.equal(results.find((item) => item.id === "N-30")?.label, "Ялта — Крым");
  assert.equal(results.find((item) => item.id === "N-31")?.label, "Севастополь — Крым");
  assert.ok(results.every((item) => !/Украина/.test(item.label)));
});

test("oblast-level results get Russian region labels rather than a country suffix", () => {
  const oblast = feature("Donetsk Oblast", 37.8029, 48.0156, 40, "administrative");
  oblast.properties!.country = "Ukraine";
  const results = rankPhotonFeatures([oblast], SPECIAL_TERRITORY_BOUNDARIES, "Донецкая область");
  assert.equal(results[0].label, "Донецкая область");
  assert.equal(results[0].title, "Донецкая область");
});

test("boosts exact namesake cities in special polygons while keeping unrelated partial matches lower", () => {
  const ordinaryKrasnodar = feature("Краснодар", 38.98, 45.04, 50);
  const specialStreet = feature("Краснодарская улица", 37.931, 47.947, 51, "residential");
  const similarLnrVillage = feature("Краснодарський", 39.99, 48.316, 52, "village");
  const krasnodar = rankPhotonFeatures([ordinaryKrasnodar, specialStreet, similarLnrVillage], SPECIAL_TERRITORY_BOUNDARIES, "Краснодар");
  assert.equal(krasnodar[0].id, "N-50");
  const yaltaCrimea = feature("Ялта", 34.1689, 44.4988, 53);
  const yaltaDnr = feature("Ялта", 37.2776, 46.9589, 54);
  const yalts = rankPhotonFeatures([yaltaCrimea, yaltaDnr], SPECIAL_TERRITORY_BOUNDARIES, "Ялта");
  assert.equal(yalts[0].id, "N-54");
  assert.equal(yalts[0].label, "Ялта — ДНР");
  assert.equal(yalts[1].label, "Ялта — Крым");
});

test("region query boosts exact oblast result and not a similarly named street", () => {
  const street = feature("Донецкая улица", 39.1126, 48.1258, 60, "residential");
  const oblast = feature("Донецкая область", 37.8029, 48.0156, 61, "administrative");
  const results = rankPhotonFeatures([street, oblast], SPECIAL_TERRITORY_BOUNDARIES, "Донецкая область");
  assert.equal(results[0].id, "N-61");
  assert.equal(results[0].label, "Донецкая область");
});

test("Ukrainian locality spelling matches a Russian query and omits community suffix", () => {
  const donetsk = feature("Донецьк", 37.80134, 48.01587, 70, "administrative");
  donetsk.properties!.city = "Донецька міська громада";
  const makeyevka = feature("Макеевка", 37.9028, 48.0171, 71, "administrative");
  makeyevka.properties!.city = "Макіївська міська рада";
  const results = rankPhotonFeatures([donetsk, makeyevka], SPECIAL_TERRITORY_BOUNDARIES, "Макеевка");
  assert.equal(results.find((item) => item.id === "N-70")?.label, "Донецьк — ДНР");
  assert.equal(results.find((item) => item.id === "N-71")?.label, "Макеевка — ДНР");
  assert.equal(results[0].id, "N-71");
});
