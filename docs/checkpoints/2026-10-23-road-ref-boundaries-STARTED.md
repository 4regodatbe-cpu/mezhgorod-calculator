# STARTED — дорожные переходы и тарифные границы

Дата23.10.2026МСК. Разрешение: прямая команда пользователя «Начинай». Исходный remote7d1196a7d299e2c28690d814a8eadc472443a2ba, PR14open/draft. Actions39988935029completed/success перед записью. Backupc7048e0 сохранён; текущая задача не разрешаетProduction/main/merge.

План: выбранный fastest route→направленные road refs/names/точный переход→тарифные границы/существующий вектор→отдельная доступность цены. Недостающие цены не блокируют определение границ. Сначала сохранённый Гранитное→Казань: docs/checkpoints/2026-10-16-part19d-granitnoe-kazan-unknown-reproduced.md и evidence/2026-10-16-granitnoe-kazan-m4-scope.json, затем exactcapture только нужных полей. Здесь0knownPVP и2tollways; отсутствиеmappedbooth не доказываетfree. Прежние22M4scope/classification и309batch не повторять.

Официальная документация Valhalla trace_attributes: https://valhalla.github.io/valhalla/api/map-matching/api-reference/ (просмотр23.10): выдаёт нормализованные routing attributes, не все исходныеOSMtags; поддерживаетway IDs/signexit fields. OSRMsteps имеютref; потребуется работать с фактически выбраннымprovider и его отдельной полной геометрией, без смешенияroutes и геометрическихиндексов разныхresponse.

Состояние: source review показал V3resolveSelectedM4Endpoints только поfirst/lastconfirmedPVPS, m4adapter читает existingvectors; не сохраняется конкретный дорожныйсъезд. Это установленное архитектурное ограничение, не доказательство точной тарификации короткого сегмента.

Восстановление: checkout текущего remotehead, прочитать experiments/road-ref-boundaries/NEXT_STEPS.md; проверить наличие кода/evidence/следующегоDONE. Начать с извлечения выбранныхmaneuvers и соседнихtraceedges сохранённогоGranитноеcapture, не повторятьlivequeries. При sourcegap оставитьunknown и сохранить точныйprovenance/следующийшаг.

До этогоSTARTED новыеunit/build/live не запускались; код/матрица не менялись. После сохранения соблюдатьcheckpoint каждого завершённого bounded блока; не писать вветку приactiveCI.
