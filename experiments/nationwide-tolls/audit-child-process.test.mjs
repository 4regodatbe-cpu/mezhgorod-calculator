import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runAuditChild } from './scripts/audit-child-process.mjs';

test('forwards progress and heartbeat before completion', async () => {
  const lines = [];
  const result = await runAuditChild(['-e', 'console.log("started");setTimeout(()=>console.log("finished"),80)'], { heartbeatMs: 10, onProgress: line => lines.push(line) });
  assert.deepEqual(result, { ok: true });
  assert.ok(lines.some(line => line.includes('started')));
  assert.ok(lines.some(line => line.includes('WAIT')));
  assert.ok(lines.findIndex(line => line.includes('started')) < lines.findIndex(line => line.includes('finished')));
});
test('terminates a silent child within its deadline', async () => {
  const result = await runAuditChild(['-e', 'setInterval(()=>{},1000)'], { timeout: 80, heartbeatMs: 20, onProgress: () => {} });
  assert.equal(result.ok, false);
  assert.equal(result.killed, true);
});
test('preserves failure code and stderr', async () => {
  const result = await runAuditChild(['-e', 'console.error("provider failed");process.exit(7)'], { onProgress: () => {} });
  assert.equal(result.ok, false);
  assert.equal(result.code, 7);
  assert.equal(result.error, 'provider failed');
});
