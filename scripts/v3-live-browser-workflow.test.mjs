import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const workflow=readFileSync(new URL('../.github/workflows/v3-live-browser-acceptance.yml',import.meta.url),'utf8');
const runner=readFileSync(new URL('./v3-live-browser-acceptance.mjs',import.meta.url),'utf8');

test('new workflow is limited to V3 acceptance files and has explicit read-only permissions',()=>{
  assert.match(workflow,/name: V3 live browser acceptance/);
  assert.match(workflow,/permissions:\s*\n\s*contents: read/);
  assert.match(workflow,/scripts\/v3-live-browser-acceptance\.mjs/);
  assert.match(workflow,/scripts\/v3-live-browser-workflow\.test\.mjs/);
  assert.match(workflow,/actions\/upload-artifact@v4/);
});
test('V3 browser suite uses real suggestions and real calculation responses',()=>{
  assert.match(runner,/waitForResponse/);
  assert.match(runner,/\/api\/v3\/calculate/);
  assert.match(runner,/\/api\/version/);
  assert.doesNotMatch(runner,/route\.fulfill\(/);
  assert.doesNotMatch(runner,/\*\*\/api\/v3\/calculate['"]/);
  assert.doesNotMatch(runner,/\*\*\/r['"]/);
  assert.match(runner,/context\.route\('\*\*\/api\/collect',\s*route\s*=>\s*route\.abort\('blockedbyclient'\)\)/);
});
test('all eight scenarios are named and the source SHA is surfaced',()=>{
  for(let i=1;i<=8;i++)assert.match(runner,new RegExp(`\\['${String(i).padStart(2,'0')}',`));
  assert.match(runner,/deployedSha/);
  assert.match(runner,/deployedVersionIdentified/);
  assert.match(runner,/Выбран маршрут/);
  assert.doesNotMatch(runner,/Самый быстрый маршрут/);
  assert.match(runner,/displayedDistance/);
  assert.match(runner,/displayedDuration/);
});
