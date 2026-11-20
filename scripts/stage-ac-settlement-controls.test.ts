import test from "node:test";
import assert from "node:assert/strict";
import { searchLocalSettlements } from "../lib/local-settlement-search";

test("Stage AC city controls remain selectable from admitted GeoNames corpus without Photon", async () => {
  const keys = ["GEONAMES_LOCAL_PILOT", "GEONAMES_LOCAL_TEST", "GEONAMES_LOCAL_PILOT_DIR", "VERCEL", "VERCEL_ENV"];
  const saved = keys.map(key => process.env[key]);
  try {
    process.env.GEONAMES_LOCAL_PILOT = "1"; process.env.GEONAMES_LOCAL_TEST = "1";
    delete process.env.GEONAMES_LOCAL_PILOT_DIR; delete process.env.VERCEL; delete process.env.VERCEL_ENV;
    for (const query of ["Краснодар", "Горячий Ключ", "Ростов-на-Дону", "Донецк ДНР", "Волноваха", "Мелитополь", "Ялта", "Симферополь", "Москва", "Казань"]) {
      const result = await searchLocalSettlements(query);
      assert.ok(result?.items.length, query);
      assert.equal(result.localSource.provider, "geonames");
      assert.ok(result.items.every(item => item.position && Number.isFinite(item.position.lat) && Number.isFinite(item.position.lng)), query);
    }
    const dnr = await searchLocalSettlements("Донецк ДНР");
    const other = await searchLocalSettlements("Донецк Ростовская область");
    assert.notEqual(dnr?.items[0].id, other?.items[0].id);
  } finally { keys.forEach((key, index) => { if (saved[index] === undefined) delete process.env[key]; else process.env[key] = saved[index]; }); }
});
