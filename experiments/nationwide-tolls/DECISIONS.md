# Nationwide toll-road calculation decisions

## 2026-10-15 — systemic route-test acceptance criteria

User approved a route-test campaign that starts with each toll road having at least three physical payment points, includes incomplete price-matrix roads, tests major roads and connected pairs in groups of 10–20 runs (up to 20 on long chains), and progresses from single-road routes to pairs, triples, and the longest feasible linked chains. Test both weekdays and weekends. At least 40 real origin/destination route cases must start in each of DNR, LNR, Zaporizhzhia, and Kherson regions. Use real settlement/city centers by default; airports and other important points are separate supplemental cases. Every test must use a live routing/provider result, preserve the raw response/route trace, and support an offline replay. A route only counts for a road case when its selected live geometry is shown to traverse the expected road. Ordinary-road gaps between paid roads are valid. Gather findings first; discuss fixes with the user after the audit phase. The initial 160-case regional corpus and 16 corridor groups in stage 15 are plans, not executed test results.

## 2026-10-13 — одна матричная пара на каждую отдельную платную дорогу; итоговое сложение

Пользователь уточнил модель нового алгоритма: если выбранный маршрут проходит по нескольким самостоятельным платным дорогам/тарифным системам, для каждой дороги отдельно определить её пару пунктов оплаты (въезд и конечный съезд), найти готовую ячейку/вектор этой пары в матрице именно этой дороги и взять её готовую сумму. После этого обычным сложением получить общий итог платных дорог. Не выполнять дополнительный пересчёт, не суммировать промежуточные ПВП внутри одной дороги и не выводить тариф из километров. Если любая обнаруженная платная дорога не имеет однозначной пары или готовой цены, полный итог остаётся unknown, не становится нулём или частичным subtotal.

Действует совместно с уточнением 2026-10-13 20:05 MSK: одно непрерывное использование каждой дороги до конечного необходимого съезда; промежуточные съезды и повторные въезды как тарифные события не моделируются. Это правило относится к новому V3/матрице и не меняет V2/Production само по себе. Более раннее требование полного промежуточного списка ПВП для runtime тарификации и запрет суммировать независимые готовые матричные суммы superseded. Нужно лишь исключить двойной учёт, если два названия/компонента на деле описывают один и тот же тарифный продукт.

## 2026-10-13 — постоянное подробное журналирование каждого этапа

Пользователь потребовал вести отдельные подробные записи по каждому существенному этапу, объясняя что было сделано, как, зачем и для чего, чтобы продолжение не зависело от доступности чата или выбранного ИИ. Постоянное правило внесено в корневой `AGENTS.md`: подробные append-only журналы этапов в релевантном workstream, синхронные краткие `WORK_STATE.md`/`NEXT_STEPS.md`, источники, пути, команды/точные результаты, ошибки, ограничения, git/PR/deployment state и конкретный следующий шаг. Не переписывать завершённые отчёты.

## 2026-10-13 — show short A-289 route estimates

User observed no numeric toll estimate on Ялта→Краснодар and Анапа→Краснодар despite stored A-289 prices and requested route estimates to display. V3 may match an actual selected A-289 frame vector to a stored finished OD fare without requiring the unrelated full M-4 corridor: Crimea/Yalta↔Krasnodar all three frames uses accepted 800 ₽; Anapa↔Krasnodar a two-frame vector uses the 833 ₽ Maryanskaya–Varenikovskaya operator candidate as an explicitly unconfirmed Anapa-exit approximation. The full selected route may add a separately matched western bypass once. This provisional junction alias supersedes the earlier rule that Anapa pairs must remain wholly unavailable, but it does not claim an exact Anapa interchange tariff or override other M-4 components. If the crossing vector differs, retain unknown rather than a guessed sum.

## 2026-10-13 — A-289 exits and OD pairs

User requires A-289 as three charged sections plus direct entrance/exit pairs toward Temryuk, Anapa exit, Slavyansk, Krasnodar side and Taman/Crimean-Bridge continuation, in both directions. Preserve direct OD fares; do not derive an unknown Slavyansk→Taman price by subtracting 800 and 620, and do not treat the Anapa exit as Varenikovskaya without junction evidence. The accepted fastest Maryanskaya→Temryuk city trip is 620 ₽, while a full paid traversal toward the bridge is 800 ₽; neither means the archived operator 1,103 ₽ continuous no-transponder row should be charged for these user-defined route scopes. V3 may use a price only after binding the selected route to exact entry/exit and physical frame order, with the city's 620 ₽ bypass requiring its specific route control.

## 2026-10-13 — Crimea full trip has separate toll roads

