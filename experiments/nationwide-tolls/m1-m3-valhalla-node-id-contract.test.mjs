import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
const text=readFileSync(new URL("../../lib/toll-validator.ts",import.meta.url),"utf8");
test("full-route toll validator requests Valhalla end OSM node id like proven M4 local tracer",()=>{
 assert.match(text,/"edge\.end_osm_node_id"/);
 assert.doesNotMatch(text,/"node\.osm_id"/);
});
test("Valhalla toll booth node reader accepts both nested end_node and flattened end_osm_node_id",()=>{
 assert.match(text,/edge\.end_node\?\.node_id\s*\?\?\s*edge\.end_osm_node_id\s*\?\?\s*edge\.node_id/);
});
test("full route must still validate all route chunks before asserting completeness",()=>{
 assert.match(text,/failed\.length === 0 && successful\.length === chunks\.length/);
 assert.match(text,/boothEventCoverage: "complete"/);
});
