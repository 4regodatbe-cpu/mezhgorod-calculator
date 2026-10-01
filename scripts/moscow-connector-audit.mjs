const cases = [
  ["krasnodar-spb", [38.9753,45.0355], [30.3351,59.9343]],
  ["golubitskaya-spb", [37.2761,45.3258], [30.3351,59.9343]],
  ["vityazevo-spb", [37.2821,45.0019], [30.3351,59.9343]],
];

for (const [id, from, to] of cases) {
  const url = new URL(`https://router.project-osrm.org/route/v1/driving/${from.join(",")};${to.join(",")}`);
  url.searchParams.set("overview", "false");
  url.searchParams.set("steps", "true");
  const response = await fetch(url, { headers: { "user-agent": "MezhgorodCalc/2.0" }, signal: AbortSignal.timeout(30_000) });
  const data = await response.json();
  const steps = (data.routes?.[0]?.legs ?? []).flatMap((leg) => leg.steps ?? []);
  const interesting = steps
    .map((step, index) => ({
      index,
      name: step.name ?? "",
      ref: step.ref ?? "",
      distanceKm: Math.round((step.distance ?? 0) / 100) / 10,
      maneuver: step.maneuver?.location ?? null,
    }))
    .filter((step) => /(?:М|M)[- ]?4|(?:М|M)[- ]?11|МКАД|MKAD|ЦКАД|CKAD|A-?113|A-?107|Ленинград|Нева|Дон/i.test(`${step.name} ${step.ref}`));
  console.log(JSON.stringify({ id, totalKm: data.routes?.[0]?.distance / 1000, interesting }, null, 2));
}