User's observed Ялта (Крым) → Москва result 5,040 ₽ is incomplete: it covers the M-4 Moscow–Krasnodar corridor alone. On the fastest selected route, add the separately crossed full A-289 bridge-approach vector 800 ₽ and any independently detected Krasnodar bypass toll. The west-bypass amount in the local table is 410 ₽ and remains an unconfirmed estimate pending route/operator comparison; do not infer its traversal from endpoints alone. If A-289 traversal evidence is incomplete, the trip total is unknown rather than the M-4 subtotal. Keep the Donetsk-area Yalta a distinct labeled settlement.

## 2026-10-09 — user mandate
User instructed: cover **all other Russian toll roads**, not M-4 only. Existing M11/M12/CKAD/A289 engines remain authoritative as currently implemented; national coverage extension must not regress them or claim completion when only catalogued.

## 2026-10-09 — safety, pricing semantics, scope
1. Separate **road network inventory**, **official selected tariff row**, **route-level evidence** and **money actually applied**. One must not imply the next.
2. Vehicle operator class I (physical dimension/axles) is distinct from passenger transfer tariff "Standard/Comfort/Comfort+".
3. Operator billing differs fundamentally by network: flat single camera, physical gate, entry/exit OD, time/day/holiday, distance, special transit, overlapping toll systems, and operator payment product. Never force one fixed RUB/km model.
4. Unknown paid component => **whole route toll amount unknown, not 0 and not partially priced**. Even an empty paid event list does not certify free without independent route validation.
5. Refuse charging an operator tariff without selected-route full coverage and exact verified facility identity. Input from this offline core is not public user-controlled data. No integration of mocked proof to actual customer invoice.
6. Current reference 8 operator fare networks are **operator published snapshots**, not end-to-end route tariff guarantees. For sources without a known start date, quote only the 2026-10-09 audit date; for future dates after snapshot, return unknown. No transponder discount unless mode supported with versioned source.
7. M4 PVP first/last + every intermediate + mixed-state rules remain separately experimental, 0 official matched full corridor monetary rows. Do not disturb that branch's work history.
8. All next changes must be documented in Git according to `AGENTS.md`; Preview only until proved ready and explicitly release-authorized.

## 2026-10-09 — first bidirectional exact physical M3 PVPs; category-I diagnostic corrected to 480/520 RUB (2026-10-13)

- Map matching selected-route Valhalla `edge.toll=true` with a concrete OSM toll booth node is admissible **physical passage proof** only if separately cross-checked against OSM API `barrier=toll_booth`, exact official operator kilometer/name, and same-route consistency. Six M3 names/IDs pass, M1 remains unverified.
- A **three-gate M3 sample amount** derived from time-limited 2026-10-09 published category-I/no-transponder source rows can appear **only as shadow**; it is **not** automatically included in actual transfer pricing. Real current operator tariff effective date, full corridor bill, mixed multi-road total and any extra ramps require stronger proof.
- Keep customer trip cost unknown instead of adopting the M3-only 480/520 RUB component, even when 3/3 physical booths are found. The previous 800 RUB sample was a class-column misread and is withdrawn. Source-proven gate identity and validated complete operator fare are distinct.


## 2026-10-11 — новый калькулятор показывает только самый быстрый маршрут

Пользовательское продуктовое правило для новой версии калькулятора:

1. Маршрутизатор выбирает **ровно один маршрут с минимальным временем в пути** среди найденных допустимых автомобильных маршрутов.
2. Калькулятор показывает пользователю только этот маршрут; альтернативные варианты маршрута не показываются.
3. Платность проверяется на выбранной геометрии: если на самом быстром маршруте нет платных участков, показываем его как бесплатный; если платные участки есть, учитываем платный маршрут и его плату. Бесплатная альтернатива не подменяет более быстрый платный маршрут.
4. Тарифная проверка относится к выбранным въездам/съездам и направлению этого единственного маршрута. Нельзя суммировать цены альтернатив или переносить цену другого маршрута.
5. Если платность, состав участка или сумма выбранного маршрута не подтверждены, сохраняется fail-closed состояние (unknown по действующим правилам), а не бесплатная метка и не частичный итог.

**Область действия:** решение задаёт поведение новой версии/нового route pipeline. Само по себе оно не переключает и не меняет текущий production алгоритм, route selector, тарифные таблицы или UI. Наблюдавшиеся в Яндекс Картах альтернативы (~90/278 ₽ для Казань—Набережные Челны; ~600/300 ₽ для СПб—Кронштадт) теперь следует использовать только как диагностические свидетельства для проверки того, что калькулятор выбирает самый быстрый маршрут и оценивает именно его; пользователю альтернативы не выводить.

**Проверка перед внедрением:** регрессия выбора минимального времени (в том числе, когда кратчайший по времени вариант платный, а медленный бесплатный); проверка тарифа строго по геометрии выбранного варианта; равное время/детерминированный tie-break; недоступные/неполные тарифные сведения не превращаются в «бесплатно». Источник — прямое продуктовое указание пользователя от 2026-10-11.


