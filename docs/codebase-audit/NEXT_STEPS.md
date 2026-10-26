# Codebase audit fixes — next steps

## Follow-up plan (started 26.10.2026 23:49 МСК; separate from the completed prior six-block plan)

- [x] Block 1 — V2 full/incomplete trace characterization against saved synthetic case; 0 network calls. Checkpoint: [trace regression](../checkpoints/2026-10-26-2349-aud-trace-regression-DONE.md).
- [ ] Block 2 — propose safe public behavior for partial recovery; implementation paused pending user approval. Do not change current business behavior meanwhile.
- [ ] Block 3 — freshness gate uses actual run date by default and a fixed test date override; preserve UNKNOWN effective dates.
- [ ] Block 4 — document three unknown effective-date rows and exact primary evidence required; no tariff-data edits.

Current follow-up progress: 1/4 blocks complete. Previous six-block plan below is historical and remains complete.

Новый ограниченный план: 6 независимых блоков. Завершение одного блока не означает готовность проекта.

- [x] AUD-DATE-01 — strict V2 departure calendar validation aligned with V3.
- [x] AUD-ERROR-01 — classify client input, known upstream, and unexpected internal exceptions while retaining safe client messages.
- [x] AUD-CI-01 — Node 24 in both workflows; hosted verify PASS. Unplanned live-probe side effect documented; do not rerun.
- [x] AUD-UI-01 — abort active V2 calculation on unmount; focused lifecycle regression passes.
- [x] AUD-DATA-01 — evidence/recommendation saved; fare amounts/effectiveFrom unchanged; source-date clarification remains BLOCKED_BY_DATA.
- [x] AUD-TRACE-RECOVERY-01 — evidence/recommendation saved; recovery thresholds/policy unchanged.

Progress: all 6/6 requested blocks complete. The fix plan itself is 4/4 P2 code blocks (100%); the two accompanying reviews are evidence-only and do not imply product policy/data is resolved. AUD-DATA-01 source dates remain BLOCKED_BY_DATA; AUD-TRACE-RECOVERY-01 requires a separately authorized policy change after focused follow-up tests. No B03/B10 or mass route audit was repeated.
