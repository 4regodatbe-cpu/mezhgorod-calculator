import assert from "node:assert/strict";
import { selectEffectiveTariffSnapshot, tariffFreshness, validateTariffMetadata, type TariffSnapshotMetadata } from "../lib/toll-engine/tariff-versioning.ts";
import { TARIFF_SNAPSHOT_REGISTRY } from "../lib/toll-engine/tariff-registry.ts";

const base = (id: string, from: string | null, to: string | null = null): TariffSnapshotMetadata => ({
  id, systemId: "fixture", source: "fixture", observedAt: "2026-10-01", publishedAt: null,
  effectiveFrom: from, effectiveTo: to, tariffMode: "not_applicable", vehicleCategory: "I", currency: "RUB", staleAfterDays: 30,
});

assert.equal(validateTariffMetadata(base("x", null)).length, 0, "unknown effective date is valid provenance but not selectable");
assert.equal(selectEffectiveTariffSnapshot([base("unknown", null)], x => x, "2026-10-01").status, "unknown");
const old = base("old", "2026-03-01", "2026-09-30");
const current = base("current", "2026-10-01");
assert.equal(selectEffectiveTariffSnapshot([old, current], x => x, "2026-09-30").status, "selected");
assert.equal(selectEffectiveTariffSnapshot([old, current], x => x, "2026-10-01").status, "selected");
assert.equal(selectEffectiveTariffSnapshot([current], x => x, "2026-09-30").status, "unknown");
assert.equal(selectEffectiveTariffSnapshot([base("a", "2026-10-01"), base("b", "2026-10-01")], x => x, "2026-10-01").status, "unknown");
assert.equal(tariffFreshness(current, "2026-10-01").status, "fresh");
assert.equal(tariffFreshness(current, "2026-11-15").status, "stale");
assert.equal(tariffFreshness(current, "2026-09-30").status, "future_observation");

const m12 = TARIFF_SNAPSHOT_REGISTRY.find(x => x.id === "m12-2026-03-02-category1");
assert.ok(m12 && m12.effectiveFrom === "2026-03-02");
const m11 = TARIFF_SNAPSHOT_REGISTRY.find(x => x.systemId === "m11-58-679-avtodor");
assert.ok(m11 && m11.effectiveFrom === null, "M-11 unknown effective date must stay fail-closed");
const other = TARIFF_SNAPSHOT_REGISTRY.filter(x => x.systemId === "avtodor-other-roads");
assert.equal(other.length, 2);
assert.deepEqual(new Set(other.map(x => x.tariffMode)), new Set(["transponder", "noTransponder"]));
assert.ok(other.every(x => x.effectiveFrom === null));
console.log("Segment 7 direct core test: GREEN");
