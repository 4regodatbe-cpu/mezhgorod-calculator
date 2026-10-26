# Codebase audit fixes — next steps

Новый ограниченный план: 6 независимых блоков. Завершение одного блока не означает готовность проекта.

- [x] AUD-DATE-01 — strict V2 departure calendar validation aligned with V3.
- [x] AUD-ERROR-01 — classify client input, known upstream, and unexpected internal exceptions while retaining safe client messages.
- [x] AUD-CI-01 — Node 24 in both workflows; hosted verify PASS. Unplanned live-probe side effect documented; do not rerun.
- [ ] AUD-UI-01 — abort the active V2 calculation on unmount and add a focused lifecycle regression.
- [ ] AUD-DATA-01 — static evidence and recommendations only; do not edit tariff amounts or `effectiveFrom`.
- [ ] AUD-TRACE-RECOVERY-01 — static evidence and recommendations only; do not change partial-geometry recovery rules.

Progress: 3/6 blocks complete (50%). Accepted gates per code block: regression/focused test plus applicable type/build checks. The special-territory PR workflow currently couples runtime path changes to a broad live-probe and can classify cumulative skipped commits as runtime changes; avoid another unrelated live probe. No B03/B10 rerun or route mass audit is authorized here.
