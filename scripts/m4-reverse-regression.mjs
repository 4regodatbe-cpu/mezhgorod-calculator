const baseUrl = (process.env.CALCULATOR_URL || "https://mezhgorod-calculator.vercel.app").replace(/\/$/, "");

const routes = [
  ["Москва — Ейск", [55.755819, 37.617644], [46.711524, 38.276451]],
  ["Москва — Майкоп", [55.755819, 37.617644], [44.609826, 40.100653]],
  ["Москва — Ялта", [55.755819, 37.617644], [44.495205, 34.166301]],
  ["Москва — Краснодар", [55.755819, 37.617644], [45.03547, 38.975313]],
  ["Москва — Сочи", [55.755819, 37.617644], [43.585472, 39.723098]],
];

function point(label, [lat, lng]) {
  return { label, position: { lat, lng } };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const [name, from, to] of routes) {
  const response = await fetch(`${baseUrl}/api/v2/calculate`, {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "M4ReverseRegression/2.0" },
    body: JSON.stringify({
      mode: "standard",
      from: point(name.split(" — ")[0], from),
      to: point(name.split(" — ")[1], to),
      departureAt: new Date().toISOString(),
    }),
  });

  assert(response.ok, `${name}: HTTP ${response.status}`);

  const data = await response.json();
  const leg = data.legs?.[0];
  const validation = leg?.fast?.tollValidation;
  const tolls = leg?.fast?.tolls;

  assert(leg?.fast, `${name}: fast route missing`);
  assert(validation, `${name}: toll validation missing`);
  assert(validation.complete === true, `${name}: validation incomplete`);
  assert(validation.unknownCount === 0, `${name}: unknown toll candidates remain`);
  assert(Array.isArray(validation.unresolved) && validation.unresolved.length === 0, `${name}: unresolved toll data`);
  assert(validation.status === "priced", `${name}: toll status is ${validation.status}`);
  assert(typeof tolls?.amount === "number", `${name}: toll amount missing`);

  console.log(JSON.stringify({
    route: name,
    status: validation.status,
    amount: tolls.amount,
    checked: validation.checkedCandidateCount ?? null,
  }));
}

console.log("M4 reverse regression passed with strict assertions");
