import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
export const root = resolve(dirname(new URL(import.meta.url).pathname), '../..');
// Execute actual TS modules and actual registry/adapters; no mocked toll prices or gates.
const cache = new Map();
export function load(file) {
  if (!existsSync(file)) file += '.ts';
  if (!file.endsWith('.ts')) return require(file);
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} }; cache.set(file, mod);
  const source = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { module: mod, exports: mod.exports, require: name => name.startsWith('@/') ? load(resolve(root, name.slice(2))) : name.startsWith('.') ? load(resolve(dirname(file), name)) : require(name) }, { filename: file });
  return mod.exports;
}