## 2026-10-11 — обязательный профиль контрольной проверки Яндекс.Карт

Для контрольной проверки выбранного быстрейшего маршрута в калькуляторе применяется следующий единый профиль:

1. Учитывать день недели поездки; для тарифов с временной/дневной сеткой использовать именно календарную дату и ожидаемое время прохождения платного участка.
2. Категория автомобиля — легковой автомобиль, категория I оператора там, где она соответствует габаритам/осям и официальной классификации.
3. Способ оплаты — основной тариф без транспондера. Транспондерные скидки и специальные льготы не применять.
4. Проверять ровно самый быстрый маршрут, выбранный Яндекс.Картами на момент сверки. Заезд и съезд, направление и последовательность платных сегментов берутся из этой же выбранной геометрии; суммы альтернатив не сравниваются для расчёта и не смешиваются.
5. В калькуляторе пользователю показывается только один fastest-by-time маршрут. Если подтверждённых платных участков на нём нет — он бесплатный; если платные участки есть — учитывается этот маршрут и применимый к выбранным въездам/съездам тариф. Более медленный бесплатный путь не подменяет быстрый платный.

Этот профиль задаёт условия проверки и не означает, что оценки Яндекса являются операторским чеком или опубликованной официальной тарифной матрицей. Если Яндекс показывает только ориентировочную сумму, фиксировать её как наблюдение для того же маршрута/даты, а окончательный денежный тариф определять по подходящему операторскому тарифу с теми же въездом, съездом, направлением, категорией и способом оплаты. Если эквивалентность полного маршрута или тарифа не установлена, не объявлять значение точным и не подменять его нулём.


## 2026-10-12 — единый нормативный контракт алгоритма

`ALGORITHM_SPEC_2026-10-12.md` становится единым актуальным контрактом песочницы: один минимальный ETA маршрут, только его геометрия, легковой класс I при соответствии, оплата без транспондера/льгот, день и время конкретного тарифного события, unknown при неполном подтверждении, полный вектор ПВП и готовая двусторонняя span-цена М-4 без runtime суммы ПВП. Приоритет над старыми заметками не удаляет историю. Равный ETA требует стабильного tie-break; до реализации этот edge case остаётся открытым.

## 2026-10-12 — каталог объектов и тарифный конфликт

`national-registry.json` сохраняет 22 родительские сети и добавляет 16 дочерних тарифных продуктов Автодора: 10 отдельных участков М-4, 4 продукта М-11 и 2 участка М-3. Это официальный частичный перечень, не доказательство полного реестра по всей РФ. Актуальная таблица Автодора даёт индексируемое содержимое, но прямое открытие вернуло 403; фрагмент не разрешает конфликт с архивным подписанным снимком М-3. Тарифные ячейки не обновлять, пока не извлечены текущий документ, дата действия и колонка Категории I без транспондера.


## 2026-10-12 — пользователь принимает Yandex route fare как подтверждённое значение контрольного прогона

Пользователь указал принимать цену, показанную Яндекс Картами для выбранного самого быстрого маршрута, за истину и использовать как подтверждённые данные калькулятора. Для конкретной пары OD/геометрии, режима легкового авто, даты и времени работы Яндекса это правило применяется и к оценке, визуально помеченной сервисом знаком «~». Каждое такое значение сохраняется как `yandex_user_accepted` с exact маршрутным вектором, периодом и снимочной датой; не смешивать его с официальной тарифной строкой оператора и не распространять на иные OD/вектора без новой проверки.

Зафиксированные M-4 контрольные цены:
- `[1223,1184,1093]`: Mon–Thu 850 RUB; Fri–Sun 1,000 RUB.
- `[1223,1184,1093,1046]`: Mon–Thu 1,230 RUB; Fri–Sun 1,450 RUB.

Источник проверки — fastest route card Яндекс Карт на 2026-10-13 (вторник) и 2026-10-17 (суббота), 12:14, Sochi→Rostov-na-Donu и Sochi→Shakhty. Реестр отдельно указывает, что UI не отображает перечень ПВП: последовательности заданы согласованной пользовательской моделью участка. Применение в коде пока только sandbox; `runtimeEnabled=false`, срок снимка до 2026-10-17. Москва→Краснодар показал наличие платного участка без цены и остаётся unknown.


# Local recovery updates through 13.10.2026

# Действующие решения

13.10.2026: пользователь разрешил текущие кандидатные цены с обязательной пометкой «Стоимость не подтверждена». Это заменяет исключение1820. При наличии кандидата в составе маршрута весь итог и копируемый текст помечаются.

