import assert from 'node:assert/strict';
import test from 'node:test';
import { ESLint } from 'eslint';

test('native experiment CommonJS accepts require while TS and ESM keep the import restriction', async () => {
  const lint = new ESLint();
  const code = 'const fs = require("node:fs"); console.log(fs);\n';
  const commonjsPath = 'experiments/nationwide-tolls/scripts/lint-policy-proof.cjs';
  const [commonjs] = await lint.lintText(code, { filePath: commonjsPath });
  assert.equal(commonjs.errorCount, 0);
  assert.equal((await lint.calculateConfigForFile(commonjsPath)).languageOptions.sourceType, 'commonjs');
  for (const filePath of ['lib/lint-policy-proof.ts', 'experiments/nationwide-tolls/scripts/lint-policy-proof.mjs', 'scripts/lint-policy-proof.cjs']) {
    const [result] = await lint.lintText(code, { filePath });
    assert.ok(result.messages.some(x => x.ruleId === '@typescript-eslint/no-require-imports' && x.severity === 2), filePath);
  }
});
