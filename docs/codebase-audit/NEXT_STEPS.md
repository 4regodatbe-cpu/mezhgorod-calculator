# Codebase audit fixes — next steps

Новый ограниченный план: 6 независимых блоков. Завершение одного блока не означает готовность проекта.

- [x] AUD-DATE-01 — strict V2 departure calendar validation aligned with V3.
- [x] AUD-ERROR-01 — classify client input, known upstream, and unexpected internal exceptions while retaining safe client messages.
- [ ] AUD-CI-01 — IN PROGRESS. Node 24 configs saved in STARTED checkpoint; await PR verify outcome.
- [ ] AUD-UI-01 — abort the active V2 calculation on unmount and add a focused lifecycle regression.
- [ ] AUD-DATA-01 — static evidence and recommendations only; do not edit tariff amounts or `effectiveFrom`.
- [ ] AUD-TRACE-RECOVERY-01 — static evidence and recommendations only; do not change partial-geometry recovery rules.

Progress: 2/6 blocks complete (33.3%); AUD-CI-01 is IN_PROGRESS and does not earn completion until hosted verify is read back. Accepted gates per code block: regression/focused test plus applicable type/build checks. The special-territory PR workflow currently couples runtime path changes to a broad live-probe; avoid an unrelated mass audit, and report that CI limitation honestly. No B03/B10 or route mass audit is authorized here.