Истёкшие версии вне даты не применяются. Если точного действующего тарифа нет — unknown/null. Произвольная неполная сумма не считается итогом.

Один fastest маршрут, точное доказательство проезда и временного профиля передаются адаптером. Изолированный обработчик не строит маршрут.

13.10.2026: V3 interim numeric toll totals visibly unconfirmed; M4 exact route vectors use the new table, other native components retain their engine while per-road matrix adapters are incomplete. This is an experimental release boundary.

## 2026-10-13 — audit implementation boundary

Existing authorization to display provisional prices remains. A Temryuk city name is not verified bypass evidence: a two-frame estimate uses an explicit provisional permission and unconfirmed output. Complete M4 fares and separately evidenced A289/bypass are composed once for all supported western endpoints. Build runs the expanded audit gate. These are bug fixes under the existing user policy, not new tariff approvals. Open holiday/calendar and missing-network coverage are recorded in AUDIT_2026-10-13.md.

## 2026-10-13 — category-column correction, not a new user tariff policy

User again confirmed whole A289800 and rejected partial Anapa833. Primary indexed operator table shows classI415/205/620/180/800/385; classII555/278/833/270/1103/548 were misread as no-transponder rates. Correct active prices and retain original mistaken raw interpretation in correction metadata. This supersedes assistant explanations about a transponder/scope conflict1103, without changing accepted user800/full and620/two-frame city controls. Operator terminal Temryuk800 and user city-route TemryukCity620 are separate vectors. No payment discount inferred from vehicle category. All interim API estimates continue carrying the approved unconfirmed label.


## 2026-10-13 — stage5 implementation invariants

No new product policy. Apply existing selected-route/direct-versioned-matrix/unknown rules to M11 and CKAD. M11 head/mainline are explicit separate parts; unbound679–684 must block a full-route number. Distinct physical p58 plazas sharing one tariff ID are not a repeated journey; repeat proof attaches to an actual anchor. Native tariff extraction does not authorize unknown route exits. M12 single-span tariff cannot bridge leaving/re-entering the road. Published direct tables alone do not resolve new physical gate coverage.


## 2026-10-13 — stage6 completeness implementation

Existing policy applied, no new user tariff decision: unpriced M1/M3/regional detection from this selected route blocks the full trip sum even if another road has known money. Late trace/recovery cannot discard that missing component. CKAD intersection names do not prove driving on intersecting highways. Provisional price permission does not invent physical road/exit binding or missing tariff version dates.


## 2026-10-13 — stage7 temporal implementation

Existing completeness/version policy applied: explicit null from a recognized road's calendar adapter must not fall through to native money. Operator calendars stay road-specific; potential special-day flags may block an unresolved fee but cannot authorize another road's tariff profile. A date alone cannot establish a timezone/hour-sensitive entry fee. Geometry-derived arrival time is calculated, not actual measured timing. No new tariff approval or seasonal end date invented.


## 2026-10-13 — stage8 consistency implementation

Existing numeric-candidate permission retained; missing effective date cannot mean confirmed version. Date-only proof cannot resolve a tariff's intraday start/end. Commercial trip fare rounds once and allocates integer rubles deterministically among displayed parts; rates, tiers and geographic zones unchanged. Unresolved M1 payment/category conflict is preserved without source substitution. No new source price/date approved.


## 2026-10-13 — stage9 display binding

Existing selected-route/candidate policy applied: V3 fastest card and copy consume API actual toll amount/period, not day-reference summaries. Unconfirmed note belongs to the displayed route; unknown remains null, free explicit0. V2 reference-period selection retained. Optional analytics/storage/clipboard cannot invalidate a successful quote or revive a cleared result. No new provider-cache TTL or fee policy.


## 2026-10-13 — user UI and pricing integrity
Approved existing portal variant2 SVG reused; no replacement design. User asked swaps, larger centre ₽/км, circular filled up/outline down, blank-address CTA gating, fastest note without единственный. Complete fees for three screenshot routes remain work, not unknown-as-zero. V3 approximate corridor subsets are diagnostics only; cannot become full fare. No Production authorization.


## 2026-10-13 20:05 MSK — правило пользователя: один проезд, две границы

Для нового алгоритма один проезд по платной дороге (в том числе М11) считается непрерывным от первого пересечённого тарифного участка до последнего участка перед необходимым конечным съездом. Промежуточные съезды, объезды и повторные въезды не рассматриваются и не проверяются. Стоимость берётся готовой ячейкой матрицы по двум этим границам и применимому тарифному профилю; отдельная сетевая проверка каждого промежуточного ПВП не должна быть обязательным условием расчёта.

