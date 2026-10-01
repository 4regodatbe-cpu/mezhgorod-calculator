import fs from "node:fs";

const base = process.env.CALCULATOR_BASE_URL || "http://127.0.0.1:3000";
const routes = [
  { id: "krasnodar-moscow", from: { label: "Краснодар", position: { lat: 45.0355, lng: 38.9753 } }, to: { label: "Москва", position: { lat: 55.7558, lng: 37.6173 } } },
  { id: "krasnodar-spb", from: { label: "Краснодар", position: { lat: 45.0355, lng: 38.9753 } }, to: { label: "Санкт-Петербург", position: { lat: 59.9343, lng: 30.3351 } } },
  { id: "golubitskaya-spb", from: { label: "Голубицкая", position: { lat: 45.3258, lng: 37.2761 } }, to: { label: "Санкт-Петербург", position: { lat: 59.9343, lng: 30.3351 } } },
  { id: "vityazevo-spb", from: { label: "Витязево", position: { lat: 45.0019, lng: 37.2821 } }, to: { label: "Санкт-Петербург", position: { lat: 59.9343, lng: 30.3351 } } },
  { id: "kazan-yalta", from: { label: "Казань", position: { lat: 55.7961, lng: 49.1064 } }, to: { label: "Ялта", position: { lat: 44.4952, lng: 34.1663 } } },
];

const output = [];
for (const item of routes) {
  const started = Date.now();
  try {
    const response = await fetch(`${base}/api/v2/calculate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from: item.from, to: item.to, mode: "standard", departureAt: "2026-10-01T12:00:00+03:00", diagnostics: false }),
      signal: AbortSignal.timeout(58_000),
    });
    const data = await response.json();
    const leg = data?.legs?.[0];
    output.push({
      id: item.id,
      http: response.status,
      elapsedMs: Date.now() - started,
      fastKm: leg?.fast?.meters ? Math.round(leg.fast.meters / 100) / 10 : null,
      fastMinutes: leg?.fast?.seconds ? Math.round(leg.fast.seconds / 60) : null,
      routeQuality: leg?.fast?.quality ?? null,
      pricingStatus: leg?.fast?.tolls?.pricingStatus ?? null,
      tollAmount: leg?.fast?.tolls?.amount ?? null,
      tollWeekday: leg?.fast?.tolls?.weekdayAmount ?? null,
      tollWeekend: leg?.fast?.tolls?.weekendAmount ?? null,
      tollSegments: leg?.fast?.tolls?.segments ?? [],
      tollValidation: leg?.fast?.tollValidation ?? null,
      freeKm: leg?.free?.meters ? Math.round(leg.free.meters / 100) / 10 : null,
      freeCandidateKm: leg?.freeCandidate?.meters ? Math.round(leg.freeCandidate.meters / 100) / 10 : null,
      error: data?.error ?? null,
    });
  } catch (error) {
    output.push({ id: item.id, http: null, elapsedMs: Date.now() - started, error: error instanceof Error ? error.message : String(error) });
  }
}

fs.mkdirSync("artifacts", { recursive: true });
fs.writeFileSync("artifacts/live-user-route-audit.json", JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));

const longSpbIds = new Set(["krasnodar-spb", "golubitskaya-spb", "vityazevo-spb"]);
const longSpb = output.filter((row) => longSpbIds.has(row.id));
const grossUnderprices = longSpb.filter((row) => row.pricingStatus === "priced" && Number(row.tollAmount) < 8000);
if (grossUnderprices.length) throw new Error(`Gross partial toll total still exposed: ${grossUnderprices.map((row) => `${row.id}=${row.tollAmount}`).join(", ")}`);

const pricedWithoutM11 = longSpb.filter((row) => row.pricingStatus === "priced" && !(row.tollSegments ?? []).some((segment) => String(segment).includes("М-11")));
if (pricedWithoutM11.length) throw new Error(`Long SPB total exposed without M11 component: ${pricedWithoutM11.map((row) => row.id).join(", ")}`);

const falseCkad = longSpb.filter((row) => (row.tollSegments ?? []).some((segment) => String(segment).includes("ЦКАД")));
if (falseCkad.length) throw new Error(`False CKAD component detected on M4→Moscow→M11 control routes: ${falseCkad.map((row) => row.id).join(", ")}`);
