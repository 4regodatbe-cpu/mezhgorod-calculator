const baseUrl = (process.env.CALCULATOR_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const checks = [];
let failed = false;

async function expectStatus(name, path, options, expected) {
  try {
    const response = await fetch(`${baseUrl}${path}`, options);
    const ok = response.status === expected;
    const text = await response.text();
    checks.push({ name, ok, expected, actual: response.status, body: text.slice(0, 300) });
    if (!ok) failed = true;
    console.log(`${ok ? "PASS" : "FAIL"} ${name}: HTTP ${response.status}, expected ${expected}`);
  } catch (error) {
    failed = true;
    checks.push({ name, ok: false, expected, actual: "request_error", body: error instanceof Error ? error.message : String(error) });
    console.log(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const jsonHeaders = { "content-type": "application/json", "user-agent": "MezhgorodApiContract/1.0" };
const from = { label: "Москва", position: { lat: 55.755819, lng: 37.617644 } };
const to = { label: "Казань", position: { lat: 55.796127, lng: 49.106405 } };

await expectStatus("invalid calculation mode", "/api/v2/calculate", {
  method: "POST", headers: jsonHeaders, body: JSON.stringify({ mode: "broken", from, to }),
}, 400);
await expectStatus("invalid departure timestamp", "/api/v2/calculate", {
  method: "POST", headers: jsonHeaders, body: JSON.stringify({ mode: "standard", from, to, departureAt: "not-a-date" }),
}, 400);
await expectStatus("out-of-range route coordinates", "/api/v2/calculate", {
  method: "POST", headers: jsonHeaders, body: JSON.stringify({ mode: "standard", from: { label: "A", position: { lat: 95, lng: 37 } }, to }),
}, 400);
await expectStatus("dual mode requires midpoint", "/api/v2/calculate", {
  method: "POST", headers: jsonHeaders, body: JSON.stringify({ mode: "dual", from, to }),
}, 400);
await expectStatus("malformed calculation JSON", "/api/v2/calculate", {
  method: "POST", headers: jsonHeaders, body: "{",
}, 400);
await expectStatus("oversized suggestion query", `/api/suggest?q=${encodeURIComponent("a".repeat(201))}`, {
  method: "GET", headers: { "user-agent": "MezhgorodApiContract/1.0" },
}, 400);
await expectStatus("unknown toll telemetry cannot claim zero", "/api/collect", {
  method: "POST", headers: jsonHeaders, body: JSON.stringify({
    type: "route_v2", fromRegion: "Москва", toRegion: "Казань", distanceKm: 800, durationMin: 720,
    routeType: "Быстрый", totals: { standard: 20000, comfort: 24000, comfortPlus: 28000, minivan: 40000 },
    tollWeekday: 0, tollWeekend: 0, tollPricingStatus: "unknown",
  }),
}, 400);
await expectStatus("free toll telemetry must remain zero", "/api/collect", {
  method: "POST", headers: jsonHeaders, body: JSON.stringify({
    type: "route_v2", fromRegion: "Москва", toRegion: "Казань", distanceKm: 800, durationMin: 720,
    routeType: "Бесплатный", totals: { standard: 20000, comfort: 24000, comfortPlus: 28000, minivan: 40000 },
    tollWeekday: 1, tollWeekend: 1, tollPricingStatus: "free",
  }),
}, 400);

if (failed) {
  console.error(JSON.stringify({ failed, checks }, null, 2));
  process.exitCode = 1;
} else {
  console.log(`API contract smoke GREEN: ${checks.length} checks`);
}
