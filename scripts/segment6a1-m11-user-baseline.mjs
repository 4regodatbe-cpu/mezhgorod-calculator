const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const GROUP = (process.env.M11_BASELINE_GROUP || "a").toLowerCase();

const places = {
  Moscow: { label: "Москва", position: { lat: 55.755819, lng: 37.617644 } },
  SaintPetersburg: { label: "Санкт-Петербург", position: { lat: 59.938784, lng: 30.314997 } },
  Tver: { label: "Тверь", position: { lat: 56.858721, lng: 35.917596 } },
  Solnechnogorsk: { label: "Солнечногорск", position: { lat: 56.185102, lng: 36.977631 } },
  Sochi: { label: "Сочи", position: { lat: 43.585472, lng: 39.723098 } },
};

const groups = {
  a: [
    ["Moscow -> Saint Petersburg", places.Moscow, places.SaintPetersburg],
    ["Saint Petersburg -> Moscow", places.SaintPetersburg, places.Moscow],
    ["Moscow -> Tver", places.Moscow, places.Tver],
    ["Tver -> Moscow", places.Tver, places.Moscow],
    ["Moscow -> Solnechnogorsk", places.Moscow, places.Solnechnogorsk],
    ["Solnechnogorsk -> Moscow", places.Solnechnogorsk, places.Moscow],
  ],
  b: [
    ["Tver -> Saint Petersburg", places.Tver, places.SaintPetersburg],
    ["Saint Petersburg -> Tver", places.SaintPetersburg, places.Tver],
    ["Solnechnogorsk -> Saint Petersburg", places.Solnechnogorsk, places.SaintPetersburg],
    ["Saint Petersburg -> Solnechnogorsk", places.SaintPetersburg, places.Solnechnogorsk],
    ["Sochi -> Saint Petersburg", places.Sochi, places.SaintPetersburg],
    ["Saint Petersburg -> Sochi", places.SaintPetersburg, places.Sochi],
  ],
};

const cases = groups[GROUP];
if (!cases) throw new Error(`Unknown M11_BASELINE_GROUP=${GROUP}`);

function compactLeg(name, leg) {
  const tolls = leg?.fast?.tolls ?? {};
  const validation = leg?.fast?.tollValidation ?? {};
  return {
    name,
    fastKm: Number(((leg?.fast?.meters ?? 0) / 1000).toFixed(1)),
    fastMinutes: Math.round((leg?.fast?.seconds ?? 0) / 60),
    toll: {
      amount: tolls.amount ?? null,
      weekdayAmount: tolls.weekdayAmount ?? null,
      weekendAmount: tolls.weekendAmount ?? null,
      pricingStatus: tolls.pricingStatus ?? null,
      period: tolls.period ?? null,
      segments: Array.isArray(tolls.segments) ? tolls.segments : [],
    },
    validation: {
      status: validation.status ?? null,
      source: validation.source ?? null,
      message: validation.message ?? null,
    },
    free: Boolean(leg?.free),
    freeCandidate: Boolean(leg?.freeCandidate),
    freeError: leg?.freeError ?? null,
  };
}

async function run([name, from, to]) {
  const response = await fetch(`${BASE_URL}/api/v2/calculate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      mode: "standard",
      departureAt: "2026-10-01T12:00:00+03:00",
      diagnostics: false,
    }),
    signal: AbortSignal.timeout(150_000),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}: ${text.slice(0, 1000)}`);
  const data = JSON.parse(text);
  if (!Array.isArray(data.legs) || data.legs.length !== 1) throw new Error(`${name}: expected exactly one leg`);

  const record = compactLeg(name, data.legs[0]);
  console.log(`M11_BASELINE ${JSON.stringify(record)}`);
  return record;
}

const results = [];
for (const test of cases) results.push(await run(test));

console.log(`M11_BASELINE_SUMMARY ${JSON.stringify({ group: GROUP, departureAt: "2026-10-01T12:00:00+03:00", count: results.length, results })}`);
