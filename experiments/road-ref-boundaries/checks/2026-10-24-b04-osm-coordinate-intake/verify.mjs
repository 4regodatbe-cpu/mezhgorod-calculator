import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => JSON.parse(fs.readFileSync(path.join(here, name), "utf8"));
const element = (name) => {
  const document = read(path.join("raw", name));
  assert.equal(document.elements.length, 1);
  return document.elements[0];
};

const entryNode = element("node-4443232947.json");
const exitNode = element("node-358467208.json");
const entryIncoming = element("way-447135768.json");
const entryOutgoing = element("way-1182567076.json");
const exitIncoming = element("way-1211606940.json");
const exitOutgoing = element("way-28835034.json");
const reviewed = read("reviewed-identity.json");

assert.deepEqual([entryNode.lat, entryNode.lon], [47.5105556, 39.9708171]);
assert.deepEqual([exitNode.lat, exitNode.lon], [48.186303, 40.265878]);
assert.equal(entryIncoming.nodes.at(-1), entryNode.id);
assert.equal(entryOutgoing.nodes.at(0), entryNode.id);
assert.equal(exitIncoming.nodes.at(-1), exitNode.id);
assert.equal(exitOutgoing.nodes.at(0), exitNode.id);
assert.equal(entryOutgoing.tags.ref, "М-4");
assert.equal(entryOutgoing.tags.toll, "yes");
assert.equal(exitIncoming.tags.ref, "М-4");
assert.equal(exitOutgoing.tags.ref, "Р-260");
assert.equal(reviewed.runtimeEligible, false);
assert.equal(reviewed.officialKilometre, null);
assert.equal(reviewed.operatorScope, null);
assert.equal(reviewed.fare, null);
assert.ok(reviewed.boundaries.every((boundary) => boundary.directedMembershipVerified));

console.log(JSON.stringify({ status: "PASS", checks: 15, liveRequests: 0 }));
