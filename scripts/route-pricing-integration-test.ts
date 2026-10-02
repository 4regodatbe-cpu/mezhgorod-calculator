import { calculateRoutePricing } from "../lib/route-pricing-integration.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Route pricing integration regression failed: ${message}`);
}

function equal(actual: unknown, expected: unknown, message: string) {
  assert(actual === expected, `${message}; got ${String(actual)}, expected ${String(expected)}`);
}

const ordinary = calculateRoutePricing({
  from: "Краснодар",
  to: "Москва",
  vehicle: "comfort",
  legs: [{ from: "Краснодар", to: "Москва", distanceKm: 600 }],
});
equal(ordinary.corridor.id, "normal", "ordinary route corridor");
equal(ordinary.dualTariff, false, "ordinary route must not enable dual tariff");
equal(ordinary.pricingSegments[0].type, "normal", "ordinary segment type");
equal(ordinary.pricingSegments[0].ratePerKm, 32.5, "comfort long distance rate");
equal(ordinary.totalPrice, 19_500, "ordinary route total");

const split = calculateRoutePricing({
  from: "Краснодар",
  to: "Мариуполь",
  vehicle: "comfort",
  legs: [
    { from: "Краснодар", to: "Ростов-на-Дону", distanceKm: 200 },
    { from: "Ростов-на-Дону", to: "Мариуполь", distanceKm: 300 },
  ],
});
equal(split.corridor.id, "m4_dnr", "DNR route corridor");
equal(split.dualTariff, true, "DNR route must enable dual tariff");
equal(split.pricingSegments.length, 2, "split route segment count");
equal(split.pricingSegments[0].type, "normal", "first route segment type");
equal(split.pricingSegments[0].ratePerKm, 40, "first route segment rate");
equal(split.pricingSegments[1].type, "special", "special route segment type");
equal(split.pricingSegments[1].ratePerKm, 80, "special comfort rate");
equal(split.totalPrice, 32_000, "split route total");

const review = calculateRoutePricing({
  from: "Краснодар",
  to: "Бердянск",
  vehicle: "comfort",
  legs: [{ from: "Краснодар", to: "Бердянск", distanceKm: 300 }],
});
equal(review.dualTariff, false, "unverified borderline corridor must fail closed");
equal(review.reviewRequired, true, "borderline corridor must request review");
equal(review.pricingSegments[0].type, "normal", "borderline route must use normal tariff");
equal(review.totalPrice, 10_500, "borderline route uses normal total");

console.log("Route pricing integration GREEN");
