import { mkdir, readFile, writeFile } from 'node:fs/promises';

const sourcePath = new URL('../../../data/settlement-route-benchmark-20261006.json', import.meta.url);
const outputPath = new URL('../source-snapshots/systemic-road-audit-2026-10-15/corpus.json', import.meta.url);
const source = JSON.parse(await readFile(sourcePath, 'utf8'));
let previous;
try { previous = JSON.parse(await readFile(outputPath, 'utf8')); } catch {}

const destinations = [
  { id: 'moscow-center', label: 'Москва, центр', position: { lng: 37.6173, lat: 55.7558 } },
  { id: 'saint-petersburg-center', label: 'Санкт-Петербург, центр', position: { lng: 30.3159, lat: 59.9391 } },
  { id: 'kazan-center', label: 'Казань, центр', position: { lng: 49.1221, lat: 55.7887 } },
  { id: 'kerch-center', label: 'Керчь, центр', position: { lng: 36.4689, lat: 45.3568 } },
];

const routes = [];
const priorById = new Map((previous?.routes ?? []).map((item) => [item.id, item]));
for (const [region, area] of Object.entries(source.areas)) {
  if (!['dnr', 'lnr', 'zaporizhzhia', 'kherson'].includes(region)) continue;
  for (const origin of area.selected) {
    for (const destination of destinations) {
      const id = `${region}-${origin.requested.toLowerCase().replace(/[^a-zа-я0-9]+/giu, '-')}-${destination.id}`;
      const prior = priorById.get(id);
      routes.push({
        ...prior,
        id,
        region,
        from: { label: origin.label, position: origin.position, kind: origin.osmType, sourceRequested: origin.requested },
        to: destination,
        routeMustBeLive: true,
        expectedRoads: [],
        status: prior?.status ?? 'planned',
      });
    }
  }
}

const corridorPlan = [
  { id: 'single-m4', roads: ['m4'], minimumRuns: 10, examples: [['Краснодар', 'Домодедово'], ['Краснодар', 'Воронеж'], ['Краснодар', 'Донецк'], ['Ростов-на-Дону', 'Воронеж']] },
  { id: 'single-a289', roads: ['a289'], minimumRuns: 10, examples: [['Воронеж', 'Тамань'], ['Краснодар', 'Керчь'], ['Анапа', 'Славянск-на-Кубани']] },
  { id: 'single-m3', roads: ['m3'], minimumRuns: 10, examples: [['Москва', 'Калуга'], ['Калуга', 'Москва']] },
  { id: 'single-m11', roads: ['m11'], minimumRuns: 10, examples: [['Москва', 'Санкт-Петербург'], ['Тверь', 'Москва']] },
  { id: 'single-m12', roads: ['m12'], minimumRuns: 10, examples: [['Казань', 'Москва'], ['Владимир', 'Казань']] },
  { id: 'single-ckad', roads: ['ckad'], minimumRuns: 10, examples: [['Москва', 'Казань'], ['Домодедово', 'Клин']] },
  { id: 'single-zsd', roads: ['zsd'], minimumRuns: 10, examples: [['Благодатная', 'Приморский'], ['Приморский', 'Благодатная']] },
  { id: 'pair-m4-a289', roads: ['m4', 'a289'], minimumRuns: 10, examples: [['Воронеж', 'Тамань'], ['Краснодар', 'Керчь']] },
  { id: 'pair-m4-m11', roads: ['m4', 'm11'], minimumRuns: 10, examples: [['Краснодар', 'Санкт-Петербург'], ['Санкт-Петербург', 'Краснодар']] },
  { id: 'pair-m11-zsd', roads: ['m11', 'zsd'], minimumRuns: 10, examples: [['Москва', 'Благодатная'], ['Благодатная', 'Москва']] },
  { id: 'pair-m11-ckad', roads: ['m11', 'ckad'], minimumRuns: 10, examples: [['Санкт-Петербург', 'Казань через ЦКАД']] },
  { id: 'pair-m12-ckad', roads: ['m12', 'ckad'], minimumRuns: 10, examples: [['Казань', 'Санкт-Петербург через ЦКАД']] },
  { id: 'triple-m4-m11-zsd', roads: ['m4', 'm11', 'zsd'], minimumRuns: 10, examples: [['Краснодар', 'Санкт-Петербург через ЦКАД']] },
  { id: 'triple-m11-ckad-m12', roads: ['m11', 'ckad', 'm12'], minimumRuns: 10, examples: [['Санкт-Петербург', 'Казань через ЦКАД']] },
  { id: 'max-chain-m4-ckad-m11-zsd', roads: ['m4', 'ckad', 'm11', 'zsd'], minimumRuns: 10, examples: [['Краснодар', 'Санкт-Петербург через ЦКАД']] },
  { id: 'max-chain-m12-ckad-m11-zsd', roads: ['m12', 'ckad', 'm11', 'zsd'], minimumRuns: 10, examples: [['Казань', 'Санкт-Петербург через ЦКАД']] },
];

const counts = Object.fromEntries(['dnr', 'lnr', 'zaporizhzhia', 'kherson'].map((region) => [region, routes.filter((item) => item.region === region).length]));
for (const [region, count] of Object.entries(counts)) if (count < 40) throw new Error(`${region} requires at least 40 cases; got ${count}`);

const corpus = {
  schemaVersion: 1,
  createdAt: new Date().toISOString(),
  source: 'data/settlement-route-benchmark-20261006.json; its 10 fixed geocoded settlements per region are reused as route origins.',
  destinationCoordinates: 'Fixed city-center coordinates; every run must query live routing providers. Airport/important-point controls are supplemental cases, not included in the 40-per-region city-center minimum.',
  requirements: {
    liveRouteProviderRuns: true,
    saveRawProviderResponsesAndRouteGeometry: true,
    replaySavedResponsesOffline: true,
    departureWindows: ['weekday', 'weekend'],
    requireSelectedRouteToTraverseExpectedRoads: true,
    allowOrdinaryRoadGapsBetweenPaidRoads: true,
    routeCaseMinimumPerSpecialRegion: 40,
  },
  routeCountsBySpecialRegion: counts,
  routes,
  corridorPlan,
  executionNotes: [
    'The corridor plan is a test plan, not evidence that each named route traverses the expected toll road.',
    'Before marking a corridor case passed, inspect the live selected geometry and toll-road edge/gate trace.',
    'Road inventory must confirm which networks have at least three physical payment points; candidates in corridorPlan remain subject to that inventory check.',
    'Unknown tariff and incomplete route traces are reported as findings, never converted to zero or a full route price.',
  ],
};

await mkdir(new URL('.', outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(corpus, null, 2)}\n`);
console.log(JSON.stringify({ output: outputPath.pathname, routeCountsBySpecialRegion: counts, corridorGroups: corridorPlan.length }));
