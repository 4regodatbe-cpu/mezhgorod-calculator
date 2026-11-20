# DONE — северный въезд ЦКАД47→М11

МСК 2026-10-18T12:22:04.441702+03:00. Source proof durable `6b83a64899b8d45fe10ff2d8780fff066f50e503`, tree916647a1402813e679bdd80df5bdca784d78cfdc; readback15 paths/head/draft PASS. Одна разрешённая ветка `fix/v3-missing-route-prices-2026-10-15`, PR14draft.

## Исправление

Новый `m11-ckad-head-entry.ts` распознаёт отдельно доказанный ПВП18 «ЦКАД» на47км. Требует полного собственногоvalidation, точногоgate8087316065 на954011576, платного продолжения1270188032, семиorderedanchors и прохождения по38точкам независимой первичнойOSMцепи в25мкоридоре. Reverse/обход/неполноеtrace не разрешены. `m11-product-boundaries.ts` добавляет готовую `tskad→solnechnogorsk` только при уже доказанной strict mainline58→679 и северном порядке. Москва/ММК/обратныйпроезд не заменяются этой парой. Runtime содержит физическиеOSMякоря, не case/архивныйcapture/маршрутнуюцену.

Один собственный target `max-chain-m12-ckad-m11-zsd-arzamas-to-prim`: ранее headunknown, теперь280₽по отправлению15Oct09:00 и320₽по17Oct09:00. M11head+mainlineсоставляют4180/4520₽, **это не полная поездка**. Общийcomposer проверен с запретом fetch: pricedМ11head/mainline/tail иМ12; missingЦКАД/ЗСД, wholeunknown, requests0. Новыхpricedcomponents1, подтверждённыхполныхтарифов0.

## Проверки

Focused20/20; fullaudit757/757 +quote/API contracts PASS; targetedESLint PASS; `tsc --noEmit --incremental false` PASS; Next/Turbopackbuild16/16 PASS. Отдельныйcomposerprobe PASS без сети. Исходные архивныеcapture/hashes сохранены без правок.

Первый exploratoryguard требовал non-toll approachways в paid-onlywayIds и правильно далunknown; контракт исправлен наexactgate+paidcontinuation+independentphysicalcorridor. Три первыхfullgate попытки остановились на отсутствующихfixture в sparse checkout; восстановлены точные старыеGitblobs, затем757/757. После этого Nextотвергвнешнийnode_modules symlink; создана локальная hardlinkкопия зависимостей, package/lockfilesне менялись. Повторная самостоятельнаяNextсборка16/16прошла. Ошибки/успешныевыходы сохранены gzip в`experiments/nationwide-tolls/checks/2026-10-18-m11-ckad47-entry/implementation-logs`; эти ошибки не скрыты и не объявлены успешными npmrunbuild.

## Продолжение

После публикации проверить actual codeCI; до его завершения не писать в ветку. Затем отдельный boundedSTARTED на семь остальных headcases: только owncapture/gate/way/geometry/датированныепары по новой общейпривязке, per-caseprogress, без повторных восьми replay/41routeaudit и новой сети. Они **не засчитаны** текущим представителем. Baselineочередь и canonicalистория сохранены, latestFixReviewотдельно. ЗСДРВП64/ЦКАД/М12прочиепробелы не закрыты этимисправлением. Merge/main/Production/Android не выполнялись.