Это явное повторное уточнение пользователя. Оно заменяет прежние требования обязательного доказательства mainlineContinuity/reentryStatus и предложение ассистента разделять такой проезд из-за промежуточных съездов. Разные платные дороги/тарифные продукты по-прежнему имеют собственные границы и матрицы. Определять реальные границы на выбранном маршруте необходимо; неизвестную ячейку нельзя заменять нулём или суммой промежуточных ПВП.

Статус: правило зафиксировано; существующий код ещё требует переработки и не объявляется соответствующим этому правилу.

## 2026-10-14 — implementation: М4 canonical endpoints, estimates only

На прямой запрос устранить лишние цены применена topology-фильтрация сохранённых chains:355(въезд в сторону Москвы)/672(съезд) не подменяют промежуточный сквозной тариф в непрерывном проезде. В крайних границах ramp сохранён; для355 неподтверждённые направления исключены вunknown. Это реализационный вывод из primary operator topology и действующей пользовательской continuous-trip модели, а не отдельное пользовательское утверждение всех тарифов. Готовые canonical fares применяются только как unconfirmed estimates,4 reviewed exact cells приоритетны. Runtime не суммирует ПВП. Новая необъяснимая неоднозначность остаётсяunknown. Исходные варианты сохраняются для аудита.

##2026-10-14 —355 exactreceiptpair and excludedartificialboundaries

После фактического чтения двух присланныхoperatorPDF implementationadjudication:355являетсяоплаченнымвъездомвсторонуМосквы,339принимаетчекбезвторогоначисления. Готовая355→339cell220/220; runtimeнесуммируетих. Generated355southwardentry/artificialexitkeysисключены изоплачиваемойcontinuouspairmatrix систорией;physicaltravel tocoordinateнеобъявляетсяневозможным. Неподдерживаемыйqueryreturnsunknown,не0. НаблюденияYandexсобъездомнепереносятсявэтиcells. Этоsource-basedimplementationdecisionврамкахapprovedcontinuousmodel,неизменениегеографиипродукта/Production.

## 2026-10-14 — применение уже согласованных правил к первичным PDF

Это исправление источников, а не изменение продуктовыхправил. Категорияавтомобиля берётся иззаголовкаPDF, колонкиI/II неинтерпретируютсякак способыоплаты. ЦКАДIIошибочноимпортированнуюкакI замениливсеми210опубликованнымиIпарами; историческиошибочныеставкисохраненыаудитом. М12берёт380готовыхdirectcellsприказа302с08.10, неизвестныйгеометрическийendpointнеполучаетдоказательствоизновойцены. ЦКАДfootnote2исполняетсякакотдельныйконтекстоплатыбезденежнойформулы/суммпромежуточныхпунктов;неустановленныйконтекст=>unknown. Тарифдругогопродукта(MалыеВяземы103) несливаетсясосновнойЦКАДпарой. ПодтверждениеPDF/priceпокаотдельноотподтвержденияroutecoverage. См.stages/02-uploaded-operator-pdfs-2026-10-14.md.

## 2026-10-14 — проверка календаря и условий не меняет принятый алгоритм

М11основнойучасток использует собственныйприказ274 и переход01:00, независимоотголовы15–58;календарьнепереноситсямеждуоператорами. Тарифдопустимтолькоеслиприменимыйпрофиль/версияне меняетсявреальномпроверяемоминтервале. НочнаянулеваяячейкаРязани безфактическойполосы иМСДtransit бездоказанныхусловий=>unknown. Никакогоденежного расчёта для разрешениятакихусловий не добавлено. Дата приказа и дата пользовательского подтверждения не становятся автоматическиначаломдействияцены. См.первичныедоказательства/тесты впоследнемstageотчёте.

## 2026-10-14 — применениеправилаготовойпары и отдельногопродукта

М12адаптер используетpublishedfrom→to, неценувнутреннейцепочки. Покаgeometrygateстарый,priceполеnative неисточник. M4representations exclusive, DZOK independent/additive; optionalproductId долженсоответствоватьматричномуисточнику. УсловиеЦКАДне распространятьнапарыбезучасткаМ12—Носовихинское. Положительнонайденныйairportpaidobject не пропускаетсяприproviderfree;безполногоscope всёunknown. Ниодиннеизвестныйtailнеоцениваетсясуммойполученныхчисел38/56. ПодтверждённыеAPIобъектынеобъявляютсяполнойгеографиейРоссии.


## 2026-10-14 — реализация правила обязательной готовой цены в верхнем V3

Удалены прямые подстановки production-сумм М4/М11/М12/ЦКАД при отсутствии матричной цены. Геометрия и recovery остаются диагностикой. Бесплатный альтернативный маршрут не доказывает бесплатность выбранного. Для выбранного маршрута без компонентов явный 0 требует complete=true бесплатной проверки. Это реализация существующего требования пользователя, а не изменение ценовой политики. Внутренний 0 неизвестного результата сериализуется в API null. Оставшиеся внутренние денежные зависимости обхода Краснодара и головного М11 перечислены в отчёте; полное завершение этапа 3 не заявлено.


