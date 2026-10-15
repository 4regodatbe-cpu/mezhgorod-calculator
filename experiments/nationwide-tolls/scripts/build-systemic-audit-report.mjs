import fs from 'node:fs';
import path from 'node:path';

const root = 'experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const batches = fs.readdirSync(root).filter(name => /^batch-.*\.json$/.test(name)).sort().map(name => ({ path: path.join(root, name), ...read(path.join(root, name)) }));
const latest = new Map();
for (const batch of batches) for (const entry of batch.cases) if (entry.status) latest.set(entry.caseId, { batch: batch.path, ...entry });
const corpus = read(path.join(root, 'corpus.json'));
const roads = read(path.join(root, 'road-cases.json'));
const findings = new Map();
function finding(code, caseId, detail, evidence) {
  if (!findings.has(code)) findings.set(code, { code, cases: new Set(), occurrences: [] });
  const row = findings.get(code);
  row.cases.add(caseId);
  row.occurrences.push({ caseId, detail, evidence });
}
const results = [];
for (const entry of latest.values()) {
  if (!entry.live) { finding('live-routing-failed', entry.caseId, entry.error, entry.batch); continue; }
  const live = read(entry.live);
  const dir = path.dirname(entry.live);
  const samePath = entry.sameDateReplay ? path.join(dir, entry.sameDateReplay) : null;
  const weekendPath = entry.weekendReplay ? path.join(dir, entry.weekendReplay) : null;
  const same = samePath ? read(samePath) : null;
  const weekend = weekendPath ? read(weekendPath) : null;
  const row = { caseId: entry.caseId, status: entry.status, region: live.region ?? null, live: entry.live,
    weekdayAmount: live.tolls.amount, weekendAmount: weekend?.tolls?.amount ?? null,
    traceComplete: live.traceComplete, sameDateParity: entry.sameDateParity,
    roadCoverage: live.roadCoverage ?? same?.roadCoverage ?? null,
    provider: live.provider, rejectedProviders: live.rejectedProviders,
    routeMeters: live.routeMeters, routeSeconds: live.routeSeconds };
  results.push(row);
  if (!entry.sameDateParity) finding('same-date-replay-differs', entry.caseId, 'Live and offline pricing disagree or replay failed', samePath);
  for (const [output, evidence] of [[live, entry.live], [same, samePath], [weekend, weekendPath]]) {
    if (!output) continue;
    if (output.replayIntegrity && !output.replayIntegrity.complete) finding('offline-capture-incomplete', entry.caseId, output.replayIntegrity, evidence);
    if (!output.traceComplete) finding('selected-route-trace-incomplete', entry.caseId, output.departureAt, evidence);
    const status = output.tolls.pricingStatus;
    if (status === 'unknown' && output.tolls.amount !== null || status === 'priced' && (!Number.isFinite(output.tolls.amount) || output.tolls.amount < 0)) finding('invalid-whole-route-money', entry.caseId, output.tolls, evidence);
    for (const component of output.audit.components.filter(item => item.detected && !item.tolls)) {
      const reason = component.reason ?? 'unresolved';
      const code = reason.match(/m4_crossing_profile_changes|ckad_arc_length_out_of_range|m11_[a-z_]+|m12_[a-z_]+|[a-z]+_not_[a-z_]+/)?.[0] ?? `${component.id}:unpriced`;
      finding(code, entry.caseId, { departureAt: output.departureAt, component: component.id, reason }, evidence);
    }
  }
  if (row.roadCoverage?.missingExpectedRoads.length) finding('expected-road-not-proven', entry.caseId, row.roadCoverage, entry.live);
}
const regionCounts = Object.fromEntries(['dnr', 'lnr', 'zaporizhzhia', 'kherson'].map(region => {
  const rows = results.filter(row => row.region === region);
  return [region, { planned: corpus.routes.filter(row => row.region === region).length, liveCaptured: rows.length,
    audited: rows.filter(row => row.status === 'audited').length, traceComplete: rows.filter(row => row.traceComplete).length,
    pricedWeekday: rows.filter(row => row.weekdayAmount !== null).length, pricedWeekend: rows.filter(row => row.weekendAmount !== null).length }];
}));
const groupCounts = roads.groups.map(group => {
  const cases = roads.routes.filter(row => row.groups.includes(group.id)).map(row => latest.get(row.id)).filter(Boolean);
  const rows = results.filter(row => cases.some(item => item.caseId === row.caseId));
  return { id: group.id, minimumRuns: group.minimumRuns, planned: group.plannedCases, attempted: cases.length,
    audited: rows.filter(row => row.status === 'audited').length, traversalProven: rows.filter(row => row.roadCoverage?.status === 'traversal-proven').length,
    pricedWeekday: rows.filter(row => row.weekdayAmount !== null).length, pricedWeekend: rows.filter(row => row.weekendAmount !== null).length };
});
const report = { generatedAt: new Date().toISOString(), scope: 'Internal component audit. A date replay is not a fresh live route. Audited means reproducible capture, not correct/confirmed fare. Priced means a numeric engine result, not independent Yandex/operator verification. Unknown is never free.',
  totals: { liveAttempts: latest.size, liveCaptured: results.length, audited: results.filter(row => row.status === 'audited').length,
    traceComplete: results.filter(row => row.traceComplete).length, sameDateParity: results.filter(row => row.sameDateParity).length },
  regionCounts, groupCounts, results,
  findings: [...findings.values()].map(row => ({ ...row, caseCount: row.cases.size, cases: [...row.cases] })),
  next: 'Complete all 40 regional OD cases per region and >=10 traversal-proven live cases per qualifying single road, then pairs/triples/chains; resolve physical inventory counts. Discuss pricing fixes only after findings review.' };
