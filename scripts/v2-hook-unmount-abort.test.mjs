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

function harness(fetch, clipboard = { writeText: async () => {} }) {
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
    Error,
    fetch,
    navigator: { clipboard },
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

test('unknown V2 road price stays unknown in copied quote instead of becoming zero', async () => {
  let copied = '';
  const h = harness(async () => Response.json({}), { writeText: async text => { copied = text; } });
  const fare = { totalPrice: 44_516, requiresSplit: false };
  const trip = {
    meters: 100_000,
    seconds: 3_600,
    pricingByVehicle: Object.fromEntries(['standard', 'comfort', 'comfort_plus', 'minivan'].map(key => [key, fare])),
  };
  const toll = { amount: null, weekdayAmount: null, weekendAmount: null, period: 'unknown', segments: [], confidence: 'none', pricingStatus: 'unknown' };
  const leg = { from: 'A', to: 'B' };

  await h.hook.copyStandard('unknown', 'route', leg, trip, toll, undefined, 'actual');

  assert.match(copied, /Стоимость платных дорог неизвестна/);
  assert.match(copied, /44[\s\u00a0\u202f]?516 ₽ платные дороги: сумма неизвестна = итого не рассчитано/);
  assert.doesNotMatch(copied, /=\s*0(?:[,.]00)?\s*₽/);
  h.cleanup();
});

test('V2 preserves safe API error messages for client, upstream and timeout responses', async () => {
  for (const [status, message] of [[400, 'Проверьте адреса.'], [500, 'Сервис временно недоступен.'], [502, 'Маршрутизатор временно недоступен.'], [504, 'Время ожидания маршрута истекло.']]) {
    const h = harness(async () => Response.json({ error: message }, { status }));
    await h.hook.calculate();
    assert.equal(h.states[1], message, `HTTP ${status} keeps its safe client message`);
    h.cleanup();
  }
});

test('V2 hides unexpected request exception details and allows retry', async () => {
  let calls = 0;
  const safeMessage = 'Не удалось выполнить расчёт. Проверьте соединение и повторите попытку.';
  const data = { legs: [{ from: 'A', to: 'B', fast: { meters: 10_000, seconds: 1_000, tolls: { pricingStatus: 'unknown' } } }] };
  const h = harness(async () => {
    calls += 1;
    if (calls === 1) throw new Error('provider.internal.example/private-token');
    return Response.json(data);
  });

  await h.hook.calculate();
  assert.equal(h.states[1], safeMessage);
  assert.doesNotMatch(h.states[1], /private-token|provider\.internal/);

  await h.hook.calculate();
  assert.equal(h.states[1], '');
  assert.equal(h.states[0].legs[0].from, 'A');
  h.cleanup();
});

test('V2 rejects malformed successful JSON with a safe incomplete-route message', async () => {
  const h = harness(async () => new Response('{malformed', { status: 200 }));
  await h.hook.calculate();
  assert.equal(h.states[0], null);
  assert.equal(h.states[1], 'Маршрут получен не полностью. Повторите расчёт.');
  assert.equal(h.states[2], false);
  h.cleanup();
});
