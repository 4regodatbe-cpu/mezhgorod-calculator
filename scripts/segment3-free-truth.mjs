import { writeFile } from "node:fs/promises";

const baseUrl = (process.env.CALCULATOR_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const points = {
  moscow: { label: "Москва", position: { lat: 55.755819, lng: 37.617644 } },
  krasnodar: { label: "Краснодар", position: { lat: 45.03547, lng: 38.975313 } },
  sochi: { label: "Сочи", position: { lat: 43.585472, lng: 39.723098 } },
};

const cases = [
  ["moscow-krasnodar", points.moscow, points.krasnodar],
  ["moscow-sochi", points.moscow, points.sochi],
];

async function calculate(from, to) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 95_000);
  try {
    const response = await fetch(`${baseUrl}/api/v2/calculate`, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "MezhgorodSegment3FreeTruth/1.0" },
      body: JSON.stringify({ mode: "standard", from, to, departureAt: "2026-09-30T09:00:00+03:00" }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
let failed = false;

function record(name, checks, leg) {
  const ok = checks.every((item) => item.ok);
  if (!ok) failed = true;
  results.push({ name, ok, checks, leg });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  for (const check of checks) console.log(`  ${check.ok ? "✓" : "✗"} ${check.label}: ${check.actual}`);
}

for (const [name, from, to] of cases) {
  try {
    const data = await calculate(from, to);
    const leg = data.legs?.[0];
    const checks = [
      { label: "fast route exists", ok: Boolean(leg?.fast), actual: leg?.fast ? "yes" : "no" },
      { label: "unverified control route is not exposed as free", ok: leg?.free === null, actual: leg?.free === null ? "free=null" : `status=${leg?.free?.tollValidation?.status ?? "missing"}` },
      { label: "unverified alternative is preserved separately", ok: Boolean(leg?.freeCandidate), actual: leg?.freeCandidate ? `${(leg.freeCandidate.meters / 1000).toFixed(1)} km` : "missing" },
      { label: "unverified alternative remains unknown", ok: leg?.freeCandidate?.tollValidation?.status === "unknown", actual: leg?.freeCandidate?.tollValidation?.status ?? "missing" },
      { label: "confirmed and unverified variants are mutually exclusive", ok: !(leg?.free && leg?.freeCandidate), actual: leg?.free && leg?.freeCandidate ? "both present" : "exclusive" },
      { label: "API explains why free route is withheld", ok: typeof leg?.freeError === "string" && leg.freeError.includes("не подтвердила"), actual: leg?.freeError ?? "missing" },
    ];
    record(name, checks, leg);
  } catch (error) {
    record(name, [{ label: "request", ok: false, actual: error instanceof Error ? error.message : String(error) }], null);
  }
}

await writeFile("segment3-free-truth.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, failed, results }, null, 2)}\n`);
if (failed) process.exitCode = 1;
