import fs from "node:fs";

const base = process.env.CALCULATOR_BASE_URL || "http://127.0.0.1:3000";
const routes = [
  { id: "krasnodar-moscow", from: { label: "Краснодар", position: { lat: 45.0355, lng: 38.9753 } }, to: { label: "Москва", position: { lat: 55.7558, lng: 37.6173 } } },
  { id: "tver-adler", from: { label: "Тверь", position: { lat: 56.8587, lng: 35.9176 } }, to: { label: "Адлер", position: { lat: 43.4382, lng: 39.9180 } } },
  { id: "krasnodar-spb", from: { label: "Краснодар", position: { lat: 45.0355, lng: 38.9753 } }, to: { label: "Санкт-Петербург", position: { lat: 59.9343, lng: 30.3351 } } },
  { id: "golubitskaya-spb", from: { label: "Голубицкая", position: { lat: 45.3258, lng: 37.2761 } }, to: { label: "Санкт-Петербург", position: { lat: 59.9343, lng: 30.3351 } } },
  { id: "vityazevo-spb", from: { label: "Витязево", position: { lat: 45.0019, lng: 37.2821 } }, to: { label: "Санкт-Петербург", position: { lat: 59.9343, lng: 30.3351 } } },
  { id: "yalta-spb", from: { label: "Ялта", position: { lat: 44.4952, lng: 34.1663 } }, to: { label: "Санкт-Петербург", position: { lat: 59.9343, lng: 30.3351 } }, departureAt: "2026-10-03T14:00:00+03:00" },
  { id: "kazan-yalta", from: { label: "Казань", position: { lat: 55.7961, lng: 49.1064 } }, to: { label: "Ялта", position: { lat: 44.4952, lng: 34.1663 } } },
  { id: "moscow-kazan", from: { label: "Москва", position: { lat: 55.7558, lng: 37.6173 } }, to: { label: "Казань", position: { lat: 55.7961, lng: 49.1064 } } },
  { id: "eysk-moscow", from: { label: "Ейск", position: { lat: 46.7115, lng: 38.2765 } }, to: { label: "Москва", position: { lat: 55.7558, lng: 37.6173 } } },
  { id: "maykop-moscow", from: { label: "Майкоп", position: { lat: 44.6098, lng: 40.1007 } }, to: { label: "Москва", position: { lat: 55.7558, lng: 37.6173 } } },
];

