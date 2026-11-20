# PART A DONE — strict М11 → Егорьевское matcher

18.10.2026 19:10–19:15 МСК. Recovery STARTED84e365a7f514f71c6786603563166dc786628a9c/tree81f024c402e463cbc8166a77c48dfa85029d0b9e сохранён, branch readback и git commit readback совпали. Прерывание произошло после update_ref до отчёта. Локальная папка была пуста; восстановлена clone разрешённой ветки с exacthead/tree. Никакие исходные OSM/operator запросы и currentparser replay не повторялись.

Добавлены lib/v3-calculation/ckad-m11-egoryevskoye-boundary.ts, scripts/v3-ckad-m11-egoryevskoye-boundary.test.ts и source-snapshots/ckad/2026-10-18-ramenskoe-exit/physical-directed.json. Только standalone, composer не подключён. Физический JSON содержит entry48 и41 независимую точку (12 prefix+29 exit), exact before/after4. Exit density начинается на первой новой exit точке12: точка11 — ещё core, не начало съезда. Не скопирован старый M12 connector.

Гарантии: complete chunks/booth coverage, toll status, один strictM11/CKAD block, repeatedfalse, exact ways/endnodes/names, paid CKADlastway, один CKADbooth, strictend25m, orderedpoints25m, entry corridor без отклонений, density0.5km/5km, boundedlength. Ни caseID, ни деньги, ни departure в matcher не включены.

Focused timeout60s: 3/3 PASS. Один own current validation positive, original snapshot negative;23 negative context variants и8 geometry/strict variants. tsc --noEmit exit0; targeted ESLint exit0; git diff --check exit0. Логи в checks/2026-10-18-ckad-ramenskoe-boundary/part-a. Внешние route/trace/source requests0. Fullgate/build ещё НЕ выполнены для этого кода. Новых priced components0: matcher пока не подключён.

NEXT PART B: resolver exact forward pair1218, пять own departure quotes (2668/2668/2828/2848/2928), APIready2668/failedtrace null, focused/fullgate/build. После сохраненияA дождаться всех active jobs перед следующей записью. PR14 draft; main/merge/Production/Android не менялись.
