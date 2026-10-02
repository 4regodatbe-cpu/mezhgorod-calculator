const baseUrl = (process.env.CALCULATOR_URL || "https://mezhgorod-calculator.vercel.app").replace(/\/$/, "");

const routes = [
  ["Москва — Ростов-на-Дону", [55.755819, 37.617644], [47.235713, 39.701505]],
  ["Москва — Краснодар", [55.755819, 37.617644], [45.03547, 38.975313]],
  ["Москва — Сочи", [55.755819, 37.617644], [43.585472, 39.723098]],
];

function point(label, [lat, lng]) {
  return { label, position: { lat, lng } };
}

for (const [name, from, to] of routes) {
  const response = await fetch(`${baseUrl}/api/v2/calculate`, {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "M4EvidenceRegression/1.0" },
    body: JSON.stringify({
      mode: "standard",
      from: point(name.split(" — ")[0], from),
      to: point(name.split(" — ")[1], to),
      departureAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);

  const data = await response.json();
  const validation = data.legs?.[0]?.fast?.tollValidation;

  if (!validation) throw new Error(`${name}: missing toll validation`);
  if (validation.unknownCount > 0) throw new Error(`${name}: unknown toll candidates remain`);
  if (validation.complete !== true) throw new Error(`${name}: incomplete plaza evidence`);
}

console.log("M4 evidence regression passed");
