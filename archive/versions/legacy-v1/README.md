# Архив 1/3 — первоначальный калькулятор

Статус: физический [`source.tar.gz`](source.tar.gz) сохранён вместе с [полным манифестом](manifest.json); 316/316 файлов извлечены и сверены с точным Git-деревом.

Ветка: [archive/legacy-v1-before-v2](https://github.com/4regodatbe-cpu/mezhgorod-calculator/tree/archive/legacy-v1-before-v2)  
Точный SHA: `636e6801bdd2a3db6ce4714830dc8a05fc73b7c9` (исторический `main` на момент инвентаризации).

Корневой `app/page.tsx` этой версии содержит первоначальный однофайловый калькулятор и использует `/api/calculate`. Это самостоятельный исторический ориентир; никаких новых исправлений здесь не вносить.

Размер архива: 350 346 байт. SHA256: `e398abe654526adbb41fd781dbbe1265396564c3531722d5cd2ec9149af0b69b`. Для восстановления: `sha256sum source.tar.gz`, затем `mkdir -p restore && tar -xzf source.tar.gz -C restore`. Сверить извлечённые файлы с `manifest.json`; исходный Git tree — `cf29803849b8bdbd83036f7241a6cdf2af4212b7`. Историческую ветку не менять и не удалять.
