# B01–B12 next steps

Актуально 26.10.2026 20:31 МСК. Selective CI guard confirmed by run40369124628 SUCCESS: classifier `no-route-runtime-change-in-update`, required verify PASS, wide jobs SKIPPED. Branch head `c65db6d026d5fb2b42d62986efa75a675da92a7b`, PR14 Draft. B10 case selection is Maykop-only; Eisk is complete and will not be recaptured. No new provider calls yet. Next: confirm Actions idle; make exactly one comment-only B10 workflow update; allow the narrow Maykop workflow and classifier/verify to run, without writing while active. [CI proof](../checkpoints/2026-10-26-2031-b10-maykop-selective-ci-proof-DONE.md).

Актуально на 26.10.2026 19:10 МСК. B03 DONE 8/8; не повторять. B10: hosted preflight Valhalla/OSRM/BRouter = 3/3 HTTP200; Ейск V2 capture и Thu/Sat offline replay завершены; comparison с V3 сохранён. [Evidence](../../experiments/nationwide-tolls/checks/2026-10-26-b10-v2-hosted-run-40354432433/README.md), [checkpoint](../checkpoints/2026-10-26-1902-b10-eisk-capture-PARTIAL.md). Run40354432433 остановился из-за неверного exact-five-fetch gate; исправленный bounded validator прошёл офлайн по artifact. Майкоп NOT_RUN. Единственный разрешённый сопутствующий special-territory run40354448205 завершён: verify и calculation_timing PASS; live_probe завершился timeout поискового запроса после четырёх HTTP503 и одного cooldown. Повторять не нужно. Ещё один run может повторно запустить тот же широкий PR workflow, поэтому Maykop пока блокируется до появления safe dispatch-механизма или отдельного разрешения. CI optimization пока только proposal: [draft](../CI_LIVE_AUDIT_OPTIMIZATION_PROPOSAL.md), существующий workflow не изменён. PR #14 Draft; тарифы неизменны.

Nationwide Node 24 diagnostic завершён: [run 40332405721](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40332405721), 7/7 PASS, логи и артефакт сохранены в репозитории. Локальный EPERM объясняется Codex sandbox; тесты не повторять без новой причины.

1. **B10 / three-test diagnosis DONE:** 7/7 PASS hosted; [evidence](../../experiments/nationwide-tolls/checks/2026-10-26-three-test-diagnostic/README.md). Локальные падения — sandbox EPERM; тесты завершены, не повторять без новой причины.

2. **B10 PARTIAL:** Eisk 8/22 proxy captured and compared; provider HTTP200 data present for all three routers. The narrow Action's gate defect has been fixed locally/offline but not rerun; Maykop remains NOT_RUN. Don't repeat Eisk and don't start another wide workflow absent permission.
3. **B03 UI scenarios DONE (mocked):** all 8/8 pass on hosted Chrome; swap callback and result reset verified. Original external B-only issue remains unverified; `addressCitySnapshot` remains off. Hosted artifact is retained through 2026-11-25T14:54:08Z.
4. **B01–B02 BLOCKED_BY_SOURCE/DATA:** address pool/circuit и GeoNames intake выполнены; нужны новые подтверждённые labels/hierarchy/coordinates.
5. **B04 IDENTITY_DONE / DATA_BLOCKED:** точные координаты и directed topology сохранены; official km/operator scope/fare unknown, runtime inactive.
6. **B05–B09 BLOCKED_BY_MISSING_RELIABLE_DATA:** fail-closed guards оставить; ранее завершённые исследования не повторять без новых первичных доказательств.
7. **B11 DIAGNOSTICS_DONE; B12 BLOCKED:** нового performance bottleneck нет; acceptance browser runtime заблокирован.

После каждого отдельного блока обязательны focused verification, checkpoint, обновление этого списка/WORK_STATE/WORK_LOG, commit, non-force remote persistence и exact readback. При активном CI запись не выполняется.
