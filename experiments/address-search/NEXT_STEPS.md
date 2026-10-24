# DONE PREVIEW — repeated address edits

[Verified full UI story](../../docs/checkpoints/2026-10-20-repeated-address-search-VERIFIED.md). Code source4f62abf; tests819/819, PreviewREADY. Problem prefix and exact two-calculation/replacement flowPASS. No more live repeats. Release only on direct current-task request; on a later outage inspect bounded failure diagnostics before altering limits/providers. Production remains4b647bf without latest patch/bypass correction.

# IN PROGRESS — verify20s search patch

[Patch checkpoint](../../docs/checkpoints/2026-10-20-repeated-address-search-PATCH.md). Await Preview standard build, then one live Доне query; inspect sanitized all-source failure categories if needed. Do not repeat successful route/tariff audits. No Production release in this task.

# IN PROGRESS — repeated address edits, 2026-10-20

Read [UI evidence](../../docs/checkpoints/2026-10-20-repeated-address-search-UI.md). Fresh prefix Доне failed after two valid route calculations and prior successful Донецк. Cached full query works. Inspect one exact server response; add sanitized first-failure diagnostics and focused resilience tests. Preserve all search windows/ranking, cancellation, tariffs and bypass correction. No new Production release.

# Address-search next steps

## Выполнено — 20.10.2026

Исправление опубликовано по прямому запросу пользователя: Production `dpl_DGhwwdXRTKwbbEMR127M5AbDMAoP`, application source `4b647bfe01c903352f3842072ceafb23ea6d10a2`. Оба основных alias подтверждены. Build810/810 PASS, Next static16/16; GET /api/suggest для «Ростов», «Красн», «Моск», «Краснодар» дал HTTP200 и20 результатов. /v2 сохранена как старый алгоритм. PR14 draft, без merge/main.

## Следующий шаг при повторном сбое

Проверить точный полный ввод B и время попытки по live POST /r; GET API не заменяет UI проверку. UI A→B и live POST в выпуске не проверены. Не менять ranking или тарифы без воспроизведения. Shared browser cache ускоряет повтор того же запроса, первый запрос зависит от Photon.
