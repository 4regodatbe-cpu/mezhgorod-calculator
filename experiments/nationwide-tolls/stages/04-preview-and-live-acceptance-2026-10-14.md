# Этап 4–5: GitHub checkpoint, Preview и живые проверки — 14 октября 2026

## 22:17–22:35 МСК — выполненный блок и исправление CI

Запрос пользователя: «Дальше». Продолжено сохранение проверенной версии и тестовая публикация. Основной расчёт и тарифы в этом блоке не менялись.

### Сохранение и публикация

- Исходная локальная audit-ветка: `3b675df36364212027fb9fa9aed6c8c13365d1e0`, полный build ранее 621/621 PASS.
- База GitHub: integration/v3-product-baseline-2026-10-14, `a5c892e67af4b050f53bf2211b62feac34d6df6c`, повторно проверена через ls-remote и connector.
- 116 изменений относительно базы: 114 blobs и 2 удаления. Объём 26 380 859 байт. Каждый blob сверялся с локальным Git SHA, чтения крупных файлов проверялись по длине. Прогресс записывался после каждого подтверждённого blob; прерывание продолжено с 10, без повторной отправки подтверждённых объектов.
- GitHub create_tree: `943b7806de6f09a3a0870a0074ed7acd1dadb8d6`, точно совпал с локальным HEAD tree. Snapshot commit `37d55f6203afbb136b573d6d8502182becdb2086`, parent a5c892e. Создана ветка audit/v3-matrix-provenance-2026-10-14; fetch и git diff --exit-code между ней и 3b675df PASS.
- Это публикация точного итогового дерева, включая PDF и всю документированную историю. Исходные промежуточные Git-коммиты остаются локально: archive/v3-local-source-3b675df-2026-10-14 и исходная audit-ветка. Рабочая локальная audit/v3-published-checkpoint-2026-10-14 отслеживает опубликованную ветку.
- Исторический PR #10 проверен: closed, другой head/base. Новый draft PR [#13](https://github.com/4regodatbe-cpu/mezhgorod-calculator/pull/13) направлен в integration/v3-product-baseline-2026-10-14: 1 snapshot commit/116 файлов, mergeable true. Первоначальная база main давала 685 коммитов/457 файлов и конфликт; база исправлена на актуальную интеграционную ветку. Merge не выполнялся.
- Vercel team `team_UFuw0UGXjMqBV2hJBxsWGAMS`, project `prj_JbuIKFQNjD3FvAcX2I65Dm5OBKie`. Автоматический deployment `dpl_67vpYt2ACFXu3iUhk8hd1x1AAnUG`, target null (Preview), READY.
- Проверенный адрес: https://mezhgorod-calculator-etema75jt-4regodatbe-5310.vercel.app/v3 . `/api/version` HTTP 200, commit 37d55f..., environment preview, no-store. Vercel build: 621/621 PASS, quote/API PASS, Turbopack/TypeScript/Next PASS, Deployment completed.
- Vercel Authentication сохранена. Временная share-ссылка выдана connector для тестирования, истекает 15 октября; её токен/cookies не сохраняются в Git.

### Живые API и браузер

Источник: этот точный Preview, без подмены транспорта/матрицы. JSON сохранены в `source-snapshots/preview-2026-10-14/`. Координаты — публичные контрольные центры городов; departureAt `2026-10-14T22:30:00+03:00`, категория I/default без транспондера. Это не сверка с Яндексом и не новая операторская верификация цен.

| Маршрут | Время API | Дистанция/ETA | Дорожная цена | Статус |
| --- | --- | --- | --- | --- |
| Анапа—Краснодар, diagnostics off | 8,74 с | 166653 м / 8761 с | 620 ₽, AnapaExit→Maryanskaya | priced/unconfirmed |
| Анапа—Краснодар, diagnostics on | 7,99 с | 166653 м / 8761 с | 620 ₽, та же пара | priced/unconfirmed |
| Ялта—Краснодар, diagnostics off | 9,16 с | 537018 м / 28303 с | 800 ₽, TamanBridge→Maryanskaya | priced/unconfirmed |

Parity Анапы: расстояние, ETA и весь toll payload совпали — PASS. JSON содержит ровно один маршрут. Показанные цены остаются «Стоимость не подтверждена»; живой API не повышает статус источника.

В облачном браузере: выбран город Анапа Краснодарского края и Краснодар через реальные подсказки, нажат расчёт, получен один результат 166,7 км/2 ч 26 мин, 620 ₽ с предупреждением, четыре коммерческих класса. Стандарт 4168+620=4788; Комфорт 5001+620=5621; Комфорт+ 5835+620=6455; Минивэн 8335+620=8955. Screenshot `source-snapshots/preview-2026-10-14/anapa-krasnodar-ui.jpg`. Кнопка копирования показала «Скопировано», но clipboard API браузерной среды вернул пустую строку; содержимое системного буфера не подтверждено. Локатор textbox по имени не разрешился, ввод выполнен через свежие AX элементы; это ограничение инструмента, не отказ формы.

Desktop отображение проверено на текущем viewport. Мобильная проверка, тёмная тема, остальные приёмочные маршруты и условия/смена профиля пока не завершены. Длинный Москва—Санкт-Петербург контроль запущен; результат будет добавлен отдельной записью.

### CI: обнаруженная ошибка и исправление

Push workflow Route quality and offline benchmark integrity run `38623167929`, job `116055580311`: первые статические шаги PASS, Production build FAIL. Логи: Node v22.13.0, `node:module` не экспортирует registerHooks; 91 test-file failures до выполнения тестов. Vercel Node 24 и локальный Node 24 прошли 621 тест — ошибка версии CI, не доказательство ошибки тарифа.

`.github/workflows/segment8-route-quality.yml` и `.github/workflows/calculator-final-gate.yml` переведены на Node 24.x согласно package.json engines. Проверки не отключены/не ослаблены. Повторный CI обязателен; пока он не выполнен, CI PASS не заявлять. Остальные исторические workflow не переписывались. Draft PR остаётся тестовым, main/Production/официальный URL/Android не изменены.

Следующий шаг: опубликовать CI correction, проверить повторный Actions run и завершить длинный API контроль; сохранить результат новым checkpoint. Затем продолжить mobile/desktop/unknown/free/копирование и source/geometry gaps из предыдущего сводного отчёта. Официальная готовность и полное покрытие России не заявлены.
