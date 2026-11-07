# 2GIS evidence next v2

Полный пересмотр38 задач по политике28.10. Действующие выводы: TASK_RESULTS.json/md, REVIEW_CHANGES.md, POLICY_RECONCILIATION.md, ACCEPTED_WORKING_CALCULATIONS.json, MAIN_CODEX_INTEGRATION.md.

HISTORICAL_V1 — неизменный предыдущий пакет, включая старые выводы и null fixtures; это история, не действующая политика. Все текущие региональные решения в M4_545/M12/CKAD/M4_62_71/ZSD_PULKOVO_M11 REVIEW.md.

Четыре working records: B05 bundle320/410, полныйCKAD981, два самостоятельных airport access38. Receipt records0; не полные поездки.

Проверка: python3 REGRESSION_TESTS/policy_review_test.py; python3 REGRESSION_TESTS/verify_package.py. Старые тесты можно запускать внутри HISTORICAL_V1 без измененияfixtures. Новых API-вызовов нет.
