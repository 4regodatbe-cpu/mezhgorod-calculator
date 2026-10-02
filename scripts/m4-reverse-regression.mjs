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

for (const [name, from, to] of routes) {
  const response = await fetch(`${baseUrl}/api/v2/calculate`, {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "M4ReverseRegression/1.0" },
    body: JSON.stringify({
      mode: "standard",
      from: point(name.split(" — ")[0], from),
      to: point(name.split(" — ")[1], to),
      departureAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`${name}: HTTP ${response.status}`);
  }

  const data = await response.json();
  const leg = data.legs?.[0];
  const validation = leg?.fast?.tollValidation;

  if (!leg?.fast || validation?.status === "unknown") {
    throw new Error(`${name}: incomplete toll validation`);
  }

  console.log(JSON.stringify({
    route: name,
    tollStatus: validation.status,
    tollAmount: leg.fast.tolls?.amount ?? null,
  }));
}

console.log("M4 reverse regression passed");
