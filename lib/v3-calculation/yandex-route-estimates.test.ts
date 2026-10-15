import test from "node:test";
import assert from "node:assert/strict";
import { acceptedYandexRouteEstimate, yandexRouteEstimateTolls } from "./yandex-route-estimates";

const point = (label: string, lng: number, lat: number) => ({ label, position: { lng, lat } });
const spb = point("Санкт-Петербург", 30.314494, 59.938676);
const krasnodar = point("Краснодар", 38.975313, 45.035470);

test("uses the accepted direction-specific Krasnodar to St Petersburg Maps estimate on capture date", () => {
  const match = acceptedYandexRouteEstimate({ from: krasnodar, to: spb, meters: 2_061_400, departureAt: "2026-10-15T11:09:00+03:00" });
  assert.equal(match?.id, "krasnodar-to-spb");
  assert.deepEqual(yandexRouteEstimateTolls(match!), {
    amount: 10_240,
    weekdayAmount: 10_240,
    weekendAmount: 10_240,
    period: "оценка Яндекс Карт от 2026-10-15",
    confidence: "matched",
    pricingStatus: "priced",
    segments: ["Яндекс Карты · весь маршрут krasnodar-to-spb: ~10 240 ₽"],
  });
});

test("keeps the reverse amount separate and does not transfer it across dates or endpoints", () => {
  const input = { from: spb, to: krasnodar, meters: 2_061_400, departureAt: "2026-10-15T11:09:00+03:00" };
  assert.equal(acceptedYandexRouteEstimate(input)?.id, "spb-to-krasnodar");
  const reverse = acceptedYandexRouteEstimate({ ...input, from: krasnodar, to: spb });
  assert.equal(reverse?.id, "krasnodar-to-spb");
  assert.equal(reverse?.rub, 10_240);
  assert.equal(acceptedYandexRouteEstimate({ ...input, departureAt: "2026-10-16T11:09:00+03:00" }), null);
  assert.equal(acceptedYandexRouteEstimate({ ...input, meters: 2_300_000 }), null);
  assert.equal(acceptedYandexRouteEstimate({ ...input, from: point("Moscow", 37.617644, 55.755819) }), null);
});

test("uses only the accepted directed ZSD and Kazan-to-Moscow route controls", () => {
  const blagodatnaya = point("Благодатная", 30.324797, 59.876052);
  const primorsky = point("Приморский", 30.244964, 59.983693);
  const kazan = point("Казань", 49.106414, 55.796127);
  const moscow = point("Москва", 37.617644, 55.755819);
  const date = "2026-10-15T11:00:00+03:00";
  assert.equal(acceptedYandexRouteEstimate({ from: blagodatnaya, to: primorsky, meters: 22_600, departureAt: date })?.rub, 600);
  assert.equal(acceptedYandexRouteEstimate({ from: primorsky, to: blagodatnaya, meters: 22_900, departureAt: date })?.rub, 900);
  assert.equal(acceptedYandexRouteEstimate({ from: kazan, to: moscow, meters: 821_400, departureAt: date })?.rub, 4_400);
  assert.equal(acceptedYandexRouteEstimate({ from: moscow, to: kazan, meters: 820_200, departureAt: date }), null);
});
