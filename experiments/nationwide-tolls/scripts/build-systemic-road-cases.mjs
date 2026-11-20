import fs from 'node:fs';
import path from 'node:path';

const root = 'experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15';
const file = path.join(root, 'road-cases.json');
const prior = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : { routes: [] };
const previous = new Map(prior.routes.map(row => [row.id, row]));
const point = (label, lng, lat) => ({ label, position: { lng, lat }, kind: 'fixed-city-control' });
const points = {
  krasnodar: point('Краснодар, центр', 38.975313, 45.035470),
  moscow: point('Москва, центр', 37.6173, 55.7558),
  spb: point('Санкт-Петербург, центр', 30.3159, 59.9391),
  kazan: point('Казань, центр', 49.1221, 55.7887),
  kerch: point('Керчь, центр', 36.4689, 45.3568),
  domodedovo: point('Домодедово, центр города', 37.7660, 55.4360),
  voronezh: point('Воронеж, центр', 39.2003, 51.6608),
  rostov: point('Ростов-на-Дону, центр', 39.7233, 47.2225),
  taman: point('Тамань, центр', 36.7160, 45.2110),
  temryuk: point('Темрюк, центр', 37.3800, 45.2720),
  anapa: point('Анапа, центр', 37.3167, 44.8940),
  slavyansk: point('Славянск-на-Кубани, центр', 38.1250, 45.2600),
  kaluga: point('Калуга, центр', 36.2612, 54.5138),
  obninsk: point('Обнинск, центр', 36.6100, 55.0960),
  maloyaroslavets: point('Малоярославец, центр', 36.4630, 55.0130),
  balabanovo: point('Балабаново, центр', 36.6580, 55.1780),
  tver: point('Тверь, центр', 35.9176, 56.8587),
  torzhok: point('Торжок, центр', 34.9620, 57.0410),
  novgorod: point('Великий Новгород, центр', 31.2755, 58.5215),
  vladimir: point('Владимир, центр', 40.4066, 56.1291),
  murom: point('Муром, центр', 42.0520, 55.5720),
  arzamas: point('Арзамас, центр', 43.8400, 55.3940),
  cheboksary: point('Чебоксары, центр', 47.2519, 56.1463),
  klin: point('Клин, центр', 36.7270, 56.3330),
  noginsk: point('Ногинск, центр', 38.4420, 55.8540),
  ramenskoe: point('Раменское, центр', 38.2250, 55.5680),
  podolsk: point('Подольск, центр', 37.5500, 55.4310),
  dmitrov: point('Дмитров, центр', 37.5170, 56.3440),
  sest: point('Сестрорецк, центр', 29.9630, 60.0930),
  peterhof: point('Петергоф, центр', 29.9060, 59.8830),
  pushkin: point('Пушкин, центр', 30.3950, 59.7200),
  blag: point('Санкт-Петербург, Благодатная улица, контроль', 30.3040, 59.8750),
  prim: point('Санкт-Петербург, Приморский проспект, контроль', 30.2400, 59.9820),
  zvenigorod: point('Звенигород, центр', 36.8550, 55.7300),
  golitsyno: point('Голицыно, центр', 36.9870, 55.6170),
  kubinka: point('Кубинка, центр', 36.6890, 55.5770),
  lesnoy: point('Лесной Городок, центр', 37.2080, 55.6340),
  rublevo: point('Рублёво, центр', 37.3540, 55.7850),
  khabarovsk: point('Хабаровск, центр', 135.0726, 48.4802),
  smidovich: point('Смидович, центр', 133.8080, 48.5960),
  vyazemsky: point('Вяземский, центр', 134.7520, 47.5360),
  knyaze: point('Князе-Волконское, центр', 135.4500, 48.4670),
  nekrasovka: point('Некрасовка, Хабаровский край, центр', 135.2320, 48.3520),
  berezovka: point('Берёзовка, Хабаровск, центр', 135.0890, 48.5710),
};
const groups = [
  ['single-m4', ['m4'], [['krasnodar', 'domodedovo'], ['krasnodar', 'voronezh'], ['krasnodar', 'rostov'], ['rostov', 'voronezh'], ['voronezh', 'moscow']]],
  ['single-a289', ['a289'], [['krasnodar', 'kerch'], ['krasnodar', 'taman'], ['krasnodar', 'temryuk'], ['krasnodar', 'anapa'], ['slavyansk', 'taman']]],
  ['single-m3', ['m3'], [['moscow', 'kaluga'], ['moscow', 'obninsk'], ['moscow', 'maloyaroslavets'], ['balabanovo', 'kaluga'], ['obninsk', 'kaluga']]],
  ['single-m11', ['m11'], [['moscow', 'spb'], ['moscow', 'tver'], ['moscow', 'torzhok'], ['tver', 'spb'], ['novgorod', 'moscow']]],
  ['single-m12', ['m12'], [['moscow', 'kazan'], ['vladimir', 'kazan'], ['murom', 'kazan'], ['arzamas', 'moscow'], ['cheboksary', 'moscow']]],
  ['single-ckad', ['ckad'], [['domodedovo', 'klin'], ['podolsk', 'noginsk'], ['ramenskoe', 'klin'], ['kazan', 'dmitrov'], ['rostov', 'dmitrov']]],
  ['single-zsd', ['zsd'], [['blag', 'prim'], ['pushkin', 'sest'], ['peterhof', 'sest'], ['blag', 'sest'], ['peterhof', 'prim']]],
  ['single-odintsovo', ['odintsovo'], [['moscow', 'zvenigorod'], ['moscow', 'golitsyno'], ['moscow', 'kubinka'], ['moscow', 'lesnoy'], ['rublevo', 'golitsyno']]],
  ['single-khabarovsk', ['khabarovsk'], [['smidovich', 'vyazemsky'], ['smidovich', 'knyaze'], ['smidovich', 'nekrasovka'], ['berezovka', 'vyazemsky'], ['khabarovsk', 'vyazemsky']]],
  ['pair-m4-a289', ['m4', 'a289'], [['voronezh', 'taman'], ['rostov', 'kerch'], ['moscow', 'taman'], ['domodedovo', 'kerch'], ['voronezh', 'anapa']]],
  ['pair-m4-m11', ['m4', 'm11'], [['krasnodar', 'spb'], ['rostov', 'spb'], ['voronezh', 'spb'], ['krasnodar', 'torzhok'], ['rostov', 'tver']]],
  ['pair-m11-zsd', ['m11', 'zsd'], [['moscow', 'sest'], ['moscow', 'prim'], ['tver', 'sest'], ['torzhok', 'prim'], ['novgorod', 'sest']]],
  ['pair-m11-ckad', ['m11', 'ckad'], [['spb', 'domodedovo'], ['spb', 'noginsk'], ['torzhok', 'ramenskoe'], ['tver', 'noginsk'], ['novgorod', 'domodedovo']]],
  ['pair-m12-ckad', ['m12', 'ckad'], [['kazan', 'klin'], ['kazan', 'dmitrov'], ['vladimir', 'klin'], ['murom', 'dmitrov'], ['arzamas', 'domodedovo']]],
  ['triple-m4-m11-zsd', ['m4', 'm11', 'zsd'], [['krasnodar', 'sest'], ['rostov', 'sest'], ['voronezh', 'prim'], ['krasnodar', 'prim'], ['domodedovo', 'sest']]],
  ['triple-m11-ckad-m12', ['m11', 'ckad', 'm12'], [['spb', 'kazan'], ['torzhok', 'kazan'], ['tver', 'murom'], ['novgorod', 'vladimir'], ['spb', 'arzamas']]],
  ['max-chain-m4-ckad-m11-zsd', ['m4', 'ckad', 'm11', 'zsd'], [['krasnodar', 'sest'], ['rostov', 'sest'], ['voronezh', 'prim'], ['krasnodar', 'prim'], ['rostov', 'prim']]],
  ['max-chain-m12-ckad-m11-zsd', ['m12', 'ckad', 'm11', 'zsd'], [['kazan', 'sest'], ['murom', 'sest'], ['arzamas', 'prim'], ['vladimir', 'sest'], ['cheboksary', 'prim']]],
];
const routes = [];
for (const [group, expectedRoads, pairs] of groups) for (const [a, b] of pairs) for (const [from, to] of [[a, b], [b, a]]) {
  const id = `${group}-${from}-to-${to}`;
  routes.push({ ...previous.get(id), id, groups: [group], from: points[from], to: points[to], expectedRoads,
    routeMustBeLive: true, status: previous.get(id)?.status ?? 'planned' });
}
if (new Set(routes.map(row => row.id)).size !== routes.length) throw Error('duplicate road case ID');
fs.writeFileSync(file, `${JSON.stringify({ schemaVersion: 1, createdAt: prior.createdAt ?? new Date().toISOString(),
  coordinateScope: 'Fixed city-center/control coordinates for comparable audit requests; not geocoded address certificates. Domodedovo means the town, not the airport. No route is credited until complete selected-trace passage evidence proves every expected road. Candidate OD pairs may miss the expected road and must then be replaced, not counted.',
  groups: groups.map(([id, roads]) => ({ id, roads, minimumRuns: 10, plannedCases: routes.filter(row => row.groups.includes(id)).length })), routes }, null, 2)}\n`);
console.log(JSON.stringify({ output: file, groups: groups.length, routes: routes.length }));