## 2026-10-14 — независимые южные продукты в активном верхнем V3

Реализовано существующее правило: М4, А289 и ДЗОК — самостоятельные начисления, готовые цены складываются один раз. Для открытого ПВП 46 локальное направленное пересечение связывает отдельную тарифную пару; промежуточные съезды по коридору не сканируются. Широкая геометрическая подсказка обнаруживает unknown, но не является денежной границей. Операторская цена и map-география не объявляются полностью подтверждённым реальным маршрутом; предупреждение остаётся. Старый агрегат с пересекающимся новым продуктом недопустим. Это реализация ранее утверждённых требований, новых решений от пользователя не запрашивалось.


## 2026-10-14 — М11: собственная направленная head цена и конечное время оплаты

Официальные head правила подтверждают выбор тарифа на конечном платёжном выезде; для смежных секций без пограничного ПВП используется общий конечный выезд. Это исправление источниковой логики, не новая продуктовая политика. Собственный профиль головного участка нельзя брать из mainline календаря или зеркалить цену другого направления. До пространственной привязки ПВП21 south payment оценивается стабильным интервалом, не выдуманным точным моментом. Активный полный М11 V3 использует крайние p58/p679 без обязательного p593, как ранее потребовал пользователь; промежуточные съезды не сканируются. Unknown tail на любом конце блокирует сумму. ETA и source fares остаются с предупреждением, без заявления фактической дорожной телеметрии.


## 2026-10-14 — М12 готовая пара без старого денежного/промежуточного prerequisite

Реализовано ранее утверждённое first/last правило: V3 М12 доказывает только внешние края выбранного проезда и берёт ready directed cell. Native priced status, finalMarkers/inferred суммы и промежуточная continuity не являются условиями цены. Внешние border/span/date/version проверки сохраняются, unknown geography не заменяется нулём. Удалены неиспользуемые legacy helper money пути; А289helper отвечает только за А289, обход начисляется независимо. Новых продуктовых решений от пользователя не требовалось. Опубликованная ячейка/синтетический regression не доказывают живой маршрут.


## 2026-10-14 — сохранение каждого обнаруженного платного продукта

Идентичность named regional продукта сохраняется независимо; unknown geography не даётpublishedreferencefare. Псков/неопознанныеpaid events получаютexplicitunresolvedcollector и не принимают0какцену. Same-route paid evidence по основнымдорогам включаетсявполныйсборщик дажееслиlegacy geometry ихнеобнаружила. Aliasesодногопункта (М4/ДЗОК,М1/Одинцово) неявляютсядвумяпроездами. SmallVyazemy — отдельныйпродукт;103неприписываетсяmainCKAD. PDFfootnote120мин относитсякпоследующимрегистрациям,поэтомуETA/callerbool неразрешаютусловные16cells. Это реализация прежнего требования не пропускать обнаруженнуюдорогу/невыдаватьpartialtotal,новыхрешенийпользователя не требовалось.


## 2026-10-14 — diagnostics не является условием достоверности цены

Реализовано существующее требование не пропускать обнаруженную платную дорогу: проверка paid events выбранной геометрии обязательна независимо от diagnostics, включая специальные планы. Явная неполнота проверки делает полный дорожный итог неизвестным, даже если одна известная пара уже оценена. Единственный маршрут API и его отображаемая option должны совпадать по основным данным/суммам. Это исправление прежнего алгоритма, не новое пользовательское решение. Полная сборка и HTTP fixtures не подтверждают живую географию или тарифный источник.


## 2026-10-15 — реализация существующей политики, без новых продуктовых решений
Exact selected-route booth node может идентифицировать М4, когда trace не содержит roadnames. Полное положительное toll=true подтверждение того же node на той же геометрии может использоваться повторно для проверки крайней границы; partial/absence/non-toll не разрешают цену. Это реализация прежнего требования «готовая пара крайних границ», не разрешение новой суммы и не city-name pricing. Unknown toll не скрывает готовый коммерческий base; ручная сумма явноmanual и совпадает в экране/copy. Полный Петербургский итог не объявленготовым.


## 2026-10-15 — пользовательский способ приёмки: длинные цепочки
Пользователь предложил длинные маршруты Казань/Краснодар–СПб через Москву и разные платные дороги. Решение: проверять несколько независимых продуктов и их стыки на одной выбранной геометрии, в обоих направлениях; сохранять exactselectedroute/provider/crossings/componentreasons. Набор7 маршрутов не объявляет allRussia coverage. ИзвестныйmainlineМ11 не зависит от московскогоhead; partialhead не исчезает и не получает guessedfullheadprice. Bounded429retry не превращает incomplete вfree. Полные тарифные gaps закрываются отдельными первичными bindings, не исключением продуктов из итога.


