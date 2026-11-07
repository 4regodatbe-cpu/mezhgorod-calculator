# Report переживает утрату evidence

Статус DONE — report fix/focused; STARTED — полный audit gate. Parent9f1921a6cd3d68b94d66f00a9f49affcef47e7b2 remote подтверждён; PR14, рабочая ветка fix/v3-missing-route-prices-2026-10-15.

build-systemic-audit-report.mjs теперь отмечает отсутствующий/битый JSON/gzip, продолжает остальные cases; исторический audited не считается восстановленным без raw+same-date+weekend. Live count требует raw, trace/parity без raw не засчитываются. Added integration test моделирует потерянный live/raw и повреждённый replay во временном каталоге.

node --test experiments/nationwide-tolls/systemic-audit-report.test.mjs:1/1PASS; stdout evidence/2026-10-15-report-recovery.tap. Генератор report на реальном восстановленном наборе завершился успешно:40historic attempts,26complete sets,26same-date-parity records,14missing live summaries. Есть ещё один raw без live summary, поэтому inventory27rawOD не равен report26complete.14ошибок report не равны55missing refs inventory: report прекращает обработку case при missing live и не проверяет остальные ссылки этого case. Полный missing list в EVIDENCE_AVAILABILITY.json. git diff --check PASS. Тарифы/app/lib не менялись.

STARTED следующий шаг: npm run test:audit с сохранением полного stdout в docs/checkpoints/evidence. При ошибке не считать gate пройденным; сохранить точный blocker. Установка зависимостей/Next build ещё не выполнены. Новые live routes пока не запускать.
