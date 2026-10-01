import assert from "node:assert/strict";
import snapshot from "../data/tolls/2026-10-01-avtodor-other-roads-category1.json" with { type: "json" };

assert.equal(snapshot.source, "https://avtodor-tr.ru/road/tariffs/");
assert.equal(snapshot.category, 1);
assert.equal(snapshot.roads["m1-33-66"].length, 1);
assert.equal(snapshot.roads.m3.length, 3);
assert.equal(snapshot.roads.ckad.length, 16);
assert.equal(snapshot.roads.a289.length, 6);
assert.equal(snapshot.roads["m1-33-66"][0].allDays.noTransponder, 250);
assert.deepEqual(snapshot.roads.m3.map((x) => [x.monThu.noTransponder, x.friSun.noTransponder]), [[100,200],[190,320],[230,280]]);
assert.equal(snapshot.roads.ckad.find((x) => x.id === "ckad-m10-m11")?.allDays.noTransponder, 60);
assert.equal(snapshot.roads.ckad.find((x) => x.id === "ckad-pk5-m10")?.allDays.noTransponder, 3189);
assert.equal(snapshot.roads.a289.find((x) => x.id === "a289-maryanskaya-temryuk")?.allDays.noTransponder, 1103);
assert.equal(snapshot.roads.a289.find((x) => x.id === "a289-maryanskaya-temryuk")?.allDays.transponder, 800);

for (const road of Object.values(snapshot.roads)) {
  for (const row of road) {
    const text = JSON.stringify(row);
    assert.equal(text.includes('"noTransponder":0'), false);
    assert.equal(text.includes('"transponder":0'), false);
  }
}
console.log("OTHER_ROAD_TARIFF_SNAPSHOT_GREEN m1=1 m3=3 ckad=16 a289=6 modes=2");
