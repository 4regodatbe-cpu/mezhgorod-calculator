import { writeFile } from "node:fs/promises";

const baseUrl = (process.env.CALCULATOR_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const points = {
  moscow: { label: "Москва", position: { lat: 55.755819, lng: 37.617644 } },
  krasnodar: { label: "Краснодар", position: { lat: 45.03547, lng: 38.975313 } },
  sochi: { label: "Сочи", position: { lat: 43.585472, lng: 39.723098 } },
  kazan: { label: "Казань", position: { lat: 55.796127, lng: 49.106405 } },
  yalta: { label: "Ялта", position: { lat: 44.495205, lng: 34.166301 } },
  petersburg: { label: "Санкт-Петербург", position: { lat: 59.938784, lng: 30.314997 } },
};

const cases = [
  { name: "moscow-krasnodar", from: points.moscow, to: points.krasnodar, expectWithheldCandidate: true },
  { name: "moscow-sochi", from: points.moscow, to: points.sochi, expectWithheldCandidate: true },
  { name: "moscow-kazan-m12", from: points.moscow, to: points.kazan },
  { name: "yalta-moscow-crimea", from: points.yalta, to: points.moscow },
  { name: "moscow-petersburg-m11", from: points.moscow, to: points.petersburg },
];

async function calculate(from, to) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 95_000);
  try {
    const response = await fetch(`${baseUrl}/api/v2/calculate`, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "MezhgorodSegment3FreeTruth/1.1" },
      body: JSON.stringify({ mode: "standard", from, to, departureAt: "2026-10-02T09:00:00+03:00" }),
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

for (const test of cases) {
  try {
    const data = await calculate(test.from, test.to);
    const leg = data.legs?.[0];
    const exposedFreeStatus = leg?.free?.tollValidation?.status ?? null;
    const candidateStatus = leg?.freeCandidate?.tollValidation?.status ?? null;
    const checks = [
      { label: "fast route exists", ok: Boolean(leg?.fast), actual: leg?.fast ? "yes" : "no" },
      { label: "exposed free route is independently confirmed", ok: !leg?.free || exposedFreeStatus === "free", actual: leg?.free ? `status=${exposedFreeStatus ?? "missing"}` : "free=null" },
      { label: "unverified candidate never becomes confirmed free", ok: !leg?.freeCandidate || candidateStatus === "unknown", actual: leg?.freeCandidate ? `candidate=${candidateStatus ?? "missing"}` : "candidate=null" },
      { label: "confirmed and unverified variants are mutually exclusive", ok: !(leg?.free && leg?.freeCandidate), actual: leg?.free && leg?.freeCandidate ? "both present" : "exclusive" },
      { label: "withheld route explains uncertainty", ok: Boolean(leg?.free) || typeof leg?.freeError === "string", actual: leg?.free ? "confirmed free route exposed" : leg?.freeError ?? "missing" },
    ];
    if (test.expectWithheldCandidate) {
      checks.push(
        { label: "known uncertain control remains withheld", ok: leg?.free === null, actual: leg?.free === null ? "free=null" : `status=${exposedFreeStatus ?? "missing"}` },
        { label: "known uncertain alternative remains separate", ok: Boolean(leg?.freeCandidate), actual: leg?.freeCandidate ? `${(leg.freeCandidate.meters / 1000).toFixed(1)} km` : "missing" },
      );
    }
    record(test.name, checks, leg);
  } catch (error) {
    record(test.name, [{ label: "request", ok: false, actual: error instanceof Error ? error.message : String(error) }], null);
  }
}

await writeFile("segment3-free-truth.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, failed, results }, null, 2)}\n`);
if (failed) process.exitCode = 1;
