import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const workflow=readFileSync(new URL('../.github/workflows/b03-address-ui-browser.yml',import.meta.url),'utf8');
const runner=readFileSync(new URL('../experiments/road-ref-boundaries/scripts/b03-current-input-flow.mjs',import.meta.url),'utf8');
function eventPaths(event) {
  const lines=workflow.split('\n');
  const start=lines.indexOf(`  ${event}:`);
  assert.notEqual(start,-1,`Missing event: ${event}`);
  let end=start+1;
  while(end<lines.length&&!/^(?:\S|  \S)/u.test(lines[end]))end++;
  return lines.slice(start+1,end).flatMap(line=>{
    const match=line.match(/^      - (\S+)\s*$/u);
    return match?[match[1]]:[];
  });
}
test('AddressField updates trigger browser checks on PR as well as push',()=>{
  for(const event of ['push','pull_request']) {
    const paths=eventPaths(event);
    assert.ok(paths.includes('app/v2/components/address-field.tsx'));
    assert.ok(paths.includes('experiments/road-ref-boundaries/scripts/b03-current-input-flow.mjs'));
  }
  assert.ok(workflow.includes('github.event.pull_request.head.sha || github.sha'));
  assert.ok(workflow.includes("node-version: '24.x'"));
});
for(const event of ['push','pull_request']) {
  test(`Snapshot changes trigger B03 browser checks on ${event}`,()=>{
    assert.ok(eventPaths(event).includes('data/address-city-snapshot.json'),`${event} must track the snapshot itself, independently of the other event`);
  });
}
test('CI executes new swap/refocus regression and preserves old suite failures',()=>{
  assert.match(workflow,/node experiments\/road-ref-boundaries\/scripts\/b03-current-input-flow\.mjs/);
  assert.match(workflow,/node experiments\/road-ref-boundaries\/scripts\/b03-address-ui-scenarios\.mjs/);
  assert.match(runner,/07-swap-and-refocus/);
  assert.match(runner,/Selected swapped B must not reopen old Anapa suggestions/);
  assert.ok(workflow.includes('"$legacy_code" -ne 0')&&workflow.includes('"$current_code" -ne 0'));
  assert.ok(!workflow.includes('b03-live-replacement.mjs'));
  assert.ok(workflow.includes('actions/upload-artifact@v4'));
});
test('push-only B03 runs retain the original mandatory offline verify commands',()=>{
  assert.match(workflow,/\n  verify:\n/);
  for(const command of [
    'node --import ./scripts/register-ts-paths.mjs --test scripts/*test.ts',
    'node scripts/special-territory-live-push-classifier.test.mjs',
    'node scripts/v2-issue2-github-capture.test.mjs',
    'pnpm test:audit',
    'node node_modules/typescript/bin/tsc --noEmit',
    'node node_modules/next/dist/bin/next build',
  ]) assert.ok(workflow.includes(command),command);
  for(const broad of ['special-territory-live-probe.mjs','settlement-random-route-audit.mjs','yandex-route-reference-audit.mjs','calculation-runtime-probe.mjs']) assert.ok(!workflow.includes(broad));
});
