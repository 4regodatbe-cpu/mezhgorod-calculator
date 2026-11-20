# М11 p214 → Москва: head исправлен и проверен; code CI pending

18.10.2026. Исходный commit `c2d50a2b8774204fef77373488b57b180f1be300`, tree `d774755946fbe44718b350b4df3d93957569b3eb`; STARTED сохранён и проверен в разрешённой ветке, PR №14 открыт/draft. Локальная ветка синхронизирована с этим remote commit.

## Что изменено

Добавлен `lib/v3-calculation/m11-southbound-moscow-head.ts`. Он требует полного trace/chunk coverage, одного строгого блока М11, уникальной точной платной рамки7171624764/way502872285, paid-way evidence, трёх независимых направленных точек в25м, p58 перед рамкой и строгого конца М11 после неё в существующей области московского конца дороги. Порог1.5км Москвы и120м p58 не расширены; одного приближения к Москве для тарифа недостаточно. Проверяется плотность собственной геометрии до строгого конца.

В `m11-product-boundaries.ts` новый matcher используется только после уже доказанного собственного въезда p214. При доказательстве включается опубликованная направленная пара `solnechnogorsk → moscow`; при неполных данных head остаётся null. Физический JSON `physical-head-gate.json` содержит только независимые gate/way/ordered coordinates, без caseID, дат, цен и benchmark. Исходный snapshot и raw не заменены.

## Фактические результаты

Собственный `single-m11-torzhok-to-moscow`: Thu09:00 и Thu23:59 mainline1250+head1130=2380₽; Fri1390+1260=2650₽; Sat1390+1500=2890₽; Sun1390+1650=3040₽. Это суммы компонентов М11, не полный тариф маршрута. Во всех пяти профилях API amount остаётся null, единственный оставшийся missing — `unknown-paid-road`. Новых рассчитанных head-компонентов1, подтверждённых полных тарифов0. Политика даты отправления соблюдена. Другие собственные p214→Раменское/Казань не получили московский head.

## Проверки

- `timeout60 node --import ./scripts/register-ts-paths.mjs --test scripts/v3-m11-p214-moscow-head.test.ts scripts/v3-m11-p214-boundary.test.ts scripts/v3-m11-p258-boundary.test.ts scripts/v3-m11-ckad-entry.test.ts` —25/25PASS. Проверены исходные SHA, отсутствие/подмена/дублирование рамки, неоплачиваемый edge, неполные chunks, обратная/параллельная/разреженная/обрезанная геометрия, локальный detour, неполный строгий охват и два других собственных head-контроля.
- `npm run build` под subprocess timeout300s — exit0: audit768/768, quote/API contractsPASS, Next/TypeScript и static16/16PASS.
- `tsc --noEmit`, targeted ESLint — exit0; `git diff --check` — exit0. Точные команды и коды в `check-status.json`/`build-status.json`, gzлоги и SHA в `result.json`.
- Новых sourceGET/routing/trace0. Own composer test закрывает fetch throwing mock; попыток0. Завершённые sourceGET/широкие routeaudits не повторялись. Прежний Photon live failure не считается исправленным.

## Сохранение и продолжение

Это DONE локального кода и проверок. После записи обязательны exact remote head/tree/readback и отдельная проверка нового codeCI; не объявлять его успешным заранее и не писать в ветку при active/queued job. Main/merge/Production/Android не затрагивались.

NEXT после codeCI: короткий offline-разбор `unknown-paid-road` только на собственном `single-m11-torzhok-to-moscow`, с exact unmatched booth/way IDs из текущего coverage и уже сохранённым physical p214 proof. Не удалять unknown по факту рассчитанного М11 или названию города; сначала доказать идентичность конкретного orphan. Не повторять364 inventory/4готовыхp214cases/GETисточников. Для следующего изменения отдельный bounded STARTED и обязательные проверки.
