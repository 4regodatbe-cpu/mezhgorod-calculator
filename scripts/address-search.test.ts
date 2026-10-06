import test from "node:test";
import assert from "node:assert/strict";
import { SPECIAL_TERRITORY_BOUNDARIES } from "../lib/special-territory-boundaries.ts";
import { photonSearchUrls, rankPhotonFeatures, type PhotonFeature } from "../lib/photon-address-search.ts";

const feature = (name: string, lng: number, lat: number, osmId: number, osmValue = "city"): PhotonFeature => ({
  geometry: { coordinates: [lng, lat] },
  properties: { name, city: name, state: name === "Донецк" ? (lng > 38 ? "Ростовская область" : "Донецкая область") : "Луганская область", country: lng > 38 ? "Россия" : "Украина", osm_key: ["city", "town", "village", "hamlet", "locality", "municipality", "isolated_dwelling", "farm"].includes(osmValue) ? "place" : osmValue === "administrative" ? "boundary" : "highway", osm_type: "N", osm_id: osmId, osm_value: osmValue },
});

test("searches globally and separately within Ukraine using Photon default language", () => {
  const urls = photonSearchUrls("Донецк").map((value) => new URL(value));
  assert.equal(urls.length, 2);
  assert.equal(urls[0].searchParams.get("q"), "Донецк");
  assert.equal(urls[0].searchParams.get("countrycode"), null);
  assert.equal(urls[0].searchParams.get("limit"), "20");
  assert.equal(urls[1].searchParams.get("countrycode"), "UA");
  assert.ok(urls.every((url) => url.searchParams.get("lang") === null));
});


test("Russian Makeyevka query also searches Photon using the Ukrainian locality spelling", () => {
  const urls = photonSearchUrls("Макеевка").map((value) => new URL(value));
  assert.equal(urls.length, 3);
  assert.equal(urls[2].searchParams.get("q"), "Макіївка");
  assert.equal(urls[2].searchParams.get("countrycode"), "UA");
  assert.equal(urls[2].searchParams.get("layer"), null);
});

test("all special-oblast queries search provider aliases in Ukraine's state layer", () => {
  const cases = [
    ["Донецкая область", ["Донецька область", "Donetsk Oblast"]],
    ["Луганская область", ["Луганська область", "Luhansk Oblast"]],
    ["Запорожская область", ["Запорізька область", "Zaporizhzhia Oblast"]],
    ["Херсонская область", ["Херсонська область", "Kherson Oblast"]],
  ] as const;
  for (const [query, aliases] of cases) {
    const urls = photonSearchUrls(query).map((value) => new URL(value));
    assert.equal(urls.length, 4, query);
    assert.deepEqual(urls.slice(2).map((url) => url.searchParams.get("q")), aliases, query);
    assert.ok(urls.slice(2).every((url) => url.searchParams.get("countrycode") === "UA"), query);
    assert.ok(urls.slice(2).every((url) => url.searchParams.get("layer") === "state"), query);
  }
});

test("exact matches in all five high-demand areas rank before ordinary namesakes", () => {
  const results = rankPhotonFeatures([
    feature("Ялта", 38.1, 44.5, 7),
    feature("Ялта", 37.2776, 46.9589, 8),
    feature("Ялта", 39.99, 48.316, 9),
    feature("Ялта", 35.365, 46.848, 10),
    feature("Ялта", 32.6169, 46.6354, 11),
    feature("Ялта", 34.1689, 44.4988, 12),
  ], SPECIAL_TERRITORY_BOUNDARIES, "Ялта");
  assert.deepEqual(results.slice(0, 5).map((item) => item.id), ["N-8", "N-9", "N-10", "N-11", "N-12"]);
  assert.equal(results[5].id, "N-7");
});

