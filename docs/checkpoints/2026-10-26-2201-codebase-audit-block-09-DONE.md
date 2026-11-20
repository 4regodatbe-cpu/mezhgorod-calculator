# Codebase audit block 9 — tariff composition and unknown handling — DONE — 26.10.2026 22:01 МСК

Branch `fix/v3-missing-route-prices-2026-10-15`, parent `4c060c4d73a6c4d653895e876246d56e9f5dbfbd`; PR #14 Draft; no active Actions at pre-write check. Static read of route pricing, composition, validation/recovery and existing focused source tests. No tests executed; no tariff or code edits.

## Confirmed defensive contracts

- `composeRouteTolls` rejects partial/unresolved/duplicate/conflicting legacy-vs-V3 components as `unknown`, and requires safe integer amounts.
- `calculateLegTolls` marks a blocked composition and does not continue recovery; `zeroUnknownTolls` emits internal zero only as sentinel, then `tollsForApi` returns null amounts/pricingStatus unknown unless validation says confirmed free.
- Existing `scripts/systemic-toll-composition-test.ts` contains assertions that partial M4 or missing CKAD/M11 cannot yield a route total; read only, not run.

## P2 candidate: AUD-TRACE-RECOVERY-01

`validateTollEdges` may return `complete:false,status:"toll"` when some chunks failed but a successful chunk found a toll edge (lines317–325). `recoverCorridorTolls` sets `mapMatched = validation.status === "toll"` (line117) and lowers the required consecutive geometry run (M4 2 vs4; M12 2 vs5, data lines). A matching recovery can emit only its matched segment sum with confidence matched and be serialized as priced. Risk is plausible but unproven because it also requires route geometry to match a corridor segment sequence; no runtime case establishes a subtotal/wrong fare. Recommend bounded fixtures for complete/incomplete evidence and short/long corridors; then decide policy. Medium behavioral change risk (could increase unknowns); isolatable. Do not change tariffs.

Block done 9/18 (50.0%). Next B10 V2 UI state statically.
