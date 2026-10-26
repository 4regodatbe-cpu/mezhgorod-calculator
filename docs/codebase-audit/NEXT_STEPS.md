# Codebase audit fixes — next steps

Новый ограниченный план: 6 независимых блоков. Завершение одного блока не означает готовность проекта.

- [x] AUD-DATE-01 — strict V2 departure calendar validation aligned with V3.
- [x] AUD-ERROR-01 — classify client input, known upstream, and unexpected internal exceptions while retaining safe client messages.
- [x] AUD-CI-01 — Node 24 in both workflows; hosted verify PASS. Unplanned live-probe side effect documented; do not rerun.
- [x] AUD-UI-01 — abort active V2 calculation on unmount; focused lifecycle regression passes.
- [x] AUD-DATA-01 — evidence/recommendation saved; fare amounts/effectiveFrom unchanged; source-date clarification remains BLOCKED_BY_DATA.
- [ ] AUD-TRACE-RECOVERY-01 — static evidence and recommendations only; do not change partial-geometry recovery rules.

Progress: 5/6 blocks complete (83.3%). AUD-DATA-01 evidence is saved, but accurate tariff effective dates remain BLOCKED_BY_DATA. The special-territory PR workflow can classify cumulative skipped commits as runtime changes; avoid unrelated live probes. No B03/B10 rerun or route mass audit is authorized here. Remaining: one read-only trace-recovery evidence checkpoint.
