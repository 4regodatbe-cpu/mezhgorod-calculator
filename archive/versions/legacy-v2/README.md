# Архив 2/3 — V2, старый алгоритм

Статус: СОХРАНЁН КАК GIT SNAPSHOT; перенос runtime-исходников ещё не выполнен.

Ветка: [archive/legacy-v2-old-algorithm](https://github.com/4regodatbe-cpu/mezhgorod-calculator/tree/archive/legacy-v2-old-algorithm)  
Точный SHA: `64631d23dc7ca44febafb9ebf1136162c7af9e82` (линия `fix/v2-mobile-layout-2026-10-05`).

**Важная особенность:** финальный маршрут `/v2`, присутствующий в опубликованном V1 Release, мог получать последующие изменения. Его полный релизный снимок гарантирован также веткой `release/v1-release-2026-10-31` (SHA `e3ca3783a8ba9de3271851959eba213bf7a76868`). Нельзя считать исторический SHA 05.10 последней версией V2 без diff.

У V1 Release сохранились импорты из `app/v2/components`; перед переносом `app/v2` сначала выделить разделяемые компоненты и проверить маршруты/формы/тарифы/поиск.
