const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";

const places = {
  Moscow: { label: "Москва", position: { lat: 55.755819, lng: 37.617644 } },
  Arzamas: { label: "Арзамас", position: { lat: 55.394754, lng: 43.840785 } },
  Kazan: { label: "Казань", position: { lat: 55.796289, lng: 49.108795 } },
};

const cases = [
  { name: "Moscow -> Arzamas", from: places.Moscow, to: places.Arzamas, expected: 1713 },
  { name: "Arzamas -> Moscow", from: places.Arzamas, to: places.Moscow, expected: 1713 },
  { name: "Arzamas -> Kazan", from: places.Arzamas, to: places.Kazan, expected: 1800 },
  { name: "Kazan -> Arzamas", from: places.Kazan, to: places.Arzamas, expected: 1800 },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function run(test) {
  const response = await fetch(`${BASE_URL}/api/v2/calculate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      from: test.from,
      to: test.to,
      mode: "standard",
      departureAt: "2026-09-30T12:00:00+03:00",
    }),
    signal: AbortSignal.timeout(120_000),
  });

  const text = await response.text();
  assert(response.ok, `${test.name}: HTTP ${response.status}: ${text.slice(0, 500)}`);
  const data = JSON.parse(text);
  assert(Array.isArray(data.legs) && data.legs.length === 1, `${test.name}: expected exactly one leg`);
  const leg = data.legs[0];
  const amount = leg?.fast?.tolls?.amount;
  const source = leg?.fast?.tollValidation?.source;
  const segments = leg?.fast?.tolls?.segments;

  assert(amount === test.expected, `${test.name}: amount ${amount}, expected ${test.expected}`);
  assert(amount > 0, `${test.name}: exact M12 amount must be positive`);
  assert(source === "M-12 local RVP core", `${test.name}: unexpected validation source ${source}`);
  assert(Array.isArray(segments) && segments.some((value) => String(value).includes("М-12: подтверждённые РВП")), `${test.name}: exact M12 segment marker missing`);

  console.log(`PASS ${test.name}: ${amount} RUB; source=${source}`);
}

for (const test of cases) {
  await run(test);
}

console.log(`Segment 5B2D-4B passed: ${cases.length}/${cases.length}`);
