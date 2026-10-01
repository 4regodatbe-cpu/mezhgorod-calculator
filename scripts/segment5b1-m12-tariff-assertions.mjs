import { writeFile } from "node:fs/promises";
import { priceM12Category1, m12Category1TariffSnapshot } from "../lib/toll-engine/m12-tariffs.ts";

const snapshot = m12Category1TariffSnapshot();
const assertions = [];

function check(name, actual, expected) {
  const pass = Object.is(actual, expected);
  assertions.push({ name, pass, actual, expected });
  if (!pass) throw new Error(`${name}: expected ${expected}, got ${actual}`);
}

check("stop-count", snapshot.stops.length, 20);
check("adjacent-count", snapshot.adjacentCategory1Rub.length, 19);
check("moscow-to-shali-adjacent-sum", snapshot.adjacentCategory1Rub.reduce((sum, value) => sum + value, 0), 5909);
check("moscow-to-kazan-adjacent-sum", snapshot.adjacentCategory1Rub.slice(0, 18).reduce((sum, value) => sum + value, 0), 5847);

for (const expected of snapshot.officialMatrixAssertions) {
  const result = priceM12Category1(expected.from, expected.to);
  check(`matrix:${expected.from}->${expected.to}:status`, result.status, "priced");
  check(`matrix:${expected.from}->${expected.to}:amount`, result.amountRub, expected.rub);
}

for (let index = 0; index < snapshot.adjacentCategory1Rub.length; index += 1) {
  const from = snapshot.stops[index];
  const to = snapshot.stops[index + 1];
  const amount = snapshot.adjacentCategory1Rub[index];
  const forward = priceM12Category1(from.id, to.id);
  const reverse = priceM12Category1(to.id, from.id);
  check(`adjacent:${from.id}->${to.id}:status`, forward.status, "priced");
  check(`adjacent:${from.id}->${to.id}:amount`, forward.amountRub, amount);
  check(`adjacent:${to.id}->${from.id}:status`, reverse.status, "priced");
  check(`adjacent:${to.id}->${from.id}:amount`, reverse.amountRub, amount);
}

const unknown = priceM12Category1("not_a_real_rvp", "kazan_p239");
check("unknown-rvp-status", unknown.status, "unknown");
check("unknown-rvp-amount-null", unknown.amountRub, null);

const same = priceM12Category1("kazan_p239", "kazan_p239");
check("same-rvp-status", same.status, "same_rvp");
check("same-rvp-amount", same.amountRub, 0);

const report = {
  generatedAt: new Date().toISOString(),
  snapshot: {
    road: snapshot.road,
    vehicleCategory: snapshot.vehicleCategory,
    effectiveFrom: snapshot.order.effectiveFrom,
    order: snapshot.order.number,
    orderDate: snapshot.order.date,
  },
  assertionCount: assertions.length,
  passed: assertions.filter((item) => item.pass).length,
  failed: assertions.filter((item) => !item.pass).length,
  assertions,
};

await writeFile("segment5b1-m12-tariff-assertions.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(`M12 official tariff assertions: ${report.passed}/${report.assertionCount} passed; Moscow→Kazan=${priceM12Category1("moscow", "kazan_p239").amountRub} RUB; Moscow→Shali=${priceM12Category1("moscow", "shali").amountRub} RUB`);
