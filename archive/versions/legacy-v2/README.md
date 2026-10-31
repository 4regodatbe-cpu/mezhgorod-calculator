# Архив 2/3 — V2, старый алгоритм

Статус: физический [`source.tar.gz`](source.tar.gz) сохранён вместе с [полным манифестом](manifest.json); 431/431 файлов извлечены и сверены с точным Git-деревом. Это архив исходной исторической линии, а не перенос действующего `/v2`.

Ветка: [archive/legacy-v2-old-algorithm](https://github.com/4regodatbe-cpu/mezhgorod-calculator/tree/archive/legacy-v2-old-algorithm)  
Точный SHA: `64631d23dc7ca44febafb9ebf1136162c7af9e82` (линия `fix/v2-mobile-layout-2026-10-05`).

**Важная особенность:** финальный маршрут `/v2`, присутствующий в опубликованном V1 Release, мог получать последующие изменения. Его полный релизный снимок гарантирован также веткой `release/v1-release-2026-10-31` (SHA `e3ca3783a8ba9de3271851959eba213bf7a76868`). Нельзя считать исторический SHA 05.10 последней версией V2 без diff.

У V1 Release сохранились импорты из `app/v2/components`; перед переносом `app/v2` сначала выделить разделяемые компоненты и проверить маршруты/формы/тарифы/поиск.

Размер архива: 1 427 554 байта. SHA256: `a183e99f1aad65511e759bafbe796f5f5f22dbe0d1a406311ceba3505668789a`. Для восстановления: `sha256sum source.tar.gz`, затем `mkdir -p restore && tar -xzf source.tar.gz -C restore`. Сверить файлы с `manifest.json`; исходный Git tree — `e56647733e8bce485b018e80696f9e0946c0b706`.