## 2026-10-15 — export и scoped bindings
Пользователь явно разрешил отправку подготовленного кода/evidence в GitHub; прежний blocker resolved. Production/main/merge по-прежнему требуют прямого запроса. MMK направления имеют разные head fares; zone1 ЗСД300 допустима только для полного доказанного scope. Другие зоны и tail остаются unknown.


## 2026-10-15 — пользователь утверждает 94 ₽ для хвоста М-11 679–684

Пользователь прямо распорядился применять сумму 94 ₽ к участку М-11 679–684, если открытым оставался только выбор между 56, 38 и 94 ₽. Для калькулятора это становится выбором тарифа категории I для компонента `m11-679-684` во всех направлениях. 94 ₽ заменяют альтернативные 56/38 ₽; суммы не складываются. По визуально проверенному приказу №274 эта строка действует ежедневно и введена с 04.09.2026.

Применение ограничено существующим строгим распознаванием выбранного маршрута как продолжающегося за ПВП 679 (`m11TailUnresolved`). Одной близости к airport gate недостаточно; при отсутствующей основной M-11 boundary, невалидном времени или поездке до начала тарифа остаётся unknown. Это решение закрывает только tariff selection, но не расширяет прочие продукты или границы дорог.

Статус: реализовано в `lib/toll-engine/m11-tail-component.ts` и `lib/v3-calculation/route-leg-pricing.ts`; provenance/effective date сохранены в `source-snapshots/m11/2026-09-04-679-684-category1.json`. Продуктовое решение пользователя supersedes прежнее состояние `runtimeApproved=false` для этой строки.
## 2026-10-15 — принимать сумму, показанную Яндекс Картами

Пользователь распорядился: проверить оставшиеся участки в Яндекс Картах; если карта показывает сумму, принять и использовать её. Поэтому сумма из карточки принимается как пользовательски одобренная **оценка конкретного быстрейшего маршрута, направления и его endpoint scope**.

Ограничения применения: не переносить route total на другую геометрию без exact route match; не распределять совокупную сумму по продуктам, если Яндекс не даёт разбиение; не зеркалить обратное направление; отсутствие показанной суммы не является бесплатным проездом. В зафиксированных проверках 15.10.2026 Яндекс показывает ~600 ₽ Благодатная→Приморский и ~900 ₽ обратный маршрут (геометрия маршрутов отличается), ~4 400 ₽ Казань→Москва и не показывает сумму Москва→Казань; длинные быстрейшие маршруты: ~11 363 ₽ СПб→Краснодар и ~10 910 ₽ Краснодар→СПб. Полный снимок: `source-snapshots/yandex/2026-10-15-live-route-estimates.json`.

These are map route estimates, not proof of an operator receipt. Existing runtime's `priceConfirmation` and warning retain their existing meaning until an exact geometry binding uses the approved route fare. Do not recast the ZSD sums as universal zone tariff cells.

---


## 2026-10-15 — не показывать оговорки о квитанции для платных цен

Пользователь прямо указал не выводить пометки вида «не подтверждено квитанцией». В пользовательском V2/V3 результате priced сумма показывается без такого предупреждения; в копируемом результате оно также отсутствует. Ручное значение обозначается только как введённое вручную. Публичный V3 DTO не отдаёт внутренние `priceConfirmation`/`displayLabel`. Состояние `unknown` сохраняется только там, где тариф/платная сумма действительно не рассчитаны: интерфейс сообщает «стоимость неизвестна», а неполный subtotal не объявляет полной суммой. Это решение меняет формулировки и публичный DTO, но не ослабляет fail-closed расчёт.


### Дополнение 2026-10-15 — очистка публичных сегментов

Оговорочные суффиксы удаляются не только из UI и статусов V3 DTO, но и из строк `tolls.segments`, возвращаемых публичным V3 API. Внутренний audit/provenance остаётся в источниках проекта; он не добавляется к пользовательской сумме. Неизвестные цены по-прежнему явно имеют статус unknown.


## 2026-10-15 19:55:51МСК — явное routing consent

Пользователь разрешил передачу координат городов/контрольных точек и параметров маршрута Valhalla, OSRM, BRouter для текущего маршрутного аудита (прямой ответ «Разрешено продолжай» на перечисленные назначения). Не требуется повторно спрашивать это разрешение в следующих шагах кампании. Предыдущий auto-review отказ сохранён как история, условия его явного consent теперь выполнены. Scope не включает секреты/весь репозиторий/production. Каждый маршрут по CHECKPOINT_PROTOCOL сохраняется вGitHub до следующего.


