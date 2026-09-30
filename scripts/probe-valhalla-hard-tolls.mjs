import { writeFile } from "node:fs/promises";

const endpoint = "https://valhalla1.openstreetmap.de/route";
const from = { lat: 55.755819, lon: 37.617644, label: "Москва" };
const to = { lat: 45.03547, lon: 38.975313, label: "Краснодар" };

const modes = [
  { name: "fast", auto: { use_tolls: 1 } },
  { name: "avoid_preference", auto: { use_tolls: 0 } },
  { name: "hard_exclude", auto: { use_tolls: 1, exclude_tolls: true } },
];

async function route(mode) {
  const url = new URL(endpoint);
  url.searchParams.set("json", JSON.stringify({
    locations: [{ lat: from.lat, lon: from.lon }, { lat: to.lat, lon: to.lon }],
    costing: "auto",
    costing_options: { auto: mode.auto },
    units: "kilometers",
    directions_type: "none",
  }));

  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "MezhgorodCalcCapabilityProbe/1.0" },
      signal: controller.signal,
    });
    const text = await response.text();
    let data = {};
    try { data = JSON.parse(text); } catch {}
    return {
      name: mode.name,
      httpStatus: response.status,
      ok: response.ok,
      elapsedMs: Date.now() - started,
      lengthKm: data.trip?.summary?.length ?? null,
      timeSeconds: data.trip?.summary?.time ?? null,
      warnings: data.warnings ?? data.trip?.warnings ?? [],
      error: response.ok ? null : (data.error || data.error_code || text.slice(0, 300)),
    };
  } catch (error) {
    return {
      name: mode.name,
      httpStatus: null,
      ok: false,
      elapsedMs: Date.now() - started,
      lengthKm: null,
      timeSeconds: null,
      warnings: [],
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
for (const mode of modes) {
  const result = await route(mode);
  results.push(result);
  console.log(`${mode.name}: HTTP=${result.httpStatus ?? "ERR"} km=${result.lengthKm ?? "n/a"} warnings=${JSON.stringify(result.warnings)} error=${result.error ?? "none"}`);
}

const byName = Object.fromEntries(results.map((item) => [item.name, item]));
const fastKm = Number(byName.fast?.lengthKm);
const avoidKm = Number(byName.avoid_preference?.lengthKm);
const hardKm = Number(byName.hard_exclude?.lengthKm);
const warningsText = JSON.stringify(byName.hard_exclude?.warnings ?? []).toLowerCase();
const warningSuggestsIgnored = /hard|exclude_tolls|exclusion|ignored|not allowed|disabled/.test(warningsText);
const materiallyDifferentFromFast = Number.isFinite(hardKm) && Number.isFinite(fastKm) && Math.abs(hardKm - fastKm) >= 5;
const resemblesAvoid = Number.isFinite(hardKm) && Number.isFinite(avoidKm) && Math.abs(hardKm - avoidKm) <= Math.max(5, avoidKm * 0.02);

const assessment = {
  requestSucceeded: byName.hard_exclude?.ok === true,
  warningSuggestsIgnored,
  materiallyDifferentFromFast,
  resemblesAvoid,
  hardExclusionLikelyEnabled: byName.hard_exclude?.ok === true
    && !warningSuggestsIgnored
    && materiallyDifferentFromFast
    && resemblesAvoid,
};

console.log(`assessment: ${JSON.stringify(assessment)}`);
await writeFile("valhalla-hard-tolls-probe.json", `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  endpoint,
  from,
  to,
  results,
  assessment,
}, null, 2)}\n`);

// Probe failure should surface as a failed workflow only when all three requests
// are unusable. Unsupported hard exclusions are a measured capability result,
// not a CI failure.
if (results.every((item) => !item.ok)) process.exitCode = 1;
