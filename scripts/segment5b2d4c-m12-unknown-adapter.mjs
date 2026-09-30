import { writeFile } from "node:fs/promises";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const from = { label: "Казань", position: { lat: 55.796289, lng: 49.108795 } };
const to = { label: "Владимир", position: { lat: 56.129057, lng: 40.406635 } };

const response = await fetch(`${BASE_URL}/api/v2/calculate`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    from,
    to,
    mode: "standard",
    departureAt: "2026-09-30T12:00:00+03:00",
  }),
  signal: AbortSignal.timeout(120_000),
});

const text = await response.text();
if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 1000)}`);
const data = JSON.parse(text);
const leg = data?.legs?.[0];
if (!leg) throw new Error("No route leg returned");

const report = {
  generatedAt: new Date().toISOString(),
  route: "Kazan -> Vladimir",
  fastMeters: leg.fast?.meters ?? null,
  amount: leg.fast?.tolls?.amount ?? null,
  weekdayAmount: leg.fast?.tolls?.weekdayAmount ?? null,
  weekendAmount: leg.fast?.tolls?.weekendAmount ?? null,
  segments: leg.fast?.tolls?.segments ?? null,
  validationStatus: leg.fast?.tollValidation?.status ?? null,
  validationSource: leg.fast?.tollValidation?.source ?? null,
  validationMessage: leg.fast?.tollValidation?.message ?? null,
  freePresent: Boolean(leg.free),
  freeCandidatePresent: Boolean(leg.freeCandidate),
  freeError: leg.freeError ?? null,
};

await writeFile("segment5b2d4c-m12-unknown-api.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