test("Donetsk search orders DNR first, Rostov Oblast second, then other namesakes", () => {
  const dnr = feature("Донецк", 37.8029, 48.0156, 13);
  const rostov = feature("Донецк", 39.7, 47.23, 14);
  const other = feature("Донецк", 132.5, 50.0, 15);
  other.properties!.state = "Амурская область";
  const crimea = feature("Донецк", 34.1689, 44.4988, 16);
  crimea.properties!.state = "Республика Крым";
  const results = rankPhotonFeatures([other, crimea, rostov, dnr], SPECIAL_TERRITORY_BOUNDARIES, "Донецк");
  assert.deepEqual(results.map((item) => item.id), ["N-13", "N-14", "N-16", "N-15"]);
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

test("Ukrainian Makeyevka spelling is matched and displayed in Russian for a Russian query", () => {
  const makeyevka = feature("Макіївка", 37.9028, 48.0171, 72, "town");
  const results = rankPhotonFeatures([makeyevka], SPECIAL_TERRITORY_BOUNDARIES, "Макеевка");
  assert.equal(results[0].label, "Макеевка — ДНР");
  assert.equal(results[0].title, "Макеевка — ДНР");
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

test("priority-territory settlement named Moscow outranks the Russian city, while unrelated POIs stay secondary", () => {
  const dnrVillage = feature("Москва", 37.8055, 47.9954, 80, "village");
  dnrVillage.properties!.city = "Донецк";
  dnrVillage.properties!.state = "Донецкая область";
  const crimeaPoi = feature("Москва", 33.5187, 44.5788, 81, "shop");
  crimeaPoi.properties!.osm_key = "shop";
  crimeaPoi.properties!.city = "Севастополь";
  crimeaPoi.properties!.state = "Республика Крым";
  const moscowCity = feature("Москва", 37.6173, 55.7558, 82, "city");
  moscowCity.properties!.osm_type = "R";
  moscowCity.properties!.country = "Россия";
  moscowCity.properties!.state = "Москва";
  const results = rankPhotonFeatures([dnrVillage, crimeaPoi, moscowCity], SPECIAL_TERRITORY_BOUNDARIES, "Москва");
  assert.equal(results[0].id, "N-80");
  assert.equal(results[0].label, "Москва — ДНР");
  assert.equal(results[1].id, "R-82");
  assert.equal(results[1].label, "Москва, Россия");
  const crimeaItem = results.find((item) => item.id === "N-81");
  assert.ok(crimeaItem);
  assert.match(crimeaItem.label, /Севастополь/u);
  assert.doesNotMatch(crimeaItem.label, / — Крым$/u);
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

test("exact oblast result outranks a partial locality name during a region search", () => {
  const partialLocality = feature("Донецкая", 39.9073, 48.3006, 63, "town");
  partialLocality.properties!.state = "Ростовская область";
  const exactOblast = feature("Донецкая область", 37.781, 47.921, 64, "administrative");
  const results = rankPhotonFeatures([partialLocality, exactOblast], SPECIAL_TERRITORY_BOUNDARIES, "Донецкая область");
  assert.equal(results[0].id, "N-64");
  assert.equal(results[0].label, "Донецкая область");
});

test("localized Ukrainian oblast result matches a Russian region query by its explicit alias", () => {
  const ukrOblast = feature("Донецька область", 37.8029, 48.0156, 62, "administrative");
  ukrOblast.properties!.country = "Ukraine";
  const results = rankPhotonFeatures([ukrOblast], SPECIAL_TERRITORY_BOUNDARIES, "Донецкая область");
  assert.equal(results[0].label, "Донецкая область");
  assert.equal(results[0].title, "Донецкая область");
});

test("Ukrainian locality spelling matches a Russian query and omits community suffix", () => {
  const donetsk = feature("Донецьк", 37.80134, 48.01587, 70, "administrative");
  donetsk.properties!.city = "Донецька міська громада";
  const makeyevka = feature("Макеевка", 37.9028, 48.0171, 71, "administrative");
  makeyevka.properties!.city = "Макіївська міська рада";
  const donetskResult = rankPhotonFeatures([donetsk], SPECIAL_TERRITORY_BOUNDARIES, "Донецк");
  const makeyevkaResults = rankPhotonFeatures([makeyevka], SPECIAL_TERRITORY_BOUNDARIES, "Макеевка");
  assert.equal(donetskResult[0].label, "Донецк — ДНР");
  assert.equal(makeyevkaResults[0].label, "Макеевка — ДНР");
  assert.equal(makeyevkaResults[0].id, "N-71");
  const luhansk = feature("Луганськ", 39.3078, 48.574, 73, "city");
  const luhanskResult = rankPhotonFeatures([luhansk], SPECIAL_TERRITORY_BOUNDARIES, "Луганск");
  assert.equal(luhanskResult[0].label, "Луганск — ЛНР");
});

test("Russian Zaporizhzhia query searches and ranks Ukrainian city spelling", () => {
  const urls = photonSearchUrls("Запорожье").map((value) => new URL(value));
  assert.equal(urls.length, 3);
  assert.equal(urls[2].searchParams.get("q"), "Запоріжжя");
  assert.equal(urls[2].searchParams.get("countrycode"), "UA");
  const results = rankPhotonFeatures([
    feature("Запоріжжя", 35.1182867, 47.8507859, 201, "city"),
    feature("Запорожье", 34.0, 44.5, 202, "village"),
  ], SPECIAL_TERRITORY_BOUNDARIES, "Запорожье");
  assert.equal(results[0].position.lat, 47.8507859);
  assert.equal(results[0].label, "Запорожье — Запорожская область");
});

test("Russian Kharkiv query with country qualifier searches Ukrainian spelling and ranks the city first", () => {
  const urls = photonSearchUrls("Харьков, Украина").map((value) => new URL(value));
  assert.equal(urls.length, 3);
  assert.equal(urls[2].searchParams.get("q"), "Харків");
  assert.equal(urls[2].searchParams.get("countrycode"), "UA");
  const results = rankPhotonFeatures([
    feature("Харьков", 34.1689, 44.4988, 203, "village"),
    feature("Харків", 36.2310146, 49.9923181, 204, "city"),
  ], SPECIAL_TERRITORY_BOUNDARIES, "Харьков, Украина");
  assert.ok(results.some((item) => item.position.lat === 49.9923181), "the Ukrainian spelling alias should return Kharkiv city");
});


test("special-region hamlet outranks Russian city with the same exact name", () => {
  const russianCity = feature("Приморск", 40.1, 47.2, 301, "city");
  russianCity.properties!.state = "Ростовская область";
  const specialHamlet = feature("Приморск", 37.8029, 48.0156, 302, "hamlet");
  specialHamlet.properties!.state = "Донецкая область";
  const results = rankPhotonFeatures([russianCity, specialHamlet], SPECIAL_TERRITORY_BOUNDARIES, "Приморск");
  assert.deepEqual(results.map((item) => item.id), ["N-302", "N-301"]);
  assert.equal(results[0].label, "Приморск — ДНР");
});

test("Donetsk DNR result remains first and Rostov Oblast namesake second across settlement sizes", () => {
  const rostov = feature("Донецк", 39.7, 47.23, 311, "town");
  rostov.properties!.state = "Ростовская область";
  const dnrHamlet = feature("Донецк", 37.8029, 48.0156, 312, "hamlet");
  const otherSpecial = feature("Донецк", 35.365, 46.848, 313, "village");
  const crimea = feature("Донецк", 34.1689, 44.4988, 314, "city");
  const results = rankPhotonFeatures([otherSpecial, crimea, rostov, dnrHamlet], SPECIAL_TERRITORY_BOUNDARIES, "Донецк");
  assert.deepEqual(results.map((item) => item.id), ["N-312", "N-311", "N-313", "N-314"]);
});

test("municipality relations are excluded and duplicate locality cards collapse", () => {
  const municipality = feature("Новопсковська селищна громада", 39.05, 49.55, 320, "municipality");
  const firstDonetsk = feature("Донецк", 37.8029, 48.0156, 318, "city");
  const duplicateDonetsk = feature("Донецк", 37.8031, 48.0157, 319, "city");
  const results = rankPhotonFeatures([municipality, firstDonetsk, duplicateDonetsk], SPECIAL_TERRITORY_BOUNDARIES, "Донецк");
  assert.deepEqual(results.map((item) => item.label), ["Донецк — ДНР"]);
});

test("transit stations and platforms are excluded while actual settlements remain selectable", () => {
  const city = feature("Донецк", 37.8029, 48.0156, 321, "city");
  const station = feature("Донецк", 37.8028, 48.0155, 322, "station");
  station.properties!.osm_key = "railway";
  const platform = feature("Донецк", 37.8027, 48.0154, 323, "platform");
  platform.properties!.osm_key = "public_transport";
  const busStop = feature("Автостанция Донецк", 37.8026, 48.0153, 324, "bus_stop");
  busStop.properties!.osm_key = "highway";
  const results = rankPhotonFeatures([station, platform, busStop, city], SPECIAL_TERRITORY_BOUNDARIES, "Донецк");
  assert.deepEqual(results.map((item) => item.id), ["N-321"]);
});

test("city query with DNR, LNR or Crimea qualifier still matches exact settlement", () => {
  const donetsk = feature("Донецк", 37.8029, 48.0156, 331);
  const yalta = feature("Ялта", 34.1615, 44.4952, 332);
  const donetskResults = rankPhotonFeatures([donetsk], SPECIAL_TERRITORY_BOUNDARIES, "Донецк ДНР");
  const yaltaResults = rankPhotonFeatures([yalta], SPECIAL_TERRITORY_BOUNDARIES, "Ялта Крым");
  assert.equal(donetskResults[0]?.label, "Донецк — ДНР");
  assert.equal(yaltaResults[0]?.label, "Ялта — Крым");
});

test("isolated dwellings and farms are included as inhabited locality types", () => {
  const farm = feature("Ферма", 37.8029, 48.0156, 341, "farm");
  const isolated = feature("Хутор", 37.8028, 48.0155, 342, "isolated_dwelling");
  const results = rankPhotonFeatures([farm, isolated], SPECIAL_TERRITORY_BOUNDARIES, "Хутор");
  assert.equal(results.find((item) => item.id === "N-341")?.label, "Ферма — ДНР");
  assert.equal(results.find((item) => item.id === "N-342")?.label, "Хутор — ДНР");
});

test("Russian localized provider name is preferred for a Ukrainian OSM settlement name", () => {
  const featureWithLocalizedName: PhotonFeature = {
    geometry: { coordinates: [39.3078, 48.574] },
    properties: { name: "Луганськ", "name:ru": "Луганск", osm_key: "place", osm_value: "city", osm_type: "N", osm_id: 351 },
  };
  const results = rankPhotonFeatures([featureWithLocalizedName], SPECIAL_TERRITORY_BOUNDARIES, "Луганск");
  assert.equal(results[0]?.label, "Луганск — ЛНР");
});


test("regional qualifier is removed from Photon query without changing full address searches", () => {
  const qualified = photonSearchUrls("Донецк ДНР").map((value) => new URL(value));
  assert.deepEqual(qualified.map((url) => url.searchParams.get("q")), ["донецк", "донецк"]);
  const fullAddress = photonSearchUrls("Москва, Тверская улица, 1").map((value) => new URL(value));
  assert.equal(fullAddress[0].searchParams.get("q"), "Москва, Тверская улица, 1");
});