const output = [];
for (const item of routes) {
  const started = Date.now();
  try {
    const response = await fetch(`${base}/api/v2/calculate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from: item.from, to: item.to, mode: "standard", departureAt: item.departureAt ?? "2026-10-01T12:00:00+03:00", diagnostics: false }),
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

const longSpbIds = new Set(["krasnodar-spb", "golubitskaya-spb", "vityazevo-spb", "yalta-spb"]);
const longSpb = output.filter((row) => longSpbIds.has(row.id));
const unresolvedLongSpb = longSpb.filter((row) => row.pricingStatus !== "priced" || !(Number(row.tollAmount) > 0));
if (unresolvedLongSpb.length) throw new Error(`Long SPB route is not fully priced: ${unresolvedLongSpb.map((row) => row.id).join(", ")}`);

const grossUnderprices = longSpb.filter((row) => Number(row.tollAmount) < 8000);
if (grossUnderprices.length) throw new Error(`Gross partial toll total still exposed: ${grossUnderprices.map((row) => `${row.id}=${row.tollAmount}`).join(", ")}`);

const expectedBands = new Map([
  ["krasnodar-spb", [10000, 13000]],
  ["golubitskaya-spb", [12000, 14500]],
  ["vityazevo-spb", [12000, 15000]],
  ["yalta-spb", [12959, 13761]],
]);
const outOfBand = longSpb.filter((row) => {
  const band = expectedBands.get(row.id);
  return band && (Number(row.tollAmount) < band[0] || Number(row.tollAmount) > band[1]);
});
if (outOfBand.length) throw new Error(`Long SPB toll total outside regression band: ${outOfBand.map((row) => `${row.id}=${row.tollAmount}`).join(", ")}`);

const golubitskaya = longSpb.find((row) => row.id === "golubitskaya-spb");
if (!golubitskaya || Math.abs(Number(golubitskaya.tollAmount) - 13350) > 1500) {
  throw new Error(`Golubitskaya→SPB drifted too far from the external Yandex QA control (~13350 RUB): ${golubitskaya?.tollAmount ?? "missing"}`);
}

const pricedWithoutM11 = longSpb.filter((row) => row.pricingStatus === "priced" && !(row.tollSegments ?? []).some((segment) => String(segment).includes("М-11")));
if (pricedWithoutM11.length) throw new Error(`Long SPB total exposed without M11 component: ${pricedWithoutM11.map((row) => row.id).join(", ")}`);

const yalta = longSpb.find((row) => row.id === "yalta-spb");
if (!yalta || !(yalta.tollSegments ?? []).includes("М-4 + А-289 + М-11: Ялта — Санкт-Петербург")) {
  throw new Error(`Yalta→SPB must use the verified whole-route tariff override: ${yalta?.tollSegments?.join(", ") ?? "missing"}`);
}
if (Number(yalta.tollWeekend) !== 13480 || Number(yalta.tollWeekday) !== 11170) {
  throw new Error(`Yalta→SPB operator tariff mismatch: ${yalta.tollWeekday}/${yalta.tollWeekend}`);
}

const falseCkad = longSpb.filter((row) => (row.tollSegments ?? []).some((segment) => String(segment).includes("ЦКАД")));
if (falseCkad.length) throw new Error(`False CKAD component detected on M4→Moscow→M11 control routes: ${falseCkad.map((row) => row.id).join(", ")}`);

const dailyFailureIds = new Set(["moscow-kazan", "eysk-moscow", "maykop-moscow"]);
const dailyFailures = output.filter((row) => dailyFailureIds.has(row.id));
const unresolvedDaily = dailyFailures.filter((row) => row.pricingStatus !== "priced" || !(Number(row.tollAmount) > 0));
if (unresolvedDaily.length) throw new Error(`Previously failing daily toll route is not positively priced: ${unresolvedDaily.map((row) => row.id).join(", ")}`);

const moscowKazan = dailyFailures.find((row) => row.id === "moscow-kazan");
if (!moscowKazan || !(moscowKazan.tollSegments ?? []).some((segment) => String(segment).includes("М-12"))) {
  throw new Error("Moscow→Kazan must be priced by the actual M-12 span, not a zero/legacy fallback");
}
const southToMoscow = dailyFailures.filter((row) => row.id === "eysk-moscow" || row.id === "maykop-moscow");
if (southToMoscow.some((row) => !(row.tollSegments ?? []).some((segment) => String(segment).includes("М-4")))) {
  throw new Error("Eysk/Maykop→Moscow must retain an M-4 toll component");
}


const tverAdler = output.find((row) => row.id === "tver-adler");
if (!tverAdler || tverAdler.pricingStatus !== "priced" || !(Number(tverAdler.tollAmount) > 0)) {
  throw new Error(`Tver→Adler must have a complete positive toll price: ${tverAdler?.tollAmount ?? "missing"}`);
}
if (!(tverAdler.tollSegments ?? []).some((segment) => String(segment).includes("М-4"))) {
  throw new Error("Tver→Adler must retain the M-4 component");
}
if (Number(tverAdler.tollAmount) < 5000) {
  throw new Error(`Tver→Adler exposed a grossly partial M-4 total: ${tverAdler.tollAmount}`);
}
// The external Yandex screenshot is a point-in-time trip estimate, so compare it
// with the audit's active departure-time amount, not the synthetic max weekend band.
if (Math.abs(Number(tverAdler.tollAmount) - 7830) > 1800) {
  throw new Error(`Tver→Adler active toll drifted too far from the external Yandex QA control (~7830 RUB): ${tverAdler.tollAmount}`);
}
if (Number(tverAdler.tollWeekend) < Number(tverAdler.tollWeekday)) {
  throw new Error(`Tver→Adler weekend band must not be below weekday: ${tverAdler.tollWeekend} < ${tverAdler.tollWeekday}`);
}
