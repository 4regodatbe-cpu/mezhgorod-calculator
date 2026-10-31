# V3 RC1 — правила поставки сохранены, приёмка STARTED LOCAL

31.10.2026. Source dbc701fb9560c7b6b3a4e0299734f365c88df4aa, clean. История I1–I3 не возвращалась/не переписывалась. Создан docs/PRODUCT_DELIVERY_ADDENDUM.md, ссылки из AGENTS и WORKFLOW_RULES; организационные приоритеты уточнены без удаления прежних правил, обязательных gates и publication/security запретов.

Минимальный продукт, ограниченный цикл и recovery: experiments/release-candidate-1/2026-10-31/README.md, WORK_LOG.md, NEXT_STEPS.md. Docs-only блок: проверка ссылок/содержания/diff; новый runtime gate пока не нужен. Следующий шаг — UI/API/end-to-end с точным разделением live/replay/mocks/browser/SSR. При неизменном browser sandbox не повторять бесперспективные запуски, продолжать независимый API и отчёт о непроверенной границе.

Только локальные commit/readback/bundle по текущему разрешению; не remote persistence. Нет push/новых CI/Production/main/Android/backup/merge/force. PR14 не меняется. Исходы прошлых I3 gates остаются доказательством только соответствующего неизменного source tree, не нового Preview.
