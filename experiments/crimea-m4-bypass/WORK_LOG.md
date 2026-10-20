# DONE — Крым ↔ М4 через Дальний западный обход Краснодара, 20.10.2026

## Запрос и причина

Пользователь сообщил: Ялта→Ростов1650₽ пропускает обход Краснодара; принять410₽. Направления изКрыма кМ4/Ростову/Москве вести через западный обход, исключая Краснодар/Майкоп/Кабардино-Балкарию и южные направления. Обратные направления симметричны по дорожному коридору с разными проезжими частями.

Source13b70ad7cdcbba89eee28b8063e118a50f7ea414; durable STARTED c1bc2c153d35e08f37c10e2bc281498e37c90866; PR14open/draft. Отдельный чистый worktree от remote source, затем parent обновлён до STARTED без потери изменений. Рабочая ветка fix/v3-missing-route-prices-2026-10-15. Production source4b647bfe / dpl_DGhwwdXRTKwbbEMR127M5AbDMAoP остаётся текущим выпуском; новая публикация не выполнялась.

В candidatePlans принудительная точка KRASNODAR(45.045,39.15) стояла восточнее города и исключала западный обход для Bridge→M4. Это ошибка выбора пути. Тариф410₽ уже содержался в прежней матрице ДЗОК и не менялся.

## Что изменено

- lib/special-territory-policy.ts заменяет восточную точку для связки Bridge↔M4 на before/gate/after фактического направленного ПВП ДЗОК. Сохраняется существующая классификация северного направления (широта материкового endpoint>46.5) и коридоры новых территорий. Южные исключения сохраняют прежний подход. Кандидат, проходящий рядом, но не пересекающий правильный ПВП, отклоняется: широкого допуска обычных контрольных точек недостаточно.
- lib/toll-engine/krasnodar-bypass-evidence.ts предоставляет направленные controls из прежнего OSM snapshot. На север51→0, на юг0→51. Два направления используют свои проезжие части, а не разворот тех же координат.
- Чистая inCrimea вынесена без изменения полигона в lib/crimea-geography.ts, re-export сохранён. A289 helper импортирует чистую географию, чтобы не подтягивать маршрутные/JSON зависимости в отдельную тарифную проверку.
- Существующая композиция сама начисляет410₽ лишь по фактическому crossing. Не добавлены тарифы по названию города/направления; аудит/матрица не редактировались.
- При обязательной локальной сборке обнаружен унаследованный invalid Next route export createSuggestionForwardRequest в app/r/route.ts. Функция без изменения поведения перенесена в lib/address-search-proxy.ts, тест импорта обновлён. Это устранило конкретный blocker Next type gate.

## Проверки и evidence

1. Собственные live OSRM captures20.10: Ялта→Ростов789843.2м/39570.2с/6682точки; Ростов→Ялта786773.3м/39679.9с/6713точек. Оба followsPlan=true и directional bypass boundaryStatus=resolved. Полные ответы gzip, raw/compressed SHA256 в capture-manifest.json. Это два контрольных маршрута, не аудит всех направлений.
2. Первая bounded M4 local trace дала только1093, поэтому numeric total не объявлялся подтверждённым. Сохранены partial result/доступный response3. Один ограниченный повтор для устранения конкретного пропуска дал2 собственных successful trace responses:1223 и1093, exact=true. Итог M4=850 + A289=800 + ДЗОК=410 =2060₽, weekend2210₽. Записи m4-retry-trace-1/2 и yalta-rostov-price-retry.json.
3. Полный calculateLegTolls воспроизведён offline на этих же собственных OSRM+M4 данных:2/2responses consumed, misses0, network0, componentAudit priced, missing[],2060/2210. Соответствующий regression test прогоняет оба профиля и проверяет отсутствие duplicate410.
4. Регрессии: Ялта/Севастополь/Керчь↔Ростов/Воронеж/Москва, Краснодар/Майкоп/Нальчик exceptions, новые территории, ложный nearby/wrong direction crossing. Новый реальный capture replay проверяет A289800 и ДЗОК410 в обе стороны.
5. Final pnpm run test:audit:817tests/817pass/0fail, quote и API adapter PASS. Focused intermediate41/41. ESLint всех изменённых TS/MJS и pnpm exec tsc --noEmit exit0; git diff --check pass.
6. Локальный pnpm run build: после успешного audit Turbopack отказал из-за внешнего symlink node_modules в изолированном worktree. Фактическая fallback сборка pnpm exec next build --webpack PASS:compile,TypeScript,static16/16. Полный standard build должен отдельно подтвердиться в новом Vercel Preview.
7. Первые промежуточные audit попытки выявили VM-loader dependency failure и старый stub пути inCrimea; они исправлены чистым geography module и обновлением тестового импорта. Результаты не выдавались за pass. Финальные логи сохранены.

## Следующий шаг

Сохранить code/tests/evidence/checkpoint и short state одним итоговым commit на разрешённой ветке, проверить точное дерево и Preview standard build. PR14оставить draft; Production для нового routing change требует прямого запроса. Если сторонний map matching снова недоступен, сохранять unknown, не публиковать известную часть как полный итог.


## Preview проверен — 20.10.2026

Code commit 0f568c57384907b8fc5f2a08412f0e3687c22cb0 сохранён в разрешённой ветке, PR14head совпал, draft=true. Все32 Git blob SHA проверены; remote tree3960de5e2038f1607e4f744aa05b5dbce234149c совпал с локальным деревом проверенной версии. Preview dpl_2M44uZUARGfqjU7ZwxFkySrA3SpU READY, Vercel combined status success. Полный стандартный pnpm build в Vercel:817tests/817pass/0fail, quote/API PASS, Next Turbopack compile PASS, static16/16. GET https://mezhgorod-calculator-1rcqv4m14-4regodatbe-5310.vercel.app/ — HTTP200, метка актуального калькулятора. Live POST/UI на Preview не проверен; полный V3 composer проверен на собственных live captures offline с2точными ответами/misses0/network0. Это закрывает environment-only локальную ошибку Turbopack symlink.

Текущая routing правка подготовлена в Preview. Production выпуска поиска dpl_DGhwwdXRTKwbbEMR127M5AbDMAoP не заменён; для новой публикации нужен прямой запрос. Итоговый документационный commit может запустить новый Preview build, но application source выше уже проверен. Не повторять live route captures или тарифный аудит.
