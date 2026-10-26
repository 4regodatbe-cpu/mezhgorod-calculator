import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { load, root } from './helpers/load-ts.mjs';

const require = createRequire(import.meta.url);
const ts = require('typescript');

function deferred() {
  let resolvePromise;
  const promise = new Promise(resolve => { resolvePromise = resolve; });
  return { promise, resolve: resolvePromise };
}

function harness(fetch) {
  const states = [];
  const cleanups = [];
  const react = {
    useRef: current => ({ current }),
    useState: initial => {
      const index = states.length;
      states.push(initial);
      return [initial, value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    },
    useEffect: effect => {
      const cleanup = effect();
      if (cleanup) cleanups.push(cleanup);
    },
  };
  const file = resolve(root, 'app/v2/components/use-v2-calculation.ts');
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(code, {
    module: mod,
    exports: mod.exports,
    AbortController,
    fetch,
    navigator: { clipboard: { writeText: async () => {} } },
    setTimeout,
    clearTimeout,
    require: name => name === 'react'
      ? react
      : name.startsWith('.')
        ? load(resolve(dirname(file), name))
        : require(name),
  }, { filename: file });
  const hook = mod.exports.useV2Calculation({
    from: { label: 'A' },
    to: { label: 'B' },
    rates: { standard: 1, comfort: 1, comfortPlus: 1, minivan: 1 },
    specialRates: { standard: 1, comfort: 1, comfortPlus: 1, minivan: 1 },
    requestMode: () => ({ mode: 'standard', modeOverride: false }),
    onServerMode: () => {},
    multiplier: 1,
  });
  return { hook, states, cleanup: () => cleanups.forEach(cleanup => cleanup()) };
}

test('unmount aborts the active V2 calculation and blocks its late response', async () => {
  const pending = deferred();
  let signal;
  const h = harness(async (_url, options) => {
    signal = options.signal;
    return pending.promise;
  });

  const calculation = h.hook.calculate();
  assert.ok(signal, 'the request has an AbortSignal');
  assert.equal(signal.aborted, false);
  h.cleanup();
  pending.resolve(Response.json({}));
  await calculation;

  assert.equal(signal.aborted, true, 'unmount aborts the in-flight fetch');
  assert.equal(h.states[0], null, 'late response does not set a result');
});
