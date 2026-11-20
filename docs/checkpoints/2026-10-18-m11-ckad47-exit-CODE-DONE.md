# Южный съезд М11 → ЦКАД47: исправлен и проверен; новый CI pending

18.10.2026. Parent `5a6bef2d0a61bbcb9c3c4a6ec4f8574cafcef7a8`, tree `0b53c28a0b9cc68135a72b2082e86f12d7fe0066`. Source DONE/CODE STARTED сохранён, exact remote head/tree/PR14draft совпали. Последний предыдущий codeCI39123710038 verify/live оба success; новые результаты CI отдельно после записи.

## Изменение

`m11-ckad-head-exit.ts` связывает только точный южный exit8087316064/way1270188041. Требуются полный validation/chunk coverage, один корректный strictM11block, уникальный gate/way, strictend у независимогоnode9556466755 в25м, p58 до exit и48 независимых orderedpoints по10onewayways, полное покрытие corridor и плотность геометрии. Non-toll access не ищется в paid-onlywayIds; его связь доказана полным собственным corridor. Сеть для matcher не нужна.

В `m11-product-boundaries.ts` matcher подключён только после строгого p214entry fallback. Выбирается отдельная опубликованная пара `solnechnogorsk → tskad`: Thu200/Fri220/Sat240/Sun320/night50. Московский head и северный CKAD entry сохранены отдельно, тарифные таблицы/пороги/выбор fastest не менялись. CKAD остаётся самостоятельным продуктом; её тариф не заменён платой за head.

## Собственные результаты и исключения

- Раменское: Thu09:00/Thu23:59 head200, М11subtotal1450₽; Fri220/1610₽; Sat240/1630₽; Sun320/1710₽. Во всех пяти own quote профилях полный API итогnull, missing только `ckad`. Нового полного тарифа нет.
- Казань: собственный независимый capture прошёл strictcorridor; own M11component Thu1450/Sat1630₽. Его полная композиция в этом блоке не запускалась и не подтверждается этими двумя componentcontrols.
- Москва и Краснодар: собственные captures не имеют нужного CKAD exit, matcherfalse, остаётся отдельный moscowhead. Первая focusedпопытка26/27 ошибочно считала Краснодар CKAD-positive; его ownstrictend37.483494,55.889379 и gate7171624764 доказали исключение. Исправлено ожидание теста на CKAD-negative, runtimeдопуски не ослаблялись. Initialfailurelog сохранён.

Новых рассчитанных headкомпонентов2 собственных случаев; подтверждённых полных тарифов0. Эти числа не расширяют покрытие всех М11/ЦКАД. Source4GET/48pointproof завершены прежним commit и не повторены в кодовом блоке. Новых routing/trace/sourceGET в кодовом блоке0, owncomposer fetchattempts0.

## Проверки

Focused27/27PASS: sourceSHA/10wayconnectivity, wrong/missing/duplicate gate, partial/failedchunks, reverse/parallel/chord/cropped/detour, malformed/missing strictspan, wrongstrictend; пять departureprofiles, ownKazancorridor и два других ownexitcontrols. Актуализированы существующие p214 и moscowhead regression expectations: Раменское/Казань получают свой CKADhead, не Московский.

`npm run build` с timeout300s exit0: audit777/777, quote/API contracts, TypeScript/Next/static16/16PASS. `tsc --noEmit`, targetedESLint и gitdiff--check exit0. Команды/status/gzлоги/SHA в `checks/2026-10-18-m11-ckad47-exit/result.json`. Узкие тесты имеют timeout60s. Новые ставки/импорт benchmark в runtime отсутствуют.

## Продолжение

После записи проверить exactremote head/tree/PR и новый codeCI. Пока jobactive/queued — второго writer не запускать. Main/merge/Production/Android не затронуты.

NEXT после CI: коротко прочитать current CKAD resolver reason/actual selected A113 exit на own `pair-m11-ckad-torzhok-to-ramenskoe`, сопоставить с уже доказанным CKAD M11→M12 context и retained source definitions. Разбирать только конкретный оставшийся CKAD billing endpoint/context, без повторов34общихarc/364inventory/4p214cases/готовых10way48pointproof. Не переносить северную/полнуюarcцену на иной съезд. Если нового источника не хватает — точный gap и отдельный bounded STARTED, не новый routing/fullrouteaudit.
