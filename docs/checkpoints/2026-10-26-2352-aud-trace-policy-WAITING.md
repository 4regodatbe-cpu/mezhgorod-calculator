# AUD-TRACE-RECOVERY-01 policy decision — WAITING_FOR_APPROVAL

- Status: WAITING_FOR_APPROVAL; proposal saved, implementation intentionally not started. Parent `0e3e9cb4be09aba212f424a2fd4e7e760b148928`; allowed branch; PR #14 Draft.
- The focused complete/incomplete synthetic V2 tests both exposed a positive approximate recovery subtotal as public `priced`; `complete:true` alone does not establish route-wide tariff sufficiency.
- Proposed behavior: corridor-recovery fragments remain diagnostic unless an independent engine establishes a complete route-wide fare; otherwise monetary totals are null and status unknown. Partial trace cannot use the lower map-matched recovery gate. No threshold values change.
- Proposal and trade-off: [AUD-TRACE-RECOVERY-PROPOSAL.md](../codebase-audit/AUD-TRACE-RECOVERY-PROPOSAL.md). Await explicit user decision before changing API/business behavior.
- Checks: proposal cross-references reviewed; no code/test/runtime policy changed in this block.
- No external services, route audits, browser tests, or tariff sources used.
- Next independent permitted block: technical freshness gate using actual run date; trace-policy change stays paused.