fs.writeFileSync(path.join(root, 'REPORT.json'), `${JSON.stringify(report, null, 2)}\n`);
const lines = [
  '# Системный аудит маршрутов — текущие результаты', '',
  `Сформировано: ${report.generatedAt}.`, '',
  `Свежие попытки: ${report.totals.liveAttempts}; маршруты получены: ${report.totals.liveCaptured}; capture + два offline replay завершены: ${report.totals.audited}; одинаковый live/offline итог: ${report.totals.sameDateParity}.`, '',
  'Audited означает воспроизводимость исполнения. Это не проверка цен по Яндексу/оператору. Неизвестная сумма остаётся неизвестной. Offline replay не считается новым live-маршрутом.', '',
  '| Регион | План | Live | Audited | Полная трасса | Числовой итог четверг | Числовой итог суббота |',
  '|---|---:|---:|---:|---:|---:|---:|',
  ...Object.entries(regionCounts).map(([region, count]) => `| ${region} | ${count.planned} | ${count.liveCaptured} | ${count.audited} | ${count.traceComplete} | ${count.pricedWeekday} | ${count.pricedWeekend} |`), '',
  '| Дорожная группа | План | Попытки | Audited | Прохождение доказано | Числовой итог четверг | Числовой итог суббота |',
  '|---|---:|---:|---:|---:|---:|---:|',
  ...groupCounts.map(row => `| ${row.id} | ${row.planned} | ${row.attempted} | ${row.audited} | ${row.traversalProven} | ${row.pricedWeekday} | ${row.pricedWeekend} |`), '',
  '| Наблюдение | Разных маршрутов |', '|---|---:|',
  ...report.findings.map(row => `| ${row.code} | ${row.caseCount} |`), '',
  'Подробные причины, отдельные маршруты, captures и пути доказательств: [REPORT.json](REPORT.json). Инвентаризация: [physical-road-inventory.json](physical-road-inventory.json).', '',
  'Следующий шаг: завершить четыре набора по 40 маршрутов и серии одиночных дорог с доказанным прохождением; затем пары, тройки и цепочки. Исправления тарификации обсуждаются после аудита.', '',
];
fs.writeFileSync(path.join(root, 'REPORT.md'), lines.join('\n'));
console.log(JSON.stringify({ totals: report.totals, regionCounts, executedGroups: groupCounts.filter(row => row.attempted), findings: report.findings.map(({ code, caseCount }) => ({ code, caseCount })) }));
