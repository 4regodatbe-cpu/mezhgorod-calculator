# DONE recovery и критерии приёмки — 24.10.2026 МСК

Remote/PR source: 7058f97d8067ab7ddec3a9b838c47c179f86bd05, tree b3b64536d3e75ea504bbb39e011058a3b36ec7db. PR14 open/draft, head соответствует разрешённой fix/v3-missing-route-prices-2026-10-15. Remote уже содержит source intake/pilot/DNS blocker/design; четыре готовых шага не повторены. Latest Actions 40083903106 completed/success; live Photon failure не переименован в PASS. Активных/queued среди последних трёх runs нет.

Восстановлен отдельный checkout текущего сеанса. Shared clone из прежнего partial checkout не имел четырёх blobs; восстановлены через GitHub fetch_file на exact SHA. git hash-object -w подтвердил точные blob IDs: 7ebe6f3f8c43b363f2356577f7cd89c6acc844fb, fe55e440e9cd594907fb3850a3afd67d0f492325, 63a13919915bcd75b40d6330c94dbe9127b848ba, e6114a06a7aa2d2f6f80ca0b97eed15f681e2414. Их содержимое не изменено. Посторонний временный файл не включается в commit.

Независимый короткий docs-only результат: SETTLEMENT_PILOT_ACCEPTANCE.md — конкретный формат evidence/stop-критерии поставки, целостности, provenance, приоритетной географии, русских алиасов, омонимов, точности, размера и атрибуции. Это план проверки, не её выполнение. BLOCKERS актуализирован, старый запрос повторного fallback review убран из текущей строки.

Проверки: git diff --check; ссылки новых документов проверены локально; paths диффа только docs/experiment Markdown. Новых поисковых запросов/HEAD/downloads/route measurements/unit/build runs 0. Старые 887 tests не повторены и не приписываются этой работе. Никаких runtime switches/code/data/координат не добавлено. Main/Production/Android/backup не менялись.

Следующий исполнимый шаг: pilot A только после изменения доступности download.geonames.org; до B сохранить отдельный STARTED с измеренным размером/лимитами, затем B/C по acceptance matrix. В текущей среде доказательств изменения доступа нет; прежние DNS HEAD не повторять. Все разрешённые независимые документальные части этого блока завершены; реализация остаётся NOT_STARTED до реальных данных.

Сохранение: локальный commit → connector create_tree/create_commit → non-force update_ref expected_sha=7058f97d8067ab7ddec3a9b838c47c179f86bd05 → exact remote/tree readback. Собственный SHA фиксируется readback, не самоссылкой.
