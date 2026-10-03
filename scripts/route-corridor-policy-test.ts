import { resolveCorridor, SPECIAL_TARIFF_RATES } from "../lib/route-corridors.ts";

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(`Corridor policy regression failed: ${message}`);
}

const genichesk = resolveCorridor("Краснодар", "Геническ");
assert(genichesk.corridor === "crimea_dzhankoy", "Krasnodar -> Genichesk must use the Dzhankoy Crimea corridor");
assert(genichesk.autoDual && genichesk.specialLegIndex === 1, "Crimea route must auto-enable its special second tariff leg");

const reverseGenichesk = resolveCorridor("Геническ", "Анапа");
assert(reverseGenichesk.corridor === "crimea_dzhankoy", "Genichesk -> Anapa must keep the same corridor");
assert(reverseGenichesk.specialLegIndex === 0, "reverse special route must mark the first leg as special");

const melitopol = resolveCorridor("Краснодар", "Мелитополь");
assert(melitopol.corridor === "manual_review", "Melitopol must stay out of the automatic Crimea corridor");
assert(!melitopol.autoDual, "unverified Melitopol corridor must not auto-enable special pricing");

const mariupol = resolveCorridor("Керчь", "Мариуполь");
assert(mariupol.corridor === "m4_dnr", "Crimea -> Mariupol must use the M4/DNR corridor");

const donetsk = resolveCorridor("Сочи", "Донецк");
assert(donetsk.corridor === "m4_dnr", "southern coast -> Donetsk must use M4/DNR corridor");

const lugansk = resolveCorridor("Краснодар", "Луганск");
assert(lugansk.corridor === "m4_lnr", "Krasnodar -> Lugansk must use M4/LNR corridor");

const borderline = resolveCorridor("Краснодар", "Бердянск");
assert(borderline.corridor === "manual_review", "borderline destinations must fail closed until benchmarked");

const ordinary = resolveCorridor("Краснодар", "Москва");
assert(ordinary.corridor === "normal" && !ordinary.autoDual, "ordinary route must not auto-enable dual tariff");

assert(SPECIAL_TARIFF_RATES.standard === 70, "special standard tariff must be 70");
assert(SPECIAL_TARIFF_RATES.comfort === 80, "special comfort tariff must be 80");
assert(SPECIAL_TARIFF_RATES.comfortPlus === 90, "special comfort+ tariff must be 90");
assert(SPECIAL_TARIFF_RATES.minivan === 110, "special minivan tariff must be 110");

console.log("Route corridor policy GREEN");
