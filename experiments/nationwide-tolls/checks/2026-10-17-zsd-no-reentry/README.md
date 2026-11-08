# V3: исключение подтверждённого повторного заезда наЗСД

17.10.2026 16:37 МСК. **Исправлено и проверено, точная область — один подтверждённый мотив Планерной.** Source0cc2c469…, durable STARTED `80a15c47087199bab3d96783559fc486946b52be`. Post-STARTEDCI39036931767 completed/success перед итоговой записью; новый codeCI проверять отдельно.

## Поведение

Ранее Valhalla выбирался по меньшемуETA, хотя выходил сЗСД кБогатырскому/Планерной, проходил городские съезды и заезжал наЗСД повторно. Теперь общийV3 `isUsableRoute` исключает такой кандидат **до сравнения времени** в ordinary иspecial ветвях. Среди оставшихся обычных ответов провайдеров выбирается минимальное время; цена и наличие тарифа в выборе не участвуют. Новые запросы бесплатных/bypassмаршрутов не добавлены. Если допустимого ответа нет, возвращается существующая ошибка маршрутизации.

Фильтр требует8упорядоченных физических свидетелей на собственной геометрии, допуск15м, сегменты≤500м и местный проезд≤4км. Недостаточно одногоПВП, названия дороги или координаты конечного пункта. Runtime читает только небольшой geometry.json, а не capture/OD/ETA/ценовойbenchmark. Это **не общий доказанный детектор всех повторных заездов поРоссии**.

## Шесть собственных сохранённых кандидатов

| Случай | Прежний недопустимыйValhalla, сек | Обычный допустимыйOSRM, сек | Новый выбор |
|---|---:|---:|---|
| `pair-m11-zsd-prim-to-moscow` | 25471 | 30963 | OSRM, один маршрут |
| `max-chain-m12-ckad-m11-zsd-prim-to-arzamas` | 44435 | 52323 | OSRM, один маршрут |
| `max-chain-m12-ckad-m11-zsd-prim-to-cheboksary` | 54716 | 64986 | OSRM, один маршрут |
| `max-chain-m4-ckad-m11-zsd-prim-to-voronezh` | 48214 | 55226 | OSRM, один маршрут |
| `pair-m11-zsd-prim-to-torzhok` | 16578 | 21098 | OSRM, один маршрут |
| `triple-m4-m11-zsd-prim-to-voronezh` | 48214 | 55226 | OSRM, один маршрут |

Все6captureSHA совпали. Старые6геометрий отклонены, собственные6OSRMгеометрий допущены. Четыре независимых непрерывныхконтроля не отклоняются:КАД-юг→Планерная,КАД-север→КАД-юг,Благодатная→Планерная,Гранитное→Екатерингофка. Проверки chord/обратного порядка/параллельного пути/разрыва не дают ложного подтверждения рассматриваемого мотива.

## Проверки

- focused:24/24 PASS, включаяordinary/specialAPI и отсутствие допустимых кандидатов.
- mutation: при отключении толькоguard все3новыхAPIрегрессии ожидаемо падают. Productionфайлы при этом не изменялись; тестовыйloader отдельно отрепозитория.
- full audit:721/721 PASS, quote/API checks PASS.
- TypeScript PASS; targetedESLint PASS; Nextbuild PASS, static16/16.
- candidate-batch:6случаев,12candidategeometries,4negativecontrols; отдельныеcases/progress/sourcehashes/summary.

Первыйfullgate упал из-за отсутствующей старойA289фикстуры в sparsecheckout, а не из-заguard. Три точных trackedfixture восстановлены изSTARTED Gitobjects и проверены поblobSHA; полныйgate повторён и прошёл. Initialfailure, recovery и обааудитлога сохранены. Первыйfocusedлог былпустым приexit0; явныйreporter24/24 иfullaudit подтверждаютреальные проверки. Подробностиvalidation.json.

Новыхliveproviderзапросов и fulltripreplay0. Новыхрассчитанныхтарифныхкомпонентов/подтверждённыхполныхтарифов0. Итоги поездок по новымOSRMгеометриям **не пересчитывались вlive**: старуюValhallaпроверку нельзя переносить наOSRM. MockedAPI проверяетtrace только выбранныхOSRMточек и сохраняетunknown при недоступномновомtrace. Историческийbaseline26priced/50unknown не является пересчитанным покрытием новыхгеометрий.

## Воспроизведение

```sh
node --import ./scripts/register-ts-paths.mjs --test lib/v3-calculation/zsd-reentry-policy.test.ts scripts/v3-route-selection-audit.test.ts
node --import ./scripts/register-ts-paths.mjs experiments/nationwide-tolls/scripts/check-zsd-no-reentry.mjs /tmp/zsd-no-reentry-new
npm run test:audit
node node_modules/typescript/bin/tsc --noEmit
NEXT_TELEMETRY_DISABLED=1 node node_modules/next/dist/bin/next build
```

Существующий candidate-batch/summary не перезаписывается; передавать новыйкаталог. Для clean/sparsecheckout материализовать толькоточныеfixtureпути изsource-manifest иfixture-recovery.json. Не запускать74/76/309live/replay.

## Следующий шаг

После durablecodecommit проверить егоCI. Затем рассматривать конкретную возможность получить собственныйtrace новогоOSRMвыбранного маршрута дляодногопредставителя, если нужно продолжатьегоpricing: геометрия реальноизменилась, старыйtraceнеприменим. Не возвращатьцену по старомуcapture; sourcecollectiongaps остаются. No main/merge/Production/Android.

Mutation воспроизводится test-only loader из mutation-disable-guard.mjs; он не импортируется обычным приложением или нормальнымtest run.
