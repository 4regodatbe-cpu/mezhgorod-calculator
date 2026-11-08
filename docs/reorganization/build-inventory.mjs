import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, normalize, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const head = process.argv[2];
if (!/^[a-f0-9]{40}$/.test(head ?? '')) throw new Error('Pass the exact git HEAD as argument');
const paths = readFileSync(0).toString('utf8').split('\0').filter(Boolean);
const pathSet = new Set(paths);
const groups = new Map();
const directoryGroups = new Map();
const references = new Map();
const crossGroup = new Map();
const largest = [];
let totalBytes = 0;

function group(path) {
  if (path.startsWith('.github/workflows/')) return 'ci';
  if (/^(app|components|lib|public|vendor)\//.test(path)) return 'runtime_code';
  if (path.startsWith('data/')) return 'data_conservative_keep';
  if (path.startsWith('scripts/')) return 'scripts_and_tests';
  if (path.startsWith('experiments/')) return 'experiments_review_dependencies';
  if (path.startsWith('docs/') || path.startsWith('archive/') || path.startsWith('sandbox/')) return 'documentation_or_archive';
  if (/^(android-app|vk-mini-app|google-apps-script)/.test(path)) return 'other_integrations_keep';
  return 'root_configuration_or_other';
}
function bump(map, name, bytes) {
  const current = map.get(name) ?? { files: 0, bytes: 0 };
  current.files++;
  current.bytes += bytes;
  map.set(name, current);
}
function resolveReference(source, literal) {
  const value = literal.split(/[?#]/, 1)[0];
  if (!value || value.includes('${') || value.includes('*') || value.startsWith('http')) return null;
  let target;
  if (value.startsWith('@/')) target = value.slice(2);
  else if (value.startsWith('./') || value.startsWith('../')) target = normalize(`${dirname(source)}/${value}`);
  else if (/^(app|components|lib|data|scripts|experiments|vendor|public)\//.test(value)) target = value;
  else return null;
  if (target.startsWith('../') || target.startsWith('/')) return null;
  for (const trial of [target, `${target}.ts`, `${target}.tsx`, `${target}.mjs`, `${target}.js`, `${target}.json`, `${target}/index.ts`, `${target}/index.tsx`]) {
    if (pathSet.has(trial)) return trial;
  }
  return null;
}
for (const path of paths) {
  if (!existsSync(`${root}/${path}`)) continue;
  const bytes = statSync(`${root}/${path}`).size;
  totalBytes += bytes;
  bump(groups, group(path), bytes);
  const parts = path.split('/');
  if (parts.length > 1) bump(directoryGroups, parts[0] === 'experiments' || parts[0] === 'data' ? parts.slice(0, 2).join('/') : parts[0], bytes);
  largest.push({ path, bytes });
}

const scanned = [];
const dynamicPatterns = [];
const textSources = paths.filter(path =>
  /\.(?:[cm]?[jt]sx?|ya?ml)$/.test(path) || ['package.json', 'next.config.ts', 'tsconfig.json'].includes(path));
for (const source of textSources) {
  const full = `${root}/${source}`;
  if (!existsSync(full) || statSync(full).size > 1024 * 1024) continue;
  const content = readFileSync(full, 'utf8');
  scanned.push(source);
  if (/readFileSync|import\s*\(|readdirSync|globSync|outputFileTracingIncludes/.test(content)) dynamicPatterns.push(source);
  const literals = content.matchAll(/['"`]([^'"`\n]{2,220})['"`]/g);
  for (const match of literals) {
    const target = resolveReference(source, match[1]);
    if (!target) continue;
    const sources = references.get(target) ?? new Set();
    sources.add(source);
    references.set(target, sources);
    const edge = `${group(source)} -> ${group(target)}`;
    crossGroup.set(edge, (crossGroup.get(edge) ?? 0) + 1);
  }
}

const experimentDirs = [...directoryGroups.keys()].filter(name => name.startsWith('experiments/')).sort();
const experimentReview = experimentDirs.map(dir => ({
  directory: dir,
  ...directoryGroups.get(dir),
  referencedFiles: [...references.keys()].filter(path => path.startsWith(`${dir}/`)).length,
  directReferrers: [...new Set([...references.entries()].filter(([path]) => path.startsWith(`${dir}/`)).flatMap(([, sources]) => [...sources]))].slice(0, 12),
  status: 'REVIEW_REQUIRED_NOT_PROVEN_UNUSED',
}));

const result = {
  schemaVersion: 1,
  sourceHead: head,
  scope: 'Git tracked/index files; source text under 1 MiB; literal imports and paths. Dynamic paths, workflow globs and test fixtures require manual review.',
  trackedFiles: paths.length,
  trackedBytes: totalBytes,
  groups: Object.fromEntries([...groups].sort()),
  directoryGroups: Object.fromEntries([...directoryGroups].sort()),
  scannedSourceFiles: scanned.length,
  matchedReferencedFiles: references.size,
  crossGroupLiteralReferences: Object.fromEntries([...crossGroup].sort()),
  experimentReview,
  largestTrackedFiles: largest.sort((a, b) => b.bytes - a.bytes).slice(0, 25),
  dynamicPathSourcesSample: dynamicPatterns.slice(0, 80),
  protectedDependencies: [
    'app/v3/page.tsx -> app/v2/components (shared live UI)',
    'next.config.ts outputFileTracingIncludes -> data/local-settlements/**',
    'package.json test:audit -> scripts/*.test.* and experiments/nationwide-tolls plus experiments/toll-od-matrix',
    '.github/workflows/** -> scripts, data fixtures and experiments; path filters are not a full dependency graph',
    'Android and VK integration directories remain in place',
  ],
  confirmedUnusedFiles: [],
  deletionCandidates: [],
  ambiguousAreas: [
    'Unmatched research files may be read through dynamic paths, globs, quoted string interpolation or archival tools.',
    'A missing literal edge is not proof of non-use; each move requires exact import/test/CI review and verified backup.',
  ],
};
writeFileSync(`${root}/docs/reorganization/INVENTORY.json`, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ sourceHead: head, trackedFiles: paths.length, trackedBytes: totalBytes, scannedSourceFiles: scanned.length, matchedReferencedFiles: references.size, experimentDirectories: experimentDirs.length }));