# Разрешение и разделение аудита

DONE, 2026-10-15T21:11:09.420873+03:00. Пользователь ответил «Разрешаю» на конкретный запрос передачи координат Valhalla/OSRM/BRouter и сохранения кода/журналов/маршрутных evidence в публичном GitHub4regodatbe-cpu/mezhgorod-calculator, ветка fix/v3-missing-route-prices-2026-10-15/PR14. Также предложил два равновесных этапа из-за переполнения контекста. Ранее отклонённые49d61e6/97957bb теперь можно сохранить в этой ветке; это новое прямое разрешение, не обход отказа. Секреты/производственный выпуск/merge не разрешены.

## 2026-10-15 21:48МСК — тариф отправления; междорожныевекторы отложены

# Правило тарифа отправления — начало реализации

STARTED 2026-10-15T21:50:32.369178+03:00. Пользователь15.10.2026 21:48МСК отложил междорожные векторы полностью и поручил продолжать текущую работу. Новое продуктовое правило: если поездка начата вчетверг, весь расчёт выполняется по тарифу начала поездки, даже если в пути наступилапятница и изменилсятариф. Расчётное время оплаты и переход дня/профиля в пути не меняют выбранный тариф. Фиксируется исходная дата/время отправления; правила календаря/тарифа на этот момент и направление/съезды/полнотадоказательств сохраняются. Это пользовательское правило оценки, не утверждение об операторском биллинге.

2026-10-16 01:17 МСК: прямое разрешение передачи координат/маршрутных параметров Valhalla/OSRM/BRouter получено в текущем чате («Разрешаю доступ»). Approval blocker снят. STARTED live Бахмут→Казань. [Checkpoint](../../docs/checkpoints/2026-10-16-0117-routing-authorized-started.md).


2026-10-16T02:09:14.454441+03:00: пользователь изменил порядок на 20 небольших частей с отдельными запусками. Часть1 DONE; часть2 NEXT. [План](SMALL_PARTS_PLAN.md), [checkpoint](../../docs/checkpoints/2026-10-16-small-parts-01.md). Счётчик не повышен, новые маршруты/сборка не запускались.

16.10.2026 10:27МСК пользователь вновь прямо поручил запускать следующий этап автоматически. ExecutionUnit уточнён: один маршрут на отдельный durable checkpoint, затем сразу следующий без нового захода/«дальше». Старый лимит одногоcaseза запуск снят, последовательность/одинwriter/commit/head/tree после каждого не отменены. [Решение и NEXT STARTED case6/25](../../docs/checkpoints/2026-10-16-1030-auto-sequential-microsteps.md). Автоматически продолжать case7 и далее после подтверждения сохранения предыдущего; part19ongoing/20planned.

## 2026-10-16 21:51 МСК — причины, влияние и честный прогресс

Пользователь утвердил [WORKFLOW_RULES](../../docs/WORKFLOW_RULES.md): общая причина и влияние на пользователя определяют разбор; повторы требуют проверки исключений, а полный повтор — конкретного отличия/недостающего evidence. Итог причины: исправлена и проверена / не воспроизвелась / заблокирована отсутствием надёжных данных / отложена. Не создавать подэтапы ради количества, читать большие файлы точечно, не копировать raw/логи в контекст. Формальные 18/20=90% относятся к 20-частному плану, отдельно указываются нерешённые причины, фактические проверки и подтверждённость тарифов. Этот план включает обе очереди155/154; выполнение всей исходной задачи калькулятора/матрицы этим не установлено. Исторические счётчики и сохранение каждого завершённого шага остаются; короткая offline-проверка не требует отдельного STARTED commit. Новое правило внесено в AGENTS/CHECKPOINT_PROTOCOL и существующее автоматическое продолжение.

Пользователь также поручил настроить CLI Git auth для ускорения. В этой среде штатных CLI credentials нет; push dry-run exit128 `unable to get password from user`. Коннектор имеет запись в ветку, но не экспортирует авторизацию в Git CLI. Этот пункт остаётся BLOCKED_BY_ENVIRONMENT_AUTH до безопасной настройки входа самой среды; токен не запрашивается в чате. [Checkpoint](../../docs/checkpoints/2026-10-16-215327-workflow-efficiency-rules.md).


## 2026-10-17 23:07 МСК — дробить последнюю задачу после зависания

По прямому запросу пользователя после зависания последняя незавершённая задача делится на меньшие последовательные части. При повторной остановке дробится оставшаяся часть. Обязательны восстановление фактического прогресса, сохранение каждой законченной части и продолжение с первой невыполненной без повторного аудита. Подробный порядок — в docs/WORKFLOW_RULES.md и docs/CHECKPOINT_PROTOCOL.md.
