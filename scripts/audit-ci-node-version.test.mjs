import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const packageJson = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
const expectedMajor = /^([0-9]+)\.x$/.exec(packageJson.engines.node)?.[1];
assert.ok(expectedMajor, `Unexpected Node engine: ${packageJson.engines.node}`);

function assertNodeSetups(workflow, expectedSetups) {
  const versions = [...workflow.matchAll(/^\s+node-version:\s*['"]?([^'"\s]+)['"]?\s*$/gm)].map(match => match[1]);
  assert.equal(versions.length, expectedSetups, 'expected the exact reviewed setup-node count');
  for (const version of versions) {
    assert.ok(version === expectedMajor || version === `${expectedMajor}.x`, `found Node ${version}`);
  }
}

for (const [path, expectedSetups] of [
  // The previously approved isolated build-only job is a second Node24 setup.
  ['.github/workflows/route-quality.yml', 2],
  ['.github/workflows/systemic-toll-composition.yml', 1],
]) {
  test(`${path} runs the package Node.js ${expectedMajor}.x engine`, () => {
    const workflow = readFileSync(new URL(path, root), 'utf8');
    assertNodeSetups(workflow, expectedSetups);
  });
}

test('every Node setup is checked and missing/extra setups remain failures', () => {
  const two = "    node-version: '24'\n    node-version: '24.x'\n";
  assertNodeSetups(two, 2);
  assert.throws(() => assertNodeSetups(two.replace("'24'", "'22'"), 2));
  assert.throws(() => assertNodeSetups(two.replace("'24.x'", "'22.x'"), 2));
  assert.throws(() => assertNodeSetups("    node-version: '24'\n", 2));
  assert.throws(() => assertNodeSetups(two + "    node-version: '24'\n", 2));
});
