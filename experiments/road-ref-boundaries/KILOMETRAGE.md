# Локальный модуль километража

## Назначение и подключение

Дополнительная позиционная диагностика выбранных въезда/съезда М4. Не изменяет маршрут, распознавание платности, операторский scope, tariffVector, amount или pricingStatus. Обогащает m4PvpPreview.roadKilometrage, который уже включается в fast-ответ V3. Возвращает entry/exit с диапазоном километров, scaleId/branchId/source/method, направление и structured stops. Unknown/ambiguous не превращается в подтверждённый тариф.

Код: lib/toll-engine/road-kilometrage.ts; адаптер: optional-road-kilometrage.ts. Единственный вызов — optionalRoadKilometrage(roadBoundaries) в resolveSelectedM4Endpoints из m4-production.ts. Сначала существующий resolver проверяет полную trace и совпадение выбранной геометрии; чужая/неполная evidence не обогащается уверенными километрами.

Выключить: data/toll-feature-switches.json → roadKilometrage:false, затем обычная сборка. Результат status=disabled, тарифный движок продолжает прежнюю работу. Полностью убрать: удалить import optionalRoadKilometrage, его условное spread-поле и type roadKilometrage в m4-production.ts (type import RoadKilometrage тоже удалить), затем файлы модуля/реестр/его тесты. Отдельные функции основной тарификации переписывать не требуется. Switch — конфигурация сборки, без платного сервиса feature flags.

## Данные и алгоритм

1. Индекс строится один раз при загрузке модуля. Сначала ищется полный directed transition ID; затем точный node ID. Запись transitionId не становится якорем для других подходов к тому же узлу. Несколько якорей одного уровня — ambiguous. Номер OSM объекта не интерпретируется как километр.
2. Если точного якоря нет, можно использовать coordinate и небольшой заранее калиброванный section. Должны совпасть номер целевой дороги и номер фактически пройденной подъездной дороги. Простое destination упоминание не используется. Сегмент выбирается проекцией; соседние подходящие branches/sections не разрешаются правилом ближайшего кандидата. Неоднозначность — unknown/ambiguous.
3. Длина вдоль section переводится в официальную шкалу по двум проверенным startKm/endKm. Не считать расстояние от начала произвольной полилинии официальным километром. Геометрия не достраивается по прямой между произвольными ПВП. Не экстраполировать за концы калиброванного участка. Допустимая погрешность/боковой допуск задаются данными.
4. Направление устанавливается по порядку выбранных entry→exit и неперекрывающимся диапазонам на одной scale/branch при resolved непрерывной evidence. Увеличение/уменьшение км — не обещание фиксированного географического севера/юга. Разные обходы/шкалы, пересекающиеся интервалы, partial trace — direction unknown.

Ограничения:5000 anchors,256 sections,20000 stored segments,4096 projected segments на одну границу. Section≤20км, каждый отрезок≤5км; локальная метрическая проекция применима только к этим небольшим участкам. Координаты за±85° широты отвергаются. Лимиты превышены — structured stop, частичный лучший кандидат не принимается. Никаких fetch/повторов/синхронной записи логов в критическом пути.

## Реальное покрытие и пополнение

Из существующего data/m4-pvp-osm-partial.json импортируются14 групп/81 точный lane node с named_osm_match. Это номинальные километры именованных ПВП, а не survey точность. Принятый приложением диапазон±1км — консервативный допуск; centroid не используется как подтверждение проезда. Не импортируются непроверенные spatial/operator-local кандидаты. Само наличие километра не доказывает тарифицируемую область.

data/road-kilometrage.json имеет0 дополнительных reviewed anchors/sections и2 pending перехода. Для узлов4443232947 и358467208 нет проверенных официальных км/decoded output shape: на сохранённом реальном маршруте ожидается unknown километраж, graph boundaries остаются resolved и существующий tariffVector сохраняется. Число именованных ПВП не означает покрытие всех съездов М4.

Чтобы пополнить anchors: указать roadRef,scaleId,branchId,osmNodeId ИЛИ точный transitionId,km,uncertaintyKm,source,reviewed:true. Предпочтение transitionId, если запись относится только к конкретному направленному подходу. Для sections нужны те же metadata плюс accessRoadRefs,coordinates,startKm,endKm,maxOffsetKm; source должен позволять проверить обе отметки и выбранную ветку. Synthetic fixtures из тестов/benchmark никогда не копировать в runtime JSON. Pending не индексируется.

## Проверки и диагностика

scripts/road-kilometrage.test.ts: exact/reverse/access/ambiguity/branch-scale/partial/budget/disabled/retained pending/integration. scripts/road-boundaries-v3-replay.test.ts проверяет новый unknown metadata в полном прежнем14-response replay в двух профилях, без live. Benchmark: node --import ./scripts/register-ts-paths.mjs scripts/road-kilometrage-benchmark.mjs. Только CPU модуля; не холодный сервер/внешняя сеть/полный запрос.

Stop reason возвращается в m4PvpPreview.roadKilometrage.stops; source data errors содержат индекс строки, чтобы исправлять независимо. Подробный журнал известных проблем: BLOCKERS.md. Автоматические долговечные логи каждого пользовательского запроса этим модулем не добавлены: чтобы не задерживать ответ и не вводить новый внешний сервис. При сохранении route capture его диагностика сохраняется вместе с ответом. До10с полного запроса пока цель, а не достигнутый SLA.
