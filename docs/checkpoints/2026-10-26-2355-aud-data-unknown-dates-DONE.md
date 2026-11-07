# AUD-DATA-01 unknown effective-date evidence list — DONE

- Status: DONE (evidence inventory only); parent `8c66a7b73ebdbd4240a854d5bb1c791fc74b1e9b`; allowed branch only; PR #14 remains Draft.
- Listed the three null `effectiveFrom` records: M11 58–679 current A1, Avtodor other roads Category I/transponder, and Avtodor other roads Category I/no-transponder.
- For M11, requested the complete signed Avtodor order No. 274 dated 2026-09-03, all applicable M11 58–679 Category-I annex/table pages and explicit commencement/amendment clause; existing PDF/OCR is partial and does not establish the exact effective date.
- For each aggregated other-roads record, requested the official Avtodor order/publication version plus explicit effective-date clause and complete matching tables for its payment mode across underlying M1, M3, CKAD, and A289 rows. If the rates have different dates, registry records must be split rather than assigned one aggregate date.
- Check: compared record IDs and source metadata against `lib/toll-engine/tariff-registry.ts`, `docs/codebase-audit/AUD-DATA-01.md`, and existing Segment 6 acquisition evidence; links/path names reviewed; `git diff --check` PASS.
- No network requests, tariff values, `effectiveFrom`, or business logic changed. The list describes documents needed, not newly obtained evidence.
- Evidence list: [AUD-DATA-01 unknown-date requirements](../codebase-audit/AUD-DATA-01-UNKNOWN-EFFECTIVE-DATES.md).
- Next: all independent blocks in this follow-up are complete; the separate V2 public-pricing policy decision remains WAITING_FOR_APPROVAL.
