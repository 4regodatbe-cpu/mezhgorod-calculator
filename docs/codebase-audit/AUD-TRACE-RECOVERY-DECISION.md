# AUD-TRACE-RECOVERY-01 — approved behavior and implementation

Decision: APPROVED by the user on 2026-10-27. This resolves the proposal in [AUD-TRACE-RECOVERY-PROPOSAL.md](AUD-TRACE-RECOVERY-PROPOSAL.md).

- Corridor-recovery output is an approximate subtotal only; it cannot by itself be exposed as the full public fare.
- Without independently confirmed route-wide cost, V2 exposes `pricingStatus: "unknown"` and null `amount`, `weekdayAmount`, and `weekendAmount`.
- When diagnostic mode is requested, preserve the corridor subtotal, period, confidence, and section labels under `fast.tollDiagnostics.corridorRecovery`. The customer-facing toll totals remain null.
- `recoverCorridorTolls` uses map-matched thresholds only when trace status is toll **and** `complete === true` **and** `boothEventCoverage === "complete"`. Missing/incomplete coverage uses the existing stricter geometric threshold. Numeric M4/M12 thresholds are unchanged.
- Full pricing independently established by route toll composition remains `priced`, even if the supplied map-match trace is incomplete. A complete trace alone does not make an approximate subtotal a full fare.
- No tariff values, road geometry, fastest-route selection, or independently composed price calculation changed.

Verification: see [implementation checkpoint](../checkpoints/2026-10-27-0054-aud-trace-recovery-fix-DONE.md). The check was offline and focused; broad audit/build and hosted Actions were not run.
