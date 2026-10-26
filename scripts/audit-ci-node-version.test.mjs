import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const packageJson = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
const expectedMajor = /^([0-9]+)\.x$/.exec(packageJson.engines.node)?.[1];
assert.ok(expectedMajor, `Unexpected Node engine: ${packageJson.engines.node}`);

for (const path of [
  '.github/workflows/route-quality.yml',
  '.github/workflows/systemic-toll-composition.yml',
]) {
  test(`${path} runs the package Node.js ${expectedMajor}.x engine`, () => {
    const workflow = readFileSync(new URL(path, root), 'utf8');
    const versions = [...workflow.matchAll(/^\s+node-version:\s*['"]?([^'"\s]+)['"]?\s*$/gm)].map(match => match[1]);
    assert.equal(versions.length, 1, 'expected exactly one setup-node version');
    assert.ok(versions[0] === expectedMajor || versions[0] === `${expectedMajor}.x`, `found Node ${versions[0]}`);
  });
}
