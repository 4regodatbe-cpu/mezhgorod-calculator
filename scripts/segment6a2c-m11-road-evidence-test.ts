import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  deriveM11EvidenceFromOsrm,
  deriveM11EvidenceFromValhalla,
  type M11OsrmLeg,
  type M11ValhallaLeg,
} from "../lib/toll-engine/m11-road-evidence.ts";

const fixtures = JSON.parse(await readFile(new URL("../data/m11-road-evidence-fixtures.json", import.meta.url), "utf8"));

function close(actual: number | null, expected: number, label: string) {
  assert.notEqual(actual, null, `${label}: expected numeric km`);
  assert.ok(Math.abs((actual as number) - expected) <= 0.001, `${label}: expected ${expected}, got ${actual}`);
}

for (const fixture of fixtures.valhalla as Array<{ id: string; legs: M11ValhallaLeg[]; expected: Record<string, number> }>) {
  const result = deriveM11EvidenceFromValhalla(fixture.legs);
  const expected = fixture.expected;
  assert.equal(result.provider, "valhalla", `${fixture.id}: provider`);
  assert.equal(result.strictBlocks.length, expected.strictBlocks, `${fixture.id}: strict block count`);
  assert.equal(result.malformedStrictCount, expected.malformedStrictCount, `${fixture.id}: malformed count`);
  assert.equal(result.candidateClues.length, expected.candidateClues, `${fixture.id}: candidate clue count`);
  if (result.strictBlocks.length > 0) {
    assert.equal(result.strictBlocks[0].sourceStartIndex, expected.firstSourceIndex, `${fixture.id}: first source index`);
    assert.equal(result.strictBlocks.at(-1)?.sourceEndIndex, expected.lastSourceIndex, `${fixture.id}: last source index`);
  }
  if (fixture.id === "malformed-index-break") {
    assert.deepEqual(result.strictBlocks.map((block) => [block.sourceStartIndex, block.sourceEndIndex]), [[0, 0], [2, 2]], `${fixture.id}: malformed item must break continuity`);
  }
  console.log(`M11_EVIDENCE_FIXTURE_OK valhalla ${fixture.id} blocks=${result.strictBlocks.length} malformed=${result.malformedStrictCount}`);
}

for (const fixture of fixtures.osrm as Array<{ id: string; legs: M11OsrmLeg[]; expected: any }>) {
  const result = deriveM11EvidenceFromOsrm(fixture.legs);
  const expected = fixture.expected;
  assert.equal(result.provider, "osrm", `${fixture.id}: provider`);
  assert.equal(result.strictBlocks.length, expected.strictBlocks, `${fixture.id}: strict block count`);
  assert.equal(result.malformedStrictCount, expected.malformedStrictCount, `${fixture.id}: malformed count`);
  assert.equal(result.candidateClues.length, expected.candidateClues, `${fixture.id}: candidate clue count`);

  if (expected.blockSourceRanges) {
    assert.deepEqual(
      result.strictBlocks.map((block) => [block.sourceStartIndex, block.sourceEndIndex]),
      expected.blockSourceRanges,
      `${fixture.id}: block source ranges`,
    );
  }
  if (expected.blockBeginKm) {
    expected.blockBeginKm.forEach((value: number, index: number) => close(result.strictBlocks[index].beginKm, value, `${fixture.id}: block ${index} begin`));
  }
  if (expected.blockEndKm) {
    expected.blockEndKm.forEach((value: number, index: number) => close(result.strictBlocks[index].endKm, value, `${fixture.id}: block ${index} end`));
  }
  if (expected.candidateSourceIndex !== undefined) {
    assert.equal(result.candidateClues[0]?.sourceIndex, expected.candidateSourceIndex, `${fixture.id}: candidate source index`);
    assert.ok(result.candidateClues[0]?.reasons.includes(expected.candidateReason), `${fixture.id}: missing candidate reason ${expected.candidateReason}`);
  }
  if (fixture.id === "northbound-two-blocks-with-gap") {
    assert.equal(result.strictBlocks[0].sourceEndIndex + 2, result.strictBlocks[1].sourceStartIndex, `${fixture.id}: unlabeled source step must remain an explicit gap`);
  }
  if (fixture.id === "southbound-destination-clue-not-strict") {
    assert.equal(result.strictBlocks[0].sourceStartIndex, 2, `${fixture.id}: destination-only step must not become strict`);
  }
  console.log(`M11_EVIDENCE_FIXTURE_OK osrm ${fixture.id} blocks=${result.strictBlocks.length} clues=${result.candidateClues.length}`);
}

console.log(`M11_EVIDENCE_FIXTURES_GREEN valhalla=${fixtures.valhalla.length} osrm=${fixtures.osrm.length}`);
