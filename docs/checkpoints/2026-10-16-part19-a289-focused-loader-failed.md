# A289 full-vector: первый focused запуск FAILED на test loader

16.10.2026. Parent6e66fad4, рабочая ветка/PR14draft. Реализована минимальная привязка полного трёхрамочного вектора при неизвестном конце длинной поездки; сумма через прежний datedadapter, имена поездки не выдумываются. Частичные/неправильные/повторные/даты guard сохранены. Изменены a289-short-route.ts и два тестовых файла.

Команда node --import ./scripts/register-ts-paths.mjs --test scripts/v3-a289-long-route.test.mjs scripts/a289-short-route.test.mjs scripts/v3-a289-od-audit.test.mjs scripts/v3-m4-a289-composition.test.mjs exit1:15PASS/1failed testfile. Лог evidence/2026-10-16-part19-a289-green.log (это не GREEN, название до запуска). Новый integration testfile не загрузился: старый VMload-ts helper не поддерживает default JSON import в зависимости композиции. TypeError undefined.facilities в m11-moscow-geometry.ts. Не доказана ошибка новогоA289алгоритма; полноценные новыеtestsещё не запущены.

Следующее STARTED: заменить только импорт composition в новомtestfile на native await import как в существующем v3-m4-a289-composition.test.mjs, повторить те же4focused suites в новыйлог. Production helperloader не менять, источник расчёта не ослаблять. ПослеfocusedPASS — fullgate/replays отдельнымиsteps; baseline/live не перезаписаны. Часть19 INPROGRESS.
